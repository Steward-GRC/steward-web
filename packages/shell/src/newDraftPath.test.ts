// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { newDraftPath } from "./newDraftPath";

describe("newDraftPath (#147, #148)", () => {
  it("puts the type in the path, in lowercase", () => {
    expect(newDraftPath("POLICY")).toBe("/drafts/new/policy");
    expect(newDraftPath("PROCEDURE")).toBe("/drafts/new/procedure");
  });

  it("puts the category slug in the path (#377)", () => {
    expect(newDraftPath("POLICY", ["it-security"])).toBe("/drafts/new/policy/category/it-security");
    expect(newDraftPath("PROCEDURE", ["human-resources"])).toBe(
      "/drafts/new/procedure/category/human-resources",
    );
  });

  it("nests a subcategory under its category", () => {
    expect(newDraftPath("POLICY", ["it-security", "travel"])).toBe(
      "/drafts/new/policy/category/it-security/travel",
    );
    expect(newDraftPath("PROCEDURE", ["it-security", "facilities", "desks"])).toBe(
      "/drafts/new/procedure/category/it-security/facilities/desks",
    );
  });

  it("encodes each segment: spaces, slashes and unicode", () => {
    expect(newDraftPath("POLICY", ["a b", "x/y", "caf\u00E9"])).toBe(
      "/drafts/new/policy/category/a%20b/x%2Fy/caf%C3%A9",
    );
  });

  it("leaves out an empty path", () => {
    expect(newDraftPath("POLICY", [])).toBe("/drafts/new/policy");
  });
});
