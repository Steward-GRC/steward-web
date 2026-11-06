// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, renderHook } from "@testing-library/react";
import { type ReactNode } from "react";
import {
  MemoryRouter,
  type ShouldRevalidateFunctionArgs,
  useLocation,
  useNavigationType,
} from "react-router";
import { describe, expect, it } from "vitest";

import { type DataColumn, shouldRevalidateTable, useDataTable } from "./dataTable";

interface Row {
  id: string;
  kind: string;
  name: string;
  size: number;
}

const columns: DataColumn<Row>[] = [
  { cell: (row) => row.name, header: "Name", key: "name", value: (row) => row.name },
  { cell: (row) => row.size, header: "Size", key: "size", value: (row) => row.size },
  {
    cell: (row) => row.kind,
    filter: "values",
    header: "Kind",
    key: "kind",
    value: (row) => row.kind,
  },
  { cell: () => "x", header: "Open", key: "open", sorts: false, value: () => "" },
];

const make = (count: number): Row[] =>
  Array.from({ length: count }, (_, index) => ({
    id: String(index),
    kind: index % 3 === 0 ? "policy" : "standard",
    name: `Item ${String(index).padStart(4, "0")}`,
    size: (index * 7) % 101,
  }));

const setup = (rows: Row[], entry = "/", options = {}) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>
  );
  return renderHook(
    () => ({
      location: useLocation(),
      navigation: useNavigationType(),
      table: useDataTable({
        columns,
        rows,
        search: (row) => `${row.name} ${row.kind}`,
        ...options,
      }),
    }),
    { wrapper },
  );
};

describe("useDataTable", () => {
  it("pages 700 rows at the default size and reports the totals", () => {
    const { result } = setup(make(700));
    expect(result.current.table.total).toBe(700);
    expect(result.current.table.pageSize).toBe(20);
    expect(result.current.table.pageCount).toBe(35);
    expect(result.current.table.pageRows).toHaveLength(20);
  });

  it("jumps to a page and keeps it in the address", () => {
    const { result } = setup(make(700));
    act(() => result.current.table.setPage(12));
    expect(result.current.table.page).toBe(12);
    expect(result.current.table.pageRows[0]?.name).toBe("Item 0220");
    expect(result.current.location.search).toContain("page=12");
  });

  it("clamps a page past the end", () => {
    const { result } = setup(make(45), "/?page=99");
    expect(result.current.table.page).toBe(3);
    expect(result.current.table.pageRows).toHaveLength(5);
  });

  it("changes the page size, back to page one", () => {
    const { result } = setup(make(700), "/?page=5");
    act(() => result.current.table.setPageSize(100));
    expect(result.current.table.pageSize).toBe(100);
    expect(result.current.table.pageCount).toBe(7);
    expect(result.current.table.page).toBe(1);
    expect(result.current.location.search).toContain("size=100");
  });

  it("ignores a page size that is not on offer", () => {
    const { result } = setup(make(100), "/?size=7");
    expect(result.current.table.pageSize).toBe(20);
  });

  it("filters live on the search words and resets to page one", () => {
    const { result } = setup(make(700), "/?page=4");
    act(() => result.current.table.setQuery("item 0042"));
    expect(result.current.table.total).toBe(1);
    expect(result.current.table.page).toBe(1);
    expect(result.current.table.pageRows[0]?.name).toBe("Item 0042");
    expect(result.current.location.search).toContain("q=item");
  });

  it("filters by one value of a column", () => {
    const { result } = setup(make(30));
    act(() => result.current.table.setColumnFilter("kind", "policy"));
    expect(result.current.table.total).toBe(10);
    expect(result.current.table.columnFilters).toEqual({ kind: "policy" });
  });

  it("lists the values a column holds, for its filter", () => {
    const { result } = setup(make(30));
    expect(result.current.table.valuesOf("kind")).toEqual(["policy", "standard"]);
  });

  it("sorts ascending, then descending, then off, by a header", () => {
    const { result } = setup(make(50));
    act(() => result.current.table.toggleSort("size"));
    expect(result.current.table.sort).toEqual({ dir: "asc", key: "size" });
    const sizes = result.current.table.pageRows.map((row) => row.size);
    expect(sizes).toEqual([...sizes].toSorted((a, b) => a - b));
    act(() => result.current.table.toggleSort("size"));
    expect(result.current.table.sort).toEqual({ dir: "desc", key: "size" });
    expect(result.current.table.pageRows[0]?.size).toBeGreaterThanOrEqual(
      result.current.table.pageRows[1]?.size ?? 0,
    );
    act(() => result.current.table.toggleSort("size"));
    expect(result.current.table.sort).toBeNull();
  });

  it("sorts text the way people read it, numbers as numbers", () => {
    const rows: Row[] = [
      { id: "1", kind: "a", name: "b2", size: 10 },
      { id: "2", kind: "a", name: "b10", size: 9 },
      { id: "3", kind: "a", name: "a1", size: 100 },
    ];
    const { result } = setup(rows, "/?sort=name");
    expect(result.current.table.pageRows.map((row) => row.name)).toEqual(["a1", "b2", "b10"]);
    act(() => result.current.table.toggleSort("size"));
    expect(result.current.table.pageRows.map((row) => row.size)).toEqual([9, 10, 100]);
  });

  it("does not sort a column that opts out", () => {
    const { result } = setup(make(5));
    act(() => result.current.table.toggleSort("open"));
    expect(result.current.table.sort).toBeNull();
  });

  it("applies the default sort until the person picks another", () => {
    const { result } = setup(make(5), "/", { defaultSort: { dir: "desc", key: "name" } });
    expect(result.current.table.sort).toEqual({ dir: "desc", key: "name" });
    expect(result.current.table.pageRows[0]?.name).toBe("Item 0004");
  });

  it("groups, ordering whole groups ahead of the sort, so a page never splits a heading", () => {
    const { result } = setup(make(30), "/?groupby=kind&size=10");
    const { groups } = result.current.table;
    expect(groups?.map((group) => group.key)).toEqual(["policy"]);
    expect(groups?.[0]?.rows).toHaveLength(10);
    act(() => result.current.table.setPage(2));
    expect(result.current.table.groups?.map((group) => group.key)).toEqual(["standard"]);
  });

  it("has no groups unless grouped", () => {
    const { result } = setup(make(5));
    expect(result.current.table.groups).toBeUndefined();
  });

  it("clears the search, the column filters and the page, but keeps the sort", () => {
    const { result } = setup(make(100), "/?q=item&f.kind=policy&page=2&sort=size");
    act(() => result.current.table.clear());
    expect(result.current.location.search).toBe("?sort=size");
  });
});

