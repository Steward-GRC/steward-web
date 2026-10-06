// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { lastSeenLabel } from "./sessionTimes";

describe("lastSeenLabel", () => {
  it("shows the local time a session was last used", () => {
    const at = "2026-01-01T09:30:00Z";
    expect(lastSeenLabel({ lastSeenAt: at })).toBe(new Date(at).toLocaleString());
  });

  it("shows a dash for a session never seen", () => {
    expect(lastSeenLabel({ lastSeenAt: null })).toBe("—");
    expect(lastSeenLabel({})).toBe("—");
  });
});
