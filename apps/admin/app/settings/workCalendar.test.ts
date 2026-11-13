// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { calendarSummary, parseWorkCalendar } from "./workCalendar";

const SHORT = (day: number) => ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day]!;

describe("parseWorkCalendar", () => {
  it("reads the calendar a form posts as JSON", () => {
    const calendar = {
      holidays: [{ date: "2026-12-25", label: "" }],
      timezone: "UTC",
      weekdays: [1],
    };
    expect(parseWorkCalendar(JSON.stringify(calendar))).toEqual(calendar);
  });

  it("refuses anything that is not a calendar", () => {
    expect(parseWorkCalendar("not json")).toBeNull();
    expect(parseWorkCalendar(JSON.stringify({ weekdays: "1" }))).toBeNull();
    expect(
      parseWorkCalendar(
        JSON.stringify({ holidays: [{ date: 5 }], timezone: "UTC", weekdays: [1] }),
      ),
    ).toBeNull();
  });
});

describe("calendarSummary", () => {
  it("collapses a run of days and counts holidays", () => {
    expect(
      calendarSummary({ holidays: [], timezone: "UTC", weekdays: [1, 2, 3, 4, 5] }, SHORT),
    ).toEqual({ days: "Mon–Fri", holidays: 0 });
  });

  it("lists days that are not one run", () => {
    expect(
      calendarSummary(
        { holidays: [{ date: "2026-01-01", label: "" }], timezone: "UTC", weekdays: [1, 3, 7] },
        SHORT,
      ),
    ).toEqual({ days: "Mon, Wed, Sun", holidays: 1 });
  });
});
