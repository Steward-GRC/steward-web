// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { action, loader } from "./approvals.$number";

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
      const result = handler(body.variables) as Record<string, unknown>;
      return Promise.resolve(Response.json("errors" in result ? result : { data: result }));
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

const category = (id: string, name: string, parentId: null | string = null) => ({
  ackEveryone: false,
  ackEveryoneSet: false,
  ackTriggers: "ON_PUBLISH",
  defaultTemplateId: null,
  defaultTemplateNone: false,
  defaultWorkflowId: null,
  exclusionGroupIds: null,
  id,
  idpGroupIds: null,
  name,
  owners: [],
  parentId,
  reviewCadence: "NONE",
  reviewDate: null,
  slug: name.toLowerCase(),
});

const expenses = {
  currentDraftVersionId: "version-3",
  currentPublishedVersionId: "version-2",
  currentVersionNo: 2,
  currentVersionStatus: "published",
  documentType: "POLICY",
  homeCategoryId: "c-expenses",
  id: "p-1",
  number: "POL-EXPENSES-000002",
  ownerName: "Dave",
  ownerUserId: "u-4",
  retiredAt: null,
  sensitivity: "STANDARD",
  templateId: null,
  templateNone: true,
  title: "Expense Claims Policy",
  updatedAt: "2026-10-01T00:00:00Z",
  viewerCan: {
    ack: false,
    approve: true,
    canBreakGlass: false,
    contentObfuscated: false,
    edit: false,
    read: true,
    submit: false,
  },
};

describe("approvals.$number loader: the review", () => {
  it("diffs the draft against the published version, reads the draft, and knows a preview", async () => {
    const asked: string[] = [];
    routeGateway({
      CategoryTree: () => ({
        categoryTree: [category("c-fin", "Finance"), category("c-expenses", "Expenses", "c-fin")],
      }),
      DiffVersions: (v) => {
        asked.push(`${String(v.fromVersionId)}→${String(v.toVersionId)}`);
        return {
          diffVersions: [
            {
              changeType: "changed",
              sectionKey: "claim",
              sectionTitle: "Claim",
              wordDiffHtml: "<ins>30</ins>",
            },
          ],
        };
      },
      Me: () => ({ me: approver }),
      PendingTasks: () => ({ pendingTasks: [] }),
      Policies: () => ({ policies: [expenses] }),
      PolicyVersion: () => ({
        policyVersion: {
          appendices: [],
          contentJson: "[]",
          createdAt: null,
          id: "version-3",
          policyId: "p-1",
          publishedAt: null,
          status: "in_review",
          templateVersionId: "",
          versionNo: 3,
        },
      }),
      UpcomingApprovals: () => ({
        upcomingApprovals: [
          {
            policyTitle: "Expense Claims Policy",
            policyVersionId: "version-3",
            stageIndex: 1,
            stageName: "Final approval",
          },
        ],
      }),
      WorkflowStatus: () => inReview,
    });

    const result = await load("POL-EXPENSES-000002");

    expect(asked).toEqual(["version-2→version-3"]);
    expect(result.data).toMatchObject({
      match: { category: "Finance", subcategory: "Expenses", version: "3.0.0" },
      preview: { stageNumber: 2 },
      review: {
        diff: [{ sectionKey: "claim" }],
        upcoming: { blocks: [], version: "3.0.0" },
      },
      task: null,
    });
  });

  // bug log 208: a draft saved without its template version cannot be compared (the service says
  // "fetch template version: not found"). The screen used to read that as "nothing changed".
  it("says the comparison failed instead of showing an empty one", async () => {
    routeGateway({
      CategoryTree: () => ({
        categoryTree: [category("c-fin", "Finance"), category("c-expenses", "Expenses", "c-fin")],
      }),
      DiffVersions: () => ({
        data: null,
        errors: [
          {
            extensions: { code: "INTERNAL" },
            message: "fetch template version: not found",
            path: ["diffVersions"],
          },
        ],
      }),
      Me: () => ({ me: approver }),
      PendingTasks: () => ({ pendingTasks: [] }),
      Policies: () => ({ policies: [expenses] }),
      PolicyVersion: () => ({
        policyVersion: {
          appendices: [],
          contentJson: "[]",
          createdAt: null,
          id: "version-3",
          policyId: "p-1",
          publishedAt: null,
          status: "in_review",
          templateVersionId: "",
          versionNo: 3,
        },
      }),
      UpcomingApprovals: () => ({ upcomingApprovals: [] }),
      WorkflowStatus: () => inReview,
    });

    const result = await load("POL-EXPENSES-000002");

    expect(result.data).toMatchObject({ review: { diff: null, diffFailed: true } });
  });

  it("brings what changed since this approver last reviewed, apart from the comparison with the published version", async () => {
    routeGateway({
      CategoryTree: () => ({
        categoryTree: [category("c-fin", "Finance"), category("c-expenses", "Expenses", "c-fin")],
      }),
      DiffVersions: () => ({ diffVersions: [] }),
      Me: () => ({ me: approver }),
      PendingTasks: () => ({ pendingTasks: [] }),
      Policies: () => ({ policies: [expenses] }),
      PolicyVersion: () => ({
        policyVersion: {
          appendices: [],
          contentJson: "[]",
          createdAt: null,
          id: "version-3",
          policyId: "p-1",
          publishedAt: null,
          status: "in_review",
          templateVersionId: "",
          versionNo: 3,
        },
      }),
      UpcomingApprovals: () => ({ upcomingApprovals: [] }),
      VersionChangesSinceReview: (variables) => {
        expect(variables).toEqual({ policyVersionId: "version-3" });
        return {
          versionChangesSinceReview: [
            {
              changeType: "changed",
              sectionKey: "claim",
              sectionTitle: "Claim",
              wordDiffHtml: "<ins>30</ins>",
            },
          ],
        };
      },
      WorkflowStatus: () => inReview,
    });
    const result = await load("POL-EXPENSES-000002");
    expect(result.data).toMatchObject({
      review: { sinceReview: [{ changeType: "changed", sectionKey: "claim" }] },
    });
  });

  it("has nothing since the last review for someone with no seat, or when it cannot be read", async () => {
    routeGateway({
      CategoryTree: () => ({
        categoryTree: [category("c-fin", "Finance"), category("c-expenses", "Expenses", "c-fin")],
      }),
      DiffVersions: () => ({ diffVersions: [] }),
      Me: () => ({ me: approver }),
      PendingTasks: () => ({ pendingTasks: [] }),
      Policies: () => ({ policies: [expenses] }),
      PolicyVersion: () => ({
        policyVersion: {
          appendices: [],
          contentJson: "[]",
          createdAt: null,
          id: "version-3",
          policyId: "p-1",
          publishedAt: null,
          status: "in_review",
          templateVersionId: "",
          versionNo: 3,
        },
      }),
      UpcomingApprovals: () => ({ upcomingApprovals: [] }),
      VersionChangesSinceReview: () => ({
        data: null,
        errors: [{ extensions: { code: "PERMISSION_DENIED" }, message: "forbidden" }],
      }),
      WorkflowStatus: () => inReview,
    });
    const result = await load("POL-EXPENSES-000002");
    expect(result.data).toMatchObject({ review: { sinceReview: [] } });
  });

  it("is a first publish only when there is no published version to compare with", async () => {
    routeGateway({
      CategoryTree: () => ({
        categoryTree: [category("c-fin", "Finance"), category("c-expenses", "Expenses", "c-fin")],
      }),
      Me: () => ({ me: approver }),
      PendingTasks: () => ({ pendingTasks: [] }),
      Policies: () => ({
        policies: [{ ...expenses, currentPublishedVersionId: null }],
      }),
      PolicyVersion: () => ({
        policyVersion: {
          appendices: [],
          contentJson: "[]",
          createdAt: null,
          id: "version-3",
          policyId: "p-1",
          publishedAt: null,
          status: "in_review",
          templateVersionId: "",
          versionNo: 1,
        },
      }),
      UpcomingApprovals: () => ({ upcomingApprovals: [] }),
      WorkflowStatus: () => inReview,
    });

    const result = await load("POL-EXPENSES-000002");

    expect(result.data).toMatchObject({ review: { diff: null, diffFailed: false, first: true } });
  });
});

