// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type CommandAction, formatShortcut, type PaletteGroup, SHORTCUTS } from "@steward-web/ui";

const matches = (label: string, words: string) => label.toLowerCase().includes(words.toLowerCase());

const item = (action: CommandAction) => ({
  ...(action.kind === "admin" ? { admin: true } : {}),
  icon: "action" as const,
  id: `action:${action.id}`,
  label: action.label,
  run: action.run,
  shortcut: action.shortcut ? formatShortcut(SHORTCUTS[action.shortcut].keys) : undefined,
});

/**
 * The command bar's groups for the page in view (bug log 26, #103): the everyday actions under
 * Actions, then the admin-level tasks under their own Admin group with an admin mark on each.
 * The words typed narrow by label; "admin" lists the Admin group whole.
 */
export const pageActionGroups = (
  actions: readonly CommandAction[],
  words: string,
  headings: { actions: string; admin: string },
): PaletteGroup[] => {
  const everyday = actions.filter((action) => action.kind !== "admin");
  const admin = actions.filter((action) => action.kind === "admin");
  const asksForAdmin = words.length >= 3 && "admin".startsWith(words.toLowerCase());
  return [
    {
      heading: headings.actions,
      id: "actions",
      items: everyday
        .filter((action) => !words || matches(action.label, words))
        .map((action) => item(action)),
    },
    ...(admin.length > 0
      ? [
          {
            heading: headings.admin,
            id: "admin",
            items: admin
              .filter((action) => !words || asksForAdmin || matches(action.label, words))
              .map((action) => item(action)),
          },
        ]
      : []),
  ];
};
