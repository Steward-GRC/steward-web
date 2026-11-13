// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { liveEdge } from "./live.server";

/** Answers a POST by operation name, the way the gateway would, and records the variables. */
const routeGateway = (answers: Record<string, unknown>) => {
  const calls: { operation: string; variables: Record<string, unknown> }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string) as {
        query: string;
        variables: Record<string, unknown>;
      };
      const operation = /^(?:query|mutation) (\w+)/m.exec(body.query)?.[1] ?? "";
      calls.push({ operation, variables: body.variables });
      const data = answers[operation];
      return Promise.resolve(Response.json(data ? { data } : { errors: [{ message: "refused" }] }));
    }),
  );
  return calls;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("liveEdge workflow approver candidates", () => {
  it("asks for one workflow's candidates and returns the people the rows allow", async () => {
    const calls = routeGateway({
      WorkflowApproverCandidates: {
        workflowApproverCandidates: {
          attached: true,
          categoryIds: ["c-1"],
          users: [{ name: "Dave", userId: "u-dave" }],
          workflowId: "w-1",
        },
      },
    });
    const answer = await liveEdge.workflowApproverCandidates("w-1");
    expect(calls).toEqual([
      { operation: "WorkflowApproverCandidates", variables: { workflowId: "w-1" } },
    ]);
    expect(answer.attached).toBe(true);
    expect(answer.users).toEqual([{ name: "Dave", userId: "u-dave" }]);
  });

  it("reports a workflow no category uses as not attached, with nobody to pick", async () => {
    routeGateway({
      WorkflowApproverCandidates: {
        workflowApproverCandidates: {
          attached: false,
          categoryIds: [],
          users: [],
          workflowId: "w-2",
        },
      },
    });
    const answer = await liveEdge.workflowApproverCandidates("w-2");
    expect(answer.attached).toBe(false);
    expect(answer.users).toEqual([]);
  });

  it("lets a refusal throw instead of passing it off as not attached", async () => {
    routeGateway({});
    await expect(liveEdge.workflowApproverCandidates("w-1")).rejects.toThrow();
  });
});
