// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from "vitest";

import { createReadinessChecker } from "./health";

describe("createReadinessChecker", () => {
  it("reports ok when the ping succeeds", async () => {
    const check = createReadinessChecker({ ping: () => Promise.resolve(true) });
    const result = await check();
    expect(result.state).toBe("ok");
  });

  it("reports down, with a reason, when the ping resolves false", async () => {
    const check = createReadinessChecker({ ping: () => Promise.resolve(false) });
    const result = await check();
    expect(result.state).toBe("down");
    expect(result.lastError).toBe("unreachable");
  });

  it("reports down, never throwing, when the ping itself rejects", async () => {
    const check = createReadinessChecker({ ping: () => Promise.reject(new Error("timeout")) });
    const result = await check();
    expect(result.state).toBe("down");
    expect(result.lastError).toBe("timeout");
  });

  it("caches the result for cacheMs, so a burst of probes pings the dependency once", async () => {
    let now = 0;
    const ping = vi.fn().mockResolvedValue(true);
    const check = createReadinessChecker({ cacheMs: 5000, now: () => now, ping });

    await check();
    now += 1000;
    await check();
    expect(ping).toHaveBeenCalledOnce();
  });

  it("recovers on its own once the cache window passes", async () => {
    let now = 0;
    let up = false;
    const check = createReadinessChecker({
      cacheMs: 5000,
      now: () => now,
      ping: () => Promise.resolve(up),
    });

    const firstCheck = await check();
    expect(firstCheck.state).toBe("down");
    up = true;
    now += 4000;
    const stillCached = await check();
    expect(stillCached.state).toBe("down"); // still within the cache window
    now += 2000;
    const afterCacheExpires = await check();
    expect(afterCacheExpires.state).toBe("ok");
  });
});
