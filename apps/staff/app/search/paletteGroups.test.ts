// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Category, Policy } from "@steward-web/api-client";

import { DocumentType, PolicyStatus, Sensitivity } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { paletteGroupsOf } from "./paletteGroups";

const policy = (overrides: Partial<Policy> & Pick<Policy, "id" | "number" | "title">): Policy => ({
  category: "Workplace",
  categorySlug: "workplace",
  currentDraftVersionId: null,
  currentPublishedVersionId: "v-1",
  documentType: DocumentType.Policy,
  homeGroupId: "g-1",
  ownerUserId: "u-1",
  retiredAt: null,
  sensitivity: Sensitivity.Standard,
  status: PolicyStatus.Published,
  subcategory: "Facilities",
  subcategorySlug: "facilities",
  templateId: null,
  templateNone: false,
  updated: "2026-01-01T00:00:00Z",
  version: "1.0.0",
  viewerCan: {
    manage: false,
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

const desk = policy({ id: "p1", number: "POL-FACILITIES-000001", title: "Desk Booking Policy" });
const visitor = policy({
  id: "p4",
  number: "POL-FACILITIES-000004",
  title: "Visitor Sign-in Policy",
});
const deskProcedure = policy({
  documentType: DocumentType.Procedure,
  id: "r1",
  number: "PRC-FACILITIES-000002",
  title: "Desk Clean-down Procedure",
});
const facilities: Category = { id: "c1", name: "Desk services", slug: "desk", subcategories: [] };

describe("paletteGroupsOf", () => {
  it("groups the matches into policies, procedures and categories", () => {
    const groups = paletteGroupsOf([desk, visitor], [deskProcedure], [facilities], "desk");
    expect(groups.map((g) => [g.id, g.items.map((index) => index.label)])).toEqual([
      ["policies", ["Desk Booking Policy"]],
      ["procedures", ["Desk Clean-down Procedure"]],
      ["categories", ["Desk services"]],
    ]);
    expect(groups[0]!.items[0]).toEqual({
      hint: "POL-FACILITIES-000001 · Workplace",
      id: "p1",
      label: "Desk Booking Policy",
      to: "/policies/POL-FACILITIES-000001",
    });
    expect(groups[1]!.items[0]!.to).toBe("/procedures/PRC-FACILITIES-000002");
    expect(groups[2]!.items[0]).toMatchObject({
      icon: "folder",
      to: "/policies/category/desk",
    });
  });

  it("keeps each group to five and answers nothing for no words", () => {
    const many = Array.from({ length: 8 }, (_, n) =>
      policy({ id: `p${n}`, number: `POL-X-${n}`, title: `Desk ${n}` }),
    );
    expect(paletteGroupsOf(many, [], [], "desk")[0]!.items).toHaveLength(5);
    expect(paletteGroupsOf(many, [], [], " ")).toEqual([]);
  });
});
