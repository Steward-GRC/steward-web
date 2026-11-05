// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { beforeEach, describe, expect, it } from "vitest";

import {
  clearFormatCache,
  formatDate,
  formatDateTime,
  formatDayMonth,
  formatHour,
  formatList,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  formatWeekday,
} from "./formats";

beforeEach(clearFormatCache);

// These assert BEHAVIOUR (locale-sensitivity, fallbacks, no throwing) rather
// than exact glyphs, because ICU output varies by Node/CLDR version and pinning
// the string would make the suite fail on a Node bump for no real reason.

describe("formatDate / formatDateTime", () => {
  it("formats an ISO string, an epoch and a Date alike", () => {
    const iso = "2026-08-24T14:30:00.000Z";
    for (const value of [iso, Date.parse(iso), new Date(iso)])
      expect(formatDate(value, { locale: "en" })).toContain("2026");
  });

  it("actually varies with the locale", () => {
    // The point of the helper: the SAME instant renders differently per locale.
    // If these were equal, the locale argument would be being ignored.
    const iso = "2026-08-24T14:30:00.000Z";
    expect(formatDate(iso, { locale: "en" })).not.toBe(formatDate(iso, { locale: "ja" }));
  });

  it("returns the fallback for missing or unparseable input", () => {
    // The audit found call sites rendering "Invalid Date" to users.
    for (const bad of [null, undefined, "", "not a date", "  "])
      expect(formatDate(bad, { locale: "en" })).toBe("—");
    expect(formatDate(null, { fallback: "never", locale: "en" })).toBe("never");
  });

  it("includes a time component only in formatDateTime", () => {
    const iso = "2026-08-24T14:30:00.000Z";
    expect(formatDateTime(iso, { locale: "en" })).toMatch(/\d{1,2}:\d{2}/);
    expect(formatDate(iso, { locale: "en" })).not.toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("the decided date style (3-colour-type-tokens.s6)", () => {
  // The app's default English is the en descriptor (US), but the decided style is the same
  // everywhere: day, short month, year ("2 Oct 2026"), and "2 Oct" without the year.
  const iso = "2026-10-02T10:00:00Z";

  it("is day, short month and year for the app's default locale", () => {
    expect(formatDate(iso)).toBe("2 Oct 2026");
    expect(formatDate(iso, { locale: "en" })).toBe("2 Oct 2026");
    expect(formatDate(iso, { locale: "en-GB" })).toBe("2 Oct 2026");
  });

  it("drops the year, not the order, for the day and month", () => {
    expect(formatDayMonth(iso)).toBe("2 Oct");
  });

  it("puts the 24-hour time after the same date", () => {
    expect(formatDateTime("2026-10-02T14:02:00", { locale: "en" })).toBe("2 Oct 2026, 14:02");
  });

  it("still follows another locale's own order", () => {
    expect(formatDate(iso, { locale: "de" })).toMatch(/^2\. Okt\. 2026$/);
  });
});

describe("formatHour", () => {
  it("uses a 12-hour clock for en and a 24-hour clock for de", () => {
    // Replaces the hardcoded `HH:00`, which showed "14:00" to a US audience.
    expect(formatHour(14, { locale: "en" })).toMatch(/2/);
    expect(formatHour(14, { locale: "en" })).toMatch(/PM/i);
    expect(formatHour(14, { locale: "de" })).not.toMatch(/PM/i);
  });

  it("covers the whole day without throwing", () => {
    for (let hour = 0; hour < 24; hour += 1)
      expect(formatHour(hour, { locale: "en" })).toBeTruthy();
  });
});

describe("formatWeekday", () => {
  it("maps 0..6 onto Sunday..Saturday, matching getDay()", () => {
    expect(formatWeekday(0, { locale: "en" })).toBe("Sunday");
    expect(formatWeekday(1, { locale: "en" })).toBe("Monday");
    expect(formatWeekday(6, { locale: "en" })).toBe("Saturday");
  });

  it("localizes and supports a short width", () => {
    expect(formatWeekday(0, { locale: "de" })).toBe("Sonntag");
    expect(formatWeekday(0, { locale: "en", width: "short" })).toBe("Sun");
  });
});

describe("formatNumber / formatPercent", () => {
  it("groups digits per locale", () => {
    expect(formatNumber(1_234_567, { locale: "en" })).toBe("1,234,567");
    expect(formatNumber(1_234_567, { locale: "de" })).toBe("1.234.567");
  });

  it("renders a 0..1 ratio as a percentage", () => {
    // Replaces `${Math.round(pct * 100)}%`, which hardcodes symbol placement.
    expect(formatPercent(0.427, { locale: "en" })).toBe("43%");
    expect(formatPercent(1, { locale: "en" })).toBe("100%");
    expect(formatPercent(0, { locale: "en" })).toBe("0%");
  });

  it("honours a fraction-digit override", () => {
    expect(formatPercent(0.4271, { locale: "en", maximumFractionDigits: 1 })).toBe("42.7%");
  });
});

describe("formatRelativeTime", () => {
  const now = Date.parse("2026-08-24T12:00:00.000Z");

  it("picks the largest sensible unit, in the past and the future", () => {
    expect(formatRelativeTime("2026-08-21T12:00:00.000Z", { locale: "en", now })).toBe(
      "3 days ago",
    );
    expect(formatRelativeTime("2026-08-24T10:00:00.000Z", { locale: "en", now })).toBe(
      "2 hours ago",
    );
    expect(formatRelativeTime("2026-08-24T14:00:00.000Z", { locale: "en", now })).toBe(
      "in 2 hours",
    );
  });

  it("uses the locale's own wording for near-now", () => {
    // numeric: "auto" is what produces "yesterday" rather than "1 day ago".
    expect(formatRelativeTime("2026-08-23T12:00:00.000Z", { locale: "en", now })).toBe("yesterday");
  });

  it("falls back rather than rendering NaN", () => {
    expect(formatRelativeTime(null, { locale: "en", now })).toBe("—");
    expect(formatRelativeTime("nonsense", { locale: "en", now })).toBe("—");
  });
});

describe("formatList", () => {
  it("uses the locale's separators and conjunction", () => {
    // Replaces hand-rolled `slice(0,-1).join(", ") + " and " + last`.
    expect(formatList(["A", "B", "C"], { locale: "en" })).toBe("A, B, and C");
    expect(formatList(["A", "B"], { locale: "en" })).toBe("A and B");
    expect(formatList(["A"], { locale: "en" })).toBe("A");
    expect(formatList([], { locale: "en" })).toBe("");
  });

  it("supports a disjunction", () => {
    expect(formatList(["A", "B"], { locale: "en", type: "disjunction" })).toBe("A or B");
  });
});

describe("formatDayMonth", () => {
  it("is the day and short month, without the year", () => {
    expect(formatDayMonth("2026-10-02T10:00:00Z", { locale: "en-GB" })).toBe("2 Oct");
    expect(formatDayMonth("2026-10-02T10:00:00Z", { locale: "en" })).toBe("2 Oct");
    expect(formatDayMonth(undefined, { locale: "en" })).toBe("—");
  });
});

describe("formatList as a unit list", () => {
  it("joins names with the locale's separator and no conjunction", () => {
    expect(formatList(["Carol", "Grace"], { locale: "en", type: "unit" })).toBe("Carol, Grace");
  });
});
