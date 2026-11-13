// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  applySectionText,
  scaffoldFromTemplate,
  serializeDocument,
} from "@steward-web/editor-steward/document";
import { describe, expect, it } from "vitest";

import { GatewayError } from "../gatewayFetch";
import { DocumentType, Sensitivity } from "../generated/schema";
import { PolicyStatus } from "../views";
import {
  appendixText,
  bodyTextFromContent,
  categoryNames,
  type CategoryNode,
  documentBlocksFromContent,
  historyFromAuditLog,
  isPermissionDenied,
  isUnauthenticated,
  policyStatusOf,
  toPolicyView,
} from "./assemble";

const tree: CategoryNode[] = [
  { id: "root", name: "Finance", parentId: null, slug: "finance-ops" },
  { id: "child", name: "Travel", parentId: "root", slug: "travel" },
  { id: "leaf", name: "Per diem", parentId: "child", slug: "per-diem" },
];

describe("bodyTextFromContent", () => {
  it("joins the sections with text as titled blocks, in stored order", () => {
    const content = JSON.stringify([
      { sectionKey: "purpose", text: "Why it exists.", title: "Purpose" },
      { sectionKey: "scope", text: "  ", title: "Scope" },
      { sectionKey: "rules", text: "Do this.", title: "Rules" },
    ]);
    expect(bodyTextFromContent(content)).toBe("Purpose\n\nWhy it exists.\n\nRules\n\nDo this.");
  });

  it("reads the document the editor saves: each heading and block as its own paragraph", () => {
    const outline = [
      { key: "purpose", level: 2, order: 0, required: true, title: "Purpose" },
      { key: "scope", level: 2, order: 1, required: false, title: "Scope" },
    ];
    let document = scaffoldFromTemplate(outline);
    document = applySectionText(document, outline, "purpose", "Why it exists.\n\nAnd why now.");
    document = applySectionText(document, outline, "scope", "Everyone.");

    expect(bodyTextFromContent(serializeDocument(document))).toBe(
      "Purpose\n\nWhy it exists.\n\nAnd why now.\n\nScope\n\nEveryone.",
    );
  });

  it("returns an empty body for unparseable content or content in neither format", () => {
    expect(bodyTextFromContent("not json")).toBe("");
    expect(bodyTextFromContent('{"text":"x"}')).toBe("");
  });
});

const text = (value: string, format = 0) => ({ format, text: value, type: "text" });
const node = (type: string, children: object[], extra: object = {}) => ({
  children,
  type,
  ...extra,
});
const stored = (...children: object[]) => JSON.stringify({ root: { children, type: "root" } });

describe("documentBlocksFromContent", () => {
  it("reads the editor's tree as the reader's blocks, sections at depth 1", () => {
    const blocks = documentBlocksFromContent(
      stored(
        node("heading", [text("Purpose")], { tag: "h1" }),
        node("paragraph", [text("Book a "), text("shared desk", 1), text(" early.")]),
        node("heading", [text("Changing a booking")], { tag: "h2" }),
        node("list", [node("listitem", [text("Cancel")]), node("listitem", [text("Rebook")])], {
          listType: "bullet",
        }),
        node("paragraph", [
          node("link", [text("the booking page")], { url: "https://example.org/b" }),
        ]),
        node("table", [
          node("tablerow", [
            node("tablecell", [node("paragraph", [text("Role")])], { headerState: 1 }),
            node("tablecell", [node("paragraph", [text("Responsibility")])], { headerState: 1 }),
          ]),
          node("tablerow", [
            node("tablecell", [node("paragraph", [text("Staff")])]),
            node("tablecell", [node("paragraph", [text("Book ahead.")])]),
          ]),
        ]),
        node("quote", [text("Be kind.")]),
        node("paragraph", []),
      ),
    );
    expect(blocks).toEqual([
      { depth: 1, kind: "heading", sectionKey: "purpose", text: "Purpose" },
      {
        kind: "paragraph",
        runs: [{ text: "Book a " }, { bold: true, text: "shared desk" }, { text: " early." }],
      },
      { depth: 2, kind: "heading", sectionKey: "changing-a-booking", text: "Changing a booking" },
      { items: [[{ text: "Cancel" }], [{ text: "Rebook" }]], kind: "list", ordered: false },
      { kind: "paragraph", runs: [{ href: "https://example.org/b", text: "the booking page" }] },
      {
        kind: "table",
        rows: [
          { cells: ["Role", "Responsibility"], header: true },
          { cells: ["Staff", "Book ahead."], header: false },
        ],
      },
      { kind: "quote", runs: [{ text: "Be kind." }] },
    ]);
  });

  it("measures heading depth from the document's own top level", () => {
    const blocks = documentBlocksFromContent(
      stored(
        node("heading", [text("Scope")], { tag: "h2" }),
        node("heading", [text("Exceptions")], { tag: "h3" }),
      ),
    );
    expect(blocks).toEqual([
      { depth: 1, kind: "heading", sectionKey: "scope", text: "Scope" },
      { depth: 2, kind: "heading", sectionKey: "exceptions", text: "Exceptions" },
    ]);
  });

  it("keys each heading the way steward-core keys its sections, so a citation can link to it", () => {
    // Core slugs each top-level heading, numbers repeats "-2", "-3", and keeps "body" for
    // anything before the first heading, so a heading called "Body" becomes "body-2".
    const blocks = documentBlocksFromContent(
      stored(
        node("paragraph", [text("Read this first.")]),
        node("heading", [text("Body")], { tag: "h2" }),
        node("heading", [text("Making a claim: who & when?")], { tag: "h2" }),
        node("heading", [text("Notes")], { tag: "h3" }),
        node("heading", [text("Notes")], { tag: "h3" }),
        node("heading", [text("¿¡")], { tag: "h2" }),
      ),
    );
    expect(blocks.flatMap((block) => (block.kind === "heading" ? [block.sectionKey] : []))).toEqual(
      ["body-2", "making-a-claim-who-when", "notes", "notes-2", "section"],
    );
  });

  it("reads the older section array as a heading and paragraphs per section", () => {
    const blocks = documentBlocksFromContent(
      JSON.stringify([{ sectionKey: "purpose", text: "One.\n\nTwo.", title: "Purpose" }]),
    );
    expect(blocks).toEqual([
      { depth: 1, kind: "heading", text: "Purpose" },
      { kind: "paragraph", runs: [{ text: "One." }] },
      { kind: "paragraph", runs: [{ text: "Two." }] },
    ]);
  });

  it("answers no blocks for content it can't read", () => {
    expect(documentBlocksFromContent("not json")).toEqual([]);
  });
});

