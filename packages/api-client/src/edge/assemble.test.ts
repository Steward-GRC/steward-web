// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { GatewayError } from "../gatewayFetch";
import { DocumentType, Sensitivity } from "../generated/schema";
import { PolicyStatus } from "../views";
import {
  appendixText,
  bodyTextFromContent,
  categoryNames,
  type CategoryNode,
  historyFromAuditLog,
  isUnauthenticated,
  policyStatusOf,
  toPolicyView,
} from "./assemble";

const tree: CategoryNode[] = [
  { id: "root", name: "Finance", parentId: null },
  { id: "child", name: "Travel", parentId: "root" },
  { id: "leaf", name: "Per diem", parentId: "child" },
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

  it("returns an empty body for unparseable or non-array content", () => {
    expect(bodyTextFromContent("not json")).toBe("");
    expect(bodyTextFromContent('{"text":"x"}')).toBe("");
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
    expect(categoryNames(index, "root")).toEqual({ category: "Finance", subcategory: "" });
  });

  it("names the root and the level below it for a deeper home category", () => {
    expect(categoryNames(index, "child")).toEqual({ category: "Finance", subcategory: "Travel" });
    expect(categoryNames(index, "leaf")).toEqual({ category: "Finance", subcategory: "Travel" });
  });

  it("returns empty names for a category outside the tree", () => {
    expect(categoryNames(index, "missing")).toEqual({ category: "", subcategory: "" });
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
        currentDraftVersionId: null,
        currentPublishedVersionId: "v2",
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
          read: true,
          submit: false,
        },
      },
      { category: "Finance", subcategory: "Travel" },
    );
    expect(view).toMatchObject({
      category: "Finance",
      homeGroupId: "child",
      status: PolicyStatus.Published,
      subcategory: "Travel",
      updated: "2026-09-02T00:00:00Z",
      version: "3",
    });
  });

  it("shows an empty version before the first version exists", () => {
    const view = toPolicyView(
      {
        currentDraftVersionId: "d1",
        currentPublishedVersionId: null,
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
          read: true,
          submit: true,
        },
      },
      { category: "Finance", subcategory: "" },
    );
    expect(view.version).toBe("");
    expect(view.status).toBe(PolicyStatus.Draft);
    expect(view.updated).toBeNull();
  });
});

describe("historyFromAuditLog", () => {
  it("reverses the gateway's newest-first page and strips the policy. action prefix", () => {
    const history = historyFromAuditLog(
      [
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
      "2.0.0",
    );
    expect(history).toEqual([
      {
        actorName: "Ada Lovelace",
        at: "2026-07-29T09:15:00Z",
        comment: null,
        kind: "submitted",
        stage: null,
        versionLabel: "2.0.0",
      },
      {
        actorName: "Ada Lovelace",
        at: "2026-08-12T00:00:00Z",
        comment: null,
        kind: "published",
        stage: null,
        versionLabel: "2.0.0",
      },
    ]);
  });

  it("keeps an action with no recognised prefix, and a missing actor as null", () => {
    const history = historyFromAuditLog(
      [{ action: "workflow.decided", actorName: null, occurredAt: "2026-08-05T11:05:00Z" }],
      "2.0.0",
    );
    expect(history).toEqual([
      {
        actorName: null,
        at: "2026-08-05T11:05:00Z",
        comment: null,
        kind: "workflow.decided",
        stage: null,
        versionLabel: "2.0.0",
      },
    ]);
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
