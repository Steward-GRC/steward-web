// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { action, loader } from "./drafts.$number";

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
  email: "bob@example.org",
  firstName: "Bob",
  lastName: "Author",
  managedGroupIds: [],
  name: "Bob Author",
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
  ownerName: "Bob",
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
  PolicyByNumber: () => ({ policyByNumber: gatewayPolicy }),
  PolicyVersion: () => ({ policyVersion: draftVersion(versionStatus) }),
  WorkflowStatus: () => workflowStatus(approvalStatus),
});

const post = (fields: Record<string, string>) => {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  return new Request("https://staff.steward.example/drafts/FIN-001", { body, method: "POST" });
};

type ActionArguments = Parameters<typeof action>[0];
type LoaderArguments = Parameters<typeof loader>[0];

// The editor's answers are `data(...)`; only `edit` redirects, and its tests read the Response.
const runAction = (fields: Record<string, string>) =>
  action({
    params: { number: "FIN-001" },
    request: post(fields),
  } as unknown as ActionArguments) as Promise<
    Exclude<Awaited<ReturnType<typeof action>>, Response>
  >;

const runLoader = () =>
  loader({
    params: { number: "FIN-001" },
    request: new Request("https://staff.steward.example/drafts/FIN-001"),
  } as unknown as LoaderArguments);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("drafts.$number action: edit (from the reader)", () => {
  const published = {
    ...draftVersion("published"),
    id: "v-2",
    templateVersionId: "tv-1",
    versionNo: 2,
  };
  const publishedOnly = {
    ...gatewayPolicy,
    currentDraftVersionId: null,
    currentPublishedVersionId: "v-2",
  };

  it("starts a working draft from the published version and sends the author to the editor", async () => {
    const calls = routeGateway({
      ...editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"),
      Policy: () => ({ policy: publishedOnly }),
      PolicyVersion: () => ({ policyVersion: published }),
      SaveDraft: () => ({ saveDraft: { ...published, id: "v-3", status: "draft" } }),
    });

    const result = (await runAction({ intent: "edit" })) as unknown as Response;

    expect(result.status).toBe(302);
    expect(result.headers.get("location")).toBe("/drafts/FIN-001");
    expect(calls.find((c) => c.operation === "SaveDraft")?.variables).toMatchObject({
      policyId: "p-1",
      templateVersionId: "tv-1",
    });
  });

  it("just opens the editor when a draft already exists", async () => {
    const calls = routeGateway(editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"));
    const result = (await runAction({ intent: "edit" })) as unknown as Response;
    expect(result.headers.get("location")).toBe("/drafts/FIN-001");
    expect(calls.some((c) => c.operation === "SaveDraft")).toBe(false);
  });
});

describe("drafts.$number action: submit-review", () => {
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

describe("drafts.$number action: withdraw", () => {
  it("withdraws the submission from the run it is in, and keeps the draft", async () => {
    const calls = routeGateway({
      ...editorHandlers("draft", "APPROVAL_STATUS_IN_REVIEW"),
      SignalWorkflow: () => ({ signalWorkflow: true }),
    });

    const result = await runAction({ intent: "withdraw" });

    expect(result.data).toEqual({ intent: "withdraw", ok: true });
    const signal = calls.find((c) => c.operation === "SignalWorkflow")?.variables;
    expect(signal).toMatchObject({
      policyVersionId: "v-9",
      signal: "SIGNAL_TYPE_WITHDRAW",
    });
    expect(calls.map((c) => c.operation)).not.toContain("DiscardDraft");
  });

  it("refuses without signalling when the policy has no working draft", async () => {
    const calls = routeGateway({
      ...editorHandlers("draft", "APPROVAL_STATUS_IN_REVIEW"),
      Policy: () => ({ policy: { ...gatewayPolicy, currentDraftVersionId: null } }),
    });

    const result = await runAction({ intent: "withdraw" });

    expect(result.data).toMatchObject({ intent: "withdraw", ok: false });
    expect(calls.map((c) => c.operation)).not.toContain("SignalWorkflow");
  });
});

describe("drafts.$number action: publish", () => {
  it("no longer publishes directly: a draft publishes through its approval (5-screens.s9)", async () => {
    const calls = routeGateway({
      ...editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"),
      PublishDraft: () => ({ publishDraft: { ...draftVersion("published"), versionNo: 1 } }),
    });

    const result = await runAction({ intent: "publish" });

    expect(result.data).toMatchObject({ intent: "publish", ok: false });
    expect(calls.some((c) => c.operation === "PublishDraft")).toBe(false);
  });
});

const handlers = (extra: Record<string, Handler>) => ({
  ...editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"),
  ...extra,
});

describe("drafts.$number action: the appendices", () => {
  const appendix = {
    draft: null,
    id: "a-1",
    letter: "A",
    orderIndex: 0,
    policyId: "p-1",
    published: null,
    retiredAt: null,
    versions: [],
  };

  it("sends the appendices in their new order", async () => {
    const calls = routeGateway(
      handlers({ ReorderPolicyAppendices: () => ({ reorderPolicyAppendices: [] }) }),
    );
    const result = await runAction({
      intent: "reorder-appendices",
      orderedIds: "a-2,a-1",
      policyId: "p-1",
    });
    expect(result.data).toMatchObject({ ok: true });
    expect(calls.find((c) => c.operation === "ReorderPolicyAppendices")?.variables).toEqual({
      orderedIds: ["a-2", "a-1"],
      policyId: "p-1",
    });
  });

  it("adds an appendix as a draft and opens its page", async () => {
    const calls = routeGateway(
      handlers({
        CreatePolicyAppendix: () => ({ createPolicyAppendix: { ...appendix, letter: "B" } }),
      }),
    );
    const response = (await action({
      params: { number: "FIN-001" },
      request: post({ intent: "add-appendix", policyId: "p-1" }),
    } as unknown as ActionArguments)) as Response;
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/drafts/FIN-001/appendices/B");
    expect(calls.find((c) => c.operation === "CreatePolicyAppendix")?.variables).toMatchObject({
      policyId: "p-1",
      title: "Untitled appendix",
    });
  });

  it("retires and restores an appendix", async () => {
    const calls = routeGateway(
      handlers({
        RestoreAppendix: () => ({ restoreAppendix: appendix }),
        RetireAppendix: () => ({ retireAppendix: appendix }),
      }),
    );
    await runAction({ appendixId: "a-1", intent: "retire-appendix" });
    await runAction({ appendixId: "a-1", intent: "restore-appendix" });
    expect(calls.map((c) => c.operation).filter((o) => o.endsWith("Appendix"))).toEqual([
      "RetireAppendix",
      "RestoreAppendix",
    ]);
  });
});

describe("drafts.$number loader: the address", () => {
  it("opens the editor from the record number in the address", async () => {
    const calls = routeGateway(editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"));
    const result = await runLoader();
    expect(result.policy.id).toBe("p-1");
    expect(calls.find((c) => c.operation === "PolicyByNumber")?.variables).toEqual({
      number: "FIN-001",
    });
  });

  it("answers 404 for a number no record has", async () => {
    routeGateway({
      ...editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"),
      PolicyByNumber: () => ({ policyByNumber: null }),
    });
    await expect(runLoader()).rejects.toMatchObject({ status: 404 });
  });
});

describe("drafts.$number loader: review state", () => {
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

  it("names the approvers on the current step, so the author can write to one of them", async () => {
    routeGateway({
      ...editorHandlers("draft", "APPROVAL_STATUS_IN_REVIEW"),
      WorkflowStatus: () => ({
        workflowStatus: {
          currentStageIdx: 1,
          runId: "run-1",
          stageAssignees: [
            [{ groupId: null, name: "Dave", state: "approved", userId: "u-4" }],
            [
              { groupId: null, name: "Charlie", state: "pending", userId: "u-2" },
              { groupId: null, name: "Alice", state: "pending", userId: "u-1" },
              { groupId: null, name: "Charlie", state: "pending", userId: "u-2" },
            ],
          ],
          stageNames: ["Review", "Final"],
          stageUnitProgress: [[], []],
          status: "APPROVAL_STATUS_IN_REVIEW",
        },
      }),
    });
    const result = await runLoader();
    expect(result.approvers).toEqual([
      { id: "u-2", name: "Charlie" },
      { id: "u-1", name: "Alice" },
    ]);
  });

  it("has no approvers to write to when the draft is not in review", async () => {
    routeGateway(editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"));
    const result = await runLoader();
    expect(result.approvers).toEqual([]);
  });
});

describe("drafts.$number loader: the published text for the live diff (bug log 228)", () => {
  const published = JSON.stringify({ root: { children: [], type: "root" } });
  const handlers = (): Record<string, Handler> => ({
    ...editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"),
    PolicyByNumber: () => ({
      policyByNumber: { ...gatewayPolicy, currentPublishedVersionId: "v-3" },
    }),
    PolicyVersion: (variables) => ({
      policyVersion:
        variables.id === "v-3"
          ? { ...draftVersion("PUBLISHED"), contentJson: published, id: "v-3" }
          : draftVersion("draft"),
    }),
  });

  it("hands back the published version's text to compare the draft with", async () => {
    routeGateway(handlers());
    const result = await runLoader();
    expect(result.published).toBe(published);
  });

  it("has none for a document never published", async () => {
    routeGateway(editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"));
    const result = await runLoader();
    expect(result.published).toBeNull();
  });

  it("opens the editor without a diff when the published text can't be read", async () => {
    routeGateway({
      ...handlers(),
      PolicyVersion: (variables) =>
        variables.id === "v-3"
          ? { errors: [{ message: "gone" }] }
          : { policyVersion: draftVersion("draft") },
    });
    const result = await runLoader();
    expect(result.published).toBeNull();
  });
});

describe("drafts.$number for a procedure (bug log 213)", () => {
  const procedure = { ...gatewayPolicy, documentType: "PROCEDURE", number: "PRC-TRAVEL-000003" };
  const asProcedure = (versionStatus: string, approvalStatus: string): Record<string, Handler> => ({
    ...editorHandlers(versionStatus, approvalStatus),
    Policy: () => ({ policy: procedure }),
    PolicyByNumber: () => ({ policyByNumber: procedure }),
  });
  const number = "PRC-TRAVEL-000003";
  const loadProcedure = () =>
    loader({
      params: { number },
      request: new Request(`https://staff.steward.example/drafts/${number}`),
    } as unknown as LoaderArguments);

  it("opens the editor from the procedure's number and reports it in review", async () => {
    const calls = routeGateway(asProcedure("draft", "APPROVAL_STATUS_IN_REVIEW"));
    const result = await loadProcedure();
    expect(result.policy.documentType).toBe("PROCEDURE");
    expect(result.inReview).toBe(true);
    expect(calls.find((c) => c.operation === "PolicyByNumber")?.variables).toEqual({ number });
  });

  it("submits the procedure's working draft for approval like a policy's", async () => {
    const calls = routeGateway({
      ...asProcedure("draft", "APPROVAL_STATUS_UNSPECIFIED"),
      SubmitWorkflow: () => ({ submitWorkflow: { runId: "run-1" } }),
    });
    const result = (await action({
      params: { number },
      request: post({ intent: "submit-review" }),
    } as unknown as ActionArguments)) as { data: unknown };
    expect(result.data).toEqual({ intent: "submit-review", ok: true, runId: "run-1" });
    expect(calls.find((c) => c.operation === "SubmitWorkflow")?.variables).toMatchObject({
      policyId: "p-1",
      policyVersionId: "v-9",
    });
  });
});
