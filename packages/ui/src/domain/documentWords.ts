// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Word count and reading time for the published read view (bug log 172). The editor shows the
// same two numbers while writing, from the editor package's own counter; this counts the words in
// the blocks the reader draws, so both say the same thing about the same text.
import type { DocumentBlock, InlineRun } from "@steward-web/api-client";

/** The reading speed the editor package uses too. */
export const WORDS_PER_MINUTE = 238;

const wordsIn = (text: string): number => text.split(/\s+/u).filter(Boolean).length;

const runsText = (runs: readonly InlineRun[]): string => runs.map((run) => run.text).join("");

const blockWords = (block: DocumentBlock): number => {
  switch (block.kind) {
    case "heading": {
      return wordsIn(block.text);
    }
    case "list": {
      return block.items.reduce((total, item) => total + wordsIn(runsText(item)), 0);
    }
    case "paragraph":
    case "quote": {
      return wordsIn(runsText(block.runs));
    }
    case "table": {
      return block.rows.reduce(
        (total, row) => total + row.cells.reduce((sum, cell) => sum + wordsIn(cell), 0),
        0,
      );
    }
  }
};

/** The words in a body: headings, paragraphs, lists, quotes and tables. */
export const wordsInBlocks = (blocks: readonly DocumentBlock[]): number =>
  blocks.reduce((total, block) => total + blockWords(block), 0);

/** Whole minutes to read `words`, rounded up; 0 for none. */
export const readingMinutes = (words: number, wordsPerMinute = WORDS_PER_MINUTE): number =>
  words <= 0 ? 0 : Math.ceil(words / wordsPerMinute);