const arguments_ = (from: string, to: string, extra: object = {}) =>
  ({
    currentUrl: new URL(from, "https://x.example"),
    defaultShouldRevalidate: true,
    nextUrl: new URL(to, "https://x.example"),
    ...extra,
  }) as unknown as ShouldRevalidateFunctionArgs;

describe("the table's address state and the route that holds it", () => {
  it("does not reload the route when only the table's own parameters change", () => {
    expect(shouldRevalidateTable(arguments_("/a", "/a?q=x"))).toBe(false);
    expect(shouldRevalidateTable(arguments_("/a?q=x", "/a?q=xy&sort=name&dir=desc&page=2"))).toBe(
      false,
    );
    expect(shouldRevalidateTable(arguments_("/a", "/a?size=50&groupby=kind&f.kind=policy"))).toBe(
      false,
    );
  });

  it("reloads when anything else changes, or the path, or a form was sent", () => {
    expect(shouldRevalidateTable(arguments_("/a", "/a?q=x&deleted=1"))).toBe(true);
    expect(shouldRevalidateTable(arguments_("/a?filter=mine", "/a?filter=all"))).toBe(true);
    expect(shouldRevalidateTable(arguments_("/a", "/b?q=x"))).toBe(true);
    expect(shouldRevalidateTable(arguments_("/a", "/a?q=x", { formMethod: "POST" }))).toBe(true);
  });

  it("replaces the history entry while typing, but a page change is a step of its own", () => {
    const { result } = setup(make(100));
    act(() => result.current.table.setQuery("i"));
    expect(result.current.navigation).toBe("REPLACE");
    act(() => result.current.table.setPage(2));
    expect(result.current.navigation).toBe("PUSH");
  });
});

describe("the search text", () => {
  it("shows what was typed at once, whatever the address has caught up to", () => {
    const { result } = setup(make(100));
    act(() => result.current.table.setQuery("it"));
    expect(result.current.table.query).toBe("it");
    act(() => result.current.table.setQuery("ite"));
    expect(result.current.table.query).toBe("ite");
  });

  it("follows the address when it changes from somewhere else", () => {
    const { result } = setup(make(100), "/?q=item");
    expect(result.current.table.query).toBe("item");
    act(() => result.current.table.setQuery("it"));
    act(() => result.current.table.clear());
    expect(result.current.table.query).toBe("");
    expect(result.current.location.search).toBe("");
  });
});
