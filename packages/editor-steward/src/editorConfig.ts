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
  KoenigColorSwatch,
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

/**
 * The callout's fixed set (bug log 193): one soft status colour each, as Steward's own tokens with
 * the ink that goes with them, so a callout follows light, dark and high contrast and is chosen
 * as a pair from one control.
 */
export const CALLOUT_COLORS: readonly KoenigColorSwatch[] = [
  { ink: "var(--color-ink)", label: "Info", value: "var(--color-info-soft)" },
  { ink: "var(--color-ink)", label: "Success", value: "var(--color-ok-soft)" },
  { ink: "var(--color-ink)", label: "Warning", value: "var(--color-warn-soft)" },
  { ink: "var(--color-ink)", label: "Danger", value: "var(--color-danger-soft)" },
  { ink: "var(--color-ink)", label: "Neutral", value: "var(--color-neutral-soft)" },
];

/** The same five as plain colours, for a table's banding. */
const TABLE_BAND_COLORS: readonly KoenigColorSwatch[] = [
  { label: "Info", value: "#e5eaf6" },
  { label: "Success", value: "#e4efe2" },
  { label: "Warning", value: "#faeed3" },
  { label: "Danger", value: "#f8e3e0" },
  { label: "Neutral", value: "#ede7e8" },
];

/** The same five, stronger, for a table's header and the like. */
const STRONG_COLORS: readonly KoenigColorSwatch[] = [
  { label: "Info", value: "#2d4c99" },
  { label: "Success", value: "#2c6a34" },
  { label: "Warning", value: "#875400" },
  { label: "Danger", value: "#a3342c" },
  { label: "Neutral", value: "#5f5560" },
];

const INK_COLORS: readonly KoenigColorSwatch[] = [{ label: "Text", value: "#261b25" }];
const PRIMARY_COLORS: readonly KoenigColorSwatch[] = [{ label: "Steward", value: "#5d2a5b" }];

/** A fixed list: no colour wheel, and no "no colour" choice. */
const fixed = (palette: readonly KoenigColorSwatch[]): KoenigColorSetting => ({
  none: false,
  palette: [...palette],
  picker: false,
});

/**
 * Every colour control in Steward offers a short fixed list and never a colour wheel (bug log
 * 193). Typed over every slot, so a slot the package adds fails to compile until it is given one.
 */
export const BASE_COLORS: Record<KoenigColorSlot, KoenigColorSetting> = {
  buttonBackground: fixed(PRIMARY_COLORS),
  buttonText: fixed([{ label: "White", value: "#ffffff" }]),
  calloutBackground: fixed(CALLOUT_COLORS),
  calloutText: fixed(INK_COLORS),
  headerBackground: fixed(PRIMARY_COLORS),
  headerButton: fixed(PRIMARY_COLORS),
  headerButtonText: fixed([{ label: "White", value: "#ffffff" }]),
  headerText: fixed([{ label: "White", value: "#ffffff" }]),
  highlight: fixed([{ label: "Yellow", value: HIGHLIGHT_YELLOW }]),
  tableBand: fixed(TABLE_BAND_COLORS),
  tableBorder: { ...fixed(STRONG_COLORS), none: true },
  tableCell: { ...fixed(TABLE_BAND_COLORS), none: true },
  tableBrand: fixed(STRONG_COLORS),
  textColor: fixed(INK_COLORS),
};

/**
 * The button card (bug log 183): its look is Steward's, so no colour or emoji controls, and the
 * label and the link are required.
 */
export const BUTTON_CARD = { colors: false, emoji: false, required: true } as const;

/** Cards left off the "+" and slash menus; a stored one still opens (bug log 169). */
export const MENU_HIDDEN = ["code"] as const;

/** Plain text written in Markdown becomes headings and lists on paste (bug log 176). */
export const PASTE_MARKDOWN = true;

/**
 * An editor's own toolbar: the base, reduced to what it asks for. Nothing outside the base is
 * ever shown, and the base's order is kept. Asking for nothing in particular gives the base.
 */
export const reduceToolbar = (requested?: readonly StewardToolbarItem[]): StewardToolbarItem[] =>
  requested === undefined
    ? [...BASE_TOOLBAR]
    : BASE_TOOLBAR.filter((item) => requested.includes(item));

/**
 * The file card's type icons are always shown in Steward, with no way to switch them off (bug log
 * 187). The package leaves them on when nothing is set; this says so on purpose, so a later change
 * to the package's default can't turn them off here.
 */
export const FILE_ICONS = {} as const;

/**
 * What the file card accepts: the attachments people would normally send by email (bug log 187).
 * Never web or program files (HTML, SVG, XML, scripts, executables), archives, or Office files with
 * macros. This is the picker's and the drop's filter; the server checks the bytes itself
 * (steward-core#36). The list follows the proposed default there, and the admin setting that will
 * switch kinds off is steward-web#246.
 */
export const FILE_UPLOAD_RULE = {
  extensions: [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "csv",
    "ppt",
    "pptx",
    "odt",
    "ods",
    "odp",
    "rtf",
    "txt",
    "md",
    "mp4",
    "m4v",
    "mov",
    "webm",
  ],
  maxSize: 10 * 1024 * 1024,
  mimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.presentation",
    "application/rtf",
    "text/plain",
    "text/markdown",
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ],
} as const;
