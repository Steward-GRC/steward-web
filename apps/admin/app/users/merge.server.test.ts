// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { mergeAccounts, previewAccountMerge } from "./merge.server";

const siteAdminMe = {
  email: "admin@example.com",
  id: "u-admin",
  managedGroupIds: [],
  name: "Admin",
  permissions: ["user.manage"],
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

const request = () => new Request("https://admin.steward.example/users/merge");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("previewAccountMerge", () => {
  it("redirects a caller who lacks user.manage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: readerMe })));
    const thrown: unknown = await previewAccountMerge(request(), "u-1", "u-2").catch(
      (error: unknown) => error,
    );
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("location")).toBe("/");
  });

  it("returns the gateway's dry-run preview for a site-admin", async () => {
    const preview = {
      counts: {
        acknowledgmentsDeduped: 0,
        acknowledgmentsMoved: 1,
        policiesOwned: 2,
        preferences: 0,
        raciGrants: 0,
        workflowItems: 0,
      },
      items: [],
      requiresPrivilegedConfirm: false,
      sourceUserId: "u-1",
      targetUserId: "u-2",
      warnings: [],
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ previewAccountMerge: preview }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await previewAccountMerge(request(), "u-1", "u-2");
    expect(result).toEqual(preview);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({
      sourceUserId: "u-1",
      targetUserId: "u-2",
    });
  });
});

describe("mergeAccounts", () => {
  it("redirects a caller who lacks user.manage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: readerMe })));
    const thrown: unknown = await mergeAccounts(request(), "u-1", "u-2", false).catch(
      (error: unknown) => error,
    );
    expect(thrown).toBeInstanceOf(Response);
  });

  it("sends confirmPrivileged through to the gateway's merge mutation", async () => {
    const outcome = {
      counts: {
        acknowledgmentsDeduped: 0,
        acknowledgmentsMoved: 0,
        policiesOwned: 0,
        preferences: 0,
        raciGrants: 0,
        workflowItems: 0,
      },
      mergeOperationId: "merge-1",
      status: "COMPLETED",
      steps: [],
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ mergeAccounts: outcome }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await mergeAccounts(request(), "u-1", "u-2", true);
    expect(result).toEqual(outcome);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({
      confirmPrivileged: true,
      sourceUserId: "u-1",
      targetUserId: "u-2",
    });
  });
});
