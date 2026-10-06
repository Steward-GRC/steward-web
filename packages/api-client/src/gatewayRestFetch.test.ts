// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { GatewayError } from "./gatewayFetch";
import { gatewayRestFetch } from "./gatewayRestFetch";

const jsonResponse = (status: number, body: unknown) => Response.json(body, { status });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("gatewayRestFetch", () => {
  it("forwards the cookie and returns the body on success", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { entityId: "https://idp.example/metadata" }));
    vi.stubGlobal("fetch", fetchSpy);

    const body = await gatewayRestFetch<{ entityId: string }>(
      "/admin/idp/import-metadata",
      { url: "https://idp.example/metadata" },
      "ImportIdpMetadata",
      { cookie: "steward_session=abc", url: "https://gateway.example/admin/idp/import-metadata" },
    );

    expect(body).toEqual({ entityId: "https://idp.example/metadata" });
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://gateway.example/admin/idp/import-metadata");
    expect((init.headers as Record<string, string>).cookie).toBe("steward_session=abc");
  });

  it("omits the cookie header when none is given", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse(200, {}));
    vi.stubGlobal("fetch", fetchSpy);

    await gatewayRestFetch("/admin/idp/fetch-cert", { url: "x" }, "FetchIdpCert", {
      url: "https://gateway.example/admin/idp/fetch-cert",
    });

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect("cookie" in (init.headers as Record<string, string>)).toBe(false);
  });

  it("throws GatewayError built from the body's error field on a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(400, { error: "Missing url — provide a URL" })),
    );

    await expect(
      gatewayRestFetch("/admin/idp/fetch-cert", {}, "FetchIdpCert", { url: "x" }),
    ).rejects.toMatchObject({
      message: "Missing url — provide a URL",
      operation: "FetchIdpCert",
      status: 400,
    });
  });

  it("falls back to a generic message when the error response carries no error field", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(502, {})));

    await expect(
      gatewayRestFetch("/admin/idp/fetch-cert", {}, "FetchIdpCert", { url: "x" }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
