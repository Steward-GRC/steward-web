// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The one shortcut registry (as Brigade's command bar keeps it): every key and every id appears
// once, and a duplicate throws when this module loads. Plain keys never fire while the person
// is typing or a dialog is open (see CommandActionsProvider).

export interface ShortcutSpec {
  /** "A", "Shift+R" or "Mod+K" (Mod is Cmd on a Mac, Ctrl elsewhere). */
  keys: string;
  /** The i18n key (common namespace) that words what the shortcut does. */
  label: string;
}

export const SHORTCUTS = {
  acknowledge: { keys: "A", label: "shortcuts.acknowledge" },
  create: { keys: "Shift+C", label: "shortcuts.create" },
  exportPdf: { keys: "Shift+E", label: "shortcuts.exportPdf" },
  history: { keys: "H", label: "shortcuts.history" },
  inbox: { keys: "Shift+I", label: "shortcuts.inbox" },
  magicLinks: { keys: "Shift+M", label: "shortcuts.magicLinks" },
  openPalette: { keys: "Mod+K", label: "shortcuts.openPalette" },
  retire: { keys: "Shift+R", label: "shortcuts.retire" },
  shortcuts: { keys: "?", label: "shortcuts.shortcuts" },
} as const satisfies Record<string, ShortcutSpec>;

export type ShortcutId = keyof typeof SHORTCUTS;

/** Throws when two ids share a key. Object keys already make ids unique. */
export const assertUniqueShortcuts = (registry: Record<string, ShortcutSpec>) => {
  const seen = new Map<string, string>();
  for (const [id, spec] of Object.entries(registry)) {
    const keys = spec.keys.toLowerCase();
    const other = seen.get(keys);
    if (other) throw new Error(`Duplicate shortcut ${spec.keys}: ${other} and ${id}`);
    seen.set(keys, id);
  }
};
assertUniqueShortcuts(SHORTCUTS);

/** Whether a key press is exactly this shortcut (no extra modifiers). */
export const matchesShortcut = (event: KeyboardEvent, keys: string): boolean => {
  const parts = keys.split("+");
  const key = parts.at(-1) ?? "";
  const wantsModifier = parts.includes("Mod");
  const wantsShift = parts.includes("Shift");
  return (
    event.key.toLowerCase() === key.toLowerCase() &&
    // A symbol such as "?" needs Shift on some layouts and not on others, so Shift only counts
    // for letters.
    (!/^[a-z]$/i.test(key) || event.shiftKey === wantsShift) &&
    (event.metaKey || event.ctrlKey) === wantsModifier &&
    !event.altKey
  );
};

/** The keycap text: "⇧R", "⌘K" on a Mac or "Ctrl+K" elsewhere. */
export const formatShortcut = (keys: string, mac = isMac()): string =>
  keys
    .split("+")
    .map((part) => {
      if (part === "Shift") return "⇧";
      if (part === "Mod") return mac ? "⌘" : "Ctrl+";
      return part;
    })
    .join("");

const isMac = () =>
  typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.userAgent);
