// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType } from "@steward-web/api-client";
import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { RecordBreadcrumb, recordCrumbs } from "./RecordBreadcrumb";

const record = {
  category: "Finance",
  categorySlug: "finance",
  documentType: DocumentType.Policy,
  number: "POL-EXPENSES-000002",
  subcategory: "Expenses",
  subcategorySlug: "expenses",
  title: "Expense Claims",
};

const show = (element: React.ReactNode) =>
  render(<RouterProvider router={createMemoryRouter([{ element, path: "*" }])} />);

describe("recordCrumbs", () => {
  it("goes library, category, subcategory, then the record", () => {
    expect(recordCrumbs(record, "Policies")).toEqual([
      { href: "/policies", label: "Policies" },
      { href: "/policies/category/finance", label: "Finance" },
      { href: "/policies/category/finance/expenses", label: "Expenses" },
      { label: "Expense Claims" },
    ]);
  });

  it("uses the procedures library for a procedure", () => {
    expect(
      recordCrumbs({ ...record, documentType: DocumentType.Procedure }, "Procedures")[0],
    ).toEqual({ href: "/procedures", label: "Procedures" });
  });

  it("links a procedure's category under the procedures library, with encoded slugs", () => {
    expect(
      recordCrumbs(
        {
          ...record,
          categorySlug: "a b",
          documentType: DocumentType.Procedure,
          subcategorySlug: "x/y",
        },
        "Procedures",
      ).map((c) => c.href),
    ).toEqual([
      "/procedures",
      "/procedures/category/a%20b",
      "/procedures/category/a%20b/x%2Fy",
      undefined,
    ]);
  });

  it("leaves out a missing subcategory or category", () => {
    expect(recordCrumbs({ ...record, subcategory: "" }, "Policies").map((c) => c.label)).toEqual([
      "Policies",
      "Finance",
      "Expense Claims",
    ]);
    expect(
      recordCrumbs({ ...record, category: "", subcategory: "" }, "Policies").map((c) => c.label),
    ).toEqual(["Policies", "Expense Claims"]);
  });

  it("links the record and adds a last crumb for a page about it (draft, approval)", () => {
    const crumbs = recordCrumbs(record, "Policies", "Draft");
    expect(crumbs.at(-2)).toEqual({
      href: "/policies/POL-EXPENSES-000002",
      label: "Expense Claims",
    });
    expect(crumbs.at(-1)).toEqual({ label: "Draft" });
  });
});

describe("recordCrumbs for a draft never published", () => {
  it("does not link the record, which has no page yet", () => {
    expect(recordCrumbs(record, "Policies", "Draft", false).at(-2)).toEqual({
      label: "Expense Claims",
    });
  });
});

describe("RecordBreadcrumb", () => {
  it("is a navigation of links with the current page last and unlinked", () => {
    show(<RecordBreadcrumb page={undefined} record={record} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((a) => a.textContent),
    ).toEqual(["Policies", "Finance", "Expenses"]);
    expect(within(nav).getByText("Expense Claims")).toHaveAttribute("aria-current", "page");
  });
});
