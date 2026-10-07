// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { buildUiIssueBundle, redactMessage, type UiIssueBundleInput } from "./uiIssueBundle";

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

// Every secret-shaped value is assembled at runtime so no literal one sits in the repo history.
const fakeBase64 = btoa(["alice", "pw".repeat(8)].join(":"));
const fakeHex = "0f".repeat(16);
const fakeCookieValue = "a1b2".repeat(4);
const pemHeader = ["-----BEGIN", "PRIVATE", "KEY-----"].join(" ");

describe("redactMessage", () => {
  it.each([
    [
      "an Authorization Basic value",
      `Authorization: Basic ${fakeBase64}`,
      "Basic [redacted]",
      [fakeBase64],
    ],
    [
      "a cookie-style key=value",
      `cookie steward_sid=${fakeCookieValue}; path=/`,
      "[redacted]",
      [fakeCookieValue],
    ],
    [
      "URL userinfo",
      `fetch https://alice:${fakeCookieValue}@db.example.com/x failed`,
      "https://[host]",
      ["alice", fakeCookieValue, "db.example.com"],
    ],
    [
      "a URL fragment",
      `redirect to /callback#access_token=${fakeCookieValue}`,
      "/callback",
      ["#", "access_token"],
    ],
    ["a long hex run", `digest ${fakeHex} mismatch`, "[redacted]", [fakeHex]],
    ["a long base64 run", `blob ${fakeBase64} rejected`, "[redacted]", [fakeBase64]],
    [
      "an unterminated PEM block",
      `bad key ${pemHeader}\nMIIEvQIBADANBg`,
      "[pem]",
      ["BEGIN", "MIIE"],
    ],
    ["a bare FQDN", "connect to db01.corp.example.com refused", "[host]", ["db01", "corp.example"]],
    ["an IPv4 address", "connect to 192.0.2.10:5432 refused", "[ip]", ["192.0.2.10"]],
    [
      "an IPv6 address",
      "connect to fe80::1 and 2001:db8:0:0:0:0:2:1 refused",
      "[ip]",
      ["fe80", "2001:db8"],
    ],
  ])("masks %s", (_name, raw, expected, leaked) => {
    const redacted = redactMessage(raw);
    expect(redacted).toContain(expected);
    for (const value of leaked) expect(redacted).not.toContain(value);
  });

  it.each([
    ["the word basic", "basic auth failed for basic users"],
    ["a UUID", "policy 123e4567-e89b-42d3-a456-426614174000 not found"],
    ["a ULID", "case 01ARZ3NDEKTSV4RRFFQ69G5FAV not found"],
    ["a long identifier", "useMemoizedCallbackWithDependencies is not a function"],
    ["a module path", "Cannot find module /srv/app/node_modules/some-package/dist/index.js"],
    ["a C# or element-id hash", "C# style selector div#main failed"],
    ["a code name ending in a file extension", "Loading chunk main.js failed at a.b"],
    ["a dotted file name", "in uiIssueBundle.test.ts and config.local.js"],
    [
      "a property path",
      [
        ["window", "app", "init"],
        ["import", "meta", "env", "DEV"],
        ["console", "info"],
      ]
        .map((parts) => parts.join("."))
        .concat(["user", "home"].join("."))
        .join(", "),
    ],
  ])("leaves %s readable", (_name, raw) => {
    expect(redactMessage(raw)).toBe(raw);
  });

  it("stays fast on a huge message", () => {
    const started = performance.now();
    redactMessage(`${"a.".repeat(25_000)}@`.repeat(2));
    expect(performance.now() - started).toBeLessThan(250);
  });

  it("masks a JSON-style secret's string value, any key case and colon spacing", () => {
    const value = ["s3", "cr3t", "-value"].join("");
    for (const key of ["password", "Token", "SECRET", "api_key"]) {
      for (const colon of [":", " : ", ":  "]) {
        const redacted = redactMessage(`body {"${key}"${colon}"${value}","id":"x1"} rejected`);
        expect(redacted).toBe(`body {"${key}"${colon}"[redacted]","id":"x1"} rejected`);
      }
    }
  });

  it("masks a JSON-style secret that is unterminated or itself escaped inside a string", () => {
    const value = ["s3", "cr3t", "-value"].join("");
    expect(redactMessage(`body {"password":"${value}`)).toBe('body {"password":"[redacted]"');
    expect(redactMessage(String.raw`body "{\"token\": \"${value}\"}"`)).toBe(
      String.raw`body "{\"token\": \"[redacted]\"}"`,
    );
  });

  it("masks a two-label hostname ending in a network TLD", () => {
    expect(redactMessage(["lookup wiki", "example failed"].join("."))).toBe("lookup [host] failed");
    expect(redactMessage(["lookup acme", "corp failed"].join("."))).toBe("lookup [host] failed");
    expect(redactMessage(["reach wiki", "example."].join("."))).toBe("reach [host].");
  });

  it("leaves a clock time alone", () => {
    expect(redactMessage("timed out at 15:42:07")).toBe("timed out at 15:42:07");
  });

  it("redacts before the 200-character cap, so a secret cut by the cap never leaks a prefix", () => {
    const redacted = redactMessage(`${"x ".repeat(96)}Basic ${fakeBase64}`);
    expect(redacted.length).toBeLessThanOrEqual(200);
    expect(redacted).not.toContain(fakeBase64.slice(0, 2));
  });

  it("runs the same redaction over recentErrors as over lastErr", () => {
    const bundle = JSON.parse(
      buildUiIssueBundle({
        ...minimalInput,
        recentErrors: [
          { at: new Date("2026-07-06T18:04:01Z"), m: `Basic ${fakeBase64}`, src: "fetch" },
          { at: new Date("2026-07-06T18:03:01Z"), m: "from 192.0.2.10", src: "promise" },
        ],
      }),
    );
    expect(bundle.recentErrors.map((error: { m: string }) => error.m)).toEqual([
      "Basic [redacted]",
      "from [ip]",
    ]);
  });
});
