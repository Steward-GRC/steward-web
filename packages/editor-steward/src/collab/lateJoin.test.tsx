// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// bug log 171: a second window opens the draft while the first is editing it. The draft screen
// mounts the editor only once the room has answered, so by then the shared document already holds
// the first window's content and the room has reported synced. The second window has to show it.
//
// Lexical draws the shared document only as it changes, so the editor has to be bound to the room
// before the content arrives. The draft screen therefore mounts it while the room is connecting.
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import { act, render, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
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

/** Window A starts the room alone and fills it from the draft; returns its document. */
const startRoom = async (): Promise<Doc> => {
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
  return documentA;
};

const mountB = (collaboration: ReturnType<typeof createStewardCollaboration>) => {
  const boxB = document.createElement("div");
  document.body.append(boxB);
  let handle: StewardEditorHandle | undefined;
  render(
    <StewardEditor
      collaboration={collaboration}
      initialDocument={scaffoldFromTemplate(outline)}
      onReady={(ready) => {
        handle = ready;
      }}
    />,
    { container: boxB },
  );
  return () => handle;
};

describe("a window that joins a room that already has content", () => {
  it("shows the first window's document when its editor is bound before the content arrives", async () => {
    const documentA = await startRoom();
    const documentB = new Doc();
    const collabB = createStewardCollaboration(documentB, new Awareness(documentB));
    const handleB = mountB(collabB);
    await waitFor(() => expect(handleB()).toBeDefined());
    // the room answers: its content reaches the document, then the room reports synced
    await act(async () => {
      applyUpdate(documentB, encodeStateAsUpdate(documentA), "remote");
      collabB.attach(synced);
    });
    await waitFor(() => expect(JSON.stringify(handleB()!.getDocument())).toContain("Purpose"));
    expect(JSON.stringify(handleB()!.getDocument())).toContain("Scope");
  });

  // KNOWN LIMITATION: an editor mounted after the content is already in the document and the room
  // is synced is never drawn. The draft screen does not mount it that way. Remove `.fails` if
  // Lexical ever draws an already-populated document.
  it.fails("does not draw a document that was already populated when the editor mounted", async () => {
    const documentA = await startRoom();
    const documentB = new Doc();
    applyUpdate(documentB, encodeStateAsUpdate(documentA), "remote");
    const collabB = createStewardCollaboration(documentB, new Awareness(documentB));
    collabB.attach(synced);
    const handleB = mountB(collabB);
    await waitFor(() => expect(handleB()).toBeDefined());
    await waitFor(() => expect(JSON.stringify(handleB()!.getDocument())).toContain("Purpose"));
  });
});

// bug log 201: opening a draft showed its first heading repeated hundreds of times. A window that
// opens a stored room, again and again, in React's development double mount, has to end with one
// copy of the document every time.
describe("a stored room that is opened again and again", () => {
  it("never multiplies the document", async () => {
    const documentA = await startRoom();
    let state = encodeStateAsUpdate(documentA);
    const counts: number[] = [];
    for (let open = 0; open < 4; open++) {
      const documentB = new Doc();
      const collabB = createStewardCollaboration(documentB, new Awareness(documentB));
      const box = document.createElement("div");
      document.body.append(box);
      let handle: StewardEditorHandle | undefined;
      render(
        <StrictMode>
          <StewardEditor
            collaboration={collabB}
            initialDocument={scaffoldFromTemplate(outline)}
            onReady={(ready) => {
              handle = ready;
            }}
          />
        </StrictMode>,
        { container: box },
      );
      await waitFor(() => expect(handle).toBeDefined());
      await act(async () => {
        applyUpdate(documentB, state, "remote");
        collabB.attach(synced);
      });
      await waitFor(() => expect(JSON.stringify(handle!.getDocument())).toContain("Purpose"));
      counts.push(JSON.stringify(handle!.getDocument()).split("Purpose").length - 1);
      state = encodeStateAsUpdate(documentB);
      box.remove();
    }
    expect(counts).toEqual([1, 1, 1, 1]);
  });
});
