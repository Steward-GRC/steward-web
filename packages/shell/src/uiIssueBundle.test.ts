// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { buildUiIssueBundle, type UiIssueBundleInput } from "./uiIssueBundle";

const minimalInput: UiIssueBundleInput = {
  app: "staff",
  dpr: 2,
  path: "/policies/:number",
  route: "routes/policy",
  sha: "352a58c",
  t: new Date("2026-07-06T18:05:09Z"), // EDT: -04:00
  ua: "Mozilla/5.0 test-agent",
  vh: 900,
  vw: 1440,
};

describe("buildUiIssueBundle", () => {
  it("orders every key exactly as the shared schema v1 fixes it", () => {
    const bundle = JSON.parse(
      buildUiIssueBundle({
        ...minimalInput,
        clicked: "[data-testid=secret-reveal]",
        lastErr: { at: new Date("2026-07-06T18:05:01Z"), m: "boom", src: "render" },
        locale: "en-US",
        params: { number: "42" },
        recentErrors: [{ at: new Date("2026-07-06T18:04:01Z"), m: "earlier", src: "fetch" }],
        role: "site-admin",
        theme: "dark",
      }),
    );

    expect(Object.keys(bundle)).toEqual([
      "v",
      "product",
      "app",
      "sha",
      "route",
      "path",
      "params",
      "role",
      "vw",
      "vh",
      "dpr",
      "ua",
      "t",
      "theme",
      "locale",
      "clicked",
      "lastErr",
      "recentErrors",
    ]);
  });

  it("always reports product as steward, regardless of app", () => {
    expect(JSON.parse(buildUiIssueBundle(minimalInput)).product).toBe("steward");
    expect(JSON.parse(buildUiIssueBundle({ ...minimalInput, app: "admin" })).product).toBe(
      "steward",
    );
  });

  it("omits a key with no value rather than setting it to null", () => {
    const bundle = JSON.parse(buildUiIssueBundle(minimalInput));
    for (const key of ["params", "role", "theme", "locale", "clicked", "lastErr", "recentErrors"]) {
      expect(bundle).not.toHaveProperty(key);
    }
    expect(JSON.stringify(bundle)).not.toContain("null");
  });

  it("omits params given as an empty object", () => {
    const bundle = JSON.parse(buildUiIssueBundle({ ...minimalInput, params: {} }));
    expect(bundle).not.toHaveProperty("params");
  });

  it("omits recentErrors given as an empty array", () => {
    const bundle = JSON.parse(buildUiIssueBundle({ ...minimalInput, recentErrors: [] }));
    expect(bundle).not.toHaveProperty("recentErrors");
  });

  it("truncates lastErr.m to at most 200 characters", () => {
    const long = "x".repeat(400);
    const bundle = JSON.parse(
      buildUiIssueBundle({
        ...minimalInput,
        lastErr: { at: new Date("2026-07-06T18:05:01Z"), m: long, src: "window" },
      }),
    );
    expect((bundle.lastErr.m as string).length).toBeLessThanOrEqual(200);
  });

  it("redacts an email address out of an error message", () => {
    const bundle = JSON.parse(
      buildUiIssueBundle({
        ...minimalInput,
        lastErr: {
          at: new Date("2026-07-06T18:05:01Z"),
          m: "failed for shane.froebel@example.com",
          src: "fetch",
        },
      }),
    );
    expect(bundle.lastErr.m).not.toContain("shane.froebel@example.com");
    expect(bundle.lastErr.m).not.toContain("@");
  });

  it("redacts a bearer token out of an error message", () => {
    const bundle = JSON.parse(
      buildUiIssueBundle({
        ...minimalInput,
        lastErr: {
          at: new Date("2026-07-06T18:05:01Z"),
          m: "call failed: Bearer abc123.def456-ghi789",
          src: "fetch",
        },
      }),
    );
    expect(bundle.lastErr.m).not.toContain("abc123.def456-ghi789");
  });

  it("caps recentErrors at 5, keeping the given (newest-first) order", () => {
    const errors = Array.from({ length: 8 }, (_, index) => ({
      at: new Date("2026-07-06T18:00:00Z"),
      m: `error-${index}`,
      src: "window" as const,
    }));
    const bundle = JSON.parse(buildUiIssueBundle({ ...minimalInput, recentErrors: errors }));
    expect(bundle.recentErrors).toHaveLength(5);
    expect(bundle.recentErrors.map((error: { m: string }) => error.m)).toEqual([
      "error-0",
      "error-1",
      "error-2",
      "error-3",
      "error-4",
    ]);
  });

  it("formats t as ISO 8601 with the US Eastern offset, DST included", () => {
    const edt = JSON.parse(
      buildUiIssueBundle({ ...minimalInput, t: new Date("2026-07-06T18:05:09Z") }),
    );
    expect(edt.t).toBe("2026-07-06T14:05:09-04:00");

    const est = JSON.parse(
      buildUiIssueBundle({ ...minimalInput, t: new Date("2026-01-06T18:05:09Z") }),
    );
    expect(est.t).toBe("2026-01-06T13:05:09-05:00");
  });

  it("formats lastErr.at and recentErrors[].at the same ET way as t", () => {
    const bundle = JSON.parse(
      buildUiIssueBundle({
        ...minimalInput,
        lastErr: { at: new Date("2026-07-06T18:05:01Z"), m: "boom", src: "render" },
      }),
    );
    expect(bundle.lastErr.at).toBe("2026-07-06T14:05:01-04:00");
  });

  it("never includes a query string, cookie or secret-looking field name", () => {
    const bundle = buildUiIssueBundle(minimalInput);
    for (const banned of ["query", "cookie", "token", "secret", "password"]) {
      expect(bundle.toLowerCase()).not.toContain(banned);
    }
  });
});
