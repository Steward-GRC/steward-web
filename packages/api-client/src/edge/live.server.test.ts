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
  viewerCan,
  ...overrides,
});

const tree: Record<string, unknown[]> = {
  "": [category("c-fin", "Finance")],
  "c-fin": [category("c-travel", "Travel", "c-fin")],
  "c-travel": [],
};

const treeHandlers: Record<string, Handler> = {
  CategoryChildren: (v) => ({ categoryChildren: tree[String(v.parentId ?? "")] ?? [] }),
};

const me = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  name: "Ada Lovelace",
  permissions: ["policy.read"],
  roles: ["reader"],
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
  it("lists the root categories with their direct children's names", async () => {
    routeGateway(treeHandlers);
    expect(await liveEdge.categories()).toEqual([
      { id: "c-fin", name: "Finance", slug: "finance", subcategories: ["Travel"] },
    ]);
  });
});

describe("liveEdge.policies", () => {
  it("reads each root's policies, then names and versions each row", async () => {
    const calls = routeGateway({
      ...treeHandlers,
      Policies: () => ({ policies: [policy({})] }),
      PolicyVersionMeta: () => ({
        policyVersion: { id: "v-2", status: "published", versionNo: 2 },
      }),
    });

    const rows = await liveEdge.policies(DocumentType.Policy);

    expect(rows).toEqual([
      expect.objectContaining({
        category: "Finance",
        homeGroupId: "c-travel",
        status: PolicyStatus.Published,
        subcategory: "Travel",
        version: "2",
      }),
    ]);
    expect(calls.find((c) => c.operation === "Policies")?.variables).toEqual({
      categoryId: "c-fin",
      documentType: "POLICY",
    });
  });
});

describe("liveEdge.policyDetail", () => {
  it("finds the policy by number and assembles the reader's view", async () => {
    routeGateway({
      ...treeHandlers,
      AckStatus: () => ({ ackStatus: { ackedAt: "2026-10-01T00:00:00Z", acknowledged: true } }),
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
      Policies: () => ({ policies: [policy({}), policy({ id: "p-2", number: "FIN-002" })] }),
      PolicyAttachments: () => ({
        policyContactBlocks: [],
        policyDefinitionEntries: [{ definition: "A trip.", id: "d-1", term: "Travel" }],
        policyReferences: [],
        relatedPolicies: [],
      }),
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
          id: "v-2",
          policyId: "p-1",
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
      history: [],
      id: "p-1",
      priorVersion: { diff: [{ changeType: "MODIFIED" }], version: "1" },
      status: PolicyStatus.Published,
      subcategory: "Travel",
      version: "2",
    });
  });

  it("answers null when no policy of that type carries the number", async () => {
    routeGateway({ ...treeHandlers, Policies: () => ({ policies: [policy({})] }) });
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
  it("keeps only the caller's own policies with a working draft", async () => {
    routeGateway({
      ...treeHandlers,
      Me: () => ({ me }),
      Policies: (v) => ({
        policies:
          v.documentType === "POLICY"
            ? [
                policy({ currentDraftVersionId: "v-9", id: "mine" }),
                policy({ currentDraftVersionId: "v-8", id: "theirs", ownerUserId: "u-2" }),
                policy({ id: "no-draft" }),
              ]
            : [],
      }),
      PolicyVersionMeta: (v) => ({
        policyVersion: { id: v.id, status: "published", versionNo: 1 },
      }),
    });
    const drafts = await liveEdge.myDraftPolicies();
    expect(drafts.map((p) => p.id)).toEqual(["mine"]);
  });
});

describe("liveEdge.draftVersion", () => {
  it("answers null when the policy has no working draft", async () => {
    const calls = routeGateway({ Policy: () => ({ policy: policy({}) }) });
    expect(await liveEdge.draftVersion("p-1")).toBeNull();
    expect(calls.map((c) => c.operation)).toEqual(["Policy"]);
  });
});
