// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AuditRecord } from "@steward-web/api-client";

import { afterEach, describe, expect, it, vi } from "vitest";

import { listAuditLog, verifyAuditChain } from "./audit.server";

const siteAdminMe = {
  email: "admin@example.com",
  id: "u-admin",
  managedGroupIds: [],
  name: "Admin",
  permissions: ["audit.read"],
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

const makeRecord = (overrides: Partial<AuditRecord> & Pick<AuditRecord, "id">): AuditRecord => ({
  action: "group.created",
  actorName: "Admin",
  actorUserId: "u-admin",
  groupId: "g-1",
  groupName: "Root",
  legalBasisExempt: false,
  occurredAt: "2026-01-01T00:00:00Z",
  prevHash: "0",
  recordHash: "1",
  recordUuid: `uuid-${overrides.id}`,
  subject: "group:g-1",
  subjectLabel: "Root",
  tier: "audit",
  ...overrides,
});

const request = () => new Request("https://admin.steward.example/audit");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listAuditLog", () => {
  it("redirects a caller who lacks audit.read", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: readerMe })));
    const thrown: unknown = await listAuditLog(request()).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("location")).toBe("/");
  });

  it("asks the gateway for a 200-record page and returns its records as-is", async () => {
    const records = [makeRecord({ id: "1" }), makeRecord({ id: "2" })];
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ auditLog: { nextPageToken: "", records } }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await listAuditLog(request());
    expect(result).toEqual(records);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({ pageSize: 200 });
  });

  it("passes groupId/actorUserId/subject through to the gateway query", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ auditLog: { nextPageToken: "", records: [] } }));
    vi.stubGlobal("fetch", fetchSpy);

    await listAuditLog(request(), { actorUserId: "u-1", groupId: "g-1", subject: "POL-1" });
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({
      actorUserId: "u-1",
      groupId: "g-1",
      subject: "POL-1",
    });
  });

  it("filters by action client-side (the gateway has no argument for it)", async () => {
    const records = [
      makeRecord({ action: "group.created", id: "1" }),
      makeRecord({ action: "group.deleted", id: "2" }),
    ];
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ auditLog: { nextPageToken: "", records } }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await listAuditLog(request(), { action: "deleted" });
    expect(result.map((r) => r.id)).toEqual(["2"]);
  });
});

describe("verifyAuditChain", () => {
  it("requires audit.read and posts the verify query with the given range", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(
        jsonOnce({ verifyAuditChain: { errors: [], recordsChecked: 2, valid: true } }),
      );
    vi.stubGlobal("fetch", fetchSpy);

    const result = await verifyAuditChain(request(), "1", "2");
    expect(result).toEqual({ errors: [], recordsChecked: 2, valid: true });
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({
      fromRecordId: "1",
      toRecordId: "2",
    });
  });
});
