// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The palette's "Recent" list: what this person opened from it lately, kept in this browser
// only (a per-viewer convenience). Storage can be missing or refuse; then there's no list.
import type { PaletteItem } from "@steward-web/ui";

const KEY = "steward.palette.recent";
const LIMIT = 5;

export const readRecent = (): PaletteItem[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? (parsed as PaletteItem[]).slice(0, LIMIT) : [];
  } catch {
    return [];
  }
};

export const rememberRecent = (item: PaletteItem): void => {
  try {
    const kept = readRecent().filter((r) => r.to !== item.to);
    const entry: PaletteItem = { hint: item.hint, id: item.id, label: item.label, to: item.to };
    localStorage.setItem(KEY, JSON.stringify([entry, ...kept].slice(0, LIMIT)));
  } catch {
    // No storage: the palette simply has no Recent list.
  }
};
