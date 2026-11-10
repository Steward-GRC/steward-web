// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { CategoryTree, type TreeRow } from "./CategoryTree";

// Finance > Expenses > Travel (three levels), IT with Security, and Legal.
const rows: TreeRow[] = [
  { id: "fin", name: "Finance", owners: 2, parentId: null },
  { id: "exp", name: "Expenses", owners: 0, parentId: "fin" },
  { id: "trv", name: "Travel", owners: 0, parentId: "exp" },
  { id: "it", name: "IT", owners: 1, parentId: null },
  { id: "sec", name: "Security", owners: 0, parentId: "it" },
  { id: "legal", name: "Legal", owners: 0, parentId: null },
];

const posts: Record<string, string>[] = [];

const open = (data: TreeRow[] = rows) => {
  posts.length = 0;
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        posts.push(Object.fromEntries(await request.formData()) as Record<string, string>);
        return { id: "x", ok: true, parentId: null };
      },
      Component: () => <CategoryTree rows={data} />,
      path: "/categories",
    },
  ]);
  render(<Stub initialEntries={["/categories"]} />);
};

const drag = (from: string, onto: string) => {
  const data = new Map<string, string>();
  const dataTransfer = {
    effectAllowed: "",
    setData: (key: string, value: string) => data.set(key, value),
  };
  fireEvent.dragStart(screen.getByTestId(`node-${from}`), { dataTransfer });
  fireEvent.dragOver(screen.getByTestId(`node-${onto}`), { dataTransfer });
  fireEvent.drop(screen.getByTestId(`node-${onto}`), { dataTransfer });
};

describe("the category tree", () => {
  it("shows the top level open, the owners and the sub-category count on each node", async () => {
    open();
    expect(await screen.findByRole("link", { name: "Finance" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Expenses" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Travel" })).toBeNull();
    const finance = screen.getByTestId("node-fin");
    expect(within(finance).getByText("2 owners")).toBeInTheDocument();
    expect(within(finance).getByText("1 sub-category")).toBeInTheDocument();
  });

  it("opens and closes a node", async () => {
    open();
    await userEvent.click(await screen.findByRole("button", { name: "Expand Expenses" }));
    expect(screen.getByRole("link", { name: "Travel" })).toHaveAttribute("href", "/categories/trv");
    await userEvent.click(screen.getByRole("button", { name: "Collapse Expenses" }));
    expect(screen.queryByRole("link", { name: "Travel" })).toBeNull();
  });

  it("filters, keeping the path down to each match open", async () => {
    open();
    await userEvent.type(
      await screen.findByRole("searchbox", { name: "Search categories" }),
      "trav",
    );
    expect(screen.getByRole("link", { name: "Travel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Finance" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Legal" })).toBeNull();
    await userEvent.clear(screen.getByRole("searchbox", { name: "Search categories" }));
    await userEvent.type(screen.getByRole("searchbox", { name: "Search categories" }), "zzz");
    expect(screen.getByText("No categories match.")).toBeInTheDocument();
  });
});

describe("moving a category", () => {
  it("offers only the parents that keep the branch within three levels, and sends the move", async () => {
    open();
    await userEvent.click(await screen.findByRole("button", { name: "Move Expenses" }));
    const dialog = await screen.findByRole("dialog", { name: "Move Expenses" });
    expect(within(dialog).getByText(/and its 1 sub-category with it/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("combobox", { name: "New parent" }));
    // Expenses holds Travel (height 2): it fits under a top-level category, not under Travel
    // (its own branch) and not under Security (depth 2 + 2 = 4).
    const names = screen.getAllByRole("option").map((option) => option.textContent);
    expect(names).toContain("None (top level)");
    expect(names).toContain("IT");
    expect(names).toContain("Finance");
    expect(names).not.toContain("IT › Security");
    expect(names).not.toContain("Finance › Expenses › Travel");
    await userEvent.click(screen.getByRole("option", { name: "IT" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Move" }));
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0]).toEqual({ groupId: "exp", intent: "move", parentId: "it" });
  });
});

describe("dragging a category", () => {
  it("moves the dragged category under the one it is dropped on", async () => {
    open();
    await screen.findByTestId("node-legal");
    drag("legal", "it");
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0]).toEqual({ groupId: "legal", intent: "move", parentId: "it" });
  });

  it("refuses a drop inside its own branch and says why, without asking the gateway", async () => {
    open();
    await userEvent.click(await screen.findByRole("button", { name: "Expand Expenses" }));
    drag("fin", "trv");
    expect(
      await screen.findByText("Finance can't move under one of its own sub-categories."),
    ).toBeInTheDocument();
    expect(posts).toHaveLength(0);
  });

  it("refuses a drop that would nest the branch deeper than three levels (depth 4)", async () => {
    open();
    await screen.findByTestId("node-it");
    // Finance holds three levels; under IT it would be four.
    drag("fin", "it");
    expect(
      await screen.findByText("That would nest Finance deeper than 3 levels."),
    ).toBeInTheDocument();
    expect(posts).toHaveLength(0);
  });
});
