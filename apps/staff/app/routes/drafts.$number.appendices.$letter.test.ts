// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The appendix edit page: an appendix has a life of its own, so it is opened, written, published,
// retired and restored here, away from the policy's own draft.
import { afterEach, describe, expect, it, vi } from "vitest";

import { action, loader } from "./drafts.$number.appendices.$letter";

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

const row = (state: string, versionNo: number, title: string, text: string) => ({
  contentJson: JSON.stringify({ text }),
  createdAt: "2026-11-01T00:00:00Z",
  id: `row-${String(versionNo)}`,
  publishedAt: state === "PUBLISHED" ? "2026-11-02T00:00:00Z" : null,
  publishedBy: state === "PUBLISHED" ? "u-1" : null,
  state,
  title,
  updatedAt: "2026-11-02T00:00:00Z",
  updatedBy: "u-1",
  versionNo,
});

const appendix = (id: string, letter: null | string, extra: Record<string, unknown> = {}) => ({
  draft: null,
  id,
  letter,
  orderIndex: 0,
  policyId: "p-1",
  published: row("PUBLISHED", 1, `Rates ${id}`, "Per diem."),
  retiredAt: null,
  versions: [row("PUBLISHED", 1, `Rates ${id}`, "Per diem.")],
  ...extra,
});

const handlers = (list: unknown[]): Record<string, Handler> => ({
  ...editorHandlers("draft", "APPROVAL_STATUS_UNSPECIFIED"),
  AppendixDiff: () => ({
    appendixDiff: [
      {
        changeType: "changed",
        sectionKey: "body",
        sectionTitle: "body",
        wordDiffHtml: "<ins>x</ins>",
      },
    ],
  }),
  PolicyAppendices: () => ({ policyAppendices: list }),
});

const call = (fields: null | Record<string, string>, letter = "A", number = "FIN-001") => {
  const url = `https://staff.steward.example/drafts/${number}/appendices/${letter}`;
  const request = fields
    ? new Request(url, { body: new URLSearchParams(fields), method: "POST" })
    : new Request(url);
  return { params: { letter, number }, request };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the appendix page loader", () => {
  it("opens the appendix of the letter in the address", async () => {
    const withDraft = appendix("a-1", "A", { draft: row("DRAFT", 2, "Rates (next)", "More.") });
    const calls = routeGateway(handlers([withDraft, appendix("a-2", "B")]));
    const result = await loader(call(null, "A") as unknown as Parameters<typeof loader>[0]);
    expect(result.appendix.id).toBe("a-1");
    expect(calls.find((c) => c.operation === "PolicyAppendices")?.variables).toMatchObject({
      includeRetired: true,
      policyId: "p-1",
    });
  });

  it("opens a retired appendix by its id, which has no letter", async () => {
    routeGateway(handlers([appendix("a-3", null, { retiredAt: "2026-11-03T00:00:00Z" })]));
    const result = await loader(call(null, "a-3") as unknown as Parameters<typeof loader>[0]);
    expect(result.appendix.retiredAt).toBeTruthy();
  });

  it("answers 404 for a letter the policy does not have", async () => {
    routeGateway(handlers([appendix("a-1", "A")]));
    await expect(
      loader(call(null, "Z") as unknown as Parameters<typeof loader>[0]),
    ).rejects.toMatchObject({ status: 404 });
  });
});

const run = (fields: Record<string, string>, letter = "A") =>
  action(call(fields, letter) as unknown as Parameters<typeof action>[0]) as Promise<{
    data: unknown;
  }>;

describe("the appendix page actions", () => {
  it("saves the title and the document into the draft", async () => {
    const calls = routeGateway({
      ...handlers([appendix("a-1", "A")]),
      SaveAppendixDraft: () => ({ saveAppendixDraft: appendix("a-1", "A") }),
    });
    const result = await run({ contentJson: "{}", intent: "save", title: "Rates" });
    expect(result.data).toMatchObject({ intent: "save", ok: true });
    expect(calls.find((c) => c.operation === "SaveAppendixDraft")?.variables).toEqual({
      contentJson: "{}",
      id: "a-1",
      title: "Rates",
    });
  });

  it("publishes, retires and restores", async () => {
    const calls = routeGateway({
      ...handlers([appendix("a-1", "A")]),
      PublishAppendix: () => ({ publishAppendix: appendix("a-1", "A") }),
      RestoreAppendix: () => ({ restoreAppendix: appendix("a-1", "A") }),
      RetireAppendix: () => ({ retireAppendix: appendix("a-1", "A") }),
    });
    for (const intent of ["publish", "retire", "restore"]) {
      const result = await run({ intent });
      expect(result.data).toMatchObject({ intent, ok: true });
    }
    expect(calls.map((c) => c.operation).filter((o) => o.endsWith("Appendix"))).toEqual([
      "PublishAppendix",
      "RetireAppendix",
      "RestoreAppendix",
    ]);
  });

  it("issues a co-editing token for the appendix's own room", async () => {
    const calls = routeGateway({
      ...handlers([appendix("a-1", "A")]),
      IssueAppendixCollabToken: () => ({
        issueAppendixCollabToken: {
          expiresAt: "2026-11-08T00:05:00Z",
          token: "t",
          wsUrl: "/collab/ws/appendix%3Aa-1",
        },
      }),
    });
    const result = await run({ intent: "collab-token" });
    expect(result.data).toMatchObject({
      intent: "collab-token",
      ok: true,
      token: "t",
      wsUrl: "/collab/ws/appendix%3Aa-1",
    });
    expect(calls.find((c) => c.operation === "IssueAppendixCollabToken")?.variables).toEqual({
      appendixId: "a-1",
    });
  });

  it("answers the gateway's refusal with a 400", async () => {
    routeGateway({
      ...handlers([appendix("a-1", "A")]),
      PublishAppendix: () => ({
        errors: [{ extensions: { code: "FAILED_PRECONDITION" }, message: "no draft" }],
      }),
    });
    const result = (await run({ intent: "publish" })) as unknown as { init?: { status: number } };
    expect(result.init?.status).toBe(400);
  });
});
