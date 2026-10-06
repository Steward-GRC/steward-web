// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { EmailServiceConfigStatus, GlobalSettings } from "@steward-web/api-client";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getEmailServiceConfig,
  getGlobalSettings,
  saveEmailServiceConfig,
  saveGlobalSettings,
} from "./settings.server";

const siteAdminMe = {
  email: "admin@example.com",
  id: "u-admin",
  managedGroupIds: [],
  name: "Admin",
  permissions: ["settings.manage"],
  roles: ["site-admin"],
  username: "admin",
};

const readerMe = {
  email: "reader@example.com",
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
      domain: "mg.example.com",
      enabled: true,
      fromAddress: "notify@example.com",
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
      domain: "mg.example.com",
      enabled: true,
      fromAddress: "notify@example.com",
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
        domain: "mg.example.com",
        enabled: true,
        fromAddress: "notify@example.com",
        provider: "mailgun",
        region: "EU",
      }),
    ).toEqual(status);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables.input.apiKey).toBe("new-key");
  });
});
