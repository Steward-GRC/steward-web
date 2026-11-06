// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type * as React from "react";

import { DocumentType, PolicyStatus, Sensitivity } from "@steward-web/api-client";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

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

const renderAt = (
  initialEntries: string[] = ["/policies"],
  actions?: React.ReactNode,
  heading: { subtitle?: string; title?: string } = {},
  columnOptions?: boolean,
) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <PolicyLibrary
          actions={actions}
          categories={categories}
          columnOptions={columnOptions}
          documentType={DocumentType.Policy}
          policies={policies}
          subtitle={heading.subtitle}
          title={heading.title}
        />
      ),
      path: "/policies",
    },
  ]);
  render(<Stub initialEntries={initialEntries} />);
};

/** The header row's column names, after the star column. */
const headers = () =>
  within(screen.getAllByRole("row")[0]!)
    .getAllByRole("columnheader")
    .slice(1)
    // The sorted column's arrow isn't part of its name.
    .map((cell) => cell.textContent?.replaceAll(/[↑↓]/g, "").trim());

const STAFF_HEADERS = [
  "Number",
  "Title",
  "Category",
  "Subcategory",
  "Sensitivity",
  "Status",
  "Version",
  "Updated",
];

/** The whole library's table with the column options on (A10). */
const openColumns = () => renderAt(["/policies?status=all"], undefined, {}, true);

const rowTitles = () =>
  screen
    .getAllByRole("row")
    // The header rows (and the column options' filter row) have no cells.
    .filter((row) => within(row).queryAllByRole("cell").length > 0)
    .map((row) => within(row).getAllByRole("cell")[2]!.textContent);

