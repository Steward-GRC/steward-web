import type { LexicalEditor } from "lexical";

// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import { render, screen, waitFor } from "@testing-library/react";
import { DEFAULT_NODES } from "node-koenig-editor";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Awareness } from "y-protocols/awareness";
import { Doc } from "yjs";

import { createStewardCollaboration, type ProviderEventSource } from "./collab/stewardCollaboration";
import { StewardEditor } from "./StewardEditor";

afterEach(() => vi.restoreAllMocks());
// jsdom has no hit testing; the editor's drag handle asks for it on pointer moves.
document.elementFromPoint = () => null;

const synced = (): ProviderEventSource => ({ off: () => {}, on: () => {}, synced: true });

const mountEditor = (collab: boolean) => {
  const errors: Error[] = [];
  vi.spyOn(console, "error").mockImplementation((...arguments_) => {
    const text = arguments_.map(String).join(" ");
    if (!text.includes("not wrapped in act")) errors.push(new Error(text));
  });
  let collaboration = null;
  if (collab) {
    const document = new Doc();
    collaboration = createStewardCollaboration(document, new Awareness(document));
    collaboration.attach(synced());
  }
  render(<StewardEditor collaboration={collaboration} />);
  return errors;
};

type Menu = { insertCommand: Parameters<LexicalEditor["dispatchCommand"]>[0]; insertParams?: unknown };

/** The command the slash menu dispatches for a card: the node class's own `kgMenu`. */
const menuFor = (type: string): Menu => {
  const node = DEFAULT_NODES.find((n) => (n as { getType?: () => string }).getType?.() === type);
  const menu = (node as unknown as { kgMenu?: Menu | Menu[] }).kgMenu;
  return (Array.isArray(menu) ? menu[0] : menu)!;
};

describe.each([false, true])("inserting cards from the slash menu (collaboration %s)", (collab) => {
  it.each(["toggle", "callout"])("inserts %s without an error", async (type) => {
    const errors = mountEditor(collab);
    const boxes = await screen.findAllByRole("textbox");
    const box = boxes[0]!;
    const editor = (box as unknown as { __lexicalEditor: LexicalEditor }).__lexicalEditor;
    const menu = menuFor(type);
    editor.focus();
    editor.dispatchCommand(menu.insertCommand, menu.insertParams as never);
    await waitFor(() => expect(editor.getEditorState().toJSON()).toMatchObject({}));
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(JSON.stringify(editor.getEditorState().toJSON())).toContain(`"type":"${type}"`);
    expect(document.querySelector("[data-kg-card-error]")).toBeNull();
    expect(errors.map((error) => error.message)).toEqual([]);
  });
});
