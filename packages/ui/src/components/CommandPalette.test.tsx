// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { CommandPalette, type PaletteGroup, type PaletteItem } from "./CommandPalette";

const groups: PaletteGroup[] = [
  {
    heading: "Policies",
    id: "policies",
    items: [
      {
        hint: "POL-FACILITIES-000001 · Workplace",
        id: "p1",
        label: "Desk Booking Policy",
        to: "/policies/POL-FACILITIES-000001",
      },
      {
        hint: "POL-FACILITIES-000004 · Workplace",
        id: "p4",
        label: "Visitor Sign-in Policy",
        to: "/policies/POL-FACILITIES-000004",
      },
    ],
  },
  {
    heading: "Categories",
    id: "categories",
    items: [
      { hint: "Workplace", icon: "folder", id: "c1", label: "Facilities", to: "/policies?c=1" },
    ],
  },
];

const Palette = ({
  initial = "desk",
  onSeeAll = () => {},
  onSelect = () => {},
  shown = groups,
}: {
  initial?: string;
  onSeeAll?: (query: string) => void;
  onSelect?: (item: PaletteItem) => void;
  shown?: PaletteGroup[];
}) => {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState(initial);
  return (
    <>
      <span>{open ? "open" : "closed"}</span>
      <CommandPalette
        groups={shown}
        onOpenChange={setOpen}
        onQueryChange={setQuery}
        onSeeAll={onSeeAll}
        onSelect={onSelect}
        open={open}
        query={query}
      />
    </>
  );
};

describe("the command palette (H10)", () => {
  it("is a dialog with the search field and the esc keycap", () => {
    render(<Palette />);
    const dialog = screen.getByRole("dialog", { name: "Search Steward" });
    expect(within(dialog).getByRole("combobox")).toHaveValue("desk");
    expect(within(dialog).getByText("esc")).toBeInTheDocument();
  });

  it("groups the results under their headings with their hints", () => {
    render(<Palette />);
    expect(screen.getByRole("group", { name: "Policies" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Categories" })).toBeInTheDocument();
    const desk = screen.getByRole("option", { name: /Desk Booking Policy/ });
    expect(desk).toHaveTextContent("POL-FACILITIES-000001 · Workplace");
    expect(within(desk).getByText("Desk").tagName).toBe("U");
  });

  it("selects the first result first and opens what Enter picks", async () => {
    const onSelect = vi.fn();
    render(<Palette onSelect={onSelect} />);
    expect(screen.getByRole("option", { name: /Desk Booking Policy/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith(groups[0]!.items[1]);
  });

  it("ends with See all results for the words typed", async () => {
    const onSeeAll = vi.fn();
    render(<Palette onSeeAll={onSeeAll} />);
    await userEvent.click(screen.getByRole("option", { name: "See all results for “desk”" }));
    expect(onSeeAll).toHaveBeenCalledWith("desk");
  });

  it("says when nothing matches", () => {
    render(<Palette initial="zzz" shown={[]} />);
    expect(screen.getByText("Nothing matches “zzz”.")).toBeInTheDocument();
  });

  it("closes on Esc", async () => {
    render(<Palette />);
    await userEvent.keyboard("{Escape}");
    expect(screen.getByText("closed")).toBeInTheDocument();
  });
});
