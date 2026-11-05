// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { loader } from "./root";

const settings = {
  announcement: { enabled: true, level: "warning", message: "Acknowledge by Friday." },
  maintenance: { enabled: true, message: "Read-only tonight." },
};

type LoaderArguments = Parameters<typeof loader>[0];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin root loader", () => {
  it("loads the site banners alongside the identity, even signed out", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        const body = String(init.body);
        if (body.includes("globalSettings")) {
          return Promise.resolve(Response.json({ data: { globalSettings: settings } }));
        }
        return Promise.resolve(
          Response.json({
            errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "signed out" }],
          }),
        );
      }),
    );

    const result = await loader({
      request: new Request("https://admin.steward.example/sign-in"),
    } as unknown as LoaderArguments);

    expect(result.siteSettings).toEqual(settings);
    expect(result.identity.id).toBe("");
  });

  it("still renders the page when the banners can't be read", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await loader({
      request: new Request("https://admin.steward.example/"),
    } as unknown as LoaderArguments);

    expect(result.siteSettings).toBeNull();
  });
});
