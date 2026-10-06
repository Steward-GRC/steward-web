// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createReadinessChecker,
  handleHealthRoute,
  type ReadinessState,
  resolveBuildInfo,
} from "./health";

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

describe("resolveBuildInfo", () => {
  it("falls back to dev and unknown when unset", () => {
    expect(resolveBuildInfo({})).toEqual({ commit: "unknown", version: "dev" });
  });

  it("trims and uses the stamped values", () => {
    expect(resolveBuildInfo({ COMMIT: " abc123 ", VERSION: " v0.1.0 " })).toEqual({
      commit: "abc123",
      version: "v0.1.0",
    });
  });

  it("falls back on an empty or whitespace-only value", () => {
    expect(resolveBuildInfo({ COMMIT: " ".repeat(3), VERSION: "" })).toEqual({
      commit: "unknown",
      version: "dev",
    });
  });
});

const readyWith = (state: ReadinessState) => (): Promise<ReadinessState> => Promise.resolve(state);

describe("handleHealthRoute", () => {
  const listen = (server: Server): Promise<string> =>
    new Promise((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        if (address == null || typeof address === "string") throw new Error("no port");
        resolve(`http://127.0.0.1:${address.port}`);
      });
    });

  const close = (server: Server): Promise<void> =>
    new Promise((resolve) => server.close(() => resolve()));

  let server: Server | undefined;

  afterEach(async () => {
    if (server) await close(server);
    server = undefined;
  });

  const serve = (checkReady: () => Promise<ReadinessState>) => {
    const config = { checkReady, commit: "abc123", version: "v0.1.0" };
    server = createServer((request, response) => {
      if (handleHealthRoute(request, response, config)) return;
      response.writeHead(404);
      response.end();
    });
    return listen(server);
  };

  it("answers /livez with the build headers and no dependency check", async () => {
    const checkReady = vi.fn<() => Promise<ReadinessState>>();
    const url = await serve(checkReady);

    const response = await fetch(`${url}/livez`);

    expect(response.status).toBe(200);
    expect(response.headers.get("steward-version")).toBe("v0.1.0");
    expect(response.headers.get("steward-commit")).toBe("abc123");
    expect(checkReady).not.toHaveBeenCalled();
  });

  it("answers /readyz 200 with the dependency's state and version when the gateway is up", async () => {
    const checkReady = readyWith({ lastChecked: "2026-01-01T00:00:00.000Z", state: "ok" });
    const url = await serve(checkReady);

    const response = await fetch(`${url}/readyz`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("steward-version")).toBe("v0.1.0");
    expect(response.headers.get("steward-commit")).toBe("abc123");
    expect(body).toEqual({
      dependencies: {
        gateway: {
          lastChecked: "2026-01-01T00:00:00.000Z",
          required: true,
          state: "ok",
          version: "unknown",
        },
      },
      status: "ok",
    });
  });

  it("answers /readyz 503 while the gateway is down", async () => {
    const checkReady = readyWith({
      lastChecked: "2026-01-01T00:00:00.000Z",
      lastError: "unreachable",
      state: "down",
    });
    const url = await serve(checkReady);

    const response = await fetch(`${url}/readyz`);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("down");
    expect(body.dependencies.gateway.lastError).toBe("unreachable");
  });

  it("leaves any other path unhandled, for the caller to route", async () => {
    const url = await serve(readyWith({ lastChecked: "x", state: "ok" }));

    const response = await fetch(`${url}/query`);

    expect(response.status).toBe(404);
  });
});
