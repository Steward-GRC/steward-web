// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Category, Group, Policy, Template } from "@steward-web/api-client";

import { describe, expect, it } from "vitest";

import { paletteGroupsOf } from "./paletteGroups";

const desk = {
  category: "Workplace",
  documentType: "POLICY",
  id: "p1",
  number: "POL-FACILITIES-000001",
  sensitivity: "STANDARD",
  status: "PUBLISHED",
  subcategory: "Facilities",
  title: "Desk Booking Policy",
  version: "1.0.0",
} as unknown as Policy;
const deskCategory: Category = { id: "c1", name: "Desk services", slug: "desk", subcategories: [] };
const deskTemplate = {
  code: "TPL-DESK",
  id: "t1",
  name: "Desk template",
  ownerCategoryId: null,
  retiredAt: null,
} as Template;
const deskGroup = { id: "g1", name: "Desk team", parentId: null, slug: "desk-team" } as Group;

describe("paletteGroupsOf (admin)", () => {
  it("groups the matches into policies, categories, templates and groups", () => {
    const groups = paletteGroupsOf([desk], [deskCategory], [deskTemplate], [deskGroup], "desk");
    expect(groups.map((g) => [g.id, g.items.map((index) => index.to)])).toEqual([
      ["policies", ["/policies/POL-FACILITIES-000001"]],
      ["categories", ["/policies?category=Desk%20services"]],
      ["templates", ["/templates/TPL-DESK"]],
      ["groups", ["/categories/g1"]],
    ]);
    expect(groups[1]!.items[0]!.icon).toBe("folder");
  });

  it("answers nothing for no words", () => {
    expect(paletteGroupsOf([desk], [], [], [], "")).toEqual([]);
  });
});
