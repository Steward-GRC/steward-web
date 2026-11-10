// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { checkMove, depthOf, descendantIds, subtreeHeight } from "./tree";

// Finance > Expenses > Travel, and a separate IT, and Legal.
const groups = [
  { id: "fin", parentId: null },
  { id: "exp", parentId: "fin" },
  { id: "trv", parentId: "exp" },
  { id: "it", parentId: null },
  { id: "legal" },
];

describe("the tree helpers", () => {
  it("measure depth and the height of a branch", () => {
    expect(depthOf(groups, "trv")).toBe(3);
    expect(subtreeHeight(groups, "fin")).toBe(3);
    expect(subtreeHeight(groups, "legal")).toBe(1);
    expect([...descendantIds(groups, "fin")].toSorted()).toEqual(["exp", "fin", "trv"]);
  });
});

describe("checkMove", () => {
  it("allows a move that keeps the whole branch within three levels", () => {
    expect(checkMove(groups, "exp", "it")).toBe("ok");
    expect(checkMove(groups, "trv", null)).toBe("ok");
    expect(checkMove(groups, "legal", "exp")).toBe("ok");
  });

  it("refuses a move that would make the branch four levels deep (depth 4)", () => {
    // Finance has height 3; under IT (depth 1) it would reach depth 4.
    expect(checkMove(groups, "fin", "it")).toBe("depth");
    // Expenses (height 2) under Travel (depth 3) is depth 5, and Travel is its own descendant.
    expect(checkMove(groups, "legal", "trv")).toBe("depth");
  });

  it("refuses itself, its own branch, and where it already is", () => {
    expect(checkMove(groups, "fin", "fin")).toBe("self");
    expect(checkMove(groups, "fin", "trv")).toBe("descendant");
    expect(checkMove(groups, "exp", "fin")).toBe("same");
    expect(checkMove(groups, "fin", null)).toBe("same");
    expect(checkMove(groups, "legal", null)).toBe("same");
  });
});
