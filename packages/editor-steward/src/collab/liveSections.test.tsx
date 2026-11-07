// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// bug log 173: the required-sections list changes as collaborators edit, not only as this window
// does. The draft screen checks the document its editor reports, so what has to hold is that an
// edit made in one window is reported, with its text, by the other window's editor.
import { act, render, waitFor } from "@testing-library/react";
import { $getRoot, $isElementNode, CONTROLLED_TEXT_INSERTION_COMMAND, type LexicalEditor } from "lexical";
import { afterEach, describe, expect, it } from "vitest";
import { Awareness } from "y-protocols/awareness";
import { applyUpdate, Doc, encodeStateAsUpdate } from "yjs";

import { missingRequiredSections, scaffoldFromTemplate, type TemplateSectionOutline } from "../document";
import type { SerializedDocument } from "../document/tree";
import { StewardEditor } from "../StewardEditor";
import { createStewardCollaboration } from "./stewardCollaboration";

const outline: TemplateSectionOutline[] = [
  { key: "purpose", level: 2, order: 1, required: true, title: "Purpose" },
  { key: "scope", level: 2, order: 2, required: true, title: "Scope" },
];

const synced = { off: () => {}, on: () => {}, synced: true };

interface Peer {
  doc: Doc;
  editor: () => LexicalEditor;
  seen: SerializedDocument[];
}

// the peers that have joined the room so far
const joined: Doc[] = [];

const joinPeer = async (container: HTMLElement, doc: Doc): Promise<Peer> => {
  const others = [...joined];
  // what a relay does: every update reaches the peers that are in the room
  doc.on("update", (update: Uint8Array, origin: unknown) => {
    if (origin === "remote") return;
    for (const other of joined) if (other !== doc) applyUpdate(other, update, "remote");
  });
  const collaboration = createStewardCollaboration(doc, new Awareness(doc));
  const seen: SerializedDocument[] = [];
  render(
    <StewardEditor
      collaboration={collaboration}
      initialDocument={scaffoldFromTemplate(outline)}
      onChange={(next) => seen.push(next)}
    />,
    { container },
  );
  // the room's state arrives after the editor is bound, then the session reports synced
  await act(async () => {
    for (const other of others) applyUpdate(doc, encodeStateAsUpdate(other), "remote");
    collaboration.attach(synced);
  });
  joined.push(doc);
  await waitFor(() => expect(container.querySelector("[data-lexical-editor]")).not.toBeNull());
  return {
    doc,
    editor: () =>
      (container.querySelector("[data-lexical-editor]") as unknown as { __lexicalEditor: LexicalEditor })
        .__lexicalEditor,
    seen,
  };
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("required sections while collaborators edit", () => {
  it("reports a section a collaborator filled in, and one they emptied again", async () => {
    const docA = new Doc();
    const docB = new Doc();
    const boxA = document.body.appendChild(document.createElement("div"));
    const boxB = document.body.appendChild(document.createElement("div"));
    joined.length = 0;
    const a = await joinPeer(boxA, docA);
    const b = await joinPeer(boxB, docB);
    // both windows start with every required section empty
    await waitFor(() =>
      expect(missingRequiredSections(b.editor().getEditorState().toJSON() as SerializedDocument, outline)).toEqual([
        "Purpose",
        "Scope",
      ]),
    );
    const before = b.seen.length;

    await act(async () => {
      a.editor().update(() => {
        const body = $getRoot().getChildren()[0]!.getNextSibling();
        if ($isElementNode(body)) body.selectStart();
      });
    });
    await act(async () => {
      a.editor().dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, "Typed by a collaborator.");
    });

    // window B reports the change, with the text in it
    await waitFor(() => expect(b.seen.length).toBeGreaterThan(before));
    expect(missingRequiredSections(b.seen.at(-1), outline)).toEqual(["Scope"]);

    await act(async () => {
      a.editor().update(() => {
        const body = $getRoot().getChildren()[0]!.getNextSibling();
        if ($isElementNode(body)) body.clear();
      });
    });
    await waitFor(() => expect(missingRequiredSections(b.seen.at(-1), outline)).toEqual(["Purpose", "Scope"]));
  });
});
