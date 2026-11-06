// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SHORTCUTS } from "./shortcuts";
import { ShortcutsPage } from "./ShortcutsPage";

describe("the keyboard shortcuts page", () => {
  it("lists every shortcut in the registry with its keys and what it does", () => {
    render(<ShortcutsPage />);
    const list = screen.getByRole("list", { name: "Keyboard shortcuts" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(Object.keys(SHORTCUTS).length);
    expect(within(list).getByText("Open the command bar")).toBeInTheDocument();
    expect(within(list).getByText(/K$/)).toBeInTheDocument();
    expect(within(list).getByText("Open the inbox")).toBeInTheDocument();
    expect(within(list).getByText("Show the keyboard shortcuts")).toBeInTheDocument();
  });

  it("has a heading", () => {
    render(<ShortcutsPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Keyboard shortcuts" })).toBeVisible();
  });
});
