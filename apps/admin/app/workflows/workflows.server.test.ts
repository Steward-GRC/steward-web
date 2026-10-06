// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { WorkflowDef } from "@steward-web/api-client";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  archiveWorkflowDef,
  createWorkflowDef,
  getWorkflowDef,
  listWorkflowDefs,
  listWorkflows,
  updateWorkflowDef,
} from "./workflows.server";

const siteAdminMe = {
  email: "admin@example.com",
  managedGroupIds: [],
  name: "Admin",
  permissions: ["group.manage"],
  roles: ["site-admin"],
  userId: "u-admin",
  username: "admin",
};

const readerMe = {
  email: "reader@example.com",
  managedGroupIds: [],
  name: "Reader",
  permissions: [],
  roles: ["reader"],
  userId: "u-reader",
  username: "reader",
};

const jsonOnce = (data: unknown) => Response.json({ data });

const workflowDef = (
  overrides: Partial<WorkflowDef> & Pick<WorkflowDef, "id" | "name">,
): WorkflowDef => ({
  description: null,
  stages: [],
  version: 1,
  ...overrides,
});

const request = () => new Request("https://admin.steward.example/workflows");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listWorkflows", () => {
  it("redirects a caller who lacks group.manage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: readerMe })));
    const thrown: unknown = await listWorkflows(request()).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("location")).toBe("/");
  });

  it("answers the gateway's workflow list", async () => {
    const workflows = [workflowDef({ id: "w-1", name: "Single approver" })];
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ workflowDefs: workflows }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await listWorkflows(request())).toEqual(workflows);
  });
});

describe("listWorkflowDefs", () => {
  it("answers the full workflow directory", async () => {
    const workflows = [workflowDef({ id: "w-1", name: "Single approver" })];
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ workflowDefs: workflows }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await listWorkflowDefs(request())).toEqual(workflows);
  });
});

describe("getWorkflowDef", () => {
  it("answers one workflow's full detail", async () => {
    const workflow = workflowDef({ id: "w-1", name: "Single approver" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ workflowDef: workflow }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await getWorkflowDef(request(), "w-1")).toEqual(workflow);
  });
});

describe("createWorkflowDef", () => {
  it("posts the create mutation", async () => {
    const created = workflowDef({ id: "w-new", name: "New" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ createWorkflowDef: created }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await createWorkflowDef(request(), "New", null, []);
    expect(result).toEqual(created);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({ name: "New" });
  });
});

describe("updateWorkflowDef", () => {
  it("posts the update mutation", async () => {
    const updated = workflowDef({ id: "w-1", name: "Renamed", version: 2 });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ updateWorkflowDef: updated }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await updateWorkflowDef(request(), "w-1", "Renamed", null, [])).toEqual(updated);
  });
});

describe("archiveWorkflowDef", () => {
  it("posts the archive mutation", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ archiveWorkflowDef: true }));
    vi.stubGlobal("fetch", fetchSpy);

    await expect(archiveWorkflowDef(request(), "w-1")).resolves.toBeUndefined();
  });
});
