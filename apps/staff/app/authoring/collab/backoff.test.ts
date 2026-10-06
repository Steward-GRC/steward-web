// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { reconnectDelayMs } from "./backoff";

describe("reconnectDelayMs", () => {
  it("doubles with each attempt", () => {
    expect(reconnectDelayMs(1)).toBe(500);
    expect(reconnectDelayMs(2)).toBe(1000);
    expect(reconnectDelayMs(3)).toBe(2000);
  });

  it("caps at the maximum", () => {
    expect(reconnectDelayMs(10)).toBe(10_000);
    expect(reconnectDelayMs(100)).toBe(10_000);
  });

  it("never goes negative for a zero or negative attempt", () => {
    expect(reconnectDelayMs(0)).toBe(500);
    expect(reconnectDelayMs(-5)).toBe(500);
  });
});