describe("appendixText", () => {
  it("reads the editor's { text } appendix content", () => {
    expect(appendixText(JSON.stringify({ text: "Annex body" }))).toBe("Annex body");
  });

  it("returns empty text for content it can't read", () => {
    expect(appendixText("")).toBe("");
    expect(appendixText("[")).toBe("");
  });
});

describe("categoryNames", () => {
  const index = new Map(tree.map((n) => [n.id, n]));

  it("names a root home category with no subcategory", () => {
    expect(categoryNames(index, "root")).toEqual({
      category: "Finance",
      categorySlug: "finance-ops",
      subcategory: "",
      subcategorySlug: "",
    });
  });

  it("names the root and the level below it for a deeper home category", () => {
    const travel = {
      category: "Finance",
      categorySlug: "finance-ops",
      subcategory: "Travel",
      subcategorySlug: "travel",
    };
    expect(categoryNames(index, "child")).toEqual(travel);
    expect(categoryNames(index, "leaf")).toEqual(travel);
  });

  it("returns empty names for a category outside the tree", () => {
    expect(categoryNames(index, "missing")).toEqual({
      category: "",
      categorySlug: "",
      subcategory: "",
      subcategorySlug: "",
    });
  });
});

describe("policyStatusOf", () => {
  it("is published whenever a published version exists", () => {
    expect(policyStatusOf(true, "draft")).toBe(PolicyStatus.Published);
  });

  it("maps the working draft's own status", () => {
    expect(policyStatusOf(false, "in_review")).toBe(PolicyStatus.InReview);
    expect(policyStatusOf(false, "REJECTED")).toBe(PolicyStatus.Rejected);
  });

  it("falls back to draft for an unknown or missing version status", () => {
    expect(policyStatusOf(false, "something-new")).toBe(PolicyStatus.Draft);
    expect(policyStatusOf(false)).toBe(PolicyStatus.Draft);
  });
});

