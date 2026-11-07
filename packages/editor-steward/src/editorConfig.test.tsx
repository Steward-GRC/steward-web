// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import type { LexicalEditor } from "lexical";

import { act, render, screen, waitFor } from "@testing-library/react";
import { $getRoot, $isTextNode, CONTROLLED_TEXT_INSERTION_COMMAND } from "lexical";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { SerializedDocument } from "./document/tree";

import { BASE_COLORS, BASE_TOOLBAR, HIGHLIGHT_YELLOW, reduceToolbar } from "./editorConfig";
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

// jsdom has no layout: the format toolbar measures a range and the point under it.
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

// the toolbar names its heading buttons h1 to h5; the option calls them heading1 to heading5
const buttonName = (item: string) => item.replace(/^heading(\d)$/, "h$1");

/** The list a toolbar button sits in, so two buttons can be compared for sharing a row. */
const rowOf = (name: string) =>
  document.querySelector(`[data-kg-toolbar-button="${CSS.escape(name)}"]`)?.parentElement;

/** The toolbar's buttons once a word is selected, by the package's own names, in order. */
const toolbarButtons = async (): Promise<string[]> => {
  await select(0, 8);
  await waitFor(() => expect(document.querySelector("[data-kg-toolbar-button]")).not.toBeNull());
  return [...document.querySelectorAll("[data-kg-toolbar-button]")].map(
    (item) => (item as HTMLElement).dataset.kgToolbarButton ?? "",
  );
};

/** The labels the slash menu lists after "/" is typed at the end of the document. */
const slashMenuLabels = async (): Promise<string[]> => {
  const editor = lexicalEditor();
  await act(async () => {
    editor.getRootElement()?.focus();
    editor.update(() => {
      $getRoot().selectEnd();
    });
  });
  await act(async () => {
    globalThis.dispatchEvent(new KeyboardEvent("keypress", { key: "/" }));
  });
  await act(async () => {
    editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, "/");
  });
  await waitFor(() =>
    expect(document.querySelectorAll("[data-kg-card-menu-item]").length).toBeGreaterThan(0),
  );
  return [...document.querySelectorAll("[data-kg-card-menu-item]")].map(
    (item) => (item as HTMLElement).dataset.kgCardMenuItem ?? "",
  );
};

describe("Steward's base editor set", () => {
  it("lists exactly the base format buttons", () => {
    expect([...BASE_TOOLBAR]).toEqual([
      "bold",
      "italic",
      "underline",
      "subscript",
      "superscript",
      "highlight",
      "clearFormatting",
      "heading1",
      "heading2",
      "heading3",
      "heading4",
      "heading5",
      "bulletList",
      "numberList",
      "alignLeft",
      "alignCenter",
      "alignRight",
      "link",
    ]);
  });

  it("fixes the highlight to one yellow, with no picker and no other choice", () => {
    expect(BASE_COLORS.highlight).toEqual({
      none: false,
      palette: [{ label: "Yellow", value: HIGHLIGHT_YELLOW }],
      picker: false,
    });
  });

  it("is what an editor gets when it asks for nothing in particular", () => {
    expect(reduceToolbar()).toEqual([...BASE_TOOLBAR]);
  });

  it("lets one editor reduce the base, keeping the base's order", () => {
    expect(reduceToolbar(["link", "bold", "heading2"])).toEqual(["bold", "heading2", "link"]);
    expect(reduceToolbar([])).toEqual([]);
  });

  it("never lets an editor add a button the base does not have", () => {
    expect(reduceToolbar(["bold", "strikethrough" as never])).toEqual(["bold"]);
  });
});

// Package gap (to be filed on node-koenig-editor): the Code entry comes from the code plugin, not
// from the `cards` list, so Steward cannot take it out of the slash menu while keeping code
// blocks it already stores. This test says what is wanted and is expected to fail until the
// package has an option for it.
const slashMenuWithoutCode = async () => {
  await mount({
    initialDocument: {
      root: {
        ...DOCUMENT.root,
        children: [...DOCUMENT.root.children, { children: [], type: "paragraph", version: 1 }],
      },
    },
  });
  const labels = await slashMenuLabels();
  return labels.map((label) => label.toLowerCase());
};

describe("what the editor shows in Steward", () => {
  it("shows only the base format buttons, and the AI button beside them", async () => {
    await mount({ onRework: vi.fn() });
    const names = await toolbarButtons();
    expect(names.filter((name) => name !== "ai").toSorted()).toEqual(
      BASE_TOOLBAR.map((item) => buttonName(item)).toSorted(),
    );
    expect(names).toContain("ai");
  });

  it("puts the headings in the same toolbar row as bold (bug log 181)", async () => {
    await mount();
    await toolbarButtons();
    expect(rowOf("h1")).not.toBeNull();
    expect(rowOf("h5")).toBe(rowOf("bold"));
  });

  it("shows only what an editor reduced the base to", async () => {
    await mount({ toolbar: ["bold", "link"] });
    const buttons = await toolbarButtons();
    expect(buttons.toSorted()).toEqual(["bold", "link"]);
  });

  it("has no integrated preview and no emoji picker", async () => {
    await mount();
    expect(document.querySelector("[data-kg-preview-toggle], [data-kg-preview-bar]")).toBeNull();
    expect(screen.queryByRole("button", { name: /preview/i })).toBeNull();
  });

  it("drops Code, Gallery, Header, Emoji, Audio and Markdown from the slash menu, and keeps the rest", async () => {
    // the menu opens on an empty line, so the document ends with one
    await mount({
      initialDocument: {
        root: {
          ...DOCUMENT.root,
          children: [...DOCUMENT.root.children, { children: [], type: "paragraph", version: 1 }],
        },
      },
    });
    const shown = await slashMenuLabels();
    const labels = shown.map((label) => label.toLowerCase());
    for (const dropped of ["gallery", "header", "emoji", "audio", "markdown"]) {
      expect(labels, `${dropped} should not be offered`).not.toContain(dropped);
    }
    for (const kept of ["image", "divider", "callout", "toggle", "button"]) {
      expect(labels, `${kept} should still be offered`).toContain(kept);
    }
  });
});

describe("the Code slash entry (package gap)", () => {
  it.fails("is not offered", async () => {
    expect(await slashMenuWithoutCode()).not.toContain("code");
  });
});
