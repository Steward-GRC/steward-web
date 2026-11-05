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

/** Every authoring-only field (added once the editor extended `Policy`) shares this
 *  fully-permitted default; the library screen under test never reads them. */
const authoringDefaults = {
  currentDraftVersionId: null,
  currentPublishedVersionId: null,
  homeGroupId: "group-1",
  ownerUserId: "user-1",
  retiredAt: null,
  templateId: null,
  templateNone: true,
  viewerCan: {
    ack: true,
    approve: true,
    canBreakGlass: false,
    contentObfuscated: false,
    edit: true,
    read: true,
    submit: true,
  },
} satisfies Partial<Policy>;

const policies: Policy[] = [
  {
    ...authoringDefaults,
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
    ...authoringDefaults,
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

const rowTitles = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[2]!.textContent);

describe("PolicyLibrary", () => {
  it("shows a category tile per category, with its count and subcategory chips", () => {
    renderAt();
    const finance = screen.getByRole("listitem", { name: "Finance" });
    expect(within(finance).getByText("1")).toBeInTheDocument();
    expect(within(finance).getByRole("button", { name: "Reimbursement" })).toBeInTheDocument();
    expect(screen.getByRole("listitem", { name: "IT Security" })).toBeInTheDocument();
  });

  it("lists every policy in the table, with its status and sensitivity", () => {
    renderAt();
    const row = screen.getByRole("row", { name: new RegExp("Expense Claims") });
    expect(within(row).getByText("Published")).toBeInTheDocument();

    const sensitiveRow = screen.getByRole("row", { name: new RegExp("Acceptable Use") });
    expect(within(sensitiveRow).getByText("Draft")).toBeInTheDocument();
    expect(within(sensitiveRow).getByText("Sensitive")).toBeInTheDocument();
  });

  it("filters to a category from its tile, with a Filtered by chip", async () => {
    renderAt();
    await userEvent.click(screen.getByRole("button", { name: "Finance" }));
    const bar = screen.getByRole("region", { name: "Filtered by" });
    expect(bar).toHaveTextContent("Finance");
    expect(bar).toHaveTextContent("· 1 result");
    expect(rowTitles()).toEqual(["Expense Claims"]);
  });

  it("filters to a subcategory from its chip", async () => {
    renderAt();
    await userEvent.click(screen.getByRole("button", { name: "Usage" }));
    const bar = screen.getByRole("region", { name: "Filtered by" });
    expect(within(bar).getByText("IT Security")).toBeInTheDocument();
    expect(within(bar).getByText("Usage")).toBeInTheDocument();
    expect(rowTitles()).toEqual(["Acceptable Use"]);
  });

  it("removes one filter from its chip, and Clear removes them all", async () => {
    renderAt(["/policies?category=IT+Security&subcategory=Usage"]);
    await userEvent.click(screen.getByRole("button", { name: "Remove Usage" }));
    expect(screen.getByRole("region", { name: "Filtered by" })).toHaveTextContent("IT Security");
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByRole("region", { name: "Filtered by" })).toBeNull();
    expect(rowTitles()).toHaveLength(2);
  });

  it("filters by status and by the words in the address, each as a chip", () => {
    renderAt(["/policies?status=published"]);
    expect(screen.getByRole("region", { name: "Filtered by" })).toHaveTextContent("Published");
    expect(rowTitles()).toEqual(["Expense Claims"]);
  });

  it("filters to everything not yet published for In progress", () => {
    renderAt(["/policies?status=in-progress"]);
    expect(screen.getByRole("region", { name: "Filtered by" })).toHaveTextContent("In progress");
    expect(rowTitles()).toEqual(["Acceptable Use"]);
  });

  it("filters by words across number and title", () => {
    renderAt(["/policies?q=ITSEC"]);
    expect(screen.getByRole("region", { name: "Filtered by" })).toHaveTextContent("“ITSEC”");
    expect(rowTitles()).toEqual(["Acceptable Use"]);
  });

  it("sorts by title first and by any column from its header", async () => {
    renderAt();
    expect(screen.getByRole("columnheader", { name: "Title" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(rowTitles()).toEqual(["Acceptable Use", "Expense Claims"]);
    await userEvent.click(screen.getByRole("button", { name: "Title" }));
    expect(rowTitles()).toEqual(["Expense Claims", "Acceptable Use"]);
    await userEvent.click(screen.getByRole("button", { name: "Number" }));
    expect(screen.getByRole("columnheader", { name: "Number" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  it("pages the table", () => {
    renderAt();
    expect(screen.getByRole("navigation", { name: "Pages" })).toHaveTextContent("1–2 of 2");
  });

  it("stars a policy, then Starred in the header narrows the table to it", async () => {
    renderAt();
    await userEvent.click(screen.getByRole("button", { name: "Star POL-FINANCE-001" }));
    await userEvent.click(screen.getByRole("button", { name: "Starred" }));
    expect(rowTitles()).toEqual(["Expense Claims"]);
  });

  it("shows the empty state when no row matches the filters", () => {
    renderAt(["/policies?q=no+such+policy"]);
    expect(screen.getByText("No policies match these filters.")).toBeInTheDocument();
  });
});
