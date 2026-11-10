// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import Directory from "./categories";

type DirectoryProps = Parameters<typeof Directory>[0];

const rows = [
  { id: "c-finance", name: "Finance", owners: 2, parentId: null },
  { id: "c-expenses", name: "Expenses", owners: 0, parentId: "c-finance" },
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

describe("Categories (A3)", () => {
  it("is the tree, not a table: the header with the new action, then the category tree", async () => {
    open();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Categories" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ New category" })).toHaveAttribute(
      "href",
      "/categories/new",
    );
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByRole("navigation", { name: "Category tree" })).toBeInTheDocument();
  });

  it("opens a category's detail from its node", async () => {
    open();
    expect(await screen.findByRole("link", { name: "Expenses" })).toHaveAttribute(
      "href",
      "/categories/c-expenses",
    );
  });

  it("offers the first category when there are none", async () => {
    open([]);
    expect(await screen.findByText("No category selected")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "+ New category" }).length).toBeGreaterThan(0);
  });
});
