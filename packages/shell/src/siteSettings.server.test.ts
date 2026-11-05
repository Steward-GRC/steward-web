// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { siteSettingsFromRequest } from "./siteSettings.server";

const settings = {
  announcement: { enabled: true, level: "info", message: "Hello" },
  maintenance: { enabled: false, message: "" },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("siteSettingsFromRequest", () => {
  it("reads the public globalSettings query, signed in or not", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(Response.json({ data: { globalSettings: settings } }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await siteSettingsFromRequest(
      new Request("https://staff.steward.example/sign-in"),
    );

    expect(result).toEqual(settings);
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(String(init.body)).toContain("globalSettings");
  });

  it("forwards the request's cookie", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(Response.json({ data: { globalSettings: settings } }));
    vi.stubGlobal("fetch", fetchSpy);

    await siteSettingsFromRequest(
      new Request("https://staff.steward.example/", { headers: { cookie: "steward_sid=abc" } }),
    );

    const calls = fetchSpy.mock.calls as [string, RequestInit][];
    const query = calls.find(([, init]) => String(init.body).includes("globalSettings"));
    expect((query?.[1].headers as Record<string, string>).cookie).toBe("steward_sid=abc");
  });

  it("answers null, never throwing, when the gateway can't be read", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(
      siteSettingsFromRequest(new Request("https://staff.steward.example/")),
    ).resolves.toBeNull();
  });
});
