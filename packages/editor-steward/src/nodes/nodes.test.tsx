// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, waitFor } from "@testing-library/react";
import { $nodesOfType, createEditor, type LexicalEditor } from "lexical";
import { KoenigComposer, KoenigEditor, type KoenigEditorAPI } from "node-koenig-editor";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { type SerializedDocument, type SerializedNode, wrapRoot } from "../document/tree";
import { LexicalDocumentView } from "../LexicalDocumentView";
import { embed, footnote, mention, STEWARD_NODES, stewardEditorNodes } from "./index";

// Steward's nodes reach the published editor only through its `customNodes` option. These
// check that they register there, write back the JSON they loaded, and show in the editor
// and in the server-rendered view.

const text = (value: string): SerializedNode => ({
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text: value,
  type: "text",
  version: 1,
});

const FOOTNOTE: SerializedNode = {
  body: { content: [text("Approved by the board.")], kind: "note" },
  footnoteId: "5f0c2a8e-1d2b-4c1a-9a51-3c1f0e6b7d42",
  type: "footnote",
  version: 1,
};

const MENTION: SerializedNode = { id: "user-42", label: "Sam Rivera", type: "mention", version: 1 };

const EMBED: SerializedNode = {
  embedId: "policy-reference",
  fallback: "See POL-0007",
  props: { policyNumber: "POL-0007" },
  type: "embed",
  version: 1,
};

const paragraph = (children: SerializedNode[]): SerializedNode => ({
  children,
  direction: null,
  format: "",
  indent: 0,
  textFormat: 0,
  textStyle: "",
  type: "paragraph",
  version: 1,
});

const DOCUMENT: SerializedDocument = wrapRoot([
  paragraph([text("Signed off"), FOOTNOTE, text(" by "), MENTION, text(".")]),
  EMBED,
]);

// The image card needs an upload hook; these tests never upload.
const NO_UPLOADS = {
  useFileUpload: () => ({ errors: [], isLoading: false, progress: 0, upload: async () => null }),
};

const mountComposer = async (document: SerializedDocument): Promise<LexicalEditor> => {
  let api: KoenigEditorAPI | undefined;
  render(
    <KoenigComposer
      customNodes={STEWARD_NODES}
      fileUploader={NO_UPLOADS}
      initialEditorState={JSON.stringify(document)}
    >
      <KoenigEditor
        registerAPI={(ready) => {
          api = ready;
        }}
      />
    </KoenigComposer>,
  );
  await waitFor(() => expect(api).toBeDefined());
  return api!.editorInstance;
};

const headless = () =>
  createEditor({
    nodes: stewardEditorNodes,
    onError: (error) => {
      throw error;
    },
  });

const stewardNodesIn = (state: { root: SerializedNode }): SerializedNode[] => {
  const found: SerializedNode[] = [];
  const walk = (node: SerializedNode) => {
    if (["embed", "footnote", "mention"].includes(node.type)) found.push(node);
    const { children = [] } = node;
    for (const child of children) walk(child);
  };
  walk(state.root);
  return found;
};

describe("Steward's nodes on node-koenig-editor", () => {
  it("register through the composer's customNodes, beside the package's own nodes", async () => {
    const editor = await mountComposer(DOCUMENT);
    expect(editor.hasNodes([footnote.Node, mention.Node, embed.Node])).toBe(true);
    for (const type of ["footnote", "mention", "embed", "image", "callout", "table"]) {
      expect(editor._nodes.has(type)).toBe(true);
    }
  });

  it("serialise back to the JSON they were stored with, headless", () => {
    const editor = headless();
    editor.setEditorState(editor.parseEditorState(JSON.stringify(DOCUMENT)));
    const state = editor.getEditorState().toJSON() as unknown as SerializedDocument;
    expect(stewardNodesIn(state)).toEqual([FOOTNOTE, MENTION, EMBED]);
  });

  it("serialise back to the JSON they were stored with, mounted", async () => {
    const editor = await mountComposer(DOCUMENT);
    const state = editor.getEditorState().toJSON() as unknown as SerializedDocument;
    expect(stewardNodesIn(state)).toEqual([FOOTNOTE, MENTION, EMBED]);
  });

  it("keep their kind: footnotes and mentions inline, embeds a block", () => {
    const editor = headless();
    editor.update(() => {
      expect(footnote.Node.importJSON(FOOTNOTE as never).isInline()).toBe(true);
      expect(mention.Node.importJSON(MENTION as never).isInline()).toBe(true);
      expect(embed.Node.importJSON(EMBED as never).isInline()).toBe(false);
    });
  });

  it("render in the editor", async () => {
    const editor = await mountComposer(DOCUMENT);
    expect(await screen.findByText("@Sam Rivera")).toBeInTheDocument();
    expect(screen.getByText("See POL-0007")).toBeInTheDocument();
    expect(screen.getByTitle("Approved by the board.")).toHaveTextContent("†");
    // Each node's own element carries its type, the way createDOM marks it.
    const keys = editor
      .getEditorState()
      .read(() => [
        ...$nodesOfType(footnote.Node),
        ...$nodesOfType(mention.Node),
        ...$nodesOfType(embed.Node),
      ])
      .map((node) => node.getKey());
    expect(keys.map((key) => editor.getElementByKey(key)?.dataset.stewardNode)).toEqual([
      "footnote",
      "mention",
      "embed",
    ]);
  });

  it("render in the read-only view, on the server", () => {
    const view = renderToString(<LexicalDocumentView document={DOCUMENT} />);
    expect(view).toContain("<sup>†</sup>");
    expect(view).toContain("@<!-- -->Sam Rivera");
    expect(view).toContain("See POL-0007");
  });
});
