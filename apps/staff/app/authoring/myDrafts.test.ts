// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { DRAFTS_COLLAPSED_CAP, filterDrafts, sortDraftsByRecent, visibleDrafts } from "./myDrafts";

const drafts = [
  { number: "POL-002", title: "Acceptable Use", updated: "2026-09-01T00:00:00Z" },
  { number: "POL-001", title: "Expense Claims", updated: "2026-10-01T00:00:00Z" },
  { number: "POL-003", title: "Data Classification", updated: "2026-10-01T00:00:00Z" },
];

describe("sortDraftsByRecent", () => {
  it("orders most-recently-updated first, breaking ties on number", () => {
    expect(sortDraftsByRecent(drafts).map((d) => d.number)).toEqual([
      "POL-001",
      "POL-003",
      "POL-002",
    ]);
  });

  it("never mutates the input array", () => {
    const copy = [...drafts];
    sortDraftsByRecent(drafts);
    expect(drafts).toEqual(copy);
  });
});

describe("filterDrafts", () => {
  it("matches by title or number, case-insensitively", () => {
    expect(filterDrafts(drafts, "expense").map((d) => d.number)).toEqual(["POL-001"]);
    expect(filterDrafts(drafts, "pol-003").map((d) => d.number)).toEqual(["POL-003"]);
  });

  it("returns every row for a blank query", () => {
    expect(filterDrafts(drafts, " ".repeat(3))).toHaveLength(drafts.length);
  });
});

describe("visibleDrafts", () => {
  it("caps the list when collapsed", () => {
    const many = Array.from({ length: 10 }, (_, index) => ({
      number: `POL-${index}`,
      title: `Draft ${index}`,
      updated: "2026-01-01T00:00:00Z",
    }));
    expect(visibleDrafts(many, false)).toHaveLength(DRAFTS_COLLAPSED_CAP);
    expect(visibleDrafts(many, true)).toHaveLength(10);
  });
});
