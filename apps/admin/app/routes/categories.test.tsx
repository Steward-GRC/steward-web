// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import Directory from "./categories";

type DirectoryProps = Parameters<typeof Directory>[0];

const rows = [
  { children: 1, id: "c-finance", owners: 2, path: "Finance" },
  { children: 0, id: "c-expenses", owners: 0, path: "Finance › Expenses" },
];

const open = (data: object[] = rows) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <Directory {...({ loaderData: { rows: data } } as unknown as DirectoryProps)} />
      ),
      path: "/categories",
    },
  ]);
  render(<Stub initialEntries={["/categories"]} />);
};

describe("Categories list (A3, #90)", () => {
  it("is the common list page: header with the new action, then a table", async () => {
    open();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Categories" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ New category" })).toHaveAttribute(
      "href",
      "/categories/new",
    );
    const table = screen.getByRole("table", { name: "Categories" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent),
    ).toEqual(["Category", "Sub-categories", "Owners"]);
    expect(within(table).getByRole("link", { name: "Finance › Expenses" })).toHaveAttribute(
      "href",
      "/categories/c-expenses",
    );
  });

  it("has the right-click row menu", async () => {
    open();
    fireEvent.contextMenu(await screen.findByRole("row", { name: /Finance › Expenses/ }));
    expect(await screen.findByRole("menuitem", { name: "Open in new tab" })).toBeInTheDocument();
  });

  it("offers the first category when there are none", async () => {
    open([]);
    expect(await screen.findByText("No category selected")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "+ New category" }).length).toBeGreaterThan(0);
  });
});
