// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListPage } from "./ListPage";

const after = (a: Element, b: Element) =>
  Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe("ListPage (#90)", () => {
  it("draws the header, then the search and filter bar, then the table, in that order", () => {
    render(
      <ListPage
        actions={<button type="button">New thing</button>}
        filters={<input aria-label="Filter things" />}
        subtitle="All the things."
        title="Things"
      >
        <table aria-label="Things table" />
      </ListPage>,
    );
    const header = screen.getByRole("heading", { level: 1, name: "Things" });
    const filters = screen.getByRole("search", { name: "Search and filters" });
    const table = screen.getByRole("table", { name: "Things table" });
    expect(after(header, filters)).toBe(true);
    expect(after(filters, table)).toBe(true);
    expect(screen.getByRole("button", { name: "New thing" })).toBeInTheDocument();
    expect(screen.getByText("All the things.")).toBeInTheDocument();
  });

  it("leaves the filter bar out when there are no filters", () => {
    render(
      <ListPage title="Things">
        <table aria-label="Things table" />
      </ListPage>,
    );
    expect(screen.queryByRole("search", { name: "Search and filters" })).toBeNull();
  });
});
