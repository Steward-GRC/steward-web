// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Telling an edit from the editor merely loading a document (bug log 175). The editor reports a
// document in its own canonical form: every default field written out (`detail: 0`,
// `direction: null`, `textStyle: ""`, ...), and code split into highlighted runs. That is never
// character-for-character what was stored, so comparing the two as text always says "changed".
// This compares what a person would call the content instead.
import type { SerializedNode } from "./tree";

/** The values the editor writes for a field a stored document may simply leave out. */
const isDefault = (value: unknown): boolean => ["", 0, "normal", null].includes(value as never);

const codeText = (node: SerializedNode): string => {
  if (node.type === "linebreak") return "\n";
  if (node.type === "tab") return "\t";
  if (typeof node.text === "string") return node.text;
  return (node.children ?? []).map((child) => codeText(child)).join("");
};

const comparable = (node: SerializedNode): SerializedNode => {
  const out: SerializedNode = { type: node.type };
  for (const [key, value] of Object.entries(node)) {
    if (key === "children" || key === "type" || key === "version" || isDefault(value)) continue;
    out[key] = value;
  }
  if (node.type === "code") {
    // the run boundaries are the highlighter's, not the author's
    out.children = [{ text: codeText(node), type: "text" }];
  } else if (node.children) {
    out.children = node.children.map((child) => comparable(child));
  }
  return out;
};

/**
 * Whether two serialized documents hold the same content, ignoring the editor's default fields
 * and how it splits code into highlighted runs. Anything that is not a document is compared as
 * plain text.
 */
export const sameContent = (a: string, b: string): boolean => {
  if (a === b) return true;
  try {
    const left = JSON.parse(a) as { root?: SerializedNode };
    const right = JSON.parse(b) as { root?: SerializedNode };
    if (!left.root || !right.root) return false;
    return JSON.stringify(comparable(left.root)) === JSON.stringify(comparable(right.root));
  } catch {
    return false;
  }
};
