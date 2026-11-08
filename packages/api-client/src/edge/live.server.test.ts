// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CategoryDocumentTypes,
  DocumentType,
  NotifCadence,
  NotifCategory,
} from "../generated/schema";
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
  ownerName: "Bob",
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
  email: "bob@example.org",
  firstName: "Bob",
  lastName: "Author",
  name: "Bob Author",
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

  it("says whether the person still has to finish first-run onboarding", async () => {
    routeGateway({ Me: () => ({ me: { ...me, needsOnboarding: true } }) });
    const { me: readMe } = liveEdge;
    expect(await readMe("c=1")).toMatchObject({ needsOnboarding: true });
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

describe("liveEdge.completeOnboarding", () => {
  it("accepts the terms with the confirmed profile and answers the onboarded person", async () => {
    const calls = routeGateway({
      CompleteOnboarding: () => ({
        completeOnboarding: { ...me, firstName: "Erin", needsOnboarding: false },
      }),
    });
    const { completeOnboarding } = liveEdge;
    const person = await completeOnboarding(
      { firstName: "Erin", lastName: "Example", username: "erin" },
      "c=1",
    );
    expect(calls).toEqual([
      {
        operation: "CompleteOnboarding",
        variables: { acceptTerms: true, firstName: "Erin", lastName: "Example", username: "erin" },
      },
    ]);
    expect(person).toMatchObject({ firstName: "Erin", needsOnboarding: false });
  });
});

describe("liveEdge: the caller's acknowledgements", () => {
  it("lists what the caller still has to acknowledge", async () => {
    routeGateway({
      MyObligations: () => ({
        myObligations: [
          {
            number: "POL-EXPENSES-000002",
            policyId: "p-2",
            policyVersionId: "v-2",
            title: "Expense Claims Policy",
            version: "2.0.0",
          },
        ],
      }),
    });
    const { myObligations } = liveEdge;
    expect(await myObligations("c=1")).toEqual([
      {
        number: "POL-EXPENSES-000002",
        policyId: "p-2",
        policyVersionId: "v-2",
        title: "Expense Claims Policy",
        version: "2.0.0",
      },
    ]);
  });

  it("counts the caller's mandatory reads and how many are done", async () => {
    routeGateway({ MyAckSummary: () => ({ myAckSummary: { done: 3, required: 4 } }) });
    const { myAckSummary } = liveEdge;
    expect(await myAckSummary("c=1")).toEqual({ done: 3, required: 4 });
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
        version: "2.0.0",
      }),
    ]);
    expect(calls.find((c) => c.operation === "Policies")?.variables).toEqual({
      categoryId: "c-fin",
      documentType: "POLICY",
    });
    expect(calls.map((c) => c.operation)).not.toContain("PolicyVersionMeta");
  });
});

