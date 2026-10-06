// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Token-lifetime tests.
import { describe, expect, it } from "vitest";

import { isStale, MIN_REFRESH_DELAY_MS, REFRESH_LEAD_MS, refreshDelayMs } from "./token";

const now = Date.parse("2026-09-03T12:00:00Z");
const at = (offsetMs: number): string => new Date(now + offsetMs).toISOString();

describe("token", () => {
  it("refreshes a fresh 5-minute token one lead-time before expiry", () => {
    // The real TTL: steward-collab's DefaultTokenTTL is 5 minutes.
    expect(refreshDelayMs(at(300_000), now)).toBe(300_000 - REFRESH_LEAD_MS);
  });

  it("refreshes a token expiring inside the lead window almost immediately", () => {
    expect(refreshDelayMs(at(30_000), now)).toBe(MIN_REFRESH_DELAY_MS);
  });

  it("refreshes an already-expired token almost immediately", () => {
    // Never a negative delay: setTimeout would fire in a tight loop.
    expect(refreshDelayMs(at(-120_000), now)).toBe(MIN_REFRESH_DELAY_MS);
  });

  it("does not let an unparseable expiry become NaN", () => {
    // A NaN delay silently cancels the refresh timer, stranding the session on a credential
    // it can never renew — the worst possible failure here.
    expect(refreshDelayMs("", now)).toBe(MIN_REFRESH_DELAY_MS);
    expect(refreshDelayMs("not-a-date", now)).toBe(MIN_REFRESH_DELAY_MS);
    expect(Number.isFinite(refreshDelayMs("garbage", now))).toBe(true);
  });

  it("is stale only inside the lead window", () => {
    expect(isStale(at(300_000), now)).toBe(false);
    expect(isStale(at(REFRESH_LEAD_MS + 1000), now)).toBe(false);
    expect(isStale(at(REFRESH_LEAD_MS), now)).toBe(true);
    expect(isStale(at(1000), now)).toBe(true);
    expect(isStale(at(-1000), now)).toBe(true);
  });

  it("counts an unparseable expiry as stale", () => {
    // Better to spend a mint than a connect attempt guaranteed to 401.
    expect(isStale("", now)).toBe(true);
    expect(isStale("whenever", now)).toBe(true);
  });
});
