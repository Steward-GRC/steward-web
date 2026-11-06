// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

import { formatDateTime, setDatePreference } from "@steward-web/i18n";
import { afterEach, describe, expect, it } from "vitest";

import { lastSeenLabel } from "./sessionTimes";

afterEach(() => setDatePreference("system"));

describe("lastSeenLabel", () => {
  it("shows the local time a session was last used", () => {
    const at = "2026-01-01T09:30:00Z";
    expect(lastSeenLabel({ lastSeenAt: at })).toBe(formatDateTime(at));
  });

  it("follows the person's date preference", () => {
    setDatePreference("iso");
    expect(lastSeenLabel({ lastSeenAt: "2026-01-01T09:30:00Z" })).toMatch(
      /^2026-01-0\d \d\d:\d\d$/,
    );
  });

  it("shows a dash for a session never seen", () => {
    expect(lastSeenLabel({ lastSeenAt: null })).toBe("—");
    expect(lastSeenLabel({})).toBe("—");
  });
});