/** A reader's view of FIN-001: two published versions, and an audit log the caller may not read. */
const readerHandlers = (auditLog: Handler): Record<string, Handler> => ({
  ...treeHandlers,
  AckStatus: () => ({ ackStatus: { ackedAt: null, acknowledged: false } }),
  AuditLog: auditLog,
  DiffVersions: () => ({ diffVersions: [] }),
  PolicyAttachments: () => ({
    policyContactBlocks: [],
    policyDefinitionEntries: [],
    policyReferences: [],
    relatedPolicies: [],
  }),
  PolicyByNumber: () => ({ policyByNumber: policy({}) }),
  PolicyVersion: () => ({
    policyVersion: {
      appendices: [],
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
      {
        createdAt: "2026-03-01T00:00:00Z",
        id: "v-1",
        publishedAt: "2026-03-04T00:00:00Z",
        status: "superseded",
        versionNo: 1,
      },
      {
        createdAt: "2026-08-05T00:00:00Z",
        id: "v-2",
        publishedAt: "2026-08-12T00:00:00Z",
        status: "published",
        versionNo: 2,
      },
    ],
  }),
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
              actorName: "Bob Author",
              occurredAt: "2026-08-12T00:00:00Z",
            },
            {
              action: "policy.submitted",
              actorName: "Bob Author",
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
      body: [
        { depth: 1, kind: "heading", text: "Purpose" },
        { kind: "paragraph", runs: [{ text: "Why." }] },
      ],
      bodyText: "Purpose\n\nWhy.",
      bodyUnreadable: false,
      category: "Finance",
      currentVersionId: "v-2",
      definitions: [{ term: "Travel" }],
      history: [
        { at: "2026-07-29T09:15:00Z", kind: "submitted", versionLabel: "2.0.0" },
        { at: "2026-08-12T00:00:00Z", kind: "published", versionLabel: "2.0.0" },
      ],
      id: "p-1",
      priorVersion: { diff: [{ changeType: "MODIFIED" }], version: "1.0.0" },
      published: "2026-08-12T00:00:00Z",
      revision: null,
      status: PolicyStatus.Published,
      subcategory: "Travel",
      summary: null,
      version: "2.0.0",
    });
    expect(calls.find((c) => c.operation === "PolicyByNumber")?.variables).toEqual({
      number: "FIN-001",
    });
    expect(calls.find((c) => c.operation === "AuditLog")?.variables).toEqual({
      subject: "policy:p-1",
    });
  });

  it("lists the versions to compare, the pair it diffed, and whether AI is up", async () => {
    routeGateway({
      ...readerHandlers(() => ({ auditLog: { nextPageToken: "", records: [] } })),
      AiHealth: () => ({ aiHealth: { available: false, reason: "provider_unavailable" } }),
    });
    const detail = await liveEdge.policyDetail(DocumentType.Policy, "FIN-001");
    expect(detail).toMatchObject({
      ai: { available: false, reason: "provider_unavailable" },
      priorVersion: { fromVersionId: "v-1", toVersionId: "v-2", version: "1.0.0" },
      versions: [
        { id: "v-1", status: "superseded", version: "1.0.0" },
        { id: "v-2", status: "published", version: "2.0.0" },
      ],
    });
  });

  it("takes the next review from the nearest category that sets one (R1)", async () => {
    routeGateway({
      ...readerHandlers(() => ({ auditLog: { nextPageToken: "", records: [] } })),
      CategoryTree: () => ({
        categoryTree: [
          { ...category("c-fin", "Finance"), reviewDate: "2027-10-02T00:00:00Z" },
          category("c-travel", "Travel", "c-fin"),
        ],
      }),
    });
    const detail = await liveEdge.policyDetail(DocumentType.Policy, "FIN-001");
    expect(detail?.nextReview).toBe("2027-10-02T00:00:00Z");
  });

  it("has no next review when no category in the chain sets one", async () => {
    routeGateway(readerHandlers(() => ({ auditLog: { nextPageToken: "", records: [] } })));
    const detail = await liveEdge.policyDetail(DocumentType.Policy, "FIN-001");
    expect(detail?.nextReview).toBeNull();
  });

  it("says whether the viewer can edit, for the reader's Edit action", async () => {
    routeGateway(readerHandlers(() => ({ auditLog: { nextPageToken: "", records: [] } })));
    const editable = await liveEdge.policyDetail(DocumentType.Policy, "FIN-001");
    expect(editable?.canEdit).toBe(true);
    routeGateway({
      ...readerHandlers(() => ({ auditLog: { nextPageToken: "", records: [] } })),
      PolicyByNumber: () => ({
        policyByNumber: policy({ viewerCan: { ...viewerCan, edit: false } }),
      }),
    });
    const readOnly = await liveEdge.policyDetail(DocumentType.Policy, "FIN-001");
    expect(readOnly?.canEdit).toBe(false);
  });

  it("draws an appendix written in the editor as blocks, and an old plain one as text", async () => {
    const lexical = JSON.stringify({
      root: {
        children: [
          {
            children: [{ text: "Written in the editor.", type: "text", version: 1 }],
            type: "paragraph",
            version: 1,
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    });
    routeGateway({
      ...readerHandlers(() => ({ auditLog: { nextPageToken: "", records: [] } })),
      PolicyVersion: () => ({
        policyVersion: {
          appendices: [
            {
              contentJson: lexical,
              id: "a-1",
              letter: "A",
              orderIndex: 0,
              policyVersionId: "v-2",
              title: "New",
            },
            {
              contentJson: JSON.stringify({ text: "Old." }),
              id: "a-2",
              letter: "B",
              orderIndex: 1,
              policyVersionId: "v-2",
              title: "Old",
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
    });
    const detail = await liveEdge.policyDetail(DocumentType.Policy, "FIN-001");
    expect(detail?.appendices[0]?.blocks?.length).toBeGreaterThan(0);
    expect(detail?.appendices[1]).toMatchObject({ text: "Old." });
    expect(detail?.appendices[1]?.blocks).toBeUndefined();
  });

  describe.each([
    ["policy", DocumentType.Policy, "POL-EXPENSES-000002"],
    ["procedure", DocumentType.Procedure, "PRC-TRAVEL-000003"],
  ])("a %s with a version in review (bug log 215)", (_label, documentType, number) => {
    const inReview = (edit: boolean, publishedId: null | string) => ({
      ...readerHandlers(() => ({ auditLog: { nextPageToken: "", records: [] } })),
      PolicyByNumber: () => ({
        policyByNumber: policy({
          currentDraftVersionId: "v-3",
          currentPublishedVersionId: publishedId,
          documentType,
          number,
          viewerCan: { ...viewerCan, edit },
        }),
      }),
      PolicyVersion: (v: Record<string, unknown>) => ({
        policyVersion: {
          appendices: [],
          contentJson: JSON.stringify([
            {
              sectionKey: "purpose",
              text: v.id === "v-3" ? "The submitted words." : "The published words.",
              title: "Purpose",
            },
          ]),
          createdAt: "2026-08-05T00:00:00Z",
          id: v.id,
          policyId: "p-1",
          publishedAt: v.id === "v-2" ? "2026-08-12T00:00:00Z" : null,
          status: v.id === "v-3" ? "in_review" : "published",
          templateVersionId: "",
          versionNo: v.id === "v-3" ? 0 : 2,
        },
      }),
      PolicyVersions: () => ({
        policyVersions: [
          ...(publishedId
            ? [
                {
                  createdAt: "2026-08-05T00:00:00Z",
                  id: "v-2",
                  publishedAt: "2026-08-12T00:00:00Z",
                  status: "published",
                  versionNo: 2,
                },
              ]
            : []),
          {
            createdAt: "2026-10-05T00:00:00Z",
            id: "v-3",
            publishedAt: null,
            status: "in_review",
            versionNo: 0,
          },
        ],
      }),
    });

    it("shows the published version, never the one in review", async () => {
      routeGateway(inReview(true, "v-2"));
      const detail = await liveEdge.policyDetail(documentType, number);
      expect(JSON.stringify(detail?.body)).toContain("The published words.");
      expect(JSON.stringify(detail?.body)).not.toContain("The submitted words.");
      expect(detail?.status).toBe("PUBLISHED");
    });

    it("tells someone who can edit about the version in review, with where it is", async () => {
      routeGateway(inReview(true, "v-2"));
      const detail = await liveEdge.policyDetail(documentType, number);
      expect(detail?.revision).toMatchObject({ status: "IN_REVIEW" });
    });

    it("tells someone who cannot edit nothing about it", async () => {
      routeGateway(inReview(false, "v-2"));
      const detail = await liveEdge.policyDetail(documentType, number);
      expect(detail?.revision).toBeNull();
    });

    it("never published: shows no content, only the way to the version, to an editor", async () => {
      routeGateway(inReview(true, null));
      const detail = await liveEdge.policyDetail(documentType, number);
      expect(detail?.body).toEqual([]);
      expect(detail?.version).toBe("");
      expect(detail?.revision).toMatchObject({ status: "IN_REVIEW" });
    });

    it("never published: is not there at all for someone who cannot edit", async () => {
      routeGateway(inReview(false, null));
      expect(await liveEdge.policyDetail(documentType, number)).toBeNull();
    });
  });

  it("reads AI as unavailable when the health check itself fails", async () => {
    routeGateway(readerHandlers(() => ({ auditLog: { nextPageToken: "", records: [] } })));
    const detail = await liveEdge.policyDetail(DocumentType.Policy, "FIN-001");
    expect(detail?.ai).toEqual({ available: false, reason: "ai_service_unavailable" });
  });

  it("names a revision in review beside the published version, and reads its stored summary", async () => {
    routeGateway({
      ...readerHandlers(() => ({ auditLog: { nextPageToken: "", records: [] } })),
      PolicyByNumber: () => ({ policyByNumber: policy({ currentDraftVersionId: "v-3" }) }),
      PolicyVersions: () => ({
        policyVersions: [
          { id: "v-2", status: "published", versionNo: 2 },
          { id: "v-3", status: "in_review", versionNo: 3 },
        ],
      }),
      PolicyVersionSummary: (v) => ({
        policyVersionSummary:
          v.versionId === "v-2"
            ? { generatedAt: "2026-08-12T00:00:00Z", summaryText: "Book ahead; cancel early." }
            : null,
      }),
    });
    const detail = await liveEdge.policyDetail(DocumentType.Policy, "FIN-001");
    expect(detail).toMatchObject({
      revision: { status: PolicyStatus.InReview, version: "3.0.0" },
      summary: { generatedAt: "2026-08-12T00:00:00Z", text: "Book ahead; cancel early." },
    });
  });

  it("flags a body it couldn't read, so the reader can say so", async () => {
    routeGateway({
      ...readerHandlers(() => ({ auditLog: { nextPageToken: "", records: [] } })),
      PolicyVersion: () => ({
        policyVersion: {
          appendices: [],
          contentJson: "{ broken",
          createdAt: "2026-08-05T00:00:00Z",
          id: "v-2",
          policyId: "p-1",
          publishedAt: "2026-08-12T00:00:00Z",
          status: "published",
          templateVersionId: "",
          versionNo: 2,
        },
      }),
    });
    const detail = await liveEdge.policyDetail(DocumentType.Policy, "FIN-001");
    expect(detail).toMatchObject({ body: [], bodyUnreadable: true });
  });

  it("builds a caller without audit.read the history from the versions they can read", async () => {
    routeGateway(
      readerHandlers(() => ({
        errors: [
          {
            extensions: { code: "PermissionDenied" },
            message: "not authorized: audit.read",
          },
        ],
      })),
    );

    const detail = await liveEdge.policyDetail(DocumentType.Policy, "FIN-001");

    expect(detail).toMatchObject({ bodyText: "Purpose\n\nWhy.", id: "p-1", version: "2.0.0" });
    expect(detail?.history).toEqual([
      {
        actorName: null,
        at: "2026-03-04T00:00:00Z",
        comment: null,
        kind: "published",
        stage: null,
        versionLabel: "1.0.0",
      },
      {
        actorName: null,
        at: "2026-08-12T00:00:00Z",
        comment: null,
        kind: "published",
        stage: null,
        versionLabel: "2.0.0",
      },
    ]);
  });

  it("still fails the read when the audit log fails for any other reason", async () => {
    routeGateway(
      readerHandlers(() => ({
        errors: [{ extensions: { code: "INTERNAL" }, message: "audit unavailable" }],
      })),
    );

    await expect(liveEdge.policyDetail(DocumentType.Policy, "FIN-001")).rejects.toThrow(
      "audit unavailable",
    );
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

  it.each(["NotFound", "NOT_FOUND"])(
    "answers null, as for a missing number, when the gateway refuses with %s",
    async (code) => {
      routeGateway({
        ...treeHandlers,
        PolicyByNumber: () => ({
          errors: [{ extensions: { code }, message: "policy not found" }],
        }),
      });
      expect(await liveEdge.policyDetail(DocumentType.Procedure, "FIN-001")).toBeNull();
    },
  );

  it("still fails the read when the lookup is refused for any other reason", async () => {
    routeGateway({
      ...treeHandlers,
      PolicyByNumber: () => ({
        errors: [{ extensions: { code: "INTERNAL" }, message: "catalog unavailable" }],
      }),
    });
    await expect(liveEdge.policyDetail(DocumentType.Policy, "FIN-001")).rejects.toThrow(
      "catalog unavailable",
    );
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

describe("liveEdge.policyByNumber", () => {
  it("looks the record up by its number and answers its view", async () => {
    const calls = routeGateway({
      ...treeHandlers,
      PolicyByNumber: () => ({ policyByNumber: policy({ id: "p-7", number: "FIN-007" }) }),
    });
    const found = await liveEdge.policyByNumber("FIN-007");
    expect(found).toMatchObject({ id: "p-7", number: "FIN-007" });
    expect(calls.find((c) => c.operation === "PolicyByNumber")?.variables).toEqual({
      number: "FIN-007",
    });
  });

  it("answers null when the gateway has no such number or refuses it", async () => {
    routeGateway({
      ...treeHandlers,
      PolicyByNumber: () => ({ errors: [{ extensions: { code: "NOT_FOUND" }, message: "no" }] }),
    });
    expect(await liveEdge.policyByNumber("FIN-404")).toBeNull();
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

  it("sets the template lock after the defaults, only when it changes (steward-web#262)", async () => {
    const current = category("c-fin", "Finance");
    const calls = routeGateway({
      Category: () => ({ category: current }),
      CategoryTemplateLocks: () => ({ categoryTree: [] }),
      SetCategoryDefaults: (variables) => ({ setCategoryDefaults: { ...current, ...variables } }),
      SetCategoryTemplateLock: () => ({
        setCategoryTemplateLock: { defaultTemplateLocked: true, id: "c-fin" },
      }),
    });
    await liveEdge.updateGroupSettings({
      defaultTemplateId: "t-1",
      defaultTemplateLocked: true,
      defaultTemplateNone: false,
      id: "c-fin",
    });
    expect(calls.map((c) => c.operation).filter((o) => o.startsWith("SetCategory"))).toEqual([
      "SetCategoryDefaults",
      "SetCategoryTemplateLock",
    ]);
    calls.length = 0;
    await liveEdge.updateGroupSettings({
      defaultTemplateId: "t-1",
      defaultTemplateLocked: false,
      defaultTemplateNone: false,
      id: "c-fin",
    });
    expect(calls.map((c) => c.operation)).not.toContain("SetCategoryTemplateLock");
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

describe("liveEdge moving several documents at once (#87)", () => {
  const item = {
    newNumber: "POL-FIN-000009",
    number: "POL-EXP-000001",
    policyId: "p-1",
    refusal: null,
    title: "T",
  };

  it("previews what each would get, changing nothing", async () => {
    const calls = routeGateway({
      PreviewMovePolicies: () => ({ previewMovePolicies: { items: [item] } }),
    });
    expect(await liveEdge.previewMovePolicies(["p-1"], "c-fin")).toEqual([item]);
    expect(calls[0]?.variables).toEqual({ homeCategoryId: "c-fin", policyIds: ["p-1"] });
  });

  it("moves them together and answers the new numbers", async () => {
    const calls = routeGateway({ MovePolicies: () => ({ movePolicies: { moved: [item] } }) });
    expect(await liveEdge.movePolicies(["p-1"], "c-fin")).toEqual([item]);
    expect(calls[0]?.operation).toBe("MovePolicies");
  });
});

describe("liveEdge category document types (#87)", () => {
  it("sets what a category holds with its own mutation, leaving the others alone", async () => {
    const current = category("c-fin", "Finance");
    const calls = routeGateway({
      Category: () => ({ category: current }),
      SetCategoryDocumentTypes: (variables) => ({
        setCategoryDocumentTypes: { ...current, ...variables },
      }),
    });
    const saved = await liveEdge.updateGroupSettings({
      documentTypes: CategoryDocumentTypes.Policies,
      id: "c-fin",
    });
    const call = calls.find((c) => c.operation === "SetCategoryDocumentTypes");
    expect(call?.variables).toEqual({ documentTypes: CategoryDocumentTypes.Policies, id: "c-fin" });
    expect(saved.documentTypes).toBe(CategoryDocumentTypes.Policies);
    expect(calls.some((c) => c.operation === "SetCategoryGovernance")).toBe(false);
    expect(calls.some((c) => c.operation === "SetCategoryDefaults")).toBe(false);
  });

  it("counts the policies and procedures a category holds", async () => {
    routeGateway({
      CategoryDocumentCounts: () => ({ categoryDocumentCounts: { policies: 3, procedures: 1 } }),
    });
    expect(await liveEdge.categoryDocumentCounts("c-fin")).toEqual({ policies: 3, procedures: 1 });
  });
});

describe("liveEdge category document types on a gateway without the field (#87)", () => {
  it("reads them from the side query when the gateway has them", async () => {
    routeGateway({
      CategoryChildren: () => ({ categoryChildren: [category("c-fin", "Finance")] }),
      CategoryDocumentTypesAll: () => ({
        categoryTree: [{ documentTypes: "POLICIES", id: "c-fin" }],
      }),
    });
    const [finance] = await liveEdge.groupChildren(null);
    expect(finance?.documentTypes).toBe("POLICIES");
  });

  it("leaves the field out when the gateway refuses the side query, so every category holds both", async () => {
    routeGateway({
      CategoryChildren: () => ({ categoryChildren: [category("c-fin", "Finance")] }),
    });
    const [finance] = await liveEdge.groupChildren(null);
    expect(finance?.id).toBe("c-fin");
    expect(finance?.documentTypes).toBeUndefined();
  });

  it("asks the side query once for a burst of reads", async () => {
    const calls = routeGateway({
      CategoryChildren: () => ({ categoryChildren: [category("c-fin", "Finance")] }),
      CategoryDocumentTypesAll: () => ({ categoryTree: [] }),
    });
    await Promise.all([liveEdge.groupChildren(null), liveEdge.groupChildren("c-fin")]);
    expect(calls.filter((c) => c.operation === "CategoryDocumentTypesAll")).toHaveLength(1);
  });
});

describe("liveEdge category template lock (steward-web#262)", () => {
  it("reads the lock from its own query and adds it to the category", async () => {
    routeGateway({
      CategoryChildren: () => ({ categoryChildren: [category("c-fin", "Finance")] }),
      CategoryTemplateLocks: () => ({
        categoryTree: [{ defaultTemplateLocked: true, id: "c-fin" }],
      }),
    });
    const [finance] = await liveEdge.groupChildren(null);
    expect(finance?.defaultTemplateLocked).toBe(true);
  });

  it("leaves it out, so nothing is locked, when the gateway refuses the query", async () => {
    routeGateway({
      CategoryChildren: () => ({ categoryChildren: [category("c-fin", "Finance")] }),
    });
    const [finance] = await liveEdge.groupChildren(null);
    expect(finance?.id).toBe("c-fin");
    expect(finance?.defaultTemplateLocked).toBeUndefined();
  });

  it("sets the lock", async () => {
    const calls = routeGateway({
      SetCategoryTemplateLock: () => ({
        setCategoryTemplateLock: { defaultTemplateLocked: true, id: "c-fin" },
      }),
    });
    await liveEdge.setCategoryTemplateLock("c-fin", true);
    expect(calls[0]?.variables).toEqual({ id: "c-fin", locked: true });
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

describe("liveEdge.startDraft", () => {
  const published = {
    appendices: [],
    contentJson: JSON.stringify([{ sectionKey: "purpose", text: "Why.", title: "Purpose" }]),
    createdAt: "2026-08-05T00:00:00Z",
    id: "v-2",
    policyId: "p-1",
    publishedAt: "2026-08-12T00:00:00Z",
    status: "published",
    templateVersionId: "tv-1",
    versionNo: 2,
  };

  it("saves a working draft from the published version when there is none, so a published policy can be edited", async () => {
    const calls = routeGateway({
      Policy: () => ({ policy: policy({}) }),
      PolicyVersion: () => ({ policyVersion: published }),
      SaveDraft: (variables) => ({
        saveDraft: { ...published, contentJson: variables.contentJson, id: "v-3", status: "draft" },
      }),
    });
    const draft = await liveEdge.startDraft("p-1");
    expect(draft?.id).toBe("v-3");
    const save = calls.find((c) => c.operation === "SaveDraft");
    expect(save?.variables).toEqual({
      contentJson: published.contentJson,
      policyId: "p-1",
      templateVersionId: "tv-1",
    });
  });

  it("keeps the draft that is already there and saves nothing", async () => {
    const calls = routeGateway({
      Policy: () => ({ policy: policy({ currentDraftVersionId: "v-3" }) }),
      PolicyVersion: () => ({ policyVersion: { ...published, id: "v-3", status: "draft" } }),
    });
    const kept = await liveEdge.startDraft("p-1");
    expect(kept?.id).toBe("v-3");
    expect(calls.some((c) => c.operation === "SaveDraft")).toBe(false);
  });

  it("answers null for a policy that cannot be found", async () => {
    routeGateway({ Policy: () => ({ policy: null }) });
    expect(await liveEdge.startDraft("p-9")).toBeNull();
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

describe("liveEdge.submitWorkflow", () => {
  it("starts the approval run for the draft and answers its run id", async () => {
    const calls = routeGateway({
      SubmitWorkflow: () => ({ submitWorkflow: { runId: "run-1" } }),
    });
    expect(await liveEdge.submitWorkflow("v-9", "p-1", "c-travel")).toEqual({ runId: "run-1" });
    // The gateway walks the category lineage itself from categoryId, so none is sent.
    expect(calls).toEqual([
      {
        operation: "SubmitWorkflow",
        variables: {
          ancestorCategoryIds: [],
          categoryId: "c-travel",
          policyId: "p-1",
          policyVersionId: "v-9",
        },
      },
    ]);
  });

  it("passes the gateway's refusal through, code and all", async () => {
    routeGateway({
      SubmitWorkflow: () => ({
        errors: [
          {
            extensions: { code: "FAILED_PRECONDITION" },
            message: "No approval workflow is attached to this policy's category.",
          },
        ],
      }),
    });
    await expect(liveEdge.submitWorkflow("v-9", "p-1", "c-travel")).rejects.toMatchObject({
      code: "FAILED_PRECONDITION",
      message: "No approval workflow is attached to this policy's category.",
      operation: "SubmitWorkflow",
    });
  });
});

describe("liveEdge.versionDiff", () => {
  it("diffs any two versions the caller picked (U19)", async () => {
    const calls = routeGateway({
      DiffVersions: () => ({
        diffVersions: [
          {
            changeType: "MODIFIED",
            sectionKey: "receipts",
            sectionTitle: "Receipts",
            wordDiffHtml: "<ins>photos</ins>",
          },
        ],
      }),
    });
    expect(await liveEdge.versionDiff("v-1", "v-3", "steward_sid=s")).toEqual([
      {
        changeType: "MODIFIED",
        sectionKey: "receipts",
        sectionTitle: "Receipts",
        wordDiffHtml: "<ins>photos</ins>",
      },
    ]);
    expect(calls).toEqual([
      { operation: "DiffVersions", variables: { fromVersionId: "v-1", toVersionId: "v-3" } },
    ]);
  });
});

describe("liveEdge.versionDocument", () => {
  it("reads one version's body and appendices as the reader draws them (U25)", async () => {
    const calls = routeGateway({
      PolicyVersion: () => ({
        policyVersion: {
          appendices: [
            {
              contentJson: JSON.stringify({ text: "Rates" }),
              id: "a-1",
              letter: "A",
              orderIndex: 0,
              policyVersionId: "v-3",
              title: "Rates",
            },
          ],
          contentJson: JSON.stringify({
            root: {
              children: [
                { children: [{ text: "Receipts", type: "text" }], tag: "h2", type: "heading" },
                { children: [{ text: "A photo is enough.", type: "text" }], type: "paragraph" },
              ],
              type: "root",
            },
          }),
          createdAt: null,
          id: "v-3",
          policyId: "p-1",
          publishedAt: null,
          status: "in_review",
          templateVersionId: "",
          versionNo: 3,
        },
      }),
    });
    expect(await liveEdge.versionDocument("v-3")).toEqual({
      appendices: [{ id: "a-1", letter: "A", text: "Rates", title: "Rates" }],
      blocks: [
        { depth: 1, kind: "heading", sectionKey: "receipts", text: "Receipts" },
        { kind: "paragraph", runs: [{ text: "A photo is enough." }] },
      ],
      contentJson: expect.stringContaining("A photo is enough."),
      version: "3.0.0",
    });
    expect(calls).toEqual([{ operation: "PolicyVersion", variables: { id: "v-3" } }]);
  });

  it("is null for a version the caller can't read", async () => {
    routeGateway({ PolicyVersion: () => ({ policyVersion: null }) });
    expect(await liveEdge.versionDocument("v-9")).toBeNull();
  });
});

describe("liveEdge: creating a policy", () => {
  const gatewayPolicy = {
    ackAudienceOverride: null,
    ackTriggers: "ON_PUBLISH",
    currentDraftVersionId: "v-1",
    currentPublishedVersionId: null,
    currentVersionNo: 0,
    currentVersionStatus: "draft",
    documentType: "POLICY",
    homeCategoryId: "category-finance",
    id: "p-1",
    number: "POL-FINANCE-000001",
    ownerName: "Bob",
    ownerUserId: "u-1",
    retiredAt: null,
    sensitivity: "STANDARD",
    templateId: null,
    templateNone: false,
    title: "Hello",
    updatedAt: "2026-11-08T00:00:00Z",
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

  it("asks for the template that was chosen and does nothing more", async () => {
    const calls = routeGateway({
      CategoryTree: () => ({ categoryTree: [] }),
      CreatePolicy: () => ({ createPolicy: gatewayPolicy }),
    });
    await liveEdge.createPolicy({
      homeGroupId: "category-finance",
      sensitivity: "STANDARD" as never,
      templateId: "template-1",
      title: "Hello",
    });
    const writes = calls.filter(
      (call) => /Policy/.test(call.operation) && !/Categor/.test(call.operation),
    );
    expect(writes.map((call) => call.operation)).toEqual(["CreatePolicy"]);
    expect(writes[0]?.variables).toMatchObject({ templateId: "template-1" });
  });

  it("makes a freeform policy by setting it to no template right after it is created", async () => {
    const calls = routeGateway({
      CategoryTree: () => ({ categoryTree: [] }),
      CreatePolicy: () => ({ createPolicy: gatewayPolicy }),
      SetPolicyTemplate: () => ({ setPolicyTemplate: { ...gatewayPolicy, templateNone: true } }),
    });
    const policy = await liveEdge.createPolicy({
      freeform: true,
      homeGroupId: "category-finance",
      sensitivity: "STANDARD" as never,
      title: "Hello",
    });
    expect(
      calls
        .filter((call) => /Policy/.test(call.operation) && !/Categor/.test(call.operation))
        .map((call) => [call.operation, call.variables]),
    ).toEqual([
      ["CreatePolicy", expect.objectContaining({ homeCategoryId: "category-finance" })],
      ["SetPolicyTemplate", { none: true, policyId: "p-1" }],
    ]);
    expect(policy.templateNone).toBe(true);
  });
});

describe("liveEdge: inline review threads", () => {
  const thread = {
    createdAt: "2026-11-06T12:00:00Z",
    id: "thread-1",
    messages: [],
    occurrence: 1,
    policyVersionId: "v-3",
    quote: "seven years",
    resolved: false,
  };

  it("lists a version's threads", async () => {
    const calls = routeGateway({ ReviewThreads: () => ({ reviewThreads: [thread] }) });
    expect(await liveEdge.reviewThreads("v-3")).toEqual([thread]);
    expect(calls).toEqual([{ operation: "ReviewThreads", variables: { policyVersionId: "v-3" } }]);
  });

  it("names the approver a thread is for, reads what changed since the last review and marks it reviewed", async () => {
    const calls = routeGateway({
      AddReviewThread: () => ({ addReviewThread: thread }),
      MarkVersionReviewed: () => ({ markVersionReviewed: true }),
      VersionChangesSinceReview: () => ({
        versionChangesSinceReview: [
          {
            changeType: "changed",
            sectionKey: "scope",
            sectionTitle: "Scope",
            wordDiffHtml: "<ins>x</ins>",
          },
        ],
      }),
    });
    await liveEdge.addReviewThread("v-3", "seven years", 2, "Check?", undefined, "user-charlie");
    const changes = await liveEdge.versionChangesSinceReview("v-3");
    expect(changes.map((c) => c.sectionKey)).toEqual(["scope"]);
    expect(await liveEdge.markVersionReviewed("v-3")).toBe(true);
    expect(calls.map((call) => [call.operation, call.variables])).toEqual([
      [
        "AddReviewThread",
        {
          body: "Check?",
          occurrence: 2,
          policyVersionId: "v-3",
          quote: "seven years",
          toUserId: "user-charlie",
        },
      ],
      ["VersionChangesSinceReview", { policyVersionId: "v-3" }],
      ["MarkVersionReviewed", { policyVersionId: "v-3" }],
    ]);
  });

  it("starts a thread with a suggested text, counters it and closes it", async () => {
    const calls = routeGateway({
      AddReviewThread: () => ({ addReviewThread: thread }),
      CloseReviewSuggestion: () => ({ closeReviewSuggestion: thread }),
      CounterReviewSuggestion: () => ({ counterReviewSuggestion: thread }),
    });
    await liveEdge.addReviewThread("v-3", "seven years", 2, "Shorter?", "six years");
    await liveEdge.counterReviewSuggestion("thread-1", "five years");
    await liveEdge.closeReviewSuggestion("thread-1", "NOT_AGREED", "The law says seven.");
    await liveEdge.closeReviewSuggestion("thread-1", "CHANGED");
    expect(calls.map((call) => [call.operation, call.variables])).toEqual([
      [
        "AddReviewThread",
        {
          body: "Shorter?",
          occurrence: 2,
          policyVersionId: "v-3",
          quote: "seven years",
          suggestedText: "six years",
        },
      ],
      ["CounterReviewSuggestion", { text: "five years", threadId: "thread-1" }],
      [
        "CloseReviewSuggestion",
        { outcome: "NOT_AGREED", reason: "The law says seven.", threadId: "thread-1" },
      ],
      ["CloseReviewSuggestion", { outcome: "CHANGED", threadId: "thread-1" }],
    ]);
  });

  it("starts, answers, resolves and deletes a thread", async () => {
    const calls = routeGateway({
      AddReviewThread: () => ({ addReviewThread: thread }),
      DeleteReviewThread: () => ({ deleteReviewThread: true }),
      ReplyReviewThread: () => ({ replyReviewThread: thread }),
      SetReviewThreadResolved: () => ({ setReviewThreadResolved: { ...thread, resolved: true } }),
    });
    expect(await liveEdge.addReviewThread("v-3", "seven years", 2, "Why?")).toEqual(thread);
    expect(await liveEdge.replyReviewThread("thread-1", "Because.")).toEqual(thread);
    const resolved = await liveEdge.setReviewThreadResolved("thread-1", true);
    expect(resolved.resolved).toBe(true);
    expect(await liveEdge.deleteReviewThread("thread-1")).toBe(true);
    expect(calls.map((call) => call.variables)).toEqual([
      { body: "Why?", occurrence: 2, policyVersionId: "v-3", quote: "seven years" },
      { body: "Because.", threadId: "thread-1" },
      { resolved: true, threadId: "thread-1" },
      { threadId: "thread-1" },
    ]);
  });
});

describe("liveEdge: AI drafting", () => {
  it("passes the reference documents and hints on to draft generation", async () => {
    const calls = routeGateway({
      SubmitDraftGeneration: () => ({ submitDraftGeneration: { jobId: "job-1" } }),
    });
    await liveEdge.submitDraftGeneration({
      brief: "How visitors sign in",
      referenceDocuments: [{ content: "Notes", title: "visitor-notes.pdf" }],
      referenceHints: ["https://policies.example.org/old"],
      sections: [{ key: "purpose", order: 0, title: "Purpose" }],
      title: "Visitor Sign-in Policy",
    });
    expect(calls[0]?.variables).toEqual({
      input: {
        brief: "How visitors sign in",
        categoryId: undefined,
        referenceDocuments: [{ content: "Notes", title: "visitor-notes.pdf" }],
        referenceHints: ["https://policies.example.org/old"],
        sections: [{ key: "purpose", order: 0, title: "Purpose" }],
        title: "Visitor Sign-in Policy",
      },
    });
  });

  it("submits a revision of every section with the author's instruction", async () => {
    const calls = routeGateway({
      SubmitPolicyRevision: () => ({ submitPolicyRevision: { jobId: "job-2" } }),
    });
    const input = {
      instruction: "add a rollback section",
      policyId: "p-1",
      sections: [{ content: "Tell the desk.", key: "report", order: 0, title: "Report it" }],
      versionId: "v-9",
    };
    expect(await liveEdge.submitPolicyRevision(input)).toEqual({ jobId: "job-2" });
    expect(calls[0]).toEqual({ operation: "SubmitPolicyRevision", variables: { input } });
  });
});

describe("liveEdge: reference material for AI drafting", () => {
  it("uploads a reference document and answers its text", async () => {
    const fetchSpy = vi.fn((_url: string, _init: RequestInit) =>
      Promise.resolve(Response.json({ content: "Visitors sign in.", title: "notes.pdf" })),
    );
    vi.stubGlobal("fetch", fetchSpy);
    const file = new File(["%PDF"], "notes.pdf", { type: "application/pdf" });

    expect(await liveEdge.extractDocument(file, "steward_sid=abc")).toEqual({
      content: "Visitors sign in.",
      title: "notes.pdf",
    });
    const [url, init] = fetchSpy.mock.calls.at(-1)!;
    expect(url).toMatch(/\/documents\/extract$/);
    expect((init.body as FormData).get("file")).toBeInstanceOf(File);
  });

  it("answers the gateway's reason when a document can't be read", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(Response.json({ error: "Unsupported file type: .exe" }, { status: 400 })),
      ),
    );
    await expect(liveEdge.extractDocument(new File(["x"], "tool.exe"))).rejects.toMatchObject({
      message: "Unsupported file type: .exe",
      status: 400,
    });
  });

  it("checks that a reference URL is readable", async () => {
    const fetchSpy = vi.fn((_url: string, _init: RequestInit) =>
      Promise.resolve(Response.json({ reason: "not reachable", readable: false })),
    );
    vi.stubGlobal("fetch", fetchSpy);

    expect(await liveEdge.validateReferenceUrl("https://policies.example.org/old")).toEqual({
      reason: "not reachable",
      readable: false,
    });
    const [url, init] = fetchSpy.mock.calls.at(-1)!;
    expect(url).toMatch(/\/documents\/validate-url$/);
    expect(JSON.parse(init.body as string)).toEqual({ url: "https://policies.example.org/old" });
  });
});

describe("liveEdge: the caller's own account (U33, U35)", () => {
  const settings = {
    categories: [{ cadence: "IMMEDIATE", category: "COMPLIANCE", mandatory: true }],
    channels: { email: true, inApp: true, push: false },
    digest: { dailyHour: 8, weeklyDow: 1 },
    overrides: [],
  };

  it("reads the notification settings with the type catalog they're chosen from", async () => {
    routeGateway({
      NotificationSettings: () => ({
        notificationSettings: settings,
        notificationTypeCatalog: [
          {
            category: "COMPLIANCE",
            delivery: "REMINDER_SCHEDULE",
            kind: "ack_reminder",
            mandatory: true,
          },
        ],
      }),
    });
    expect(await liveEdge.notificationPreferences()).toEqual({
      catalog: [
        {
          category: "COMPLIANCE",
          delivery: "REMINDER_SCHEDULE",
          kind: "ack_reminder",
          mandatory: true,
        },
      ],
      settings,
    });
  });

  it("sets a category's cadence and answers the settings it leaves", async () => {
    const calls = routeGateway({ SetCategoryCadence: () => ({ setCategoryCadence: settings }) });
    expect(await liveEdge.setCategoryCadence(NotifCategory.Workflow, NotifCadence.Daily)).toEqual(
      settings,
    );
    expect(calls).toEqual([
      { operation: "SetCategoryCadence", variables: { cadence: "DAILY", category: "WORKFLOW" } },
    ]);
  });

  it("lists the caller's passkeys and renames or removes one", async () => {
    const calls = routeGateway({
      MyWebauthnCredentials: () => ({
        myWebauthnCredentials: [
          { createdAt: "2026-10-03T00:00:00Z", id: "cred-1", label: "Laptop", lastUsedAt: null },
        ],
      }),
      RemoveWebauthnCredential: () => ({ removeWebauthnCredential: true }),
      RenameMfaMethod: () => ({ renameMfaMethod: true }),
    });
    expect(await liveEdge.myPasskeys()).toEqual([
      { createdAt: "2026-10-03T00:00:00Z", id: "cred-1", label: "Laptop", lastUsedAt: null },
    ]);
    expect(await liveEdge.renameMyMethod("cred-1", "Work laptop")).toBe(true);
    expect(await liveEdge.removeMyPasskey("cred-1")).toBe(true);
    expect(calls.map((c) => c.operation)).toEqual([
      "MyWebauthnCredentials",
      "RenameMfaMethod",
      "RemoveWebauthnCredential",
    ]);
  });
});

describe("recordPolicyExport", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("records a print through the gateway's mutation when it has one", async () => {
    const calls = routeGateway({ RecordPolicyExport: () => ({ recordPolicyExport: true }) });
    expect(await liveEdge.recordPolicyExport("policy-9", "PRINT", true)).toBe(true);
    expect(calls).toEqual([
      {
        operation: "RecordPolicyExport",
        variables: { includeHistory: true, kind: "PRINT", policyId: "policy-9" },
      },
    ]);
  });

  it("does nothing, and stops asking, while the gateway has no such mutation", async () => {
    const calls = routeGateway({
      RecordPolicyExport: () => ({
        errors: [{ message: 'Cannot query field "recordPolicyExport" on type "Mutation".' }],
      }),
    });
    expect(await liveEdge.recordPolicyExport("policy-9", "PRINT", false)).toBe(false);
    expect(await liveEdge.recordPolicyExport("policy-9", "PRINT", false)).toBe(false);
    expect(calls).toHaveLength(1);
  });
});

const row = (state: string, versionNo: number, title: string) => ({
  contentJson: JSON.stringify({ text: "x" }),
  createdAt: "2026-11-01T00:00:00Z",
  id: `r-${String(versionNo)}`,
  publishedAt: state === "PUBLISHED" ? "2026-11-02T00:00:00Z" : null,
  publishedBy: state === "PUBLISHED" ? "u-1" : null,
  state,
  title,
  updatedAt: "2026-11-02T00:00:00Z",
  updatedBy: "u-1",
  versionNo,
});

describe("liveEdge: the appendix life cycle", () => {
  const appendix = {
    draft: row("DRAFT", 2, "Rates (next)"),
    id: "a-1",
    letter: "A",
    orderIndex: 0,
    policyId: "p-1",
    published: row("PUBLISHED", 1, "Rates"),
    retiredAt: null,
    versions: [row("PUBLISHED", 1, "Rates"), row("DRAFT", 2, "Rates (next)")],
  };

  it("lists a policy's appendices, with the retired ones when asked", async () => {
    const calls = routeGateway({ PolicyAppendices: () => ({ policyAppendices: [appendix] }) });
    const list = await liveEdge.policyAppendices("p-1", true);
    expect(list[0]).toMatchObject({ draft: { title: "Rates (next)" }, letter: "A" });
    expect(calls.find((c) => c.operation === "PolicyAppendices")?.variables).toEqual({
      includeRetired: true,
      policyId: "p-1",
    });
  });

  it("creates, saves, publishes, retires, restores and reorders through the gateway", async () => {
    const calls = routeGateway({
      CreatePolicyAppendix: () => ({ createPolicyAppendix: appendix }),
      PublishAppendix: () => ({ publishAppendix: appendix }),
      ReorderPolicyAppendices: () => ({ reorderPolicyAppendices: [appendix] }),
      RestoreAppendix: () => ({ restoreAppendix: appendix }),
      RetireAppendix: () => ({ retireAppendix: appendix }),
      SaveAppendixDraft: () => ({ saveAppendixDraft: appendix }),
    });
    await liveEdge.createAppendix("p-1", "Rates", "{}");
    await liveEdge.saveAppendixDraft("a-1", "Rates", "{}");
    await liveEdge.publishAppendix("a-1");
    await liveEdge.retireAppendix("a-1");
    await liveEdge.restoreAppendix("a-1");
    await liveEdge.reorderPolicyAppendices("p-1", ["a-1"]);
    expect(calls.map((c) => c.operation)).toEqual([
      "CreatePolicyAppendix",
      "SaveAppendixDraft",
      "PublishAppendix",
      "RetireAppendix",
      "RestoreAppendix",
      "ReorderPolicyAppendices",
    ]);
    expect(calls[1]?.variables).toEqual({ contentJson: "{}", id: "a-1", title: "Rates" });
  });

  it("asks for the diff of a draft against what is published", async () => {
    routeGateway({
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
    });
    expect(await liveEdge.appendixDiff("a-1")).toEqual([
      {
        changeType: "changed",
        sectionKey: "body",
        sectionTitle: "body",
        wordDiffHtml: "<ins>x</ins>",
      },
    ]);
  });
});
