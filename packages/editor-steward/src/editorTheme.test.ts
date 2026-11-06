// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { EDITOR_THEME, isDarkTheme } from "./editorTheme";

describe("the editor theme", () => {
  it("sets the reading type from the site's document scale, not fixed sizes", () => {
    expect(EDITOR_THEME).toMatchObject({
      "--kg-font-size": "var(--text-doc)",
      "--kg-font-size-h1": "var(--text-doc-h1)",
      "--kg-font-size-h2": "var(--text-doc-h2)",
      "--kg-font-size-h3": "var(--text-doc-h3)",
      "--kg-font-size-h4": "var(--text-doc-h4)",
      "--kg-font-body": "var(--font-serif)",
      "--kg-line-height": "var(--text-doc--line-height)",
    });
  });

  it("takes the accent and the selection colour from the purple primary token", () => {
    expect(EDITOR_THEME["--kg-accent-color"]).toBe("var(--color-primary)");
    expect(EDITOR_THEME["--kg-selection-color"]).toBe("var(--color-primary)");
  });

  it("leaves the length unit on the package default: the site root is 100%, not 62.5%", () => {
    expect(EDITOR_THEME).not.toHaveProperty("--kg-rem");
  });

  it("holds no literal colour or pixel size", () => {
    for (const [name, value] of Object.entries(EDITOR_THEME)) {
      if (name === "position") continue;
      expect(String(value), name).toMatch(/^var\(--/);
    }
  });

  it("keeps Heading 5 at the body size, as the site has no fifth document heading", () => {
    expect(EDITOR_THEME["--kg-font-size-h5"]).toBe(EDITOR_THEME["--kg-font-size"]);
  });
});

const classes = (...names: string[]) => ({ contains: (name: string) => names.includes(name) });

describe("isDarkTheme", () => {
  it("is dark for the dark and high contrast themes", () => {
    expect(isDarkTheme(classes("dark"), false)).toBe(true);
    expect(isDarkTheme(classes("hc"), false)).toBe(true);
  });
  it("follows the system only when the theme is System", () => {
    expect(isDarkTheme(classes("system"), true)).toBe(true);
    expect(isDarkTheme(classes("system"), false)).toBe(false);
    expect(isDarkTheme(classes("light"), true)).toBe(false);
  });
});
