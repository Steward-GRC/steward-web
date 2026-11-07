// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// What Steward switches on in the Koenig editor. The package is a base a product reduces to its
// own set, so this is Steward's: one BASE that every Steward editor starts from, and a way for a
// single editor to reduce it further (never to add to it).
//
// Bug log 167 to 169 and 173: no integrated preview; the base toolbar is Bold, Italic, Underline,
// Subscript, Superscript, Highlight in one fixed yellow, Clear formatting, headings 1 to 5, bullet
// and numbered lists, Align left, centre and right (179) and Link (the AI button is Steward's own toolbar action); the slash menu
// drops Code, Gallery, Header, Emoji, Audio and Markdown.
import type {
  KoenigCardName,
  KoenigColorSetting,
  KoenigColorSlot,
  KoenigTool,
  KoenigToolbarItem,
} from "node-koenig-editor";

/** The format buttons every Steward editor starts with, in the order the toolbar shows them. */
export const BASE_TOOLBAR = [
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
] as const satisfies readonly KoenigToolbarItem[];

export type StewardToolbarItem = (typeof BASE_TOOLBAR)[number];

/**
 * The shipped cards Steward registers. Gallery, Header, Audio and Markdown are left out, which
 * takes them out of the "+" and slash menus. (The Code entry and the table are not in the
 * package's card list; see StewardEditor for how Code is kept out of the menus.)
 */
export const BASE_CARDS = [
  "button",
  "callout",
  "divider",
  "file",
  "image",
  "table",
  "toggle",
  "toggleGroup",
  "video",
] as const satisfies readonly KoenigCardName[];

/**
 * The editor's tools that are not cards. The integrated preview is off, and so is the emoji
 * picker. Clean paste stays: it is paste handling, not a control.
 */
export const BASE_TOOLS = [
  "cleanPaste",
  "findReplace",
  "imageEditor",
  "shortcuts",
] as const satisfies readonly KoenigTool[];

/**
 * The light yellow Steward's highlight uses: one swatch, no picker, no "no colour" choice. Its dark
 * text rule is in packages/ui steward.css and must carry the same value.
 */
export const HIGHLIGHT_YELLOW = "#fff59d";

export const BASE_COLORS: Partial<Record<KoenigColorSlot, KoenigColorSetting>> = {
  highlight: {
    none: false,
    palette: [{ label: "Yellow", value: HIGHLIGHT_YELLOW }],
    picker: false,
  },
};

/**
 * An editor's own toolbar: the base, reduced to what it asks for. Nothing outside the base is
 * ever shown, and the base's order is kept. Asking for nothing in particular gives the base.
 */
export const reduceToolbar = (requested?: readonly StewardToolbarItem[]): StewardToolbarItem[] =>
  requested === undefined
    ? [...BASE_TOOLBAR]
    : BASE_TOOLBAR.filter((item) => requested.includes(item));
