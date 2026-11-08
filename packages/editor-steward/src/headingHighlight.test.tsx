// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// bug log 191: a heading can't be highlighted, only regular text. The toolbar's highlight button
// would still write the colour onto a heading's text, so the editor takes it back off.
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import { render, waitFor } from "@testing-library/react";
import {
  $getRoot,
  $isElementNode,
  $isTextNode,
  createEditor,
  type LexicalEditor,
  TextNode,
} from "lexical";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { SerializedDocument, SerializedNode } from "./document/tree";

import { StewardEditor, type StewardEditorHandle } from "./StewardEditor";

const HIGHLIGHT = "background-color: #fff59d; color: #15171A;";

const text = (words: string, style = "") => ({
  detail: 0,
  format: 0,
  mode: "normal",
  style,
  text: words,
  type: "text",
  version: 1,
});

const heading = (level: number, words: string, style = ""): SerializedNode => ({
  children: [text(words, style)],
  direction: null,
  format: "",
  indent: 0,
  tag: `h${level}`,
  type: "heading",
  version: 1,
});

const paragraph = (...runs: unknown[]): SerializedNode => ({
  children: runs as SerializedNode[],
  direction: null,
  format: "",
  indent: 0,
  textFormat: 0,
  textStyle: "",
  type: "paragraph",
  version: 1,
});

const documentOf = (...children: SerializedNode[]): SerializedDocument => ({
  root: { children, direction: null, format: "", indent: 0, type: "root", version: 1 },
});

const mount = async (initialDocument: SerializedDocument) => {
  let handle: StewardEditorHandle | undefined;
  const view = render(
    <StewardEditor
      initialDocument={initialDocument}
      onReady={(ready) => {
        handle = ready;
      }}
    />,
  );
  await waitFor(() => expect(handle).toBeDefined());
  const box = view.container.querySelector("[data-lexical-editor]") as unknown as {
    __lexicalEditor: LexicalEditor;
  };
  return { editor: box.__lexicalEditor, handle: handle! };
};

/** The style of every text run, as [text, style], in document order. */
const styles = (document_: SerializedDocument): [string, string][] => {
  const found: [string, string][] = [];
  const walk = (node: SerializedNode) => {
    if (node.type === "text") found.push([String(node.text), String(node.style ?? "")]);
    for (const child of node.children ?? []) walk(child);
  };
  walk(document_.root);
  return found;
};

describe("highlight on headings (bug log 191)", () => {
  it("takes the highlight off heading text and keeps it on regular text", async () => {
    const { handle } = await mount(
      documentOf(
        heading(1, "Purpose", HIGHLIGHT),
        heading(5, "Detail", HIGHLIGHT),
        paragraph(text("Marked words", HIGHLIGHT), text(" and plain")),
      ),
    );
    await waitFor(() => {
      const found = styles(handle.getDocument());
      expect(found.find(([words]) => words === "Purpose")?.[1]).toBe("");
      expect(found.find(([words]) => words === "Detail")?.[1]).toBe("");
    });
    expect(styles(handle.getDocument()).find(([words]) => words === "Marked words")?.[1]).toContain(
      "background-color",
    );
  });

  it("ignores a highlight applied to a heading later, and leaves the text beside it marked", async () => {
    const { editor, handle } = await mount(
      documentOf(heading(2, "Scope"), paragraph(text("Everyone who travels"))),
    );
    // what the toolbar does for a selection across the heading and the text under it
    editor.update(
      () => {
        for (const block of $getRoot().getChildren()) {
          if (!$isElementNode(block)) continue;
          for (const run of block.getChildren()) {
            if ($isTextNode(run)) run.setStyle(HIGHLIGHT);
          }
        }
      },
      { discrete: true },
    );
    await waitFor(() => {
      const found = styles(handle.getDocument());
      expect(found.find(([words]) => words === "Scope")?.[1]).toBe("");
    });
    expect(
      styles(handle.getDocument()).find(([words]) => words === "Everyone who travels")?.[1],
    ).toContain("background-color");
  });
});

describe("the heading guard is registered once per editor", () => {
  // The draft screen hands the editor a new onReady on every render, so the editor reports itself
  // again each time. Registering a node transform marks every text node dirty and runs an editor
  // update, which re-renders the screen: registering again each time is a render loop.
  it("does not register again when the host re-renders", async () => {
    const prototype = Object.getPrototypeOf(createEditor()) as LexicalEditor;
    const registered = vi.spyOn(prototype, "registerNodeTransform");
    const initial = documentOf(heading(1, "Purpose"), paragraph(text("Words")));
    const view = render(<StewardEditor initialDocument={initial} onReady={() => {}} />);
    await waitFor(() =>
      expect(view.container.querySelector("[data-lexical-editor]")).not.toBeNull(),
    );
    const forText = () => registered.mock.calls.filter(([klass]) => klass === TextNode).length;
    const first = forText();
    for (let index = 0; index < 4; index++) {
      view.rerender(<StewardEditor initialDocument={initial} onReady={() => {}} />);
    }
    expect(forText()).toBe(first);
    registered.mockRestore();
  });
});

describe("the heading guard survives React's StrictMode (bug log 191, reopened)", () => {
  // In development React mounts, unmounts and mounts again. The guard was registered once and
  // stopped by the simulated unmount, so on a fresh page it was not there at all.
  it("still takes a highlight off a heading after the double mount", async () => {
    let handle: StewardEditorHandle | undefined;
    const view = render(
      <StrictMode>
        <StewardEditor
          initialDocument={documentOf(heading(1, "Purpose"), paragraph(text("Words")))}
          onReady={(ready) => {
            handle = ready;
          }}
        />
      </StrictMode>,
    );
    await waitFor(() => expect(handle).toBeDefined());
    const box = view.container.querySelector("[data-lexical-editor]") as unknown as {
      __lexicalEditor: LexicalEditor;
    };
    box.__lexicalEditor.update(
      () => {
        for (const block of $getRoot().getChildren()) {
          if (!$isElementNode(block)) continue;
          for (const run of block.getChildren()) {
            if ($isTextNode(run)) run.setStyle(HIGHLIGHT);
          }
        }
      },
      { discrete: true },
    );
    await waitFor(() => {
      const found = styles(handle!.getDocument());
      expect(found.find(([words]) => words === "Purpose")?.[1]).toBe("");
    });
    expect(styles(handle!.getDocument()).find(([words]) => words === "Words")?.[1]).toContain(
      "background-color",
    );
  });
});
