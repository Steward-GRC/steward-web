// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { asPhone } from "../test/phone";
import Workflows from "./workflows";

const ROWS = [
  {
    categories: ["Expenses", "Travel"],
    disabledApprover: true,
    id: "w-finance",
    name: "Finance sign-off",
    stages: 2,
    usable: true,
    version: 3,
  },
  {
    categories: [],
    disabledApprover: false,
    id: "w-legacy",
    name: "Legacy",
    stages: 1,
    usable: false,
    version: 1,
  },
];

type WorkflowsProps = Parameters<typeof Workflows>[0];

const openWorkflows = (rows: object[] = ROWS) => {
  const Stub = createRoutesStub([
    {
      Component: () => <Workflows {...({ loaderData: { rows } } as unknown as WorkflowsProps)} />,
      path: "/workflows",
    },
  ]);
  render(<Stub initialEntries={["/workflows"]} />);
};

describe("Workflows (A8, #90)", () => {
  it("is a table, never cards, under the common list structure", async () => {
    openWorkflows();
    expect(await screen.findByRole("heading", { level: 1, name: "Workflows" })).toBeInTheDocument();
    expect(screen.getByText("Approval workflows for policy review.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ New workflow" })).toHaveAttribute(
      "href",
      "/workflows/new",
    );
    const table = screen.getByRole("table", { name: "Workflows" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent),
    ).toEqual(["Name", "Applies to", "Stages", "Version", "Status"]);
  });

  it("opens the workflow from its name and lists the categories it applies to", async () => {
    openWorkflows();
    const row = await screen.findByRole("row", { name: /Finance sign-off/ });
    expect(within(row).getByRole("link", { name: "Finance sign-off" })).toHaveAttribute(
      "href",
      "/workflows/w-finance",
    );
    expect(within(row).getByText("Expenses, Travel")).toBeInTheDocument();
    expect(within(row).getByText("2")).toBeInTheDocument();
    expect(within(row).getByText("v3")).toBeInTheDocument();
    expect(within(row).getByText("Disabled approver — needs replacement")).toBeInTheDocument();
    const legacy = screen.getByRole("row", { name: /Legacy/ });
    expect(within(legacy).getByText("Draft")).toBeInTheDocument();
    expect(within(legacy).getByText("Not in use")).toBeInTheDocument();
  });

  it("has the right-click row menu", async () => {
    openWorkflows();
    fireEvent.contextMenu(await screen.findByRole("row", { name: /Finance sign-off/ }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Open" })).toHaveAttribute(
      "href",
      "/workflows/w-finance",
    );
  });

  it("says when there are no workflows", async () => {
    openWorkflows([]);
    expect(await screen.findByText("No workflows yet")).toBeInTheDocument();
  });
});

describe("Workflows on a phone (7-responsive.s3)", () => {
  it("folds the table into cards, each name a link", async () => {
    asPhone();
    openWorkflows();
    expect(await screen.findByRole("link", { name: "Finance sign-off" })).toHaveAttribute(
      "href",
      "/workflows/w-finance",
    );
    expect(screen.queryByRole("table")).toBeNull();
  });
});
