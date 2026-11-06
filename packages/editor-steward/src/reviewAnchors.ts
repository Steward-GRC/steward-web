// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Where a review comment sits. The service keeps a thread's quoted text and which match of it
// (counting from 1) in the version's text; the editor keeps the highlight as a mark node with the
// thread's id. These helpers turn one into the other. "The version's text" is the text nodes in
// document order, joined with nothing between them, so a quote may run across paragraphs.
import { $wrapSelectionInMarkNode } from "@lexical/mark";
import {
  $createRangeSelection,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  type TextNode,
} from "lexical";

export interface TextAnchor {
  /** Which match of `quote` in the version's text, counting from 1. */
  occurrence: number;
  quote: string;
}

/** The index of the nth match of `needle` in `text` (counting from 1, overlaps included), or -1. */
export const nthIndexOf = (text: string, needle: string, n: number): number => {
  if (!needle) return -1;
  let at = -1;
  for (let found = 0; found < n; found += 1) {
    at = text.indexOf(needle, at + 1);
    if (at < 0) return -1;
  }
  return at;
};

const textNodes = (): TextNode[] => $getRoot().getAllTextNodes();

const offsetOf = (nodes: TextNode[], key: string, offset: number): number => {
  let before = 0;
  for (const node of nodes) {
    if (node.getKey() === key) return before + offset;
    before += node.getTextContentSize();
  }
  return -1;
};

/** The quote and occurrence of the current text selection, or null when nothing is selected. */
export const $selectionAnchor = (): null | TextAnchor => {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || selection.isCollapsed()) return null;
  const nodes = textNodes();
  const a = offsetOf(nodes, selection.anchor.key, selection.anchor.offset);
  const b = offsetOf(nodes, selection.focus.key, selection.focus.offset);
  if (a < 0 || b < 0 || a === b) return null;
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  const text = nodes.map((node) => node.getTextContent()).join("");
  const quote = text.slice(start, end);
  if (!quote.trim()) return null;
  let occurrence = 1;
  for (let at = text.indexOf(quote); at >= 0 && at < start; at = text.indexOf(quote, at + 1)) {
    occurrence += 1;
  }
  return { occurrence, quote };
};

/**
 * Marks the thread's text with its id. False, changing nothing, when the quote has no such match
 * (the text was edited). Call inside `editor.update`.
 */
export const $anchorThread = (id: string, { occurrence, quote }: TextAnchor): boolean => {
  const nodes = textNodes();
  const text = nodes.map((node) => node.getTextContent()).join("");
  const start = nthIndexOf(text, quote, occurrence);
  if (start < 0) return false;
  const end = start + quote.length;
  let from: { node: TextNode; offset: number } | null = null;
  let to: { node: TextNode; offset: number } | null = null;
  let before = 0;
  for (const node of nodes) {
    const size = node.getTextContentSize();
    if (!from && start < before + size) from = { node, offset: start - before };
    if (!to && end <= before + size && end > before) {
      to = { node, offset: end - before };
      break;
    }
    before += size;
  }
  if (!from || !to || !$isTextNode(from.node) || !$isTextNode(to.node)) return false;
  const selection = $createRangeSelection();
  selection.anchor.set(from.node.getKey(), from.offset, "text");
  selection.focus.set(to.node.getKey(), to.offset, "text");
  $wrapSelectionInMarkNode(selection, false, id);
  return true;
};
