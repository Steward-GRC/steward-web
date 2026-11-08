// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The rules of a suggestion, as one table: who may do what, and when. The same rules are the mock
// server's (steward-mock-server review-suggestions.test.ts), so the screen offers only what the
// service will accept.
import { describe, expect, it } from "vitest";

import { outcomeOf, suggestionActions, type SuggestionSide } from "./suggestionActions";

const actions = (side: SuggestionSide, turn: SuggestionSide, firstBy: SuggestionSide) =>
  suggestionActions({ closed: false, firstBy, side, turn });

describe("what each side may do with a suggestion", () => {
  it("gives the author, on the author's turn, change, remove, counter and not agreed", () => {
    expect(actions("AUTHOR", "AUTHOR", "REVIEWER")).toEqual([
      "change",
      "remove",
      "counter",
      "notAgreed",
    ]);
  });

  it("gives the reviewer, on the reviewer's turn, accept, counter and not agreed", () => {
    expect(actions("REVIEWER", "REVIEWER", "REVIEWER")).toEqual(["accept", "counter", "notAgreed"]);
  });

  it("gives the side that proposed first only withdraw while it is not their turn", () => {
    expect(actions("REVIEWER", "AUTHOR", "REVIEWER")).toEqual(["withdraw"]);
    expect(actions("AUTHOR", "REVIEWER", "AUTHOR")).toEqual(["withdraw"]);
  });

  it("gives the side that did not propose first nothing while it is not their turn", () => {
    expect(actions("AUTHOR", "REVIEWER", "REVIEWER")).toEqual([]);
    expect(actions("REVIEWER", "AUTHOR", "AUTHOR")).toEqual([]);
  });

  it("gives an ended suggestion nothing", () => {
    expect(
      suggestionActions({ closed: true, firstBy: "REVIEWER", side: "AUTHOR", turn: "AUTHOR" }),
    ).toEqual([]);
  });
});

describe("the outcome each closing action records", () => {
  it.each([
    ["accept", "AGREED"],
    ["change", "CHANGED"],
    ["notAgreed", "NOT_AGREED"],
    ["remove", "REMOVED"],
    ["withdraw", "WITHDRAWN"],
  ] as const)("%s ends it as %s", (action, outcome) => {
    expect(outcomeOf(action)).toBe(outcome);
  });

  it("has no outcome for a counter, which keeps it going", () => {
    expect(outcomeOf("counter")).toBeNull();
  });
});
