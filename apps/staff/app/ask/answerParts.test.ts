// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { answerParts } from "./answerParts";

const citations = [
  { policyId: "p-exp", sectionKey: "2" },
  { policyId: "p-travel", sectionKey: "1" },
];

describe("answerParts", () => {
  it("puts each cited span's citation numbers after it", () => {
    const answer = "File within 30 days. Book travel first.";
    expect(
      answerParts(answer, citations, [
        { end: 20, sources: [{ policyId: "p-exp", sectionKey: "2" }], start: 0 },
        { end: 39, sources: [{ policyId: "p-travel", sectionKey: "1" }], start: 21 },
      ]),
    ).toEqual([
      { cites: [1], text: "File within 30 days." },
      { cites: [], text: " " },
      { cites: [2], text: "Book travel first." },
    ]);
  });

  it("keeps the uncited text and drops a source with no citation", () => {
    expect(
      answerParts("Hello there.", citations, [
        { end: 5, sources: [{ policyId: "p-x", sectionKey: "9" }], start: 0 },
      ]),
    ).toEqual([
      { cites: [], text: "Hello" },
      { cites: [], text: " there." },
    ]);
  });

  it("is the whole answer when there are no segments", () => {
    expect(answerParts("Just text.", citations, [])).toEqual([{ cites: [], text: "Just text." }]);
  });
});
