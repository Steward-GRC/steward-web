// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CategoryTiles, FilterBar, Pager, SortHeader } from "./LibraryControls";

describe("the category tiles (U3)", () => {
  it("shows each category with its mono count and its subcategory chips", async () => {
    const onCategory = vi.fn();
    const onSubcategory = vi.fn();
    render(
      <CategoryTiles
        categories={[
          { count: 4, name: "Workplace", subcategories: ["Facilities", "Travel"] },
          { count: 3, name: "Finance", subcategories: ["Expenses"] },
        ]}
        onCategory={onCategory}
        onSubcategory={onSubcategory}
      />,
    );
    const workplace = screen.getByRole("listitem", { name: "Workplace" });
    expect(within(workplace).getByText("4")).toHaveClass("font-mono");
    await userEvent.click(within(workplace).getByRole("button", { name: "Workplace" }));
    expect(onCategory).toHaveBeenCalledWith("Workplace");
    await userEvent.click(within(workplace).getByRole("button", { name: "Travel" }));
    expect(onSubcategory).toHaveBeenCalledWith("Workplace", "Travel");
  });
});

describe("the Filtered by bar (U3)", () => {
  it("lists each filter as a removable chip, the result count and Clear", async () => {
    const onRemove = vi.fn();
    const onClear = vi.fn();
    render(
      <FilterBar
        chips={[
          { id: "category", label: "Workplace" },
          { id: "status", label: "Published" },
        ]}
        count={3}
        onClear={onClear}
        onRemove={onRemove}
      />,
    );
    const bar = screen.getByRole("region", { name: "Filtered by" });
    expect(bar).toHaveTextContent("Filtered byWorkplacePublished· 3 resultsClear");
    await userEvent.click(within(bar).getByRole("button", { name: "Remove Workplace" }));
    expect(onRemove).toHaveBeenCalledWith("category");
    await userEvent.click(within(bar).getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("says one result in the singular", () => {
    render(
      <FilterBar
        chips={[{ id: "q", label: "desk" }]}
        count={1}
        onClear={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(screen.getByText("· 1 result")).toBeInTheDocument();
  });
});

describe("the sortable column headers (U3)", () => {
  it("marks the sorted column with its arrow and aria-sort, and sorts on a click", async () => {
    const onSort = vi.fn();
    render(
      <table>
        <thead>
          <tr>
            <SortHeader direction="asc" label="Title" onSort={onSort} sorted />
            <SortHeader direction="asc" label="Number" onSort={onSort} sorted={false} />
          </tr>
        </thead>
      </table>,
    );
    const title = screen.getByRole("columnheader", { name: "Title" });
    expect(title).toHaveTextContent("Title ↑");
    expect(title).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("columnheader", { name: "Number" })).not.toHaveAttribute("aria-sort");
    await userEvent.click(screen.getByRole("button", { name: "Number" }));
    expect(onSort).toHaveBeenCalledOnce();
  });
});

describe("the pager (U3)", () => {
  it("says which rows are showing and moves between pages", async () => {
    const onPage = vi.fn();
    render(<Pager onPage={onPage} page={2} pageSize={20} total={45} />);
    const pager = screen.getByRole("navigation", { name: "Pages" });
    expect(pager).toHaveTextContent("21–40 of 45");
    expect(within(pager).getByRole("button", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await userEvent.click(within(pager).getByRole("button", { name: "Next page" }));
    expect(onPage).toHaveBeenCalledWith(3);
    await userEvent.click(within(pager).getByRole("button", { name: "Previous page" }));
    expect(onPage).toHaveBeenCalledWith(1);
  });

  it("can't go back from the first page or on from the last", () => {
    render(<Pager onPage={() => {}} page={1} pageSize={20} total={4} />);
    expect(screen.getByText("1–4 of 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});

describe("the pager's page jump and page size", () => {
  it("jumps to any page from a dropdown, however many pages there are", async () => {
    const onPage = vi.fn();
    render(<Pager onPage={onPage} page={1} pageSize={20} total={700} />);
    const jump = screen.getByRole("combobox", { name: "Jump to page" });
    expect(within(jump).getAllByRole("option")).toHaveLength(35);
    await userEvent.selectOptions(jump, "27");
    expect(onPage).toHaveBeenCalledWith(27);
  });

  it("shows a few page numbers with gaps, not all 35", () => {
    render(<Pager onPage={() => {}} page={17} pageSize={20} total={700} />);
    const pager = screen.getByRole("navigation", { name: "Pages" });
    const buttons = within(pager)
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label"));
    expect(buttons).toContain("Page 1");
    expect(buttons).toContain("Page 16");
    expect(buttons).toContain("Page 18");
    expect(buttons).toContain("Page 35");
    expect(buttons).not.toContain("Page 9");
    expect(within(pager).getAllByText("…").length).toBe(2);
  });

  it("picks how many rows a page shows", async () => {
    const onPageSize = vi.fn();
    render(
      <Pager
        onPage={() => {}}
        onPageSize={onPageSize}
        page={1}
        pageSize={20}
        pageSizes={[10, 20, 50, 100]}
        total={700}
      />,
    );
    const size = screen.getByRole("combobox", { name: "Rows per page" });
    expect(size).toHaveValue("20");
    await userEvent.selectOptions(size, "100");
    expect(onPageSize).toHaveBeenCalledWith(100);
  });

  it("leaves out the page size when none is offered, and the jump on a single page", () => {
    render(<Pager onPage={() => {}} page={1} pageSize={20} total={4} />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
