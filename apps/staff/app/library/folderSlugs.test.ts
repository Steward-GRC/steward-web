// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { folderSlugs } from "./folderSlugs";

const categories = [
  {
    id: "w",
    name: "Workplace",
    slug: "workplace-services",
    subcategories: [{ name: "Facilities", slug: "facilities" }],
  },
];

describe("folderSlugs (#377)", () => {
  it("turns the library filter's names into the slug path", () => {
    expect(folderSlugs(categories, "Workplace", "Facilities")).toEqual([
      "workplace-services",
      "facilities",
    ]);
    expect(folderSlugs(categories, "Workplace", "")).toEqual(["workplace-services"]);
  });

  it("gives nothing for a name it doesn't know", () => {
    expect(folderSlugs(categories, "Nowhere", "Facilities")).toEqual([]);
    expect(folderSlugs(categories, "Workplace", "Nope")).toEqual([]);
    expect(folderSlugs(categories, "", "")).toEqual([]);
  });
});
