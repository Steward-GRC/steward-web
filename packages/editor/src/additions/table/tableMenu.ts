import { INSERT_TABLE_COMMAND } from "@lexical/table";

// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: MIT
import TableCardIcon from "./kg-card-type-table.svg?react";

// Tables are stock @lexical/table element nodes rather than a Koenig decorator card, so the
// card menu has no `kgMenu` static to read. This entry stands in for one: the "+" and slash
// menus list it whenever the editor has the table nodes registered.
export const TABLE_MENU_ITEM = {
  desc: "Insert a table",
  Icon: TableCardIcon,
  insertCommand: INSERT_TABLE_COMMAND,
  insertParams: { columns: "3", includeHeaders: { columns: false, rows: true }, rows: "3" },
  label: "Table",
  matches: ["table", "grid"],
  priority: 3,
  shortcut: "/table",
};
