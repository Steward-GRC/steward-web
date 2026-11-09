// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type Identity, NO_ACCESS } from "@steward-web/auth";
import { afterEach, describe, expect, it, vi } from "vitest";

import { staffShellData } from "./shellData.server";

type Handler = () => unknown;

/** Answers each gateway POST by its operation name; anything else refuses. */
const routeGateway = (handlers: Record<string, Handler>) => {
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string) as { query: string };
      const operation = /^(?:query|mutation) (\w+)/m.exec(body.query)?.[1] ?? "";
      const handler = handlers[operation];
      if (!handler) return Promise.resolve(Response.json({ errors: [{ message: operation }] }));
      return Promise.resolve(Response.json({ data: handler() }));
    }),
  );
};

const erin: Identity = {
  ...NO_ACCESS,
  id: "user-erin",
  name: "Erin Reader",
  permissions: new Set(["policy.read"]),
};

const request = new Request("https://staff.steward.example/", {
  headers: { cookie: "steward_sid=sid-1" },
});

afterEach(() => vi.unstubAllGlobals());

describe("staffShellData's banners", () => {
  it("carries the acting-as session (H9)", async () => {
    routeGateway({
      ImpersonationStatus: () => ({
        impersonationStatus: {
          expiresAt: "2026-10-02T10:30:00Z",
          startedAt: "2026-10-02T10:00:00Z",
          targetName: "Erin",
          targetUserId: "user-erin",
        },
      }),
      MyFactors: () => ({ myFactors: [{ enrolledAt: "2026-01-01T00:00:00Z", kind: "totp" }] }),
    });
    const data = await staffShellData(request, erin);
    expect(data.impersonation).toEqual({ expiresAt: "2026-10-02T10:30:00Z", targetName: "Erin" });
    expect(data.secondFactorNudge).toBe(false);
  });

  it("nudges someone with email codes only (H8)", async () => {
    routeGateway({
      ImpersonationStatus: () => ({ impersonationStatus: null }),
      MyFactors: () => ({ myFactors: [{ enrolledAt: null, kind: "email" }] }),
    });
    const data = await staffShellData(request, erin);
    expect(data.impersonation).toBeNull();
    expect(data.secondFactorNudge).toBe(true);
  });

  it("shows neither when the gateway can't say", async () => {
    routeGateway({});
    const data = await staffShellData(request, erin);
    expect(data.impersonation).toBeNull();
    expect(data.secondFactorNudge).toBe(false);
  });
});

describe("staffShellData's approvals count (bug log 257)", () => {
  const task = {
    policyTitle: "P",
    policyVersionId: "v1",
    runId: "r1",
    stageIndex: 0,
    taskId: "t1",
  };

  it("counts what waits on someone who holds a seat without the approver role", async () => {
    routeGateway({ PendingTasks: () => ({ pendingTasks: [task] }) });
    const data = await staffShellData(request, erin);
    expect(data.counts.approvals).toBe(1);
  });

  it("leaves the count out for a reader with nothing waiting", async () => {
    routeGateway({ PendingTasks: () => ({ pendingTasks: [] }) });
    const data = await staffShellData(request, erin);
    expect(data.counts.approvals).toBeUndefined();
  });

  it("keeps a zero for an approver", async () => {
    routeGateway({ PendingTasks: () => ({ pendingTasks: [] }) });
    const approver = { ...erin, permissions: new Set(["policy.approve", "policy.read"]) };
    const data = await staffShellData(request, approver);
    expect(data.counts.approvals).toBe(0);
  });
});
