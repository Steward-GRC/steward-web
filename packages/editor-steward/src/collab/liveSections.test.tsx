// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// bug log 173: the required-sections list changes as collaborators edit, not only as this window
// does. The draft screen checks the document its editor reports, so what has to hold is that an
// edit made in one window is reported, with its text, by the other window's editor.
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import { act, render, waitFor } from "@testing-library/react";
import {
  $getRoot,
  $isElementNode,
  CONTROLLED_TEXT_INSERTION_COMMAND,
  type LexicalEditor,
} from "lexical";
import { afterEach, describe, expect, it } from "vitest";
import { Awareness } from "y-protocols/awareness";
import { applyUpdate, Doc, encodeStateAsUpdate } from "yjs";

import type { SerializedDocument } from "../document/tree";

import {
  missingRequiredSections,
  scaffoldFromTemplate,
  type TemplateSectionOutline,
} from "../document";
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

const joinPeer = async (container: HTMLElement, document: Doc): Promise<Peer> => {
  const others = [...joined];
  // what a relay does: every update reaches the peers that are in the room
  document.on("update", (update: Uint8Array, origin: unknown) => {
    if (origin === "remote") return;
    for (const other of joined) if (other !== document) applyUpdate(other, update, "remote");
  });
  const collaboration = createStewardCollaboration(document, new Awareness(document));
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
    for (const other of others) applyUpdate(document, encodeStateAsUpdate(other), "remote");
    collaboration.attach(synced);
  });
  joined.push(document);
  await waitFor(() => expect(container.querySelector("[data-lexical-editor]")).not.toBeNull());
  return {
    doc: document,
    editor: () =>
      (
        container.querySelector("[data-lexical-editor]") as unknown as {
          __lexicalEditor: LexicalEditor;
        }
      ).__lexicalEditor,
    seen,
  };
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("required sections while collaborators edit", () => {
  it("reports a section a collaborator filled in, and one they emptied again", async () => {
    const documentA = new Doc();
    const documentB = new Doc();
    const boxA = document.createElement("div");
    document.body.append(boxA);
    const boxB = document.createElement("div");
    document.body.append(boxB);
    joined.length = 0;
    const a = await joinPeer(boxA, documentA);
    const b = await joinPeer(boxB, documentB);
    // both windows start with every required section empty
    await waitFor(() =>
      expect(
        missingRequiredSections(
          b.editor().getEditorState().toJSON() as SerializedDocument,
          outline,
        ),
      ).toEqual(["Purpose", "Scope"]),
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
    await waitFor(() =>
      expect(missingRequiredSections(b.seen.at(-1), outline)).toEqual(["Purpose", "Scope"]),
    );
  });
});
