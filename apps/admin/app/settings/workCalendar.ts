// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The site work calendar as the Settings card and the workflow stage box share it: reading the
// posted form, naming the days, and the client-side checks that mirror the gateway's limits.
import type { WorkCalendarInput } from "@steward-web/api-client";

/** Holidays a calendar may hold; the gateway refuses more. */
export const MAX_HOLIDAYS = 366;
/** The longest holiday label; the gateway refuses more. An empty label is fine. */
export const MAX_LABEL = 80;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A real calendar date in YYYY-MM-DD, not just a string of the right shape. */
export const isIsoDate = (value: string): boolean => {
  if (!DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
};

/** The calendar a form posts as JSON, or null when it is not shaped like one. */
export const parseWorkCalendar = (raw: string): null | WorkCalendarInput => {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const { holidays, timezone, weekdays } = value as Record<string, unknown>;
    if (typeof timezone !== "string" || !Array.isArray(weekdays) || !Array.isArray(holidays)) {
      return null;
    }
    if (!weekdays.every((day) => Number.isInteger(day))) return null;
    const rows: { date: string; label: string }[] = [];
    for (const holiday of holidays as unknown[]) {
      if (!holiday || typeof holiday !== "object") return null;
      const { date, label } = holiday as Record<string, unknown>;
      if (typeof date !== "string" || typeof label !== "string") return null;
      rows.push({ date, label });
    }
    return { holidays: rows, timezone, weekdays: weekdays as number[] };
  } catch {
    return null;
  }
};

/**
 * "Mon–Fri" for one run of days, else the days in order; `short` names a day by its ISO number
 * (1 is Monday). Used for the card's pill and the stage box's helper text.
 */
export const calendarSummary = (
  calendar: WorkCalendarInput,
  short: (day: number) => string,
): { days: string; holidays: number } => {
  const days = [...new Set(calendar.weekdays)].toSorted((a, b) => a - b);
  const run = days.length > 2 && days.every((day, at) => at === 0 || day === days[at - 1]! + 1);
  return {
    days: run
      ? `${short(days[0]!)}–${short(days.at(-1)!)}`
      : days.map((day) => short(day)).join(", "),
    holidays: calendar.holidays.length,
  };
};
