// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { GatewayError } from "@steward-web/api-client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({
  archiveWorkflowDef: vi.fn(),
  createWorkflowDef: vi.fn(),
  deleteWorkflowDef: vi.fn(),
  getWorkCalendar: vi.fn(),
  getWorkflowDef: vi.fn(),
  updateWorkflowDef: vi.fn(),
}));

vi.mock("../workflows/workflows.server", () => server);

import { action } from "./workflows.$id";

const WORKFLOW = { description: null, id: "w-1", name: "Finance sign-off", stages: [], version: 1 };

const post = (fields: Record<string, string>) =>
  action({
    context: {},
    params: { id: "w-1" },
    request: new Request("https://admin.steward.example/workflows/w-1", {
      body: new URLSearchParams(fields),
      method: "POST",
    }),
  } as unknown as Parameters<typeof action>[0]);

const refused = (code: string, counts?: Record<string, string>) =>
  Promise.reject(new GatewayError("DeleteWorkflowDef", "refused", { code, counts, status: 200 }));

beforeEach(() => {
  for (const mock of Object.values(server)) mock.mockReset();
  server.getWorkflowDef.mockResolvedValue(WORKFLOW);
});

describe("the delete intent", () => {
  it("deletes through deleteWorkflowDef and returns to the list with the name", async () => {
    server.deleteWorkflowDef.mockResolvedValue(true);
    const result = (await post({ intent: "delete" })) as Response;
    expect(server.deleteWorkflowDef).toHaveBeenCalledWith(expect.any(Request), "w-1");
    expect(server.archiveWorkflowDef).not.toHaveBeenCalled();
    expect(result.headers.get("location")).toBe("/workflows?deleted=Finance%20sign-off");
  });

  it("returns the group count when categories use it", async () => {
    server.deleteWorkflowDef.mockImplementation(() =>
      refused("WORKFLOW_DEF_IN_USE_BY_CATEGORY", { category_count: "2" }),
    );
    const result = (await post({ intent: "delete" })) as unknown as {
      data: { intent: string; ok: boolean; refusal: unknown };
      init: { status: number };
    };
    expect(result.data).toMatchObject({
      intent: "delete",
      ok: false,
      refusal: { count: 2, kind: "categories" },
    });
    expect(result.init.status).toBe(409);
  });

  it("returns the run and override count when the workflow was used", async () => {
    server.deleteWorkflowDef.mockImplementation(() =>
      refused("WORKFLOW_DEF_IN_USE", { override_count: "1", run_count: "3" }),
    );
    const result = (await post({ intent: "delete" })) as unknown as {
      data: { refusal: unknown };
    };
    expect(result.data.refusal).toEqual({ count: 4, kind: "used" });
  });

  it("goes back to the list when the workflow no longer exists", async () => {
    server.deleteWorkflowDef.mockImplementation(() => refused("WORKFLOW_DEF_NOT_FOUND"));
    const result = (await post({ intent: "delete" })) as Response;
    expect(result.headers.get("location")).toBe("/workflows?gone=1");
  });

  it("keeps any other failure on the generic banner", async () => {
    server.deleteWorkflowDef.mockImplementation(() => refused("INTERNAL"));
    const result = (await post({ intent: "delete" })) as unknown as {
      data: { failure: { code: string }; refusal?: unknown };
    };
    expect(result.data.failure.code).toBe("INTERNAL");
    expect(result.data.refusal).toBeUndefined();
  });
});

describe("the archive intent", () => {
  it("archives and returns to the list with the name", async () => {
    server.archiveWorkflowDef.mockResolvedValue(true);
    const result = (await post({ intent: "archive" })) as Response;
    expect(server.archiveWorkflowDef).toHaveBeenCalledWith(expect.any(Request), "w-1");
    expect(result.headers.get("location")).toBe("/workflows?archived=Finance%20sign-off");
  });
});
