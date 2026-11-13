// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { EmailServiceConfigStatus, GlobalSettings } from "@steward-web/api-client";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  approveComplianceHardReset,
  cancelComplianceHardReset,
  executeComplianceHardReset,
  getAiSettings,
  getComplianceSettings,
  getEmailServiceConfig,
  getGlobalSettings,
  getHardReset,
  requestComplianceHardReset,
  saveEmailServiceConfig,
  saveGlobalSettings,
  saveWorkCalendar,
  setAiEnabled,
  setAiToken,
  setAiTopK,
  setComplianceModule,
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
      workCalendar: { holidays: [], timezone: "UTC", weekdays: [1, 2, 3, 4, 5] },
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
      workCalendar: { holidays: [], timezone: "UTC", weekdays: [1, 2, 3, 4, 5] },
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

describe("saveWorkCalendar", () => {
  const stored: GlobalSettings = {
    announcement: { enabled: true, level: "warning", message: "Maintenance tonight" },
    maintenance: { enabled: true, message: "Back at nine" },
    workCalendar: { holidays: [], timezone: "UTC", weekdays: [1, 2, 3, 4, 5] },
  };
  const calendar = {
    holidays: [{ date: "2026-12-25", label: "" }],
    timezone: "Europe/London",
    weekdays: [1, 2, 3, 4],
  };

  it("sends the stored announcement and maintenance along with the calendar", async () => {
    const bodies: { query: string; variables: Record<string, unknown> }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((_url: unknown, init: { body: string }) => {
        const body = JSON.parse(init.body) as (typeof bodies)[number];
        bodies.push(body);
        if (body.query.includes("setGlobalSettings")) {
          return Promise.resolve(
            jsonOnce({ setGlobalSettings: { ...stored, workCalendar: calendar } }),
          );
        }
        if (body.query.includes("globalSettings")) {
          return Promise.resolve(jsonOnce({ globalSettings: stored }));
        }
        return Promise.resolve(jsonOnce({ me: siteAdminMe }));
      }),
    );

    const saved = await saveWorkCalendar(request(), calendar);

    expect(saved.workCalendar).toEqual(calendar);
    const mutation = bodies.find((body) => body.query.includes("setGlobalSettings"));
    expect(mutation?.variables).toEqual({
      input: {
        announcement: stored.announcement,
        maintenance: stored.maintenance,
        workCalendar: calendar,
      },
    });
  });

  it("redirects a caller who lacks settings.manage without writing", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonOnce({ me: readerMe }));
    vi.stubGlobal("fetch", fetchSpy);
    const thrown: unknown = await saveWorkCalendar(request(), calendar).catch(
      (error: unknown) => error,
    );
    expect(thrown).toBeInstanceOf(Response);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
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

/** Answers each operation by name; the caller is `me`. */
const gateway = (me: unknown, answers: Record<string, unknown>) => {
  const seen: { operation: string; variables: Record<string, unknown> }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((_url: unknown, init: { body: string }) => {
      const body = JSON.parse(init.body) as {
        operationName?: string;
        query: string;
        variables: Record<string, unknown>;
      };
      const operation = /(?:query|mutation)\s+(\w+)/.exec(body.query)?.[1] ?? "";
      seen.push({ operation, variables: body.variables });
      return Promise.resolve(jsonOnce(operation === "Me" ? { me } : answers));
    }),
  );
  return seen;
};

describe("the Compliance module and hard reset", () => {
  const complianceMe = { ...siteAdminMe, permissions: ["compliance.manage"], roles: ["reporting"] };
  const asAdmin = {
    ...siteAdminMe,
    permissions: ["settings.manage", "user.manage"],
    userId: "u-admin",
  };
  const asRoot = { ...asAdmin, userId: "u-root" };

  const USERS = {
    users: {
      nextPageToken: "",
      users: [
        { isRoot: true, name: "Rosa Root", userId: "u-root" },
        { isRoot: false, name: "Ada Admin", userId: "u-admin" },
      ],
    },
  };
  const ROW = {
    approvalExpiresAt: null,
    approvedAt: null,
    approvedBy: null,
    cancelledAt: null,
    consumedAt: null,
    consumedBy: null,
    expiresAt: "2026-11-14T10:00:00Z",
    id: "req-1",
    module: "compliance",
    reason: "End of the pilot",
    requestedAt: "2026-11-13T10:00:00Z",
    requestedBy: "u-root",
    state: "pending",
  };

  it("reads and sets the module switch for a compliance manager", async () => {
    const seen = gateway(complianceMe, {
      complianceSettings: { moduleEnabled: true },
      setComplianceModule: { moduleEnabled: false },
    });
    expect(await getComplianceSettings(request())).toEqual({ moduleEnabled: true });
    expect(await setComplianceModule(request(), false)).toEqual({ moduleEnabled: false });
    expect(seen.map((call) => call.operation)).toContain("SetComplianceModule");
  });

  it("redirects a caller who cannot manage compliance", async () => {
    gateway(readerMe, {});
    const thrown: unknown = await getComplianceSettings(request()).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
  });

  it("refuses the hard reset steps to anyone who is not a site admin", async () => {
    gateway(complianceMe, {});
    const thrown = (await getHardReset(request()).catch((error: unknown) => error)) as {
      init: { status: number };
    };
    expect(thrown.init.status).toBe(403);
  });

  it("lists the requests with names and finds root from the user list", async () => {
    gateway(asRoot, { hardResetRequests: [ROW], ...USERS });
    const view = await getHardReset(request());
    expect(view.viewer).toEqual({ id: "u-root", isRoot: true });
    expect(view.names).toEqual({ "u-admin": "Ada Admin", "u-root": "Rosa Root" });
    expect(view.requests).toEqual([ROW]);
  });

  it("does not take a site admin who is not root for root", async () => {
    gateway(asAdmin, { hardResetRequests: [], ...USERS });
    const view = await getHardReset(request());
    expect(view.viewer).toEqual({ id: "u-admin", isRoot: false });
  });

  it("asks, approves, cancels and executes through the gateway", async () => {
    const seen = gateway(asRoot, {
      approveHardReset: { ...ROW, state: "approved" },
      cancelHardReset: { ...ROW, state: "cancelled" },
      executeHardReset: { approvedBy: "u-admin", casesDeleted: 7, requestedBy: "u-root" },
      requestHardReset: ROW,
    });
    await requestComplianceHardReset(request(), "End of the pilot");
    await approveComplianceHardReset(request(), "req-1");
    await cancelComplianceHardReset(request(), "req-1");
    const result = await executeComplianceHardReset(request(), "req-1", "RESET COMPLIANCE DATA");
    expect(result.casesDeleted).toBe(7);
    const calls = seen.filter((call) => call.operation !== "Me");
    expect(calls).toEqual([
      {
        operation: "RequestHardReset",
        variables: { module: "compliance", reason: "End of the pilot" },
      },
      { operation: "ApproveHardReset", variables: { requestId: "req-1" } },
      { operation: "CancelHardReset", variables: { requestId: "req-1" } },
      {
        operation: "ExecuteHardReset",
        variables: { confirmation: "RESET COMPLIANCE DATA", requestId: "req-1" },
      },
    ]);
  });
});
