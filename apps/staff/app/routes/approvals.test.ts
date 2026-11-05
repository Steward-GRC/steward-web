// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The inbox loader (U24): each task with where it sits in its run, read from the run itself.
import { afterEach, describe, expect, it, vi } from "vitest";

import { loader } from "./approvals";

type Handler = (variables: Record<string, unknown>) => unknown;

const routeGateway = (handlers: Record<string, Handler>) => {
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string) as {
        query: string;
        variables: Record<string, unknown>;
      };
      const operation = /^(?:query|mutation) (\w+)/m.exec(body.query)?.[1] ?? "";
      const handler = handlers[operation];
      if (!handler) return Promise.resolve(Response.json({ errors: [{ message: operation }] }));
      return Promise.resolve(Response.json({ data: handler(body.variables) }));
    }),
  );
};

const approver = {
  email: "carol@example.org",
  firstName: "Carol",
  lastName: "Approver",
  managedGroupIds: [],
  name: "Carol Approver",
  permissions: ["policy.read", "policy.approve"],
  roles: ["approver"],
  scopes: { author: [] },
  userId: "u-3",
  username: "carol",
};

const run = (currentStageIndex: number, stageNames: string[]) => ({
  workflowStatus: {
    currentStageIdx: currentStageIndex,
    runId: "run-1",
    stageAssignees: stageNames.map(() => []),
    stageNames,
    stageUnitProgress: stageNames.map(() => []),
    status: "APPROVAL_STATUS_IN_REVIEW",
  },
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the approvals inbox loader", () => {
  it("reads each run for its stage name and length, and where a coming run is now", async () => {
    routeGateway({
      CategoryTree: () => ({ categoryTree: [] }),
      Me: () => ({ me: approver }),
      PendingTasks: () => ({
        pendingTasks: [
          {
            dueAt: "2026-10-04T00:00:00Z",
            policyTitle: "Expense Claims Policy",
            policyVersionId: "version-3",
            runId: "run-1",
            stageIndex: 1,
            taskId: "task-1",
          },
        ],
      }),
      UpcomingApprovals: () => ({
        upcomingApprovals: [
          {
            policyTitle: "Visitor Sign-in Policy",
            policyVersionId: "version-4",
            stageIndex: 1,
            stageName: "Final approval",
          },
        ],
      }),
      WorkflowStatus: ({ policyVersionId }) =>
        policyVersionId === "version-3"
          ? run(1, ["Finance review", "Final approval"])
          : run(0, ["Facilities review", "Final approval"]),
    });

    const data = await loader({
      params: {},
      request: new Request("https://staff.steward.example/approvals"),
    } as never);

    expect(data.pending).toEqual([
      expect.objectContaining({
        dueAt: "2026-10-04T00:00:00Z",
        stageCount: 2,
        stageName: "Final approval",
        stageNumber: 2,
        title: "Expense Claims Policy",
      }),
    ]);
    expect(data.upcoming).toEqual([
      expect.objectContaining({ nowAt: "Facilities review", stageCount: 2, stageNumber: 2 }),
    ]);
    expect(data.inProgress).toEqual([]);
  });

  it("still lists a task whose run can't be read", async () => {
    routeGateway({
      CategoryTree: () => ({ categoryTree: [] }),
      Me: () => ({ me: approver }),
      PendingTasks: () => ({
        pendingTasks: [
          {
            dueAt: null,
            policyTitle: "Remote Work",
            policyVersionId: "version-9",
            runId: "run-9",
            stageIndex: 0,
            taskId: "task-9",
          },
        ],
      }),
      UpcomingApprovals: () => ({ upcomingApprovals: [] }),
    });
    const data = await loader({
      params: {},
      request: new Request("https://staff.steward.example/approvals"),
    } as never);
    expect(data.pending).toEqual([
      expect.objectContaining({ stageCount: 1, stageNumber: 1, title: "Remote Work" }),
    ]);
  });
});
