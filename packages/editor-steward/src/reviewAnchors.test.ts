// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { $isMarkNode, MarkNode } from "@lexical/mark";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setSelection,
  createEditor,
  type LexicalEditor,
} from "lexical";
import { describe, expect, it } from "vitest";

import { $anchorThread, $replaceQuote, $selectionAnchor, nthIndexOf } from "./reviewAnchors";

const editorWith = (...paragraphs: string[]): LexicalEditor => {
  const editor = createEditor({
    nodes: [MarkNode],
    onError: (error) => {
      throw error;
    },
  });
  editor.update(
    () => {
      const root = $getRoot();
      for (const text of paragraphs) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(text));
        root.append(paragraph);
      }
    },
    { discrete: true },
  );
  return editor;
};

const marked = (editor: LexicalEditor): { ids: string[]; text: string }[] =>
  editor.getEditorState().read(() => {
    const found: { ids: string[]; text: string }[] = [];
    const walk = (node: ReturnType<typeof $getRoot>) => {
      for (const child of node.getChildren()) {
        if ($isMarkNode(child)) found.push({ ids: child.getIDs(), text: child.getTextContent() });
        else if ("getChildren" in child) walk(child as typeof node);
      }
    };
    walk($getRoot());
    return found;
  });

describe("nthIndexOf", () => {
  it("finds the nth match, counting from 1, overlaps included", () => {
    expect(nthIndexOf("aaaa", "aa", 1)).toBe(0);
    expect(nthIndexOf("aaaa", "aa", 2)).toBe(1);
    expect(nthIndexOf("aaaa", "aa", 3)).toBe(2);
    expect(nthIndexOf("aaaa", "aa", 4)).toBe(-1);
  });
});

describe("anchoring a thread by its quote", () => {
  it("marks the nth match of the quote with the thread's id", () => {
    const editor = editorWith("Keep records for seven years. Then keep seven years more.");
    editor.update(
      () => {
        expect($anchorThread("t1", { occurrence: 2, quote: "seven years" })).toBe(true);
      },
      { discrete: true },
    );
    expect(marked(editor)).toEqual([{ ids: ["t1"], text: "seven years" }]);
    const text = editor.getEditorState().read(() => $getRoot().getTextContent());
    expect(text).toBe("Keep records for seven years. Then keep seven years more.");
  });

  it("answers false and changes nothing when the quote is gone", () => {
    const editor = editorWith("Nothing to see");
    let anchored = true;
    editor.update(
      () => {
        anchored = $anchorThread("t1", { occurrence: 1, quote: "missing" });
      },
      { discrete: true },
    );
    expect(anchored).toBe(false);
    expect(marked(editor)).toEqual([]);
  });

  it("anchors across two paragraphs", () => {
    const editor = editorWith("first line", "second line");
    editor.update(
      () => {
        $anchorThread("t1", { occurrence: 1, quote: "linesecond" });
      },
      { discrete: true },
    );
    expect(marked(editor).map((m) => m.ids[0])).toContain("t1");
  });
});

describe("reading the anchor of a selection", () => {
  it("gives the quote and which match of it the selection is", () => {
    const editor = editorWith("alpha beta alpha beta");
    let anchor: ReturnType<typeof $selectionAnchor> = null;
    editor.update(
      () => {
        const text = $getRoot().getAllTextNodes()[0]!;
        text.select(17, 21);
        anchor = $selectionAnchor();
        $setSelection(null);
      },
      { discrete: true },
    );
    expect(anchor).toEqual({ occurrence: 2, quote: "beta" });
  });

  it("gives nothing for a collapsed selection", () => {
    const editor = editorWith("alpha");
    let anchor: ReturnType<typeof $selectionAnchor> = { occurrence: 1, quote: "x" };
    editor.update(
      () => {
        $getRoot().getAllTextNodes()[0]!.select(2, 2);
        anchor = $selectionAnchor();
      },
      { discrete: true },
    );
    expect(anchor).toBeNull();
  });
});

const textOf = (editor: LexicalEditor) =>
  editor.getEditorState().read(() => $getRoot().getTextContent());

describe("$replaceQuote", () => {
  it("puts new text where the nth match of the quote was", () => {
    const editor = editorWith("seven years then seven years");
    let done = false;
    editor.update(
      () => {
        done = $replaceQuote({ occurrence: 2, quote: "seven years" }, "six years");
      },
      { discrete: true },
    );
    expect(done).toBe(true);
    expect(textOf(editor)).toBe("seven years then six years");
  });

  it("leaves the document alone when the quote has no such match", () => {
    const editor = editorWith("seven years");
    let done = true;
    editor.update(
      () => {
        done = $replaceQuote({ occurrence: 2, quote: "seven years" }, "six years");
      },
      { discrete: true },
    );
    expect(done).toBe(false);
    expect(textOf(editor)).toBe("seven years");
  });
});
