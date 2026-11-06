// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { requireIdentity, requireRole } from "./guards.server";
import { NO_ACCESS } from "./identity";

const someone = { ...NO_ACCESS, id: "u-1", permissions: new Set(["policy.read"]) };

const redirectFrom = (currentUrl: string): null | string => {
  try {
    requireIdentity(NO_ACCESS, currentUrl);
  } catch (error) {
    if (error instanceof Response) return error.headers.get("location");
    throw error;
  }
  throw new Error("expected a redirect");
};

const nextFrom = (currentUrl: string): null | string =>
  new URLSearchParams(redirectFrom(currentUrl)?.split("?", 2)[1]).get("next");

describe("requireIdentity's next", () => {
  it("carries the path and query only, never the origin", () => {
    expect(redirectFrom("https://steward.example/policies/POL-1?tab=history")).toBe(
      "/sign-in?next=%2Fpolicies%2FPOL-1%3Ftab%3Dhistory",
    );
  });

  it("keeps a basename that is part of the path", () => {
    expect(nextFrom("https://steward.example/admin/users?q=ada")).toBe("/admin/users?q=ada");
  });

  it("names the page a client navigation's data request was for", () => {
    expect(nextFrom("https://steward.example/policies.data?_routes=routes%2Fpolicies")).toBe(
      "/policies",
    );
    expect(nextFrom("https://steward.example/admin/_.data?_routes=root&q=1")).toBe("/admin/?q=1");
  });

  it("drops the fragment", () => {
    expect(nextFrom("https://steward.example/policies#top")).toBe("/policies");
  });
});

describe("requireRole", () => {
  it("lets someone with the permission through", () => {
    const author = { ...someone, permissions: new Set(["policy.author"]) };
    expect(requireRole(author, "policy.author", "author", "https://steward.example/drafts")).toBe(
      author,
    );
  });

  it("refuses someone without it with a 403 that names the missing role, instead of a silent redirect", () => {
    try {
      requireRole(someone, "policy.author", "author", "https://steward.example/drafts");
    } catch (error) {
      const refusal = error as { data: unknown; init: { status: number } };
      expect(refusal.init.status).toBe(403);
      expect(refusal.data).toEqual({ needs: "author" });
      return;
    }
    throw new Error("expected a 403");
  });

  it("still sends someone signed out to sign in", () => {
    expect(() =>
      requireRole(NO_ACCESS, "policy.author", "author", "https://steward.example/drafts"),
    ).toThrow(Response);
  });
});
