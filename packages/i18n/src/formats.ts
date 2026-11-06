// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Locale-aware formatters.
//
// These exist because the audit found the UI formats dates and
// numbers three incompatible ways — a hardcoded "en-GB", a bare
// toLocaleDateString(undefined, …) that follows the BROWSER rather than the
// app's chosen language, and hand-rolled `${n}d ago` / `HH:00` / ISO-slicing
// strings that can never localize at all. Routing every call site through here
// makes the app's selected locale the single input.
//
// Extraction slices should replace those call sites with these helpers; the
// formatter cache means doing so is not a per-render cost.

import { currentLocale } from "./i18n";

// Intl constructors are expensive relative to format(); the standard fix is to
// build once per (locale, options) pair and reuse.
const cache = new Map<string, unknown>();

const memo = <T>(kind: string, locale: string, options: object, make: () => T): T => {
  const key = `${kind}|${locale}|${JSON.stringify(options)}`;
  const hit = cache.get(key);
  if (hit) return hit as T;
  const made = make();
  cache.set(key, made);
  return made;
};

const dateTimeFormat = (locale: string, options: Intl.DateTimeFormatOptions) =>
  memo("dt", locale, options, () => new Intl.DateTimeFormat(locale, options));

/**
 * The locale a calendar date is written in. The decided date style (3-colour-type-tokens.s6)
 * is day, short month, year: "2 Oct 2026". The app's default English is the bare `en` tag,
 * which Intl reads as US English ("Oct 2, 2026"), so it writes dates as British English does;
 * every other locale keeps its own order.
 */
const dateLocale = (locale: string): string => (locale === "en" ? "en-GB" : locale);

/**
 * How a person wants dates written. "system" is the app's own default, the decided style;
 * the rest override it for every date the app shows, through the formatters below.
 */
export type DatePreference = "dmy" | "iso" | "mdy" | "system";

const DATE_PREFERENCES: ReadonlySet<string> = new Set(["dmy", "iso", "mdy", "system"]);

let datePreference: DatePreference = "system";

export const currentDatePreference = (): DatePreference => datePreference;

/** Set by whatever holds the person's saved choice; anything unknown means the system default. */
export const setDatePreference = (value: unknown): void => {
  datePreference = DATE_PREFERENCES.has(String(value)) ? (value as DatePreference) : "system";
};

const pad = (n: number) => String(n).padStart(2, "0");

/** The numeric, year-first form: "2026-10-02", the day-month "10-02", with the time "09:30". */
const isoParts = (date: Date) => ({
  day: pad(date.getDate()),
  month: pad(date.getMonth() + 1),
  time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  year: String(date.getFullYear()),
});

/** The locale a date is written in once the person's choice is applied. */
const choiceLocale = (locale: string): string => {
  if (datePreference === "dmy") return "en-GB";
  if (datePreference === "mdy") return "en-US";
  return dateLocale(locale);
};

/** Accepts what the data layer actually holds: an ISO string, epoch ms, or Date.
 *  Returns undefined for null/blank/unparseable rather than "Invalid Date". */
