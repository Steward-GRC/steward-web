// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { availableTo, moveId } from "./versionLinks";

describe("moving a link up or down (bug log 227)", () => {
  it("swaps it with its neighbour", () => {
    expect(moveId(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(moveId(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
  });

  it("stays put at either end", () => {
    expect(moveId(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(moveId(["a", "b"], 1, 1)).toEqual(["a", "b"]);
  });
});

describe("what is left to pick from the library", () => {
  const library = [
    { archived: false, id: "1", label: "Zebra" },
    { archived: false, id: "2", label: "apple" },
    { archived: true, id: "3", label: "Old" },
    { archived: false, id: "4", label: "Mango" },
  ];

  it("leaves out what is already linked and what is archived, alphabetically", () => {
    expect(availableTo(library, ["4"], (item) => item.label).map((item) => item.id)).toEqual([
      "2",
      "1",
    ]);
  });
});