describe("PolicyLibrary", () => {
  it("keeps the staff library's own heading by default", () => {
    renderAt();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Policies");
  });

  it("takes another title and subtitle, as the admin catalog does (A10)", () => {
    renderAt(["/policies"], undefined, {
      subtitle: "Every policy across the org.",
      title: "Catalog",
    });
    expect(screen.getByRole("heading", { level: 1, name: "Catalog" })).toBeInTheDocument();
    expect(screen.getByText("Every policy across the org.")).toBeInTheDocument();
  });

  it("shows only the category tiles until something is filtered (U3)", () => {
    renderAt();
    expect(screen.getByRole("listitem", { name: "Finance" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("region", { name: "Filtered by" })).toBeNull();
  });

  it("swaps the tiles for the Filtered by bar and the table once filtered", async () => {
    renderAt();
    await userEvent.click(screen.getByRole("button", { name: "Finance" }));
    expect(screen.queryByRole("listitem", { name: "Finance" })).toBeNull();
    expect(screen.getByRole("region", { name: "Filtered by" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("lists every policy, with its status and sensitivity, under All policies", async () => {
    renderAt();
    await userEvent.click(screen.getByRole("button", { name: "Status" }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: "All policies" }));
    expect(screen.getByRole("region", { name: "Filtered by" })).toHaveTextContent("All policies");
    const row = screen.getByRole("row", { name: new RegExp("Expense Claims") });
    expect(within(row).getByText("Published")).toBeInTheDocument();
    const sensitiveRow = screen.getByRole("row", { name: new RegExp("Acceptable Use") });
    expect(within(sensitiveRow).getByText("Draft")).toBeInTheDocument();
    expect(within(sensitiveRow).getByText("Sensitive")).toBeInTheDocument();
  });

  it("filters by status from the header's Status menu", async () => {
    renderAt();
    await userEvent.click(screen.getByRole("button", { name: "Status" }));
    for (const name of ["All policies", "Draft", "In review", "Published", "In progress"]) {
      expect(screen.getByRole("menuitemradio", { name })).toBeInTheDocument();
    }
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Draft" }));
    expect(rowTitles()).toEqual(["Acceptable Use"]);
  });

  it("removes one filter from its chip, and Clear goes back to the tiles", async () => {
    renderAt(["/policies?category=IT+Security&subcategory=Usage"]);
    await userEvent.click(screen.getByRole("button", { name: "Remove Usage" }));
    expect(screen.getByRole("region", { name: "Filtered by" })).toHaveTextContent("IT Security");
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByRole("region", { name: "Filtered by" })).toBeNull();
    expect(screen.getByRole("listitem", { name: "Finance" })).toBeInTheDocument();
  });

  it("sorts by title first and by any column from its header", async () => {
    renderAt(["/policies?status=all"]);
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
    renderAt(["/policies?status=all"]);
    expect(screen.getByRole("navigation", { name: "Pages" })).toHaveTextContent("1–2 of 2");
  });

  it("puts the caller's actions in the header after Starred and Status", () => {
    renderAt(["/policies"], <a href="/drafts/new">New policy</a>);
    expect(screen.getByRole("link", { name: "New policy" })).toBeInTheDocument();
  });

  it("shows a category tile per category, with its count and subcategory chips", () => {
    renderAt();
    const finance = screen.getByRole("listitem", { name: "Finance" });
    expect(within(finance).getByText("1")).toBeInTheDocument();
    expect(within(finance).getByRole("button", { name: "Reimbursement" })).toBeInTheDocument();
    expect(screen.getByRole("listitem", { name: "IT Security" })).toBeInTheDocument();
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

  it("stars a policy, then Starred in the header narrows the table to it", async () => {
    renderAt(["/policies?status=all"]);
    await userEvent.click(screen.getByRole("button", { name: "Star POL-FINANCE-001" }));
    await userEvent.click(screen.getByRole("button", { name: "Starred" }));
    expect(rowTitles()).toEqual(["Expense Claims"]);
  });

  it("shows the empty state when no row matches the filters", () => {
    renderAt(["/policies?q=no+such+policy"]);
    expect(screen.getByText("No policies match these filters.")).toBeInTheDocument();
  });

  it("has no column options unless they're turned on, as the staff library leaves them", () => {
    renderAt(["/policies?status=all"]);
    expect(screen.queryByRole("button", { name: "Columns" })).toBeNull();
    expect(screen.queryByRole("searchbox", { name: "Filter Title" })).toBeNull();
    expect(headers()).toEqual(STAFF_HEADERS);
  });

  describe("with column options (A10)", () => {
    it("filters a column from the filter row under the headers", async () => {
      openColumns();
      await userEvent.type(screen.getByRole("searchbox", { name: "Filter Title" }), "accept");
      expect(rowTitles()).toEqual(["Acceptable Use"]);
      expect(screen.getByRole("region", { name: "Filtered by" })).toHaveTextContent(
        "Title: “accept”",
      );
    });

    it("filters a column by its values", async () => {
      openColumns();
      await userEvent.click(screen.getByRole("combobox", { name: "Filter Sensitivity" }));
      await userEvent.click(await screen.findByRole("option", { name: "Sensitive" }));
      expect(rowTitles()).toEqual(["Acceptable Use"]);
    });

    it("hides a column and shows it again", async () => {
      openColumns();
      await userEvent.click(screen.getByRole("button", { name: "Columns" }));
      await userEvent.click(await screen.findByRole("checkbox", { name: "Subcategory" }));
      expect(headers()).not.toContain("Subcategory");
      await userEvent.click(screen.getByRole("checkbox", { name: "Subcategory" }));
      expect(headers()).toContain("Subcategory");
    });

    it("moves a column earlier or later", async () => {
      openColumns();
      await userEvent.click(screen.getByRole("button", { name: "Columns" }));
      await userEvent.click(await screen.findByRole("button", { name: "Move Title earlier" }));
      expect(headers().slice(0, 2)).toEqual(["Title", "Number"]);
      await userEvent.click(screen.getByRole("button", { name: "Move Title later" }));
      expect(headers().slice(0, 2)).toEqual(["Number", "Title"]);
    });
  });
});

/** A phone-width screen, as the browser's media queries report it. */
const asPhone = () => {
  globalThis.matchMedia = ((query: string) => ({
    addEventListener: () => {},
    matches: query === "(max-width: 47.98rem)",
    media: query,
    removeEventListener: () => {},
  })) as unknown as typeof globalThis.matchMedia;
};

describe("PolicyLibrary on a phone (U3m)", () => {
  const restore = globalThis.matchMedia;
  afterEach(() => {
    globalThis.matchMedia = restore;
  });

  it("lists every document as a card instead of the tiles and the table", async () => {
    asPhone();
    renderAt();
    const cards = await screen.findByRole("list", { name: "Policies" });
    const expense = within(cards).getByRole("link", { name: /Expense Claims/ });
    expect(expense).toHaveAttribute("href", "/policies/POL-FINANCE-001");
    expect(expense).toHaveTextContent("POL-FINANCE-001 · v2.0.0");
    expect(expense).toHaveTextContent("Finance · Reimbursement");
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("filters by category from a row of chips, starting at All", async () => {
    asPhone();
    renderAt();
    const chips = await screen.findByRole("group", { name: "Category" });
    expect(within(chips).getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(within(chips).getByRole("button", { name: "IT Security" }));
    const cards = screen.getByRole("list", { name: "Policies" });
    expect(within(cards).getAllByRole("link")).toHaveLength(1);
    expect(within(cards).getByRole("link", { name: /Acceptable Use/ })).toBeInTheDocument();
  });
});

const bodyRows = () =>
  screen.getAllByRole("row").filter((row) => within(row).queryAllByRole("cell").length > 0);

describe("PolicyLibrary with many policies", () => {
  const many: Policy[] = Array.from({ length: 70 }, (_, index) => ({
    ...policies[0]!,
    id: `bulk-${index}`,
    number: `BULK-${String(index).padStart(3, "0")}`,
    status: PolicyStatus.Published,
    title: `Bulk policy ${String(index).padStart(3, "0")}`,
  }));

  const renderMany = (entry: string) => {
    const Stub = createRoutesStub([
      {
        Component: () => (
          <PolicyLibrary
            categories={categories}
            documentType={DocumentType.Policy}
            policies={many}
          />
        ),
        path: "/policies",
      },
    ]);
    render(<Stub initialEntries={[entry]} />);
  };

  it("shows twenty a page until the person picks another size", async () => {
    renderMany("/policies?status=all");
    expect(bodyRows()).toHaveLength(20);
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Rows per page" }), "50");
    expect(bodyRows()).toHaveLength(50);
    expect(screen.getByRole("navigation", { name: "Pages" })).toHaveTextContent("1–50 of 70");
  });

  it("keeps the page size and page in the address", () => {
    renderMany("/policies?status=all&size=10&page=7");
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByRole("navigation", { name: "Pages" })).toHaveTextContent("61–70 of 70");
    expect(screen.getByRole("combobox", { name: "Jump to page" })).toHaveValue("7");
  });
});