const toDate = (value: Date | null | number | string | undefined): Date | undefined => {
  if (value == undefined || value === "") return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export type FormatOptions = {
  /** Rendered when the value is missing or unparseable. */
  fallback?: string;
  /** Override the app's current locale. Only for tests and previews. */
  locale?: string;
};

/** Day and short month, e.g. "2 Oct" / "Oct 2": the stepper's decision dates. */
export const formatDayMonth = (
  value: Date | null | number | string | undefined,
  { fallback = "—", locale = currentLocale() }: FormatOptions = {},
): string => {
  const date = toDate(value);
  if (!date) return fallback;
  if (datePreference === "iso") {
    const parts = isoParts(date);
    return `${parts.month}-${parts.day}`;
  }
  return dateTimeFormat(choiceLocale(locale), { day: "numeric", month: "short" }).format(date);
};

/** Medium date in the decided style, e.g. "24 Aug 2026"; other locales keep their own order. */
export const formatDate = (
  value: Date | null | number | string | undefined,
  { fallback = "—", locale = currentLocale() }: FormatOptions = {},
): string => {
  const date = toDate(value);
  if (!date) return fallback;
  if (datePreference === "iso") {
    const parts = isoParts(date);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  return dateTimeFormat(choiceLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

/** Date + time, for audit and session tables. */
export const formatDateTime = (
  value: Date | null | number | string | undefined,
  { fallback = "—", locale = currentLocale() }: FormatOptions = {},
): string => {
  const date = toDate(value);
  if (!date) return fallback;
  if (datePreference === "iso") {
    const parts = isoParts(date);
    return `${parts.year}-${parts.month}-${parts.day} ${parts.time}`;
  }
  return dateTimeFormat(choiceLocale(locale), {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

/** The time of day, hours and minutes ("09:12"), for a moment already dated nearby. */
export const formatTime = (
  value: Date | null | number | string | undefined,
  { fallback = "—", locale = currentLocale() }: FormatOptions = {},
): string => {
  const date = toDate(value);
  if (!date) return fallback;
  return dateTimeFormat(dateLocale(locale), { hour: "2-digit", minute: "2-digit" }).format(date);
};

/** An hour-of-day label for the digest-window pickers. Replaces the hardcoded
 *  24-hour `HH:00`, which reads wrong to a US audience expecting "2 PM". */
export const formatHour = (
  hour: number,
  { locale = currentLocale() }: FormatOptions = {},
): string => {
  const date = new Date(Date.UTC(2000, 0, 1, hour));
  return dateTimeFormat(locale, { hour: "numeric", timeZone: "UTC" }).format(date);
};

/** Weekday name. Replaces hand-written 7-entry English day maps. */
export const formatWeekday = (
  /** 0 = Sunday, matching JS getDay() and the stored weeklyDow. */
  day: number,
  { locale = currentLocale(), width = "long" }: { width?: "long" | "short" } & FormatOptions = {},
): string => {
  // 2000-01-02 was a Sunday, so day 0..6 maps onto the 2nd..8th.
  const date = new Date(Date.UTC(2000, 0, 2 + day));
  return dateTimeFormat(locale, { timeZone: "UTC", weekday: width }).format(date);
};

export const formatNumber = (
  value: number,
  { locale = currentLocale(), ...options }: { locale?: string } & Intl.NumberFormatOptions = {},
): string => memo("n", locale, options, () => new Intl.NumberFormat(locale, options)).format(value);

/** Percentage from a 0..1 ratio. Replaces `${Math.round(pct * 100)}%`, which
 *  hardcodes both the symbol position and the digit grouping. */
export const formatPercent = (
  ratio: number,
  {
    locale = currentLocale(),
    maximumFractionDigits = 0,
  }: { maximumFractionDigits?: number } & FormatOptions = {},
): string =>
  memo(
    "n",
    locale,
    { maximumFractionDigits, style: "percent" },
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits,
        style: "percent",
      }),
  ).format(ratio);

/** "3 days ago" / "in 2 hours". Replaces the hand-rolled `${n}d ago` helpers,
 *  which are English-only and inconsistent between the two apps. */
export const formatRelativeTime = (
  value: Date | null | number | string | undefined,
  {
    fallback = "—",
    locale = currentLocale(),
    now = Date.now(),
  }: { now?: number } & FormatOptions = {},
): string => {
  const date = toDate(value);
  if (!date) return fallback;

  const seconds = (date.getTime() - now) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3600],
    ["minute", 60],
  ];

  // oxlint-disable-next-line react/display-name -- memo is this file's own cache helper, not React.memo
  const rtf = memo(
    "rt",
    locale,
    { numeric: "auto" },
    () => new Intl.RelativeTimeFormat(locale, { numeric: "auto" }),
  );

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(Math.round(seconds), "second");
};

/** "A, B and C" with the locale's own separators and conjunction. Replaces the
 *  hand-rolled `slice(0,-1).join(", ") + " and " + last` joins. `unit` drops the
 *  conjunction ("Carol, Grace"), as the approval stepper's name lists do. */
export const formatList = (
  items: readonly string[],
  {
    locale = currentLocale(),
    type = "conjunction",
  }: { type?: "conjunction" | "disjunction" | "unit" } & FormatOptions = {},
): string =>
  memo(
    "l",
    locale,
    { type },
    () => new Intl.ListFormat(locale, type === "unit" ? { style: "short", type } : { type }),
  ).format(items);

/** Exported for tests: the memo cache is process-global, so a test that varies
 *  locales must be able to reset it. */
export const clearFormatCache = (): void => cache.clear();