const submit = (fields: Record<string, string>) => {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.set(name, value);
  return action({
    request: new Request("https://staff.steward.example/approvals/POL-EXPENSES-000002", {
      body,
      method: "POST",
    }),
  } as unknown as Parameters<typeof action>[0]);
};
const fields = {
  comment: "See my comments.",
  policyVersionId: "version-3",
  runId: "run-1",
  taskId: "task-1",
};

describe("approvals.$number action", () => {
  it("sends comments without deciding", async () => {
    const asked: Record<string, unknown>[] = [];
    routeGateway({
      Me: () => ({ me: approver }),
      SignalWorkflow: (variables) => {
        asked.push(variables);
        return { signalWorkflow: true };
      },
    });
    const answer = (await submit({ ...fields, intent: "request-changes" })) as {
      data: Record<string, unknown>;
    };
    expect(asked).toEqual([
      expect.objectContaining({
        comment: "See my comments.",
        signal: "SIGNAL_TYPE_REQUEST_CHANGES",
      }),
    ]);
    expect(answer.data).toEqual({ sent: true });
  });

  it("still records an approval and a rejection as decisions", async () => {
    routeGateway({
      Me: () => ({ me: approver }),
      SignalWorkflow: () => ({ signalWorkflow: true }),
    });
    expect(((await submit({ ...fields, intent: "approve" })) as { data: unknown }).data).toEqual({
      decided: "approved",
    });
    expect(((await submit({ ...fields, intent: "reject" })) as { data: unknown }).data).toEqual({
      decided: "rejected",
    });
  });
});
