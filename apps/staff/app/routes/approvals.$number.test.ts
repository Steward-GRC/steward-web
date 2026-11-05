// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { loader } from "./approvals.$number";

type Handler = (variables: Record<string, unknown>) => unknown;

/** Answers each gateway POST by its operation name. */
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
  email: "charlie@example.org",
  firstName: "Charlie",
  lastName: "Approver",
  managedGroupIds: [],
  name: "Charlie Approver",
  permissions: ["policy.read", "policy.approve"],
  roles: ["approver"],
  scopes: { author: [] },
  userId: "u-2",
  username: "charlie",
};

const inReview = {
  workflowStatus: {
    currentStageIdx: 0,
    runId: "run-1",
    stageAssignees: [
      [{ comment: null, decidedAt: null, name: "Charlie", state: "pending", userId: "u-2" }],
    ],
    stageNames: ["Approval"],
    stageUnitProgress: [[]],
    status: "APPROVAL_STATUS_IN_REVIEW",
  },
};

type LoaderArguments = Parameters<typeof loader>[0];

const load = (number: string) =>
  loader({
    params: { number },
    request: new Request(`https://staff.steward.example/approvals/${number}`),
  } as unknown as LoaderArguments);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("approvals.$number loader", () => {
  it("opens a draft the approver can't see in the library by its task's version id", async () => {
    // The gateway hides a never-published draft from anyone who can't edit it, so the inbox
    // links the task by its version id instead of a catalog number (#110).
    routeGateway({
      CategoryTree: () => ({ categoryTree: [] }),
      Me: () => ({ me: approver }),
      PendingTasks: () => ({
        pendingTasks: [
          {
            dueAt: null,
            policyTitle: "Remote Work Equipment",
            policyVersionId: "version-100",
            runId: "run-1",
            stageIndex: 0,
            taskId: "task-1",
          },
        ],
      }),
      WorkflowStatus: () => inReview,
    });

    const result = await load("version-100");

    expect(result.init?.status).toBeUndefined();
    expect(result.data).toMatchObject({
      match: { number: "", title: "Remote Work Equipment" },
      policyVersionId: "version-100",
      task: { runId: "run-1", taskId: "task-1" },
    });
  });

  it("answers 404 for an id that is neither a number nor a task of the approver's", async () => {
    routeGateway({
      CategoryTree: () => ({ categoryTree: [] }),
      Me: () => ({ me: approver }),
      PendingTasks: () => ({ pendingTasks: [] }),
      WorkflowStatus: () => inReview,
    });

    const result = await load("version-404");

    expect(result.init?.status).toBe(404);
    expect(result.data).toEqual({ match: null });
  });
});
