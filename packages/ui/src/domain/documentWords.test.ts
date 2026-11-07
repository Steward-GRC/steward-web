// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { DocumentBlock } from "@steward-web/api-client";

import { describe, expect, it } from "vitest";

import { readingMinutes, wordsInBlocks } from "./documentWords";

const run = (text: string) => ({ text });

describe("wordsInBlocks (bug log 172)", () => {
  it("counts the words in headings, paragraphs, lists, quotes and tables", () => {
    const blocks: DocumentBlock[] = [
      { depth: 1, kind: "heading", text: "Visitor sign in" },
      { kind: "paragraph", runs: [run("Visitors sign in "), run("at reception.")] },
      { items: [[run("Wear a badge")], [run("Return it")]], kind: "list", ordered: false },
      { kind: "quote", runs: [run("Be kind.")] },
      {
        kind: "table",
        rows: [
          { cells: ["Name", "Floor"], header: true },
          { cells: ["Front desk", "1"], header: false },
        ],
      },
    ];
    // 3 (heading) + 5 + 5 (list) + 2 + 5 (table) = 20
    expect(wordsInBlocks(blocks)).toBe(20);
  });

  it("counts nothing for an empty body and ignores extra spaces", () => {
    expect(wordsInBlocks([])).toBe(0);
    expect(wordsInBlocks([{ kind: "paragraph", runs: [run("  one   two  ")] }])).toBe(2);
  });
});

describe("readingMinutes", () => {
  it("rounds up to whole minutes at 238 words a minute, and is 0 for none", () => {
    expect(readingMinutes(0)).toBe(0);
    expect(readingMinutes(1)).toBe(1);
    expect(readingMinutes(238)).toBe(1);
    expect(readingMinutes(239)).toBe(2);
  });
});
