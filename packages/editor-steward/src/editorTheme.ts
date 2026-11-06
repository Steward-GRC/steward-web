// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { CSSProperties } from "react";

// Steward's tokens laid onto the editor's theme variables (node-koenig-editor 1.1.0), so the
// editor, its "+" button and its "/" menu follow the site instead of upstream's own sizes.
//
// The reading type is the site's document scale (the same one the read-only view uses), which
// moves with the five text sizes because they change the root size and these are rem values.
// `--kg-rem`, the editor's length unit, stays on its default (0.625rem): the site root is
// 100%, not 62.5%, so that default already gives the menus and the "+" the size upstream drew
// them at on a 16px root, and it too grows with the text size. Heading 5 uses the body size:
// the site has no fifth document heading, and anything smaller would sit below the text.
// Every value is a variable, so light, dark and high contrast follow the site's own blocks.
export const EDITOR_THEME = {
  "--kg-accent-color": "var(--color-primary)",
  "--kg-font-body": "var(--font-serif)",
  "--kg-font-sans": "var(--font-sans)",
  "--kg-font-size": "var(--text-doc)",
  "--kg-font-size-h1": "var(--text-doc-h1)",
  "--kg-font-size-h2": "var(--text-doc-h2)",
  "--kg-font-size-h3": "var(--text-doc-h3)",
  "--kg-font-size-h4": "var(--text-doc-h4)",
  "--kg-font-size-h5": "var(--text-doc)",
  "--kg-line-height": "var(--text-doc--line-height)",
  // Selected and focused cards, active toolbar buttons, drop lines: the purple primary, which
  // is 3:1 or better on the page and the card in every theme (held by a test in steward.test.ts).
  "--kg-selection-color": "var(--color-primary)",
  // The box is also the positioning context remote carets are drawn against.
  position: "relative",
} as CSSProperties & Record<`--kg-${string}`, string>;

interface ClassNames {
  contains: (name: string) => boolean;
}

/** Whether the editor should draw its dark card styles for the theme the page is in. */
export const isDarkTheme = (classes: ClassNames, systemPrefersDark: boolean): boolean =>
  classes.contains("dark") ||
  classes.contains("hc") ||
  (classes.contains("system") && systemPrefersDark);
