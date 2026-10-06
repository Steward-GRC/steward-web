// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * The dev-only "Copy for UI issue" bundle, schema v1: one line of minified JSON, the shared
 * reference every product's web repos match key-for-key. Keys are fixed and appear in this
 * exact order; a key with no value is omitted, never set to null.
 */

const PRODUCT = "steward";
const SCHEMA_VERSION = 1;
const MAX_ERROR_MESSAGE_LENGTH = 200;
const MAX_RECENT_ERRORS = 5;

export interface UiIssueBundleInput {
  app: "admin" | "staff";
  /** The last clicked element: a `data-testid` selector first, else a short CSS selector. */
  clicked?: string;
  dpr: number;
  lastErr?: UiIssueErrorInput;
  locale?: string;
  /** Route params. Opaque ids only; the caller is the one source for what lands here. */
  params?: Readonly<Record<string, string>>;
  /** The route pattern, not the concrete URL. */
  path: string;
  /** Up to 5 earlier errors, newest first; only the first `MAX_RECENT_ERRORS` are kept. */
  recentErrors?: readonly UiIssueErrorInput[];
  /** The signed-in user's role. No username, display name or email. */
  role?: string;
  /** The router route id. */
  route: string;
  /** The short commit the build came from. */
  sha: string;
  /** The copy time. */
  t: Date;
  theme?: string;
  ua: string;
  vh: number;
  vw: number;
}

/** An error as recorded (raw `at`); redaction and ET formatting happen when it's bundled. */
export interface UiIssueErrorInput {
  at: Date;
  m: string;
  src: UiIssueErrorSource;
}

export type UiIssueErrorSource = "fetch" | "promise" | "render" | "window";

const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const JWT_PATTERN = /\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/g;
const BEARER_PATTERN = /\bBearer\s+\S+/gi;

/** The same redaction a logged error message gets: emails and bearer-like tokens masked. */
export const redactMessage = (raw: string): string => {
  const redacted = raw
    .replaceAll(JWT_PATTERN, "[redacted]")
    .replaceAll(BEARER_PATTERN, "Bearer [redacted]")
    .replaceAll(EMAIL_PATTERN, "[redacted]");
  return redacted.slice(0, MAX_ERROR_MESSAGE_LENGTH);
};

/** ISO 8601 with the US Eastern offset (`-04:00` EDT / `-05:00` EST), DST handled. */
export const formatEasternTime = (date: Date): string => {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "shortOffset",
    year: "numeric",
  }).formatToParts(date);

  const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? "";
  const offset = /GMT([+-])(\d{1,2})(?::?(\d{2}))?/.exec(part("timeZoneName"));
  const sign = offset?.[1] ?? "-";
  const hours = (offset?.[2] ?? "0").padStart(2, "0");
  const minutes = (offset?.[3] ?? "00").padStart(2, "0");

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}:${part("second")}${sign}${hours}:${minutes}`;
};

const redactedError = (
  error: UiIssueErrorInput,
): { at: string; m: string; src: UiIssueErrorSource } => ({
  at: formatEasternTime(error.at),
  m: redactMessage(error.m),
  src: error.src,
});

export const buildUiIssueBundle = (input: UiIssueBundleInput): string => {
  /* eslint-disable perfectionist/sort-objects -- schema v1 fixes this exact key order (v,
   * product, app, sha, route, path, ...); it is a cross-product contract, not a style choice. */
  const bundle: Record<string, unknown> = {
    v: SCHEMA_VERSION,
    product: PRODUCT,
    app: input.app, // scrub:allow=fqdn
    sha: input.sha,
    route: input.route,
    path: input.path,
  };
  /* eslint-enable perfectionist/sort-objects */
  if (input.params && Object.keys(input.params).length > 0) bundle.params = input.params;
  if (input.role) bundle.role = input.role;
  bundle.vw = input.vw;
  bundle.vh = input.vh;
  bundle.dpr = input.dpr;
  bundle.ua = input.ua;
  bundle.t = formatEasternTime(input.t);
  if (input.theme) bundle.theme = input.theme;
  if (input.locale) bundle.locale = input.locale;
  if (input.clicked) bundle.clicked = input.clicked;
  if (input.lastErr) bundle.lastErr = redactedError(input.lastErr);
  if (input.recentErrors && input.recentErrors.length > 0) {
    bundle.recentErrors = input.recentErrors
      .slice(0, MAX_RECENT_ERRORS)
      .map((error) => redactedError(error));
  }
  return JSON.stringify(bundle);
};
