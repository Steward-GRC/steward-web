// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { documentTypeOfSlug, folderChoice, legacyTypeRedirect } from "./newDraftRoute";

const go = (path: string) => legacyTypeRedirect(new URL(path, "https://example.org"));

describe("the new draft route (#147, #148)", () => {
  it("reads the type from the path segment", () => {
    expect(documentTypeOfSlug("policy")).toBe("POLICY");
    expect(documentTypeOfSlug("procedure")).toBe("PROCEDURE");
    expect(documentTypeOfSlug("POLICY")).toBeNull();
    expect(documentTypeOfSlug("memo")).toBeNull();
    expect(documentTypeOfSlug()).toBeNull();
  });

  it("moves an old ?type= link into the path and keeps the rest", () => {
    expect(go("/drafts/new?type=POLICY")).toBe("/drafts/new/policy");
    expect(go("/drafts/new?type=PROCEDURE&template=t1")).toBe("/drafts/new/procedure?template=t1");
    expect(go("/drafts/new?template=t1")).toBeNull();
    expect(go("/drafts/new?type=memo")).toBeNull();
  });

  it("finds a folder's category and subcategory by name", () => {
    const categories = [
      { id: "w", name: "Workplace", subcategories: [{ id: "f", name: "Facilities" }] },
    ];
    expect(folderChoice(categories, "Workplace", "Facilities")).toEqual({
      groupId: "w",
      subcategoryId: "f",
    });
    expect(folderChoice(categories, "Workplace", "Nope")).toEqual({
      groupId: "w",
      subcategoryId: "",
    });
    expect(folderChoice(categories, "Nowhere", null)).toBeNull();
    expect(folderChoice(categories, null, null)).toBeNull();
  });
});
