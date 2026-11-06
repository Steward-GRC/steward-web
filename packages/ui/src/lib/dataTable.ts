// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  type ColumnDef,
  type FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingFn,
  useReactTable,
} from "@tanstack/react-table";
import { type ReactNode, useMemo } from "react";
import { type ShouldRevalidateFunctionArgs, useSearchParams } from "react-router";

/** One column of a data table. The same column feeds the table's header, its cells, the sort,
 *  the filter and the group, whether the rows draw as a table or as cards. */
export interface DataColumn<Row> {
  /** The cell's content. */
  cell: (row: Row) => ReactNode;
  /** Extra classes for the column's cells. */
  className?: string;
  /** "text" filters on words typed under the header; "values" on one of the values it holds. */
  filter?: "text" | "values";
  header: string;
  key: string;
  /** False for a column that doesn't sort (actions, pills). Sorts by default. */
  sorts?: boolean;
  /** The column's plain value: what sorts, filters and groups. Numbers sort as numbers. */
  value: (row: Row) => number | string;
}

export interface DataGroup<Row> {
  key: string;
  /** The group's rows on this page. */
  rows: Row[];
  /** The group's size across every page, after the filters. */
  total: number;
}

export interface DataSort {
  dir: "asc" | "desc";
  key: string;
}

export interface UseDataTableOptions<Row> {
  columns: readonly DataColumn<Row>[];
  defaultPageSize?: number;
  /** Used until the person picks a sort. `null` leaves the rows in the order given. */
  defaultSort?: DataSort | null;
  pageSizes?: readonly number[];
  /** Puts this table's address parameters under a prefix ("a-sort"), for a second table on the
   *  same page. */
  prefix?: string;
  rows: readonly Row[];
  /** The words the search box matches. Defaults to every column's value. */
  search?: (row: Row) => string;
}

export const DEFAULT_PAGE_SIZES = [10, 20, 50, 100] as const;

const GROUP_COLUMN = "__group";
const NATURAL = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

const sortValue: SortingFn<unknown> = (a, b, id) => {
  const left = a.getValue<number | string>(id);
  const right = b.getValue<number | string>(id);
  if (typeof left === "number" && typeof right === "number") return left - right;
  return NATURAL.compare(String(left), String(right));
};

const parameterName = (prefix: string, key: string) => (prefix ? `${prefix}-${key}` : key);

/** The address's parameter for a column's filter ("f.title"), as in the library. */
export const columnFilterParameter = (key: string) => `f.${key}`;

/**
 * The shared table's engine: TanStack Table (sorting, filtering, pagination) driven by the
 * address, so a refresh or a shared link keeps the search, filters, sort, group, page and page
 * size (`q`, `f.<column>`, `sort`, `dir`, `groupby`, `page`, `size`). It renders nothing; a table
 * and a card list both read it.
 *
 * Grouping orders whole groups ahead of the sort, so a page slices through the groups in order
 * and `groups` is the page's rows split under their headings.
 */
export const useDataTable = <Row>(options: UseDataTableOptions<Row>) => {
  const [parameters, setParameters] = useSearchParams();
  return useDataTableState(options, parameters, (next, replace) =>
    setParameters(next, { preventScrollReset: true, replace }),
  );
};

/** The engine over any URLSearchParams state: the address (`useDataTable`) or, outside a router,
 *  the component's own. */
