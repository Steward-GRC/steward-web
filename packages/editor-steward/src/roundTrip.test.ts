// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { $getRoot, $isElementNode, $isTextNode, createEditor, type LexicalNode } from "lexical";
import { describe, expect, it } from "vitest";

import originalDocument from "./__fixtures__/originalDocument.json";
import { stewardEditorNodes } from "./nodes";

// A document saved by the original editor (stock Lexical 0.45 plus its own image, footnote,
// mention and embed nodes) must load into this editor, take an edit and serialize back with
// nothing lost: every field the original wrote is still there with the same value. Lexical
// may add fields of its own (a newer version writes a few more defaults); that is not loss.

type Json = { [key: string]: Json } | boolean | Json[] | null | number | string;

/** Every key in `expected` is present in `actual` with an equal value, recursively; arrays
 *  must match element for element. Answers the first path that differs, or null. */
const firstLoss = (expected: Json, actual: Json, path = "$"): null | string => {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) return path;
    for (const [index, item] of expected.entries()) {
      const loss = firstLoss(item, actual[index]!, `${path}[${index}]`);
      if (loss) return loss;
    }
    return null;
  }
  if (expected !== null && typeof expected === "object") {
    if (actual === null || typeof actual !== "object" || Array.isArray(actual)) return path;
    for (const [key, value] of Object.entries(expected)) {
      if (!(key in actual)) return `${path}.${key}`;
      const loss = firstLoss(value, actual[key]!, `${path}.${key}`);
      if (loss) return loss;
    }
    return null;
  }
  return Object.is(expected, actual) ? null : path;
};

const countTypes = (node: Json, found: Map<string, number>): void => {
  if (node === null || typeof node !== "object" || Array.isArray(node)) return;
  if (typeof node.type === "string") found.set(node.type, (found.get(node.type) ?? 0) + 1);
  if (Array.isArray(node.children)) for (const child of node.children) countTypes(child, found);
};

/** How many nodes of each type a serialized editor state holds. */
const typesOf = (state: Json): Map<string, number> => {
  const found = new Map<string, number>();
  if (state !== null && typeof state === "object" && !Array.isArray(state)) {
    countTypes(state.root ?? null, found);
  }
  return found;
};

const original = originalDocument as unknown as Json;

const load = () => {
  const editor = createEditor({
    namespace: "round-trip",
    nodes: [...stewardEditorNodes],
    onError: (error) => {
      throw error;
    },
  });
  editor.setEditorState(editor.parseEditorState(JSON.stringify(originalDocument)));
  return editor;
};

/** The editor's state as `saveDraft` would store it. */
const serialized = (editor: ReturnType<typeof load>): Json => {
  const stored = JSON.stringify(editor.getEditorState().toJSON());
  return JSON.parse(stored) as Json;
};

const findText = (node: LexicalNode, value: string): LexicalNode | undefined => {
  if ($isTextNode(node) && node.getTextContent() === value) return node;
  if ($isElementNode(node)) {
    for (const child of node.getChildren()) {
      const hit = findText(child, value);
      if (hit) return hit;
    }
  }
  return undefined;
};

describe("an original-shape document", () => {
  it("uses every node type the original editor wrote", () => {
    expect([...typesOf(original).keys()].toSorted()).toEqual([
      "code",
      "code-highlight",
      "embed",
      "footnote",
      "heading",
      "horizontalrule",
      "image",
      "linebreak",
      "link",
      "list",
      "listitem",
      "mention",
      "paragraph",
      "quote",
      "root",
      "tab",
      "table",
      "tablecell",
      "tablerow",
      "text",
    ]);
  });

  it("loads and re-serializes without loss", () => {
    const output = serialized(load());
    expect(firstLoss(original, output)).toBeNull();
    expect(typesOf(output)).toEqual(typesOf(original));
  });

  it("takes an edit and keeps everything else", () => {
    const editor = load();
    editor.update(
      () => {
        const target = findText($getRoot(), "A quoted rule.");
        if (!$isTextNode(target)) throw new Error("fixture text not found");
        target.setTextContent("A quoted rule, edited.");
      },
      { discrete: true },
    );

    const expected = JSON.parse(
      JSON.stringify(originalDocument).replace("A quoted rule.", "A quoted rule, edited."),
    ) as Json;
    const output = serialized(editor);
    expect(firstLoss(expected, output)).toBeNull();
    expect(typesOf(output)).toEqual(typesOf(original));
  });
});
