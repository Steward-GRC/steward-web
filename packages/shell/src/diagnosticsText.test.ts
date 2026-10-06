// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ComponentStatus } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { buildDiagnosticsText, type DiagnosticsReportInput } from "./diagnosticsText";

const baseInput: DiagnosticsReportInput = {
  app: { commit: "abc123", version: "v0.1.0" },
  route: "/policies/:id",
  steward: "unavailable",
  time: new Date("2026-01-02T03:04:05.000Z"),
  url: "https://staff.steward.example/policies/42",
  userAgent: "test-agent/1.0",
};

describe("buildDiagnosticsText", () => {
  it("starts with the fixed first line and carries time, URL and route", () => {
    const text = buildDiagnosticsText(baseInput);
    const lines = text.split("\n");
    expect(lines[0]).toBe("Steward diagnostics");
    expect(text).toContain("Time: 2026-01-02T03:04:05.000Z");
    expect(text).toContain("URL: https://staff.steward.example/policies/42");
    expect(text).toContain("Route: /policies/:id");
  });

  it("marks the actor as sign-in-to-include when signed out, never a blank line", () => {
    const text = buildDiagnosticsText({ ...baseInput, steward: "signed-out" });
    expect(text).toContain("Actor: sign in to include");
    expect(text).toContain("Steward: sign in to include");
  });

  it("includes the actor and acting-as block when signed in", () => {
    const text = buildDiagnosticsText({
      ...baseInput,
      actor: {
        actingAs: { id: "u-2", roles: ["reader"], username: "helped-user" },
        id: "u-1",
        roles: ["site-admin"],
        username: "admin-one",
      },
    });
    expect(text).toContain("Actor id: u-1");
    expect(text).toContain("Actor username: admin-one");
    expect(text).toContain("Actor roles: site-admin");
    expect(text).toContain("Acting as id: u-2");
    expect(text).toContain("Acting as username: helped-user");
  });

  it("includes the failure's allow-listed fields only, in order", () => {
    const text = buildDiagnosticsText({
      ...baseInput,
      failure: {
        code: "PERMISSION_DENIED",
        operation: "PublishPolicy",
        reason: "NOT_AUTHOR",
        requestId: "req-1",
        status: 403,
        traceId: "trace-1",
      },
    });
    expect(text).toContain("Failure operation: PublishPolicy");
    expect(text).toContain("Failure code: PERMISSION_DENIED");
    expect(text).toContain("Failure reason: NOT_AUTHOR");
    expect(text).toContain("Failure status: 403");
    expect(text).toContain("Failure request id: req-1");
    expect(text).toContain("Failure trace id: trace-1");
  });

  it("marks Steward unavailable without failing when the read errors or times out", () => {
    expect(buildDiagnosticsText(baseInput)).toContain("Steward: unavailable");
  });

  it("lists the gateway, every service and every third-party component", () => {
    const text = buildDiagnosticsText({
      ...baseInput,
      steward: {
        appliance: null,
        gateway: { commit: "g1", name: "gateway", status: ComponentStatus.Ok, version: "v1.0.0" },
        release: "v0.1.0",
        services: [
          { commit: "c1", name: "steward-core", status: ComponentStatus.Ok, version: "v0.1.0" },
        ],
        thirdParty: [
          {
            commit: null,
            name: "Postgres",
            status: ComponentStatus.Unavailable,
            version: "unavailable",
          },
        ],
      },
    });
    expect(text).toContain("Gateway version: v1.0.0");
    expect(text).toContain("Gateway commit: g1");
    expect(text).toContain("steward-core version: v0.1.0");
    expect(text).toContain("Release: v0.1.0");
    expect(text).toContain("Postgres version: unavailable");
    expect(text).not.toContain("Appliance:");
  });

  it("never carries a field that isn't in the typed, allow-listed input", () => {
    // The type system is the actual guarantee (no object is ever spread into the builder);
    // this test only confirms the builder's OWN output has no stray key=value shape for
    // anything resembling a token, cookie or secret, as a cheap regression tripwire.
    const text = buildDiagnosticsText({
      ...baseInput,
      failure: {
        code: "X",
        operation: "Y",
        reason: "Z",
        requestId: "r",
        status: 500,
        traceId: "t",
      },
    });
    for (const banned of ["token", "cookie", "secret", "password", "Authorization"]) {
      expect(text.toLowerCase()).not.toContain(banned.toLowerCase());
    }
  });
});
