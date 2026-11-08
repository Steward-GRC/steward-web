// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A button card with no label or no link is not finished. The editor marks both fields required;
// this reads the stored document, which is what a submit is judged on (bug log 183).
import type { SerializedDocument, SerializedNode } from "./tree";

const blank = (value: unknown): boolean => typeof value !== "string" || value.trim() === "";

/** How many button cards have an empty label or an empty link. */
export const incompleteButtons = (document: SerializedDocument): number => {
  let count = 0;
  const walk = (node: SerializedNode) => {
    if (node.type === "button" && (blank(node.buttonText) || blank(node.buttonUrl))) count += 1;
    for (const child of node.children ?? []) walk(child);
  };
  walk(document.root);
  return count;
};
