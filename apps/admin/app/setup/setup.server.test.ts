// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { onApiError } from "@steward-web/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { bootstrapRoot, fetchSetupState } from "./setup.server";

const config = { baseUrl: "https://gateway.example" };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchSetupState", () => {
  it("asks the gateway's own setup endpoint, no cookie", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(Response.json({ needsSetup: true }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await fetchSetupState(config);

    expect(result).toEqual({ needsSetup: true });
    expect(fetchSpy.mock.calls[0]?.[0]).toBe("https://gateway.example/setup/state");
  });

  it("treats any network failure as not needing setup, so the app doesn't get stuck", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("unreachable")));

    const result = await fetchSetupState(config);

    expect(result).toEqual({ needsSetup: false });
  });

  it("treats a non-2xx response as not needing setup", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({}, { status: 503 })));

    const result = await fetchSetupState(config);

    expect(result).toEqual({ needsSetup: false });
  });
});

describe("bootstrapRoot", () => {
  it("posts the account payload and parses the userId, with no sso block", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(Response.json({ userId: "u-1" }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await bootstrapRoot(
      {
        email: "root@example.com",
        name: "Root",
        password: "pw",
        setupToken: "tok",
        username: "admin",
      },
      config,
    );

    expect(result).toEqual({ ok: true, sso: undefined, status: 200, userId: "u-1" });
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://gateway.example/setup/bootstrap");
    const body = JSON.parse(init.body as string);
    expect(body).not.toHaveProperty("sso");
    expect(body.username).toBe("admin");
  });

  it("forwards the optional sso block and parses the domain-verification result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          sso: {
            activationDeferred: true,
            domainVerification: {
              dnsRecordName: "_steward-verify.acme.example.org",
              dnsRecordValue: "steward-verify=tok",
              instructions: "Add a TXT record",
              token: "tok",
            },
            organization: {
              domain: "acme.example.org",
              enabled: false,
              orgName: "Acme",
              protocol: "saml",
              verified: false,
            },
          },
          userId: "u-2",
        }),
      ),
    );

    const result = await bootstrapRoot(
      {
        email: "root@example.com",
        name: "Root",
        password: "pw",
        setupToken: "tok",
        sso: {
          config: { entityId: "e" },
          domain: "acme.example.org",
          orgName: "Acme",
          protocol: "saml",
        },
        username: "admin",
      },
      config,
    );

    expect(result.ok).toBe(true);
    expect(result.userId).toBe("u-2");
    expect(result.sso?.activationDeferred).toBe(true);
    expect(result.sso?.domainVerification?.dnsRecordValue).toBe("steward-verify=tok");
  });

  it("maps error status codes to user-facing messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ error: "nope" }, { status: 403 })),
    );

    const result = await bootstrapRoot(
      { email: "root@example.com", name: "", password: "pw", setupToken: "bad", username: "admin" },
      config,
    );

    expect(result).toEqual({ error: "Invalid setup token.", ok: false, status: 403 });
  });

  it("reports an unreachable gateway without throwing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const result = await bootstrapRoot(
      {
        email: "root@example.com",
        name: "Root",
        password: "pw",
        setupToken: "tok",
        username: "admin",
      },
      config,
    );

    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
  });
});

describe("setup API error reporting", () => {
  it("reports a failed bootstrap and setup-state call to the API error reporter", async () => {
    const seen = vi.fn();
    const stop = onApiError(seen);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({}, { status: 503 })));

    await bootstrapRoot(
      { email: "root@example.com", name: "", password: "pw", setupToken: "t", username: "admin" },
      config,
    );
    await fetchSetupState(config);
    stop();

    expect(seen).toHaveBeenCalledWith({
      message: "setup returned 503",
      operation: "SetupBootstrap",
    });
    expect(seen).toHaveBeenCalledWith({ message: "setup returned 503", operation: "SetupState" });
  });
});
