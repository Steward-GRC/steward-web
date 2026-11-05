// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import Directory from "./groups";

type DirectoryProps = Parameters<typeof Directory>[0];

describe("Category directory, nothing selected (A3)", () => {
  it("asks for a category from the sidebar, and lists them for narrow screens", async () => {
    const rows = [
      { id: "c-finance", path: "Finance" },
      { id: "c-expenses", path: "Finance › Expenses" },
    ];
    const Stub = createRoutesStub([
      {
        Component: () => <Directory {...({ loaderData: { rows } } as unknown as DirectoryProps)} />,
        path: "/groups",
      },
    ]);
    render(<Stub initialEntries={["/groups"]} />);
    expect(await screen.findByText("No category selected")).toBeInTheDocument();
    expect(screen.getByText("Select a category from the sidebar.")).toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Categories" });
    expect(within(list).getByRole("link", { name: "Finance › Expenses" })).toHaveAttribute(
      "href",
      "/groups/c-expenses",
    );
    expect(screen.getByRole("link", { name: "+ New category" })).toHaveAttribute(
      "href",
      "/groups/new",
    );
  });
});
