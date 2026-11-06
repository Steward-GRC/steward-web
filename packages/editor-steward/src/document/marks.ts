// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { SerializedDocument, SerializedNode } from "./tree";

/** The node type the editor uses for a comment's highlight. */
const MARK = "mark";

const unmark = (nodes: SerializedNode[]): SerializedNode[] =>
  nodes.flatMap((node) => {
    const children = node.children ? unmark(node.children) : undefined;
    if (node.type === MARK) return children ?? [];
    return children ? [{ ...node, children }] : [node];
  });

/**
 * The document without comment highlights. A review comment's anchor is the quoted text the
 * service keeps, put back as a highlight each time the document opens, so the stored document,
 * the reader and the PDF never carry one.
 */
export const stripMarks = (document: SerializedDocument): SerializedDocument => ({
  ...document,
  root: { ...document.root, children: unmark(document.root.children) },
});