export const useDataTableState = <Row>(
  {
    columns,
    defaultPageSize = 20,
    defaultSort = null,
    pageSizes = DEFAULT_PAGE_SIZES,
    prefix = "",
    rows,
    search,
  }: UseDataTableOptions<Row>,
  parameters: URLSearchParams,
  setParameters: (next: URLSearchParams, replace: boolean) => void,
) => {
  const name = (key: string) => parameterName(prefix, key);

  const query = parameters.get(name("q")) ?? "";
  const group = parameters.get(name("groupby")) ?? "";
  const requestedSize = Number(parameters.get(name("size")));
  const pageSize = pageSizes.includes(requestedSize) ? requestedSize : defaultPageSize;

  const sortable = (key: string) => columns.some((c) => c.key === key && c.sorts !== false);
  const sortKey = parameters.get(name("sort"));
  let sort: DataSort | null = null;
  if (sortKey === null) sort = defaultSort;
  else if (sortable(sortKey)) {
    sort = { dir: parameters.get(name("dir")) === "desc" ? "desc" : "asc", key: sortKey };
  }

  const columnFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    for (const column of columns) {
      const value = parameters.get(parameterName(prefix, columnFilterParameter(column.key)));
      if (column.filter && value) filters[column.key] = value;
    }
    return filters;
  }, [columns, parameters, prefix]);

  const groupColumn = columns.find((c) => c.key === group);

  const definitions = useMemo<ColumnDef<Row>[]>(() => {
    const own = columns.map<ColumnDef<Row>>((column) => ({
      accessorFn: (row) => column.value(row),
      enableSorting: column.sorts !== false,
      filterFn: ((row, id, value: string) => {
        const text = String(row.getValue(id));
        return column.filter === "values"
          ? text === value
          : text.toLowerCase().includes(value.toLowerCase());
      }) as FilterFn<Row>,
      id: column.key,
      sortingFn: sortValue as SortingFn<Row>,
    }));
    return [
      ...own,
      {
        accessorFn: (row) => (groupColumn ? groupColumn.value(row) : ""),
        id: GROUP_COLUMN,
        sortingFn: sortValue as SortingFn<Row>,
      },
    ];
  }, [columns, groupColumn]);

  const globalFilterFunction = useMemo<FilterFn<Row>>(
    () => (row, _id, value: string) => {
      const words = value.toLowerCase().split(/\s+/).filter(Boolean);
      const text = (
        search ? search(row.original) : columns.map((c) => String(c.value(row.original))).join(" ")
      ).toLowerCase();
      return words.every((word) => text.includes(word));
    },
    [columns, search],
  );

  const requestedPage = Math.max(1, Math.floor(Number(parameters.get(name("page")))) || 1);

  const table = useReactTable<Row>({
    autoResetPageIndex: false,
    columns: definitions,
    data: rows as Row[],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: globalFilterFunction,
    state: {
      columnFilters: Object.entries(columnFilters).map(([id, value]) => ({ id, value })),
      globalFilter: query,
      pagination: { pageIndex: requestedPage - 1, pageSize },
      sorting: [
        ...(groupColumn ? [{ desc: false, id: GROUP_COLUMN }] : []),
        ...(sort ? [{ desc: sort.dir === "desc", id: sort.key }] : []),
      ],
    },
  });

  const sorted = table.getSortedRowModel().rows;
  const filteredRows = table.getFilteredRowModel().rows;
  const total = filteredRows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const pageRows = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize).map((r) => r.original),
    [sorted, page, pageSize],
  );

  const groups = useMemo<DataGroup<Row>[] | undefined>(() => {
    if (!groupColumn) return;
    const totals = new Map<string, number>();
    for (const row of filteredRows) {
      const key = String(groupColumn.value(row.original));
      totals.set(key, (totals.get(key) ?? 0) + 1);
    }
    const out: DataGroup<Row>[] = [];
    for (const row of pageRows) {
      const key = String(groupColumn.value(row));
      const last = out.at(-1);
      if (last?.key === key) last.rows.push(row);
      else out.push({ key, rows: [row], total: totals.get(key) ?? 1 });
    }
    return out;
  }, [filteredRows, groupColumn, pageRows]);

  /** Applies address changes. Anything but the page itself puts the list back on page one. */
  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(parameters);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(name(key), value);
      else next.delete(name(key));
    }
    if (!("page" in changes)) next.delete(name("page"));
    // Only a change of page is a step in the history; typing, sorting and filtering replace it.
    setParameters(next, !("page" in changes));
  };

  return {
    clear: () => {
      const changes: Record<string, string> = { q: "" };
      for (const column of columns) changes[columnFilterParameter(column.key)] = "";
      update(changes);
    },
    columnFilters,
    columns,
    group,
    groups,
    page,
    pageCount,
    pageRows,
    pageSize,
    pageSizes,
    query,
    setColumnFilter: (key: string, value: string) =>
      update({ [columnFilterParameter(key)]: value }),
    setGroup: (key: string) => update({ groupby: key }),
    setPage: (next: number) => update({ page: next > 1 ? String(next) : "" }),
    setPageSize: (size: number) => update({ size: size === defaultPageSize ? "" : String(size) }),
    setQuery: (value: string) => update({ q: value }),
    setSort: (key: string, direction: "asc" | "desc") => {
      if (sortable(key)) update({ dir: direction === "desc" ? "desc" : "", sort: key });
    },
    sort,
    toggleSort: (key: string) => {
      if (!sortable(key)) return;
      if (sort?.key !== key) update({ dir: "", sort: key });
      else if (sort.dir === "asc") update({ dir: "desc", sort: key });
      else update({ dir: "", sort: "" });
    },
    total,
    /** The distinct values a column holds, in reading order, for its value filter. */
    valuesOf: (key: string) => {
      const column = columns.find((c) => c.key === key);
      if (!column) return [];
      return [...new Set(rows.map((row) => String(column.value(row))))].toSorted((a, b) =>
        NATURAL.compare(a, b),
      );
    },
  };
};

/** The address parameters the table owns, with or without a prefix on them. */
const TABLE_KEYS = /^(?:[\w]+-)?(?:q|sort|dir|page|size|groupby|f\..+)$/;

const withoutTableKeys = (url: URL): string => {
  const rest = new URLSearchParams();
  for (const [key, value] of url.searchParams) if (!TABLE_KEYS.test(key)) rest.append(key, value);
  rest.sort();
  return rest.toString();
};

/**
 * A route's `shouldRevalidate` for a page with a shared table: a change to only the table's own
 * address parameters (search, filters, sort, page, page size, group) is the page's own
 * business, so the route's loader isn't run again for it. Anything else, another path, another
 * parameter or a submitted form, loads as it would have.
 */
export const shouldRevalidateTable = ({
  currentUrl,
  defaultShouldRevalidate,
  formMethod,
  nextUrl,
}: ShouldRevalidateFunctionArgs): boolean => {
  if (formMethod && formMethod.toUpperCase() !== "GET") return defaultShouldRevalidate;
  if (currentUrl.pathname !== nextUrl.pathname) return defaultShouldRevalidate;
  if (withoutTableKeys(currentUrl) !== withoutTableKeys(nextUrl)) return defaultShouldRevalidate;
  return false;
};
