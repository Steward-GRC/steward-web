// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { DocumentType } from "../generated/schema";
import { PolicyStatus } from "../views";
import { liveEdge } from "./live.server";

type Handler = (variables: Record<string, unknown>) => unknown;

/** Answers each POST by its operation name, the way the gateway would, and records the calls. */
const routeGateway = (handlers: Record<string, Handler>) => {
  const calls: { operation: string; variables: Record<string, unknown> }[] = [];
  const fetchSpy = vi.fn((_url: string, init: RequestInit) => {
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
  });
  vi.stubGlobal("fetch", fetchSpy);
  return calls;
};

const viewerCan = {
  ack: true,
  approve: false,
  canBreakGlass: false,
  contentObfuscated: false,
  edit: true,
  read: true,
  submit: true,
};

const category = (id: string, name: string, parentId: null | string = null) => ({
  ackEveryone: false,
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

const policy = (overrides: Record<string, unknown>) => ({
  currentDraftVersionId: null,
  currentPublishedVersionId: "v-2",
  currentVersionNo: 2,
  currentVersionStatus: "published",
  documentType: DocumentType.Policy,
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
  updatedAt: "2026-09-02T00:00:00Z",
  viewerCan,
  ...overrides,
});

const allCategories = [category("c-fin", "Finance"), category("c-travel", "Travel", "c-fin")];

const treeHandlers: Record<string, Handler> = {
  CategoryTree: () => ({ categoryTree: allCategories }),
};

const me = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  name: "Ada Lovelace",
  permissions: ["policy.read"],
  roles: ["reader"],
  scopes: { author: ["Finance"] },
  userId: "u-1",
  username: "ada",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("liveEdge: me", () => {
  it("maps the gateway user onto the identity the shell reads", async () => {
    routeGateway({ Me: () => ({ me }) });
    const { me: readMe } = liveEdge;
    expect(await readMe("c=1")).toMatchObject({ id: "u-1", username: "ada" });
  });

  it("answers null for a signed-out caller", async () => {
    routeGateway({
      Me: () => ({
        errors: [{ extensions: { code: "Unauthenticated" }, message: "no authenticated user" }],
      }),
    });
    const { me: readMe } = liveEdge;
    expect(await readMe()).toBeNull();
  });
});

describe("liveEdge.categories", () => {
  it("lists the root categories with their direct children's names, in one call", async () => {
    const calls = routeGateway(treeHandlers);
    expect(await liveEdge.categories()).toEqual([
      { id: "c-fin", name: "Finance", slug: "finance", subcategories: ["Travel"] },
    ]);
    expect(calls.map((c) => c.operation)).toEqual(["CategoryTree"]);
  });
});

describe("liveEdge.policies", () => {
  it("reads each root's policies, names each row, and takes its version off the policy row", async () => {
    const calls = routeGateway({
      ...treeHandlers,
      Policies: () => ({ policies: [policy({})] }),
    });

    const rows = await liveEdge.policies(DocumentType.Policy);

    expect(rows).toEqual([
      expect.objectContaining({
        category: "Finance",
        homeGroupId: "c-travel",
        status: PolicyStatus.Published,
        subcategory: "Travel",
        updated: "2026-09-02T00:00:00Z",
        version: "2",
      }),
    ]);
    expect(calls.find((c) => c.operation === "Policies")?.variables).toEqual({
      categoryId: "c-fin",
      documentType: "POLICY",
    });
    expect(calls.map((c) => c.operation)).not.toContain("PolicyVersionMeta");
  });
});

describe("liveEdge.policyDetail", () => {
  it("looks the policy up by number and assembles the reader's view, including its history", async () => {
    const calls = routeGateway({
      ...treeHandlers,
      AckStatus: () => ({ ackStatus: { ackedAt: "2026-10-01T00:00:00Z", acknowledged: true } }),
      AuditLog: () => ({
        auditLog: {
          nextPageToken: "",
          records: [
            {
              action: "policy.published",
              actorName: "Ada Lovelace",
              occurredAt: "2026-08-12T00:00:00Z",
            },
            {
              action: "policy.submitted",
              actorName: "Ada Lovelace",
              occurredAt: "2026-07-29T09:15:00Z",
            },
          ],
        },
      }),
      DiffVersions: (v) => ({
        diffVersions: [
          {
            changeType: v.fromVersionId === "v-1" ? "MODIFIED" : "?",
            sectionKey: "purpose",
            sectionTitle: "Purpose",
            wordDiffHtml: null,
          },
        ],
      }),
      PolicyAttachments: () => ({
        policyContactBlocks: [],
        policyDefinitionEntries: [{ definition: "A trip.", id: "d-1", term: "Travel" }],
        policyReferences: [],
        relatedPolicies: [],
      }),
      PolicyByNumber: () => ({ policyByNumber: policy({}) }),
      PolicyVersion: () => ({
        policyVersion: {
          appendices: [
            {
              contentJson: JSON.stringify({ text: "Rates" }),
              id: "a-1",
              letter: "A",
              orderIndex: 0,
              policyVersionId: "v-2",
              title: "Rates",
            },
          ],
          contentJson: JSON.stringify([{ sectionKey: "purpose", text: "Why.", title: "Purpose" }]),
          createdAt: "2026-08-05T00:00:00Z",
          id: "v-2",
          policyId: "p-1",
          publishedAt: "2026-08-12T00:00:00Z",
          status: "published",
          templateVersionId: "",
          versionNo: 2,
        },
      }),
      PolicyVersions: () => ({
        policyVersions: [
          { id: "v-1", status: "superseded", versionNo: 1 },
          { id: "v-2", status: "published", versionNo: 2 },
        ],
      }),
    });

    const detail = await liveEdge.policyDetail(DocumentType.Policy, "FIN-001");

    expect(detail).toMatchObject({
      ack: { acknowledged: true, required: true },
      appendices: [{ id: "a-1", letter: "A", text: "Rates", title: "Rates" }],
      bodyText: "Purpose\n\nWhy.",
      category: "Finance",
      currentVersionId: "v-2",
      definitions: [{ term: "Travel" }],
      history: [
        { at: "2026-07-29T09:15:00Z", kind: "submitted", versionLabel: "2" },
        { at: "2026-08-12T00:00:00Z", kind: "published", versionLabel: "2" },
      ],
      id: "p-1",
      priorVersion: { diff: [{ changeType: "MODIFIED" }], version: "1" },
      published: "2026-08-12T00:00:00Z",
      status: PolicyStatus.Published,
      subcategory: "Travel",
      version: "2",
    });
    expect(calls.find((c) => c.operation === "PolicyByNumber")?.variables).toEqual({
      number: "FIN-001",
    });
    expect(calls.find((c) => c.operation === "AuditLog")?.variables).toEqual({
      subject: "policy:p-1",
    });
  });

  it("answers null when the number carries a different document type", async () => {
    routeGateway({
      ...treeHandlers,
      PolicyByNumber: () => ({ policyByNumber: policy({ documentType: DocumentType.Procedure }) }),
    });
    expect(await liveEdge.policyDetail(DocumentType.Policy, "FIN-001")).toBeNull();
  });

  it("answers null when there is no such number", async () => {
    routeGateway({ ...treeHandlers, PolicyByNumber: () => ({ policyByNumber: null }) });
    expect(await liveEdge.policyDetail(DocumentType.Policy, "NOPE-1")).toBeNull();
  });
});

describe("liveEdge.acknowledgePolicy", () => {
  it("records the acknowledgement and reports it acknowledged", async () => {
    const calls = routeGateway({
      RecordAck: () => ({ recordAck: { ackedAt: "2026-10-06T12:00:00Z" } }),
    });
    expect(await liveEdge.acknowledgePolicy("v-2")).toEqual({
      ackedAt: "2026-10-06T12:00:00Z",
      acknowledged: true,
      required: true,
    });
    expect(calls[0]?.variables).toEqual({ policyVersionId: "v-2" });
  });
});

describe("liveEdge.myDraftPolicies", () => {
  it("assembles the caller's own drafts from the gateway's self-service read", async () => {
    const calls = routeGateway({
      ...treeHandlers,
      MyDrafts: () => ({
        myDrafts: [policy({ currentDraftVersionId: "v-9", id: "mine" })],
      }),
    });
    const drafts = await liveEdge.myDraftPolicies();
    expect(drafts.map((p) => p.id)).toEqual(["mine"]);
    expect(calls.map((c) => c.operation)).not.toContain("Me");
  });
});

describe("liveEdge.myManagedGroups", () => {
  it("reads the caller's managed platform groups, not the category tree", async () => {
    const calls = routeGateway({
      MyManagedGroups: () => ({
        myManagedGroups: [{ id: "g-2", name: "IT Security", parentId: null }],
      }),
    });
    const groups = await liveEdge.myManagedGroups();
    expect(groups).toEqual([{ id: "g-2", name: "IT Security", parentId: null }]);
    expect(calls.map((c) => c.operation)).toEqual(["MyManagedGroups"]);
  });
});

describe("liveEdge.authorableGroups", () => {
  it("keeps only the categories the caller's scopes list as authorable", async () => {
    routeGateway({ ...treeHandlers, Me: () => ({ me }) });
    const groups = await liveEdge.authorableGroups();
    expect(groups.map((g) => g.name)).toEqual(["Finance"]);
  });
});

describe("liveEdge.updateGroupSettings", () => {
  it("passes the governance fields through and preserves the rest", async () => {
    const current = category("c-fin", "Finance");
    const calls = routeGateway({
      Category: () => ({ category: current }),
      SetCategoryGovernance: (variables) => ({
        setCategoryGovernance: { ...current, ...variables },
      }),
    });
    await liveEdge.updateGroupSettings({
      ackEveryone: true,
      exclusionGroupIds: ["legal-hold"],
      id: "c-fin",
      idpGroupIds: null,
    });
    const call = calls.find((c) => c.operation === "SetCategoryGovernance");
    expect(call?.variables).toMatchObject({
      ackEveryone: true,
      ackTriggers: current.ackTriggers,
      exclusionGroupIds: ["legal-hold"],
      idpGroupIds: null,
      owners: current.owners,
    });
  });

  it("skips the governance mutation entirely when only the template/workflow defaults change", async () => {
    const current = category("c-fin", "Finance");
    const calls = routeGateway({
      Category: () => ({ category: current }),
      SetCategoryDefaults: (variables) => ({ setCategoryDefaults: { ...current, ...variables } }),
    });
    await liveEdge.updateGroupSettings({ defaultTemplateNone: true, id: "c-fin" });
    expect(calls.some((c) => c.operation === "SetCategoryGovernance")).toBe(false);
  });
});

describe("liveEdge.listUserSessions", () => {
  it("carries the gateway's clientIp through to the admin sessions table", async () => {
    routeGateway({
      ListUserSessions: () => ({
        listUserSessions: [
          {
            active: true,
            authenticatedAt: "2026-01-01T08:00:00Z",
            clientIp: "203.0.113.5",
            expiresAt: "2026-01-02T00:00:00Z",
            issuedAt: "2026-01-01T08:00:00Z",
            sessionId: "s-1",
            userAgent: "Mozilla/5.0",
            userId: "u-3",
          },
        ],
      }),
    });
    const [session] = await liveEdge.listUserSessions("u-3");
    expect(session?.clientIp).toBe("203.0.113.5");
  });
});

describe("liveEdge.draftVersion", () => {
  it("answers null when the policy has no working draft", async () => {
    const calls = routeGateway({ Policy: () => ({ policy: policy({}) }) });
    expect(await liveEdge.draftVersion("p-1")).toBeNull();
    expect(calls.map((c) => c.operation)).toEqual(["Policy"]);
  });
});

describe("liveEdge.listUserSessions last seen", () => {
  it("carries the gateway's lastSeenAt, null for a session never seen", async () => {
    routeGateway({
      ListUserSessions: () => ({
        listUserSessions: [
          {
            active: true,
            authenticatedAt: "2026-01-01T08:00:00Z",
            clientIp: null,
            expiresAt: "2026-01-02T00:00:00Z",
            issuedAt: "2026-01-01T08:00:00Z",
            lastSeenAt: "2026-01-01T09:30:00Z",
            sessionId: "s-1",
            userAgent: "Mozilla/5.0",
            userId: "u-3",
          },
          {
            active: true,
            authenticatedAt: "2026-01-01T07:00:00Z",
            clientIp: null,
            expiresAt: "2026-01-02T00:00:00Z",
            issuedAt: "2026-01-01T07:00:00Z",
            lastSeenAt: null,
            sessionId: "s-2",
            userAgent: "Mozilla/5.0",
            userId: "u-3",
          },
        ],
      }),
    });
    const [seen, unseen] = await liveEdge.listUserSessions("u-3");
    expect(seen?.lastSeenAt).toBe("2026-01-01T09:30:00Z");
    expect(unseen?.lastSeenAt).toBeNull();
  });
});
