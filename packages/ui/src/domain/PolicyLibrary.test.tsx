// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, PolicyStatus, Sensitivity } from "@steward-web/api-client";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import type { Category, Policy } from "./policy";

import { PolicyLibrary } from "./PolicyLibrary";

const categories: Category[] = [
  { id: "cat-1", name: "Finance", slug: "finance", subcategories: ["Reimbursement"] },
  { id: "cat-2", name: "IT Security", slug: "it-security", subcategories: ["Usage", "Operations"] },
];

const policies: Policy[] = [
  {
    category: "Finance",
    documentType: DocumentType.Policy,
    id: "pol-1",
    number: "POL-FINANCE-001",
    sensitivity: Sensitivity.Standard,
    status: PolicyStatus.Published,
    subcategory: "Reimbursement",
    title: "Expense Claims",
    updated: "2026-09-01",
    version: "2.0.0",
  },
  {
    category: "IT Security",
    documentType: DocumentType.Policy,
    id: "pol-2",
    number: "POL-ITSEC-004",
    sensitivity: Sensitivity.Sensitive,
    status: PolicyStatus.Draft,
    subcategory: "Usage",
    title: "Acceptable Use",
    updated: "2026-09-15",
    version: "1.0.0",
  },
];

const renderAt = (initialEntries: string[] = ["/policies"]) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <PolicyLibrary
          categories={categories}
          documentType={DocumentType.Policy}
          policies={policies}
        />
      ),
      path: "/policies",
    },
  ]);
  render(<Stub initialEntries={initialEntries} />);
};

describe("PolicyLibrary", () => {
  it("shows a category tile per category, with its policy count", () => {
    renderAt();
    expect(screen.getByRole("button", { name: "Finance" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "IT Security" })).toBeInTheDocument();
    expect(screen.getAllByText("1 policy")).toHaveLength(2);
  });

  it("lists every policy in the table, with its status and sensitivity", () => {
    renderAt();
    const row = screen.getByRole("row", { name: new RegExp("Expense Claims") });
    expect(within(row).getByText("Published")).toBeInTheDocument();

    const sensitiveRow = screen.getByRole("row", { name: new RegExp("Acceptable Use") });
    expect(within(sensitiveRow).getByText("Draft")).toBeInTheDocument();
    expect(within(sensitiveRow).getByText("Sensitive")).toBeInTheDocument();
  });

  it("filters the table to a category, hiding the tiles", async () => {
    renderAt();
    await userEvent.click(screen.getByRole("button", { name: "Finance" }));

    expect(screen.queryByRole("button", { name: "IT Security" })).not.toBeInTheDocument();
    expect(screen.getByText("Expense Claims")).toBeInTheDocument();
    expect(screen.queryByText("Acceptable Use")).not.toBeInTheDocument();
  });

  it("filters by the search box across number and title", async () => {
    renderAt();
    await userEvent.type(screen.getByPlaceholderText("Search"), "ITSEC");

    expect(screen.getByText("Acceptable Use")).toBeInTheDocument();
    expect(screen.queryByText("Expense Claims")).not.toBeInTheDocument();
  });

  it("stars a policy, then the Starred filter narrows the table to it", async () => {
    renderAt();
    await userEvent.click(screen.getByRole("button", { name: "Star POL-FINANCE-001" }));
    await userEvent.click(screen.getByRole("button", { name: "Starred" }));

    expect(screen.getByText("Expense Claims")).toBeInTheDocument();
    expect(screen.queryByText("Acceptable Use")).not.toBeInTheDocument();
  });

  it("shows the empty state when no row matches the filters", async () => {
    renderAt();
    await userEvent.type(screen.getByPlaceholderText("Search"), "no such policy");

    expect(screen.getByText("No policies match these filters.")).toBeInTheDocument();
  });
});
