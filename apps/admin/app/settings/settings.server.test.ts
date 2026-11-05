// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { EmailServiceConfigStatus, GlobalSettings } from "@steward-web/api-client";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getAiSettings,
  getEmailServiceConfig,
  getGlobalSettings,
  saveEmailServiceConfig,
  saveGlobalSettings,
  setAiEnabled,
  setAiToken,
  setAiTopK,
} from "./settings.server";

const siteAdminMe = {
  email: "admin@example.org",
  id: "u-admin",
  managedGroupIds: [],
  name: "Admin",
  permissions: ["settings.manage"],
  roles: ["site-admin"],
  username: "admin",
};

const readerMe = {
  email: "reader@example.org",
  id: "u-reader",
  managedGroupIds: [],
  name: "Reader",
  permissions: [],
  roles: ["reader"],
  username: "reader",
};

const jsonOnce = (data: unknown) => Response.json({ data });

const request = () => new Request("https://admin.steward.example/settings");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getGlobalSettings", () => {
  it("redirects a caller who lacks settings.manage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: readerMe })));
    const thrown: unknown = await getGlobalSettings(request()).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("location")).toBe("/");
  });

  it("returns the announcement and maintenance banners", async () => {
    const settings: GlobalSettings = {
      announcement: { enabled: true, level: "info", message: "Hello" },
      maintenance: { enabled: false, message: "" },
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ globalSettings: settings }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await getGlobalSettings(request())).toEqual(settings);
  });
});

describe("saveGlobalSettings", () => {
  it("posts the save mutation", async () => {
    const settings: GlobalSettings = {
      announcement: { enabled: true, level: "warning", message: "Maintenance tonight" },
      maintenance: { enabled: false, message: "" },
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ setGlobalSettings: settings }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(
      await saveGlobalSettings(request(), {
        announcement: settings.announcement,
        maintenance: settings.maintenance,
      }),
    ).toEqual(settings);
  });
});

describe("getEmailServiceConfig / saveEmailServiceConfig", () => {
  it("returns the presence-tracked status, never a key", async () => {
    const status: EmailServiceConfigStatus = {
      apiKeySet: true,
      domain: "mg.example.org",
      enabled: true,
      fromAddress: "notify@example.org",
      provider: "mailgun",
      region: "EU",
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ emailServiceConfig: status }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await getEmailServiceConfig(request())).toEqual(status);
  });

  it("posts the save mutation with the write-only key", async () => {
    const status: EmailServiceConfigStatus = {
      apiKeySet: true,
      domain: "mg.example.org",
      enabled: true,
      fromAddress: "notify@example.org",
      provider: "mailgun",
      region: "EU",
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ setEmailServiceConfig: status }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(
      await saveEmailServiceConfig(request(), {
        apiKey: "new-key",
        domain: "mg.example.org",
        enabled: true,
        fromAddress: "notify@example.org",
        provider: "mailgun",
        region: "EU",
      }),
    ).toEqual(status);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables.input.apiKey).toBe("new-key");
  });
});

const calls = () => {
  const sent: { operation: string; variables: Record<string, unknown> }[] = [];
  const answers: Record<string, unknown> = {
    AiConfig: {
      aiConfig: {
        credentialLast4: "9f2c",
        credentialSet: true,
        enabled: true,
        model: "default",
        provider: "ANTHROPIC",
        topK: 8,
      },
    },
    Me: { me: siteAdminMe },
    SetAiEnabled: { setAIEnabled: false },
    SetAiProviderCredential: {
      setAIProviderCredential: { credentialLast4: "", credentialSet: false },
    },
    SetAiRetrievalConfig: { setAIRetrievalConfig: { topK: 12 } },
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string) as {
        query: string;
        variables: Record<string, unknown>;
      };
      const operation = /(?:query|mutation) (\w+)/.exec(body.query)![1]!;
      if (operation !== "Me") sent.push({ operation, variables: body.variables });
      return jsonOnce(answers[operation]);
    }),
  );
  return sent;
};

describe("the AI settings (A28)", () => {
  it("reads the AI settings, never the token itself", async () => {
    calls();
    expect(await getAiSettings(request())).toMatchObject({
      credentialSet: true,
      enabled: true,
      topK: 8,
    });
  });

  it("turns AI off, stores and clears the token, and sets top-k", async () => {
    const sent = calls();
    await setAiEnabled(request(), false);
    await setAiToken(request(), "  sk-live-key  ");
    await setAiToken(request(), "");
    expect(await setAiTopK(request(), 12)).toBe(12);
    expect(sent.map((call) => call.variables)).toEqual([
      { enabled: false },
      { credential: "sk-live-key" },
      { credential: "" },
      { topK: 12 },
    ]);
  });
});
