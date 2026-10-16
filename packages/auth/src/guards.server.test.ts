// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { requireIdentity } from "./guards.server";
import { type Identity, NO_ACCESS } from "./identity";

const signedIn: Identity = { ...NO_ACCESS, id: "u-1" };

/** The guard throws a `redirect()` Response; read its `next` back out. */
const nextOf = (run: () => unknown): string => {
  try {
    run();
  } catch (error) {
    if (!(error instanceof Response)) throw error;
    const location = error.headers.get("location") ?? "";
    expect(location.startsWith("/sign-in?next=")).toBe(true);
    return new URL(location, "https://steward.example").searchParams.get("next") ?? "";
  }
  throw new Error("expected requireIdentity to throw a redirect");
};

describe("requireIdentity", () => {
  it("passes a signed-in identity through unchanged", () => {
    expect(requireIdentity(signedIn, "https://steward.example/profile")).toBe(signedIn);
  });

  it("sends a signed-out visitor to a relative next, with no scheme or host", () => {
    const next = nextOf(() => requireIdentity(NO_ACCESS, "https://steward.example/profile"));
    expect(next).toBe("/profile");
  });

  it("strips a single-fetch request's .data suffix and _routes parameter", () => {
    const next = nextOf(() =>
      requireIdentity(NO_ACCESS, "https://steward.example/profile.data?_routes=routes/profile"),
    );
    expect(next).toBe("/profile");
  });

  it("keeps other query parameters while dropping only _routes", () => {
    const next = nextOf(() =>
      requireIdentity(
        NO_ACCESS,
        "https://steward.example/search.data?_routes=routes/search&q=policy",
      ),
    );
    expect(next).toBe("/search?q=policy");
  });

  it("strips the _.data form an index route's single-fetch request carries", () => {
    const next = nextOf(() =>
      requireIdentity(NO_ACCESS, "https://steward.example/reports/_.data?_routes=routes/reports"),
    );
    expect(next).toBe("/reports/");
  });
});
