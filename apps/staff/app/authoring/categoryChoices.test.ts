// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { categoryChoices } from "./categoryChoices";

const group = (id: string, name: string, parentId: null | string = null) =>
  ({ id, name, parentId }) as never;

const typed = (id: string, name: string, parentId: null | string, documentTypes: string) =>
  ({ documentTypes, id, name, parentId }) as never;

describe("categoryChoices document types (#87)", () => {
  it("carries what each group holds, on categories and subcategories", () => {
    expect(
      categoryChoices([
        typed("w", "Workplace", null, "NONE"),
        typed("f", "Facilities", "w", "POLICIES"),
      ]),
    ).toEqual([
      {
        documentTypes: "NONE",
        id: "w",
        name: "Workplace",
        subcategories: [{ documentTypes: "POLICIES", id: "f", name: "Facilities" }],
      },
    ]);
  });
});

describe("categoryChoices", () => {
  it("makes the top groups categories and their children subcategories", () => {
    expect(
      categoryChoices([
        group("w", "Workplace"),
        group("f", "Facilities", "w"),
        group("t", "Travel", "w"),
        group("p", "People"),
      ]),
    ).toEqual([
      {
        id: "w",
        name: "Workplace",
        subcategories: [
          { id: "f", name: "Facilities" },
          { id: "t", name: "Travel" },
        ],
      },
      { id: "p", name: "People", subcategories: [] },
    ]);
  });

  it("treats a group whose parent the author can't use as a category of its own", () => {
    expect(categoryChoices([group("f", "Facilities", "hidden")])).toEqual([
      { id: "f", name: "Facilities", subcategories: [] },
    ]);
  });

  it("names deeper groups by their path under the subcategory", () => {
    const choices = categoryChoices([
      group("w", "Workplace"),
      group("f", "Facilities", "w"),
      group("d", "Desks", "f"),
    ]);
    expect(choices[0]!.subcategories).toEqual([
      { id: "f", name: "Facilities" },
      { id: "d", name: "Facilities › Desks" },
    ]);
  });
});
