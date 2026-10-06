// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Category, Policy } from "@steward-web/api-client";

import { DocumentType, PolicyStatus, Sensitivity } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { buildSearchIndex, searchHits } from "./searchIndex";

const policy = (overrides: Partial<Policy> & Pick<Policy, "id" | "number" | "title">): Policy => ({
  category: "IT Security",
  currentDraftVersionId: null,
  currentPublishedVersionId: "v-1",
  documentType: DocumentType.Policy,
  homeGroupId: "g-1",
  ownerUserId: "u-1",
  retiredAt: null,
  sensitivity: Sensitivity.Standard,
  status: PolicyStatus.Published,
  subcategory: "Access",
  templateId: null,
  templateNone: false,
  updated: "2026-01-01T00:00:00Z",
  version: "1.0",
  viewerCan: {
    ack: false,
    approve: false,
    canBreakGlass: false,
    contentObfuscated: false,
    edit: false,
    read: true,
    submit: false,
  },
  ...overrides,
});

const category = (
  overrides: Partial<Category> & Pick<Category, "id" | "name" | "slug">,
): Category => ({
  subcategories: [],
  ...overrides,
});

describe("buildSearchIndex", () => {
  it("indexes every policy and category as a hit", () => {
    const index = buildSearchIndex(
      [policy({ id: "p-1", number: "POL-0001", title: "Access control" })],
      [category({ id: "c-1", name: "IT Security", slug: "it-security" })],
    );
    expect(index.map((h) => h.type)).toEqual(["Policy", "Category"]);
  });

  it("links a policy hit at the number, never the backend id", () => {
    const [hit] = buildSearchIndex(
      [policy({ id: "p-1", number: "POL-0001", title: "Access control" })],
      [],
    );
    expect(hit!.to).toBe("/policies/POL-0001");
  });

  it("links a category hit at the library's browse-by-category path", () => {
    const [hit] = buildSearchIndex(
      [],
      [category({ id: "c-1", name: "IT Security", slug: "it-security" })],
    );
    expect(hit!.to).toBe("/policies/category/it-security");
  });
});

describe("searchHits", () => {
  const index = buildSearchIndex(
    [
      policy({ category: "IT Security", id: "p-1", number: "POL-0001", title: "Access control" }),
      policy({
        category: "Finance",
        id: "p-2",
        number: "POL-0002",
        subcategory: "Travel",
        title: "Expense reports",
      }),
    ],
    [category({ id: "c-1", name: "IT Security", slug: "it-security" })],
  );

  it("returns no hits for an empty query, rather than the whole catalog", () => {
    expect(searchHits(index, "")).toEqual([]);
    expect(searchHits(index, " ".repeat(3))).toEqual([]);
  });

  it("matches a bare word against any indexed field", () => {
    const hits = searchHits(index, "access");
    expect(hits.map((h) => h.id)).toEqual(["p-1"]);
  });

  it("matches a field:value filter scoped to that field", () => {
    const hits = searchHits(index, "category:finance");
    expect(hits.map((h) => h.id)).toEqual(["p-2"]);
  });

  it("matches both a policy and its category for the same term", () => {
    const hits = searchHits(index, "security");
    expect(hits.map((h) => h.id).toSorted()).toEqual(["c-1", "p-1"]);
  });
});
