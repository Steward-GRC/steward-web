// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The stored draft format: a Lexical serialized editor state, as JSON. These helpers read and
// write it as plain data, without loading Lexical, so the server, the mock gateway and the
// gates can use them.

/** A serialized editor state: what `contentJson` holds. */
export interface SerializedDocument {
  root: { children: SerializedNode[] } & SerializedNode;
}

/** One serialized Lexical node. Only the fields the helpers read are named. */
export interface SerializedNode {
  [key: string]: unknown;
  children?: SerializedNode[];
  text?: unknown;
  type: string;
}

export const emptyParagraph = (): SerializedNode => ({
  children: [],
  direction: null,
  format: "",
  indent: 0,
  type: "paragraph",
  version: 1,
});

/** Wrap root children in a root node. An empty list gets one empty paragraph: Lexical refuses
 *  a childless root, and steward-core refuses to store one. */
export const wrapRoot = (children: SerializedNode[]): SerializedDocument => ({
  root: {
    children: children.length > 0 ? children : [emptyParagraph()],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Stored `contentJson` -> a document, or undefined when it holds no usable editor state.
 * Anything else, including the earlier plain-text section array, is refused rather than
 * guessed at; callers start from a fresh scaffold instead.
 */
export const parseDocument = (contentJson?: null | string): SerializedDocument | undefined => {
  if (!contentJson) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(contentJson);
  } catch {
    return undefined;
  }
  if (!isObject(parsed) || !isObject(parsed.root)) return undefined;
  const root = parsed.root;
  const children = Array.isArray(root.children)
    ? (root.children as unknown[]).filter(
        (child): child is SerializedNode =>
          isObject(child) && typeof child.type === "string" && child.type !== "",
      )
    : [];
  return {
    ...(parsed as object),
    root: {
      ...root,
      children: children.length > 0 ? children : [emptyParagraph()],
      type: "root",
    },
  } as SerializedDocument;
};

/** A document -> the string `saveDraft` and the collab snapshot carry. */
export const serializeDocument = (document: SerializedDocument): string => JSON.stringify(document);

const descendantText = (node: SerializedNode): string =>
  typeof node.text === "string"
    ? node.text
    : (node.children ?? []).map((child) => descendantText(child)).join("");

const cellText = (cell: SerializedNode): string =>
  (cell.children ?? [])
    .map((block) => descendantText(block).replaceAll(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ");

/**
 * A node's plain text. A table keeps its grid (cells tab-separated, rows newline-separated)
 * and a list one item per line, so the structure survives for readers such as the AI
 * review, which only sees text.
 */
export const nodeText = (node: SerializedNode): string => {
  if (typeof node.text === "string") return node.text;
  if (node.type === "linebreak") return "\n";
  if (node.type === "table") {
    return (node.children ?? [])
      .filter((row) => row.type === "tablerow")
      .map((row) =>
        (row.children ?? [])
          .filter((cell) => cell.type === "tablecell")
          .map((cell) => cellText(cell))
          .join("\t"),
      )
      .join("\n");
  }
  const separator = node.type === "list" ? "\n" : "";
  return (node.children ?? []).map((child) => nodeText(child)).join(separator);
};

/** How many nodes of each type a document holds, the root included. */
export const countNodeTypes = (document: SerializedDocument): Record<string, number> => {
  const counts: Record<string, number> = {};
  const walk = (node: SerializedNode) => {
    counts[node.type] = (counts[node.type] ?? 0) + 1;
    for (const child of node.children ?? []) walk(child);
  };
  walk(document.root);
  return counts;
};

/** True when a node or anything under it carries non-blank text. */
export const hasText = (node: SerializedNode): boolean =>
  (typeof node.text === "string" && node.text.trim() !== "") ||
  (node.children ?? []).some((child) => hasText(child));
