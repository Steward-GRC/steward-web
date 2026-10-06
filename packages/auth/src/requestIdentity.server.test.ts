// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { requireIdentityFromRequest, requirePermissionFromRequest } from "./guards.server";
import { identityFromRequest } from "./requestIdentity.server";

const meResponse = (me: unknown) => Response.json({ data: { me } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("identityFromRequest", () => {
  it("resolves the identity from the request's own cookie", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      meResponse({
        email: "a@example.com",
        name: "Ada",
        permissions: ["policy.read"],
        roles: ["reader"],
        userId: "u-1",
        username: "ada",
      }),
    );
    vi.stubGlobal("fetch", fetchSpy);

    const request = new Request("https://staff.steward.example/", {
      headers: { cookie: "steward_session=abc" },
    });
    const identity = await identityFromRequest(request);

    expect(identity.id).toBe("u-1");
    expect(identity.permissions.has("policy.read")).toBe(true);
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).cookie).toBe("steward_session=abc");
  });

  it("falls back to NO_ACCESS, never throwing, when the gateway call fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const identity = await identityFromRequest(new Request("https://staff.steward.example/"));
    expect(identity.id).toBe("");
  });

  it("calls the gateway at most once per request object", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(meResponse(null));
    vi.stubGlobal("fetch", fetchSpy);

    const request = new Request("https://staff.steward.example/");
    await Promise.all([identityFromRequest(request), identityFromRequest(request)]);

    expect(fetchSpy).toHaveBeenCalledOnce();
  });
});

describe("requireIdentityFromRequest", () => {
  it("redirects a signed-out request to sign-in with the original URL", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(meResponse(null)));
    const request = new Request("https://staff.steward.example/policies/42");

    const thrown: unknown = await requireIdentityFromRequest(request).catch(
      (error: unknown) => error,
    );

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("location")).toBe(
      "/sign-in?next=https%3A%2F%2Fstaff.steward.example%2Fpolicies%2F42",
    );
  });
});

describe("requirePermissionFromRequest", () => {
  it("redirects a signed-in visitor who lacks the permission", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        meResponse({
          email: "a@example.com",
          name: "Ada",
          permissions: [],
          roles: ["reader"],
          userId: "u-1",
          username: "ada",
        }),
      ),
    );
    const request = new Request("https://staff.steward.example/admin");

    const thrown: unknown = await requirePermissionFromRequest(request, "admin.manage").catch(
      (error: unknown) => error,
    );

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("location")).toBe("/");
  });

  it("returns the identity when the permission is granted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        meResponse({
          email: "a@example.com",
          name: "Ada",
          permissions: ["admin.manage"],
          roles: ["site-admin"],
          userId: "u-1",
          username: "ada",
        }),
      ),
    );
    const identity = await requirePermissionFromRequest(
      new Request("https://staff.steward.example/admin"),
      "admin.manage",
    );
    expect(identity.id).toBe("u-1");
  });
});
