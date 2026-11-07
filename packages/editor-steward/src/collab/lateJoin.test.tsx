// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// bug log 171: a second window opens the draft while the first is editing it. The draft screen
// mounts the editor only once the room has answered, so by then the shared document already holds
// the first window's content and the room has reported synced. The second window has to show it.
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import { act, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Awareness } from "y-protocols/awareness";
import { applyUpdate, Doc, encodeStateAsUpdate } from "yjs";

import { scaffoldFromTemplate, type TemplateSectionOutline } from "../document";
import { StewardEditor, type StewardEditorHandle } from "../StewardEditor";
import { createStewardCollaboration } from "./stewardCollaboration";

const outline: TemplateSectionOutline[] = [
  { key: "purpose", level: 2, order: 1, required: true, title: "Purpose" },
  { key: "scope", level: 2, order: 2, required: true, title: "Scope" },
];

const synced = { off: () => {}, on: () => {}, synced: true };

afterEach(() => {
  document.body.innerHTML = "";
});

describe("a window that joins a room that already has content", () => {
  // KNOWN FAILURE (bug log 171). Lexical's collaboration binding draws the shared document only
  // through change observers, so a document that is already populated when the editor mounts is
  // never drawn: the second window stays empty. Remove `.fails` when that is fixed.
  it.fails("shows the first window's document", async () => {
    // window A starts the room alone and fills it from the draft
    const documentA = new Doc();
    const collabA = createStewardCollaboration(documentA, new Awareness(documentA));
    const boxA = document.createElement("div");
    document.body.append(boxA);
    let handleA: StewardEditorHandle | undefined;
    render(
      <StewardEditor
        collaboration={collabA}
        initialDocument={scaffoldFromTemplate(outline)}
        onReady={(handle) => {
          handleA = handle;
        }}
      />,
      { container: boxA },
    );
    await act(async () => {
      collabA.attach(synced);
    });
    await waitFor(() => expect(handleA).toBeDefined());
    await waitFor(() => expect(JSON.stringify(handleA!.getDocument())).toContain("Purpose"));

    // window B: the room's content is in its document and the room is synced before it mounts
    const documentB = new Doc();
    applyUpdate(documentB, encodeStateAsUpdate(documentA), "remote");
    const collabB = createStewardCollaboration(documentB, new Awareness(documentB));
    collabB.attach(synced);
    const boxB = document.createElement("div");
    document.body.append(boxB);
    let handleB: StewardEditorHandle | undefined;
    render(
      <StewardEditor
        collaboration={collabB}
        initialDocument={scaffoldFromTemplate(outline)}
        onReady={(handle) => {
          handleB = handle;
        }}
      />,
      { container: boxB },
    );
    await waitFor(() => expect(handleB).toBeDefined());
    await waitFor(() => expect(JSON.stringify(handleB!.getDocument())).toContain("Purpose"));
    expect(JSON.stringify(handleB!.getDocument())).toContain("Scope");
  });
});
