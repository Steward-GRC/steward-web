// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The live diff (bug log 228): what an author has changed against the published text, found while
// they type and drawn on the words themselves, like track changes. Plain data in, plain data out:
// the editor reads the ranges and paints them locally, so nothing here touches the document and
// nothing reaches a collaboration room.
import type { SerializedDocument, SerializedNode } from "./tree";

/** Node types that sit inside a line of text. Anything else with children holds blocks. */
const INLINE = new Set([
  "autolink",
  "code-highlight",
  "hashtag",
  "linebreak",
  "link",
  "mark",
  "tab",
  "text",
]);

const inlineText = (node: SerializedNode): string => {
  if (node.type === "linebreak") return "\n";
  if (node.type === "tab") return "\t";
  if (typeof node.text === "string") return node.text;
  return (node.children ?? []).map((child) => inlineText(child)).join("");
};

const collect = (node: SerializedNode, out: string[]): void => {
  const children = node.children ?? [];
  const inline = children.filter((child) => INLINE.has(child.type));
  const text = inline.map((child) => inlineText(child)).join("");
  if (node.type !== "root" && text !== "") out.push(text);
  // a card has no children; a container's blocks are taken in order
  for (const child of children) if (!INLINE.has(child.type) && child.children) collect(child, out);
};

/**
 * The text of each block, in reading order: a paragraph, a heading, a list item, a table cell's
 * paragraph. A nested list's items are blocks of their own. Cards and empty paragraphs have no
 * text to compare and are left out. The editor lists its blocks by the same rule.
 */
export const textBlocksOf = (document: SerializedDocument): string[] => {
  const out: string[] = [];
  collect(document.root, out);
  return out;
};

/** What changed in one block of the current text. Offsets count characters in that block. */
export interface BlockDiff {
  /** The new words, as [from, to) ranges. */
  added: [number, number][];
  /** Words that were published and are gone, and the offset in this block where they stood. */
  removed: { at: number; text: string }[];
}

export interface LiveDiff {
  /** One entry per block of the current text, in order. */
  blocks: BlockDiff[];
  /** Blocks that were published and are gone, and the index of the current block they preceded. */
  removedBlocks: { before: number; text: string }[];
}

/** Words, runs of space, and each mark of punctuation by itself. */
const tokens = (text: string): string[] =>
  text.match(/\s+|[\p{L}\p{N}_']+|[^\s\p{L}\p{N}_']/gu) ?? [];

/** Pairs of equal items in order, by the longest common subsequence. */
const commonPairs = (a: readonly string[], b: readonly string[]): [number, number][] => {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table = Array.from({ length: rows }, () => new Uint32Array(cols));
  for (let left = a.length - 1; left >= 0; left--)
    for (let right = b.length - 1; right >= 0; right--)
      table[left]![right] =
        a[left] === b[right]
          ? table[left + 1]![right + 1]! + 1
          : Math.max(table[left + 1]![right]!, table[left]![right + 1]!);
  const pairs: [number, number][] = [];
  let left = 0;
  let right = 0;
  while (left < a.length && right < b.length) {
    if (a[left] === b[right]) {
      pairs.push([left, right]);
      left++;
      right++;
    } else if (table[left + 1]![right]! >= table[left]![right + 1]!) left++;
    else right++;
  }
  return pairs;
};

/** Beyond this many token pairs a block is shown as replaced whole rather than compared. */
const MAX_TOKEN_PAIRS = 4_000_000;

/** The span without the space at either end, or null when only space is left. */
const trimmed = (text: string, from: number, to: number): [number, number] | null => {
  let start = from;
  let end = to;
  while (start < end && /\s/.test(text[start]!)) start++;
  while (end > start && /\s/.test(text[end - 1]!)) end--;
  return start < end ? [start, end] : null;
};

const diffWords = (before: string, after: string): BlockDiff => {
  const oldTokens = tokens(before);
  const newTokens = tokens(after);
  const result: BlockDiff = { added: [], removed: [] };
  const wholly = oldTokens.length * newTokens.length > MAX_TOKEN_PAIRS;
  const pairs = wholly ? [] : commonPairs(oldTokens, newTokens);
  // walk both sides between the matches: what is left on the new side is added, on the old side removed
  let oldIndex = 0;
  let newIndex = 0;
  let newOffset = 0;
  const flush = (oldEnd: number, newEnd: number) => {
    const addedFrom = newOffset;
    const addedTo = addedFrom + newTokens.slice(newIndex, newEnd).join("").length;
    const added = trimmed(after, addedFrom, addedTo);
    if (added) result.added.push(added);
    const gone = oldTokens.slice(oldIndex, oldEnd).join("").trim();
    if (gone) result.removed.push({ at: added ? added[0] : addedFrom, text: gone });
    newOffset = addedTo;
  };
  for (const [oldAt, newAt] of pairs) {
    flush(oldAt, newAt);
    oldIndex = oldAt + 1;
    newIndex = newAt + 1;
    newOffset += newTokens[newAt]!.length;
  }
  flush(oldTokens.length, newTokens.length);
  return result;
};

const wholeBlock = (text: string): BlockDiff => ({ added: [[0, text.length]], removed: [] });

/**
 * Compares the published blocks with the current ones. Equal blocks are lined up first; between
 * them, blocks are paired in order and compared word by word, and the ones left over are either
 * new (added whole) or gone (listed before the block that follows).
 */
export const diffBlocks = (published: readonly string[], current: readonly string[]): LiveDiff => {
  const blocks: BlockDiff[] = current.map(() => ({ added: [], removed: [] }));
  const removedBlocks: LiveDiff["removedBlocks"] = [];
  const anchors = commonPairs(published, current);
  const gap = (fromOld: number, toOld: number, fromNew: number, toNew: number) => {
    const paired = Math.min(toOld - fromOld, toNew - fromNew);
    for (let offset = 0; offset < paired; offset++)
      blocks[fromNew + offset] = diffWords(
        published[fromOld + offset]!,
        current[fromNew + offset]!,
      );
    for (let index = fromNew + paired; index < toNew; index++)
      blocks[index] = wholeBlock(current[index]!);
    for (let index = fromOld + paired; index < toOld; index++)
      removedBlocks.push({ before: toNew, text: published[index]! });
  };
  let oldAt = 0;
  let newAt = 0;
  for (const [oldAnchor, newAnchor] of anchors) {
    gap(oldAt, oldAnchor, newAt, newAnchor);
    oldAt = oldAnchor + 1;
    newAt = newAnchor + 1;
  }
  gap(oldAt, published.length, newAt, current.length);
  return { blocks, removedBlocks };
};
