// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  clearFormatCache,
  currentDatePreference,
  formatDate,
  formatDateTime,
  formatDayMonth,
  setDatePreference,
} from "./formats";

const noon = new Date(2026, 9, 2, 12, 0);
const morning = new Date(2026, 9, 2, 9, 30);

beforeEach(clearFormatCache);
afterEach(() => setDatePreference("system"));

describe("the date preference", () => {
  it("is the system default until a person picks one: the decided day, short month, year", () => {
    expect(currentDatePreference()).toBe("system");
    expect(formatDate(noon, { locale: "en" })).toBe("2 Oct 2026");
    expect(formatDayMonth(noon, { locale: "en" })).toBe("2 Oct");
  });

  it("writes month first for the month-day-year choice", () => {
    setDatePreference("mdy");
    expect(formatDate(noon, { locale: "en" })).toBe("Oct 2, 2026");
    expect(formatDayMonth(noon, { locale: "en" })).toBe("Oct 2");
    expect(formatDateTime(morning, { locale: "en" })).toMatch(/^Oct 2, 2026,? 09:30/);
  });

  it("writes day first for the day-month-year choice, whatever the language", () => {
    setDatePreference("dmy");
    expect(formatDate(noon, { locale: "en-US" })).toBe("2 Oct 2026");
  });

  it("writes numbers year first for the ISO choice", () => {
    setDatePreference("iso");
    expect(formatDate(noon)).toBe("2026-10-02");
    expect(formatDayMonth(noon)).toBe("10-02");
    expect(formatDateTime(morning)).toBe("2026-10-02 09:30");
  });

  it("keeps the fallback for a missing date under every choice", () => {
    setDatePreference("iso");
    expect(formatDate(null)).toBe("—");
    expect(formatDate("not a date", { fallback: "n/a" })).toBe("n/a");
  });

  it("ignores a value that isn't one of the choices", () => {
    setDatePreference("bogus" as never);
    expect(currentDatePreference()).toBe("system");
  });
});
