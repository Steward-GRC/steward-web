// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { action, loader } from "./drafts.$policyId";

type Handler = (variables: Record<string, unknown>) => unknown;

/** Answers each gateway POST by its operation name and records what was asked. */
const routeGateway = (handlers: Record<string, Handler>) => {
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
      const handler = handlers[operation];
      if (!handler) return Promise.resolve(Response.json({ errors: [{ message: operation }] }));
      const result = handler(body.variables) as Record<string, unknown>;
      return Promise.resolve(Response.json("errors" in result ? result : { data: result }));
    }),
  );
  return calls;
};

const author = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  managedGroupIds: [],
  name: "Ada Lovelace",
  permissions: ["policy.read", "policy.author"],
  roles: ["author"],
  scopes: { author: ["Travel"] },
  userId: "u-1",
  username: "ada",
};

const gatewayPolicy = {
  ackAudienceOverride: null,
  ackTriggers: null,
  currentDraftVersionId: "v-9",
  currentPublishedVersionId: null,
  currentVersionNo: null,
  currentVersionStatus: "draft",
  documentType: "POLICY",
  homeCategoryId: "c-travel",
  id: "p-1",
  number: "FIN-001",
  ownerName: "Ada",
  ownerUserId: "u-1",
  retiredAt: null,
  sensitivity: "STANDARD",
  templateId: null,
  templateNone: true,
  title: "Travel",
  updatedAt: "2026-11-05T00:00:00Z",
  viewerCan: {
    ack: false,
    approve: false,
    canBreakGlass: false,
    contentObfuscated: false,
    edit: true,
    read: true,
    submit: true,
  },
};

const draftVersion = (status: string) => ({
  appendices: [],
  contentJson: "",
  createdAt: "2026-11-05T00:00:00Z",
  id: "v-9",
  policyId: "p-1",
  publishedAt: null,
  status,
  templateVersionId: "",
  versionNo: 0,
});

const workflowStatus = (status: string) => ({
  workflowStatus: {
    currentStageIdx: 0,
    runId: status === "APPROVAL_STATUS_UNSPECIFIED" ? "" : "run-1",
    stageAssignees: [],
    stageNames: [],
    stageUnitProgress: [],
    status,
  },
});

const editorHandlers = (
  versionStatus: string,
  approvalStatus: string,
): Record<string, Handler> => ({
  AiHealth: () => ({ aiHealth: { available: false, reason: "ai_service_unavailable" } }),
  CategoryTree: () => ({
    categoryTree: [
      {
        ackEveryone: false,
        ackTriggers: "ON_PUBLISH",
        defaultTemplateId: null,
        defaultTemplateNone: false,
        defaultWorkflowId: null,
        exclusionGroupIds: null,
        id: "c-travel",
        idpGroupIds: null,
        name: "Travel",
        owners: [],
        parentId: null,
        reviewCadence: "NONE",
        reviewDate: null,
        slug: "travel",
      },
    ],
  }),
  Me: () => ({ me: author }),
  Policy: () => ({ policy: gatewayPolicy }),
  PolicyVersion: () => ({ policyVersion: draftVersion(versionStatus) }),
  WorkflowStatus: () => workflowStatus(approvalStatus),
});

const post = (fields: Record<string, string>) => {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  return new Request("https://staff.steward.example/drafts/p-1", { body, method: "POST" });
};

type ActionArguments = Parameters<typeof action>[0];
type LoaderArguments = Parameters<typeof loader>[0];

const runAction = (fields: Record<string, string>) =>
  action({ params: { policyId: "p-1" }, request: post(fields) } as unknown as ActionArguments);

const runLoader = () =>
  loader({
    params: { policyId: "p-1" },
    request: new Request("https://staff.steward.example/drafts/p-1"),
  } as unknown as LoaderArguments);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("drafts.$policyId action: submit-review", () => {
  it("starts the approval run on the policy's working draft and home category", async () => {
    const calls = routeGateway({
      ...editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"),
      SubmitWorkflow: () => ({ submitWorkflow: { runId: "run-1" } }),
    });

    const result = await runAction({ intent: "submit-review" });

    expect(result.data).toEqual({ intent: "submit-review", ok: true, runId: "run-1" });
    expect(calls.find((c) => c.operation === "SubmitWorkflow")?.variables).toEqual({
      ancestorCategoryIds: [],
      categoryId: "c-travel",
      policyId: "p-1",
      policyVersionId: "v-9",
    });
  });

  it("answers the gateway's refusal, code kept, with a 400", async () => {
    routeGateway({
      ...editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"),
      SubmitWorkflow: () => ({
        errors: [
          {
            extensions: { code: "FAILED_PRECONDITION" },
            message: "no approval workflow is attached to this policy's category",
          },
        ],
      }),
    });

    const result = await runAction({ intent: "submit-review" });

    expect(result.init?.status).toBe(400);
    expect(result.data).toMatchObject({
      error: { code: "FAILED_PRECONDITION", operation: "SubmitWorkflow" },
      intent: "submit-review",
      ok: false,
    });
  });

  it("refuses without calling the gateway's submit when the policy has no working draft", async () => {
    const calls = routeGateway({
      ...editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"),
      Policy: () => ({ policy: { ...gatewayPolicy, currentDraftVersionId: null } }),
    });

    const result = await runAction({ intent: "submit-review" });

    expect(result.data).toMatchObject({ intent: "submit-review", ok: false });
    expect(calls.map((c) => c.operation)).not.toContain("SubmitWorkflow");
  });
});

describe("drafts.$policyId action: publish", () => {
  it("still publishes directly, which the gateway allows any author of the policy", async () => {
    const calls = routeGateway({
      ...editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"),
      PublishDraft: () => ({ publishDraft: { ...draftVersion("published"), versionNo: 1 } }),
    });

    const result = await runAction({ intent: "publish" });

    expect(result.data).toEqual({ intent: "publish", ok: true });
    expect(calls.find((c) => c.operation === "PublishDraft")?.variables).toEqual({
      policyId: "p-1",
    });
  });
});

describe("drafts.$policyId loader: review state", () => {
  it("reports a draft whose approval run is open as in review", async () => {
    routeGateway(editorHandlers("draft", "APPROVAL_STATUS_IN_REVIEW"));
    const result = await runLoader();
    expect(result.inReview).toBe(true);
  });

  it("reports a draft no run holds as not in review", async () => {
    routeGateway(editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"));
    const result = await runLoader();
    expect(result.inReview).toBe(false);
  });

  it("falls back to the draft's own status when the run can't be read", async () => {
    routeGateway({
      ...editorHandlers("IN_REVIEW", "APPROVAL_STATUS_UNSPECIFIED"),
      WorkflowStatus: () => ({ errors: [{ message: "workflow unavailable" }] }),
    });
    const result = await runLoader();
    expect(result.inReview).toBe(true);
  });
});
