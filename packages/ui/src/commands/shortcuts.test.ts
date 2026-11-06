// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { assertUniqueShortcuts, formatShortcut, matchesShortcut, SHORTCUTS } from "./shortcuts";

const key = (init: KeyboardEventInit) => new KeyboardEvent("keydown", init);

describe("the shortcut registry", () => {
  it("holds every key and id once", () => {
    const keys = Object.values(SHORTCUTS).map((s) => s.keys.toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
    expect(() => assertUniqueShortcuts(SHORTCUTS)).not.toThrow();
  });

  it("throws on a duplicate key", () => {
    expect(() =>
      assertUniqueShortcuts({ a: { keys: "A", label: "x" }, b: { keys: "a", label: "y" } }),
    ).toThrow(/duplicate/i);
  });

  it("matches a plain key only without modifiers", () => {
    expect(matchesShortcut(key({ key: "a" }), "A")).toBe(true);
    expect(matchesShortcut(key({ key: "a", shiftKey: true }), "A")).toBe(false);
    expect(matchesShortcut(key({ key: "a", metaKey: true }), "A")).toBe(false);
    expect(matchesShortcut(key({ altKey: true, key: "a" }), "A")).toBe(false);
  });

  it("matches Shift and Mod chords", () => {
    expect(matchesShortcut(key({ key: "R", shiftKey: true }), "Shift+R")).toBe(true);
    expect(matchesShortcut(key({ key: "r" }), "Shift+R")).toBe(false);
    expect(matchesShortcut(key({ ctrlKey: true, key: "k" }), "Mod+K")).toBe(true);
    expect(matchesShortcut(key({ key: "k", metaKey: true }), "Mod+K")).toBe(true);
  });

  it("words a shortcut as a keycap", () => {
    expect(formatShortcut("A")).toBe("A");
    expect(formatShortcut("Shift+R")).toBe("⇧R");
    expect(formatShortcut("Mod+K", true)).toBe("⌘K");
    expect(formatShortcut("Mod+K", false)).toBe("Ctrl+K");
  });
});

describe("a symbol shortcut", () => {
  it("matches ? with or without Shift, and still refuses Ctrl", () => {
    expect(matchesShortcut(new KeyboardEvent("keydown", { key: "?" }), "?")).toBe(true);
    expect(matchesShortcut(new KeyboardEvent("keydown", { key: "?", shiftKey: true }), "?")).toBe(
      true,
    );
    expect(matchesShortcut(new KeyboardEvent("keydown", { ctrlKey: true, key: "?" }), "?")).toBe(
      false,
    );
  });
});
