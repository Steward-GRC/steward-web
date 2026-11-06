// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import type { LexicalEditor } from "lexical";

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { $getRoot, $isTextNode } from "lexical";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { SerializedDocument } from "./document/tree";

import { StewardEditor, type StewardEditorHandle } from "./StewardEditor";

const DOCUMENT: SerializedDocument = {
  root: {
    children: [
      {
        children: [{ text: "Visitors sign in at reception.", type: "text", version: 1 }],
        type: "paragraph",
        version: 1,
      },
    ],
    type: "root",
  },
};

const empty = () => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  toJSON: () => ({}),
  top: 0,
  width: 0,
  x: 0,
  y: 0,
});

// jsdom has no layout: a selection's range has no rectangles and there's no element at a point,
// which Koenig's own format toolbar measures.
beforeAll(() => {
  Range.prototype.getBoundingClientRect ??= empty as () => DOMRect;
  Range.prototype.getClientRects ??= (() => []) as unknown as () => DOMRectList;
  document.elementFromPoint ??= () => null;
});

const mount = async (props: Partial<Parameters<typeof StewardEditor>[0]> = {}) => {
  let handle: StewardEditorHandle | undefined;
  render(
    <StewardEditor
      initialDocument={DOCUMENT}
      onReady={(ready) => {
        handle = ready;
      }}
      {...props}
    />,
  );
  await waitFor(() => expect(handle).toBeDefined());
  expect(await screen.findByText("Visitors sign in at reception.")).toBeInTheDocument();
  return handle!;
};

/** The Lexical editor behind the text box, to place a selection the way a pointer would. */
const lexicalEditor = (): LexicalEditor => {
  const box = screen.getAllByRole("textbox")[0] as {
    __lexicalEditor?: LexicalEditor;
  } & HTMLElement;
  if (!box.__lexicalEditor) throw new Error("expected a Lexical editor on the text box");
  return box.__lexicalEditor;
};

const select = async (from: number, to: number) => {
  await act(async () => {
    lexicalEditor().update(() => {
      const text = $getRoot().getAllTextNodes()[0];
      if ($isTextNode(text)) text.select(from, to);
    });
    await Promise.resolve();
  });
};

const AI_BUTTON = '[data-kg-toolbar-button="ai"]';
// The package puts the id on the list item that holds the button.
const aiButton = async () =>
  waitFor(() => {
    const button = document.querySelector<HTMLElement>(`${AI_BUTTON} button`);
    expect(button).not.toBeNull();
    return button!;
  });

const documentText = (handle: StewardEditorHandle): string =>
  JSON.stringify(handle.getDocument()).match(/"text":"([^"]*)"/)?.[1] ?? "";

describe("The AI action on the selection toolbar", () => {
  it("offers Rewrite and Clarify for the selected text", async () => {
    const onRework = vi.fn();
    await mount({ onRework });
    expect(document.querySelector(AI_BUTTON)).toBeNull();

    await select(0, 8);
    const button = await aiButton();
    expect(button).toHaveAccessibleName("Rework selected text with AI");
    await userEvent.click(await aiButton());
    expect(screen.getByRole("menuitem", { name: "Rewrite" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: "Clarify" }));

    expect(onRework).toHaveBeenCalledWith({ choice: "clarify", text: "Visitors" });
  });

  it("puts the host's text in place of the selection it was asked about", async () => {
    const onRework = vi.fn();
    const handle = await mount({ onRework });

    await select(0, 8);
    await userEvent.click(await aiButton());
    await userEvent.click(screen.getByRole("menuitem", { name: "Rewrite" }));

    let replaced = false;
    act(() => {
      replaced = handle.replaceSelection("Guests");
    });
    expect(replaced).toBe(true);
    await waitFor(() => expect(documentText(handle)).toBe("Guests sign in at reception."));
  });

  it("refuses a replacement when nothing was asked about", async () => {
    const handle = await mount({ onRework: vi.fn() });
    let replaced = true;
    act(() => {
      replaced = handle.replaceSelection("Guests");
    });
    expect(replaced).toBe(false);
    expect(documentText(handle)).toBe("Visitors sign in at reception.");
  });

  it("sits on the same toolbar as the format buttons", async () => {
    await mount({ onRework: vi.fn() });
    await select(0, 8);
    const button = await aiButton();
    expect(button.closest("ul")?.querySelector('[data-kg-toolbar-button="bold"]')).not.toBeNull();
  });

  it("offers nothing for an empty selection", async () => {
    await mount({ onRework: vi.fn() });
    await select(3, 3);
    expect(document.querySelector(AI_BUTTON)).toBeNull();
  });

  it("offers nothing when the host doesn't ask for it", async () => {
    await mount();
    await select(0, 8);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.querySelector(AI_BUTTON)).toBeNull();
  });

  it("offers nothing on a read-only document", async () => {
    await mount({ onRework: vi.fn(), readOnly: true });
    await select(0, 8);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.querySelector(AI_BUTTON)).toBeNull();
  });
});
