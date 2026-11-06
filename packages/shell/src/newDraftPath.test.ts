// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { newDraftPath } from "./newDraftPath";

describe("newDraftPath (#147, #148)", () => {
  it("puts the type in the path, in lowercase", () => {
    expect(newDraftPath("POLICY")).toBe("/drafts/new/policy");
    expect(newDraftPath("PROCEDURE")).toBe("/drafts/new/procedure");
  });

  it("carries the category and subcategory of the folder it started from", () => {
    expect(newDraftPath("POLICY", { category: "Workplace", subcategory: "Facilities" })).toBe(
      "/drafts/new/policy?category=Workplace&subcategory=Facilities",
    );
    expect(newDraftPath("PROCEDURE", { category: "Human Resources" })).toBe(
      "/drafts/new/procedure?category=Human+Resources",
    );
  });

  it("leaves out an empty category", () => {
    expect(newDraftPath("POLICY", { category: "", subcategory: "" })).toBe("/drafts/new/policy");
  });
});