describe("toPolicyView", () => {
  it("assembles the library row from the gateway policy and its names, with no extra version read", () => {
    const view = toPolicyView(
      {
        ackAudienceOverride: null,
        ackTriggers: null,
        currentDraftVersionId: null,
        currentPublishedVersionId: "v2",
        currentSemanticVersion: null,
        currentVersionNo: 3,
        currentVersionStatus: "published",
        documentType: DocumentType.Policy,
        homeCategoryId: "child",
        id: "p1",
        number: "FIN-001",
        ownerUserId: "u1",
        retiredAt: null,
        sensitivity: Sensitivity.Standard,
        templateId: null,
        templateNone: true,
        title: "Travel",
        updatedAt: "2026-09-02T00:00:00Z",
        viewerCan: {
          ack: true,
          approve: false,
          canBreakGlass: false,
          contentObfuscated: false,
          edit: false,
          manage: false,
          read: true,
          submit: false,
        },
      },
      {
        category: "Finance",
        categorySlug: "finance-ops",
        subcategory: "Travel",
        subcategorySlug: "travel",
      },
    );
    expect(view).toMatchObject({
      category: "Finance",
      categorySlug: "finance-ops",
      subcategorySlug: "travel",
      homeGroupId: "child",
      status: PolicyStatus.Published,
      subcategory: "Travel",
      updated: "2026-09-02T00:00:00Z",
      version: "3.0.0",
    });
  });

  const row = {
    ackAudienceOverride: null,
    ackTriggers: null,
    currentDraftVersionId: null,
    currentPublishedVersionId: "v2",
    currentSemanticVersion: null,
    currentVersionNo: 3,
    currentVersionStatus: "published",
    documentType: DocumentType.Policy,
    homeCategoryId: "root",
    id: "p1",
    number: "FIN-001",
    ownerUserId: "u1",
    retiredAt: null,
    sensitivity: Sensitivity.Standard,
    templateId: null,
    templateNone: true,
    title: "Travel",
    updatedAt: null,
    viewerCan: {
      ack: false,
      approve: false,
      canBreakGlass: false,
      contentObfuscated: false,
      edit: true,
      manage: false,
      read: true,
      submit: true,
    },
  };
  const names = {
    category: "Finance",
    categorySlug: "finance-ops",
    subcategory: "",
    subcategorySlug: "",
  };

  it("shows the semantic version core sent for the current version (#397)", () => {
    expect(toPolicyView({ ...row, currentSemanticVersion: "2.1.0" }, names).version).toBe("2.1.0");
  });

  it("falls back to the ordinal as before when core sent no semantic version (#397)", () => {
    expect(toPolicyView(row, names).version).toBe("3.0.0");
  });

  it("shows nothing when core sent neither (#397)", () => {
    expect(
      toPolicyView({ ...row, currentSemanticVersion: null, currentVersionNo: null }, names).version,
    ).toBe("");
  });

  it("shows an empty version before the first version exists", () => {
    const view = toPolicyView(
      {
        ackAudienceOverride: null,
        ackTriggers: null,
        currentDraftVersionId: "d1",
        currentPublishedVersionId: null,
        currentSemanticVersion: null,
        currentVersionNo: null,
        currentVersionStatus: null,
        documentType: DocumentType.Procedure,
        homeCategoryId: "root",
        id: "p2",
        number: "FIN-002",
        ownerUserId: "u1",
        retiredAt: null,
        sensitivity: Sensitivity.Standard,
        templateId: null,
        templateNone: false,
        title: "Claims",
        updatedAt: null,
        viewerCan: {
          ack: false,
          approve: false,
          canBreakGlass: false,
          contentObfuscated: false,
          edit: true,
          manage: false,
          read: true,
          submit: true,
        },
      },
      { category: "Finance", categorySlug: "finance-ops", subcategory: "", subcategorySlug: "" },
    );
    expect(view.version).toBe("");
    expect(view.status).toBe(PolicyStatus.Draft);
    expect(view.updated).toBeNull();
  });
});

