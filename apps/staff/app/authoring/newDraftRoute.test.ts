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

  it("does not carry a category name from an old link (#377)", () => {
    expect(go("/drafts/new?type=POLICY&category=IT+Security&subcategory=Travel")).toBe(
      "/drafts/new/policy",
    );
    expect(go("/drafts/new?type=PROCEDURE&category=IT+Security&template=t1")).toBe(
      "/drafts/new/procedure?template=t1",
    );
  });
});

const categories = [
  {
    id: "it",
    slug: "it-security",
    subcategories: [
      { id: "it-travel", path: ["travel"] },
      { id: "it-desks", path: ["facilities", "desks"] },
    ],
  },
  { id: "hr", slug: "human-resources", subcategories: [{ id: "hr-travel", path: ["travel"] }] },
];

describe("folderChoice by slug (#377)", () => {
  it("finds a category by its slug", () => {
    expect(folderChoice(categories, ["it-security"])).toEqual({
      groupId: "it",
      subcategoryId: "",
    });
  });

  it("finds a subcategory under its category", () => {
    expect(folderChoice(categories, ["it-security", "travel"])).toEqual({
      groupId: "it",
      subcategoryId: "it-travel",
    });
  });

  it("tells the same slug under two parents apart by the parent", () => {
    expect(folderChoice(categories, ["human-resources", "travel"])).toEqual({
      groupId: "hr",
      subcategoryId: "hr-travel",
    });
  });

  it("finds a deeper subcategory by the whole path", () => {
    expect(folderChoice(categories, ["it-security", "facilities", "desks"])).toEqual({
      groupId: "it",
      subcategoryId: "it-desks",
    });
  });

  it("gives nothing for an unknown category, an unknown subcategory or no slug", () => {
    expect(folderChoice(categories, ["nowhere"])).toBeNull();
    expect(folderChoice(categories, ["it-security", "nope"])).toBeNull();
    expect(folderChoice(categories, ["it-security", "desks"])).toBeNull();
    expect(folderChoice(categories, [])).toBeNull();
  });

  it("does not match a display name", () => {
    expect(folderChoice(categories, ["IT Security"])).toBeNull();
  });
});
