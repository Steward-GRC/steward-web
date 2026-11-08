// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildVersion } from "./buildVersion.server";

const QUERY_URL = "https://mock.steward.example/query";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildVersion (steward-web#217)", () => {
  it("names the app, its commit and version, and the mock's commit when the mock answers", async () => {
    const fetchSpy = vi.fn(async () =>
      Response.json({ commit: "5d39b5c", name: "Steward", version: "0.1.0" }),
    );
    vi.stubGlobal("fetch", fetchSpy);
    const info = await buildVersion("staff", { queryUrl: QUERY_URL });
    expect(info).toMatchObject({ app: "staff", mock: { commit: "5d39b5c" } });
    expect(typeof info.commit).toBe("string");
    expect(typeof info.version).toBe("string");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://mock.steward.example/_mock/version",
      expect.anything(),
    );
  });

  it("leaves the mock out when the gateway is a real one, which has no such route", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not found", { status: 404 })),
    );
    const info = await buildVersion("admin", { queryUrl: QUERY_URL });
    expect(info.mock).toBeNull();
  });

  it("leaves the mock out when it can't be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("connection refused"))),
    );
    const info = await buildVersion("staff", { queryUrl: QUERY_URL });
    expect(info.mock).toBeNull();
  });
});