describe("historyFromAuditLog", () => {
  it("reverses the gateway's newest-first page, oldest event first", () => {
    const history = historyFromAuditLog(
      [
        {
          action: "policy.published",
          actorName: "Bob Author",
          occurredAt: "2026-08-12T00:00:00Z",
        },
        {
          action: "workflow.submitted",
          actorName: "Bob Author",
          occurredAt: "2026-07-29T09:15:00Z",
        },
      ],
      "2.0.0",
    );
    expect(history).toEqual([
      {
        actorName: "Bob Author",
        at: "2026-07-29T09:15:00Z",
        comment: null,
        kind: "submitted",
        stage: null,
        versionLabel: "2.0.0",
      },
      {
        actorName: "Bob Author",
        at: "2026-08-12T00:00:00Z",
        comment: null,
        kind: "published",
        stage: null,
        versionLabel: "2.0.0",
      },
    ]);
  });

  it("keeps a missing actor as null", () => {
    const [entry] = historyFromAuditLog(
      [{ action: "workflow.withdrawn", actorName: null, occurredAt: "2026-08-05T11:05:00Z" }],
      "2.0.0",
    );
    expect(entry?.actorName).toBeNull();
  });

  // Every action steward-core, steward-workflow and steward-obligations write about a policy,
  // its versions or its approvals (from each service's audit emit calls), with the history
  // kind it shows as. A kind is one translation key under reader.history.events.
  const SERVICE_ACTIONS: Record<string, string> = {
    "ack.recorded": "ackRecorded",
    "ack.transferred": "ackTransferred",
    "policy.ack_config_updated": "ackConfigUpdated",
    "policy.ack_required": "ackRequired",
    "policy.break_glass_read": "breakGlassRead",
    "policy.break_glass_revealed": "breakGlassRevealed",
    "policy.created": "created",
    "policy.definitions_changed": "definitionsChanged",
    "policy.deleted": "deleted",
    "policy.draft_content_updated": "draftContentUpdated",
    "policy.draft_discarded": "draftDiscarded",
    "policy.draft_saved": "draftSaved",
    "policy.moved": "moved",
    "policy.owner_changed": "ownerChanged",
    "policy.published": "published",
    "policy.references_changed": "referencesChanged",
    "policy.reindexed": "reindexed",
    "policy.rename_staged": "renameStaged",
    "policy.renamed": "renamed",
    "policy.retired": "retired",
    "policy.sensitivity_changed": "sensitivityChanged",
    "policy.status_set": "statusSet",
    "policy.template_changed": "templateChanged",
    "workflow.assignment.swapped": "workflowAssignmentSwapped",
    "workflow.assignment.swapped.out_of_eligibility": "workflowAssignmentSwappedOutOfEligibility",
    "workflow.bulk.approved": "approved",
    "workflow.bulk.rejected": "rejected",
    "workflow.decision.approved": "approved",
    "workflow.decision.rejected": "rejected",
    "workflow.run.paused": "workflowRunPaused",
    "workflow.run.resumed": "workflowRunResumed",
    "workflow.signal.approve": "workflowSignalApprove",
    "workflow.signal.reject": "workflowSignalReject",
    "workflow.signal.request_changes": "changesRequested",
    "workflow.signal.retire": "workflowSignalRetire",
    "workflow.signal.withdraw": "workflowSignalWithdraw",
    "workflow.stage.escalated": "workflowStageEscalated",
    "workflow.stage.misconfigured": "workflowStageMisconfigured",
    "workflow.stage.unstaffed": "workflowStageUnstaffed",
    "workflow.submit.no_workflow": "workflowSubmitNoWorkflow",
    "workflow.submitted": "submitted",
    "workflow.user.reassigned": "workflowUserReassigned",
    "workflow.withdrawn": "withdrawn",
  };

  it.each(Object.entries(SERVICE_ACTIONS))("shows %s as the %s event", (action, kind) => {
    const [entry] = historyFromAuditLog(
      [{ action, actorName: null, occurredAt: "2026-08-05T11:05:00Z" }],
      "1.0.0",
    );
    expect(entry?.kind).toBe(kind);
  });

  it("turns an action it doesn't know into a camelCase key, never one with dots", () => {
    const [entry] = historyFromAuditLog(
      [
        {
          action: "workflow.stage.split_later",
          actorName: null,
          occurredAt: "2026-08-05T11:05:00Z",
        },
      ],
      "1.0.0",
    );
    expect(entry?.kind).toBe("workflowStageSplitLater");
  });
});

describe("isUnauthenticated", () => {
  it("recognises the gateway's own code and the gRPC status name", () => {
    expect(isUnauthenticated(new GatewayError("Me", "x", { code: "UNAUTHENTICATED" }))).toBe(true);
    expect(isUnauthenticated(new GatewayError("Me", "x", { code: "Unauthenticated" }))).toBe(true);
    expect(isUnauthenticated(new GatewayError("Me", "x", { status: 401 }))).toBe(true);
  });

  it("leaves every other failure alone", () => {
    expect(isUnauthenticated(new GatewayError("Me", "x", { code: "PERMISSION_DENIED" }))).toBe(
      false,
    );
    expect(isUnauthenticated(new Error("boom"))).toBe(false);
  });
});

describe("isPermissionDenied", () => {
  it("recognises the gRPC status name and the symbol", () => {
    expect(
      isPermissionDenied(new GatewayError("AuditLog", "x", { code: "PermissionDenied" })),
    ).toBe(true);
    expect(
      isPermissionDenied(new GatewayError("AuditLog", "x", { code: "PERMISSION_DENIED" })),
    ).toBe(true);
  });

  it("leaves every other failure alone, a bare 403 included", () => {
    expect(isPermissionDenied(new GatewayError("AuditLog", "x", { code: "INTERNAL" }))).toBe(false);
    expect(isPermissionDenied(new GatewayError("AuditLog", "x", { status: 403 }))).toBe(false);
    expect(isPermissionDenied(new Error("PermissionDenied"))).toBe(false);
  });
});
