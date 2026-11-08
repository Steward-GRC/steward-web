// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A heading can't be highlighted, only regular text (bug log 191). The toolbar's highlight button
// writes a background colour (and the ink that reads on it) onto whatever text is selected, so a
// selection across a heading and the text under it marks both. This takes the highlight back off
// heading text, which leaves the regular text in that selection marked.
import { $isHeadingNode } from "@lexical/rich-text";
import { type LexicalEditor, TextNode } from "lexical";

const nameOf = (declaration: string): string | undefined =>
  declaration.split(":", 1)[0]?.trim().toLowerCase();

/** The style with its highlight (the background colour and the ink written with it) removed. */
export const withoutHighlight = (style: string): string => {
  const declarations = style
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean);
  if (!declarations.some((declaration) => nameOf(declaration) === "background-color")) return style;
  return declarations
    .filter(
      (declaration) =>
        nameOf(declaration) !== "background-color" && nameOf(declaration) !== "color",
    )
    .map((declaration) => `${declaration};`)
    .join(" ");
};

/** Keeps heading text free of highlight. Returns the function that stops doing so. */
export const registerHeadingHighlightGuard = (editor: LexicalEditor): (() => void) =>
  editor.registerNodeTransform(TextNode, (node) => {
    if (!$isHeadingNode(node.getParent())) return;
    const style = node.getStyle();
    const cleaned = withoutHighlight(style);
    if (cleaned !== style) node.setStyle(cleaned);
  });
