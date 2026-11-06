// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { Fragment, type ReactNode, useState } from "react";
import { useInRouterContext } from "react-router";

import { Card, Table, TD, TH, THead } from "#ui/components/Display";
import { SearchInput } from "#ui/components/SearchInput";
import { ListSkeleton } from "#ui/feedback/States";
import { cn } from "#ui/lib/cn";
import {
  type DataColumn,
  type DataSort,
  useDataTableState,
  useMirroredSearchParameters,
} from "#ui/lib/dataTable";
import { PHONE, useMediaQuery } from "#ui/lib/media";

import { Pager } from "./LibraryControls";
import { type RowAction, RowMenu } from "./RowMenu";

/** Where a column's cell goes on a phone's card: the bold title (one column), the muted meta
 *  line, the row of status pills, the actions along the foot, or nowhere. */
export type CardSlot = "action" | "hidden" | "meta" | "status" | "title";

export interface ResponsiveColumn<Row> {
  card: CardSlot;
  cell: (row: Row) => ReactNode;
  /** The wide table's cell class; the phone's card doesn't use it. */
  className?: string;
  /** A filter under the column: words typed, or one of the values it holds. */
  filter?: "text" | "values";
  header: ReactNode;
  key: string;
  /** False keeps a column with a value from sorting. */
  sorts?: boolean;
  /** The column's plain value. A column with one sorts from its header and filters; a table
   *  with any such column also pages, jumps, and filters as you type. */
  value?: (row: Row) => number | string;
}

export interface ResponsiveTableProps<Row> {
  /** The wide table's own class (`aria-label` and the kit's `table` classes stay). */
  className?: string;
  columns: readonly ResponsiveColumn<Row>[];
  /** Shown instead of the table, or the cards, when there are no rows at all. */
  empty: ReactNode;
  /** The wide table inside the surface card with a 1 px border and 10 px corners, as A12 draws
   *  it. */
  framed?: boolean;
  /** Keeps the header row for screen readers only, for a list the frame draws without one
   *  (A14's roster). */
  hideHeader?: boolean;
  /** The table's and the card list's accessible name. */
  label: string;
  /** True while the rows load: the animated skeleton shows in their place once the load is
   *  slow, and neither the rows nor the empty state show. */
  loading?: boolean;
  /** The table's own entries in the row's right-click menu, after the link ones. */
  rowActions?: (row: Row) => readonly RowAction[];
  rowClassName?: (row: Row) => string | undefined;
  /** The row's address: the right-click menu offers Open, Open in new tab and Copy link. */
  rowHref?: (row: Row) => string | undefined;
  rowKey: (row: Row) => string;
  rows: readonly Row[];
  /** A search field above the cards on a phone, matching the words in `text(row)`. */
  search?: { label: string; placeholder?: string; text: (row: Row) => string };
  /** Every second row in the stripe shade, for a dense log (the audit log). */
  striped?: boolean;
}

/** Nothing to show: React renders these as nothing, so the card leaves them out too. */
const BLANK: ReadonlySet<ReactNode> = new Set(["", false, null, undefined]);
const blank = (node: ReactNode) => BLANK.has(node);

/**
 * A table that becomes stacked cards on a phone (decision 7-responsive-and-accessibility.s3).
 * On a wide screen it's the kit's `Table` with `THead`, `TH` and `TD`, the markup the admin
 * tables had. Below `PHONE` it's a search field and a list of cards drawn like the staff
 * library's (U3m): the title column bold with a chevron (the whole card opens it when it's a
 * link), the meta columns as one muted line, the status pills on their own row, and the actions
 * along the foot.
 */
const PlainTable = <Row,>({
  className,
  columns,
  empty,
  framed = false,
  hideHeader = false,
  label,
  onSort,
  rowActions,
  rowClassName,
  rowHref,
  rowKey,
  rows,
  search,
  sort,
  striped,
}: ResponsiveTableProps<Row> & { onSort?: (key: string) => void; sort?: DataSort | null }) => {
  const { t } = useTranslation("common");
  const phone = useMediaQuery(PHONE);
  const [query, setQuery] = useState("");

  if (rows.length === 0) return <>{empty}</>;

  if (!phone) {
    const table = (
      <Table aria-label={label} className={className} striped={striped}>
        <THead className={hideHeader ? "sr-only" : undefined}>
          <tr>
            {columns.map((column) => (
              <SortableTH column={column} key={column.key} onSort={onSort} sort={sort} />
            ))}
          </tr>
        </THead>
        <tbody>
          {rows.map((row) => (
            <RowMenu actions={rowActions?.(row)} href={rowHref?.(row)} key={rowKey(row)}>
              <tr className={rowClassName?.(row)}>
                {columns.map((column) => (
                  <TD className={column.className} key={column.key}>
                    {column.cell(row)}
                  </TD>
                ))}
              </tr>
            </RowMenu>
          ))}
        </tbody>
      </Table>
    );
    return framed ? <Card>{table}</Card> : table;
  }

  const slot = (card: CardSlot) => columns.filter((column) => column.card === card);
  const title = slot("title")[0];
  const meta = slot("meta");
  const status = slot("status");
  const actions = slot("action");

  const words = query.trim().toLowerCase();
  const shown =
    search && words ? rows.filter((row) => search.text(row).toLowerCase().includes(words)) : rows;

  return (
    <div className="flex flex-col gap-3">
      {search ? (
        <SearchInput
          aria-label={search.label}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={search.placeholder}
          type="search"
          value={query}
        />
      ) : null}
      {shown.length === 0 ? (
        <p className="text-base text-muted">{t("table.noMatches", { query: query.trim() })}</p>
      ) : (
        <ul aria-label={label} className="flex flex-col gap-3">
          {shown.map((row) => {
            const metaCells = meta
              .map((column) => ({ key: column.key, node: column.cell(row) }))
              .filter(({ node }) => !blank(node));
            const statusCells = status.map((column) => ({
              key: column.key,
              node: column.cell(row),
            }));
            const actionCells = actions
              .map((column) => ({ key: column.key, node: column.cell(row) }))
              .filter(({ node }) => !blank(node));
            return (
              // U3m: a surface card, 1 px border, 10 px corners, 12 × 14 px padding, 6 px gaps.
              // A linked title stretches over the whole card, as U3m's card is one link; the
              // links and buttons in the rows below it, and the actions, sit above that.
              <li
                className={cn(
                  "relative flex flex-col gap-1.5 rounded-[10px] border border-border bg-surface px-3.5 py-3 text-base text-ink has-[[data-card-title]_a]:hover:bg-sunken",
                  rowClassName?.(row),
                )}
                key={rowKey(row)}
              >
                {title ? (
                  <div className="group/title flex items-center justify-between gap-2">
                    <span
                      className="min-w-0 font-semibold break-words [&_a]:font-semibold [&_a]:text-ink [&_a]:no-underline [&_a]:after:absolute [&_a]:after:inset-0 [&_a]:after:rounded-[10px] [&_a]:after:content-['']"
                      data-card-title=""
                    >
                      {title.cell(row)}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="hidden size-4 flex-none text-muted group-has-[a]/title:block"
                    />
                  </div>
                ) : null}
                {metaCells.length > 0 ? (
                  // One 12 px muted line, whatever size the wide table's cells use.
                  <p className="min-w-0 text-xs break-words text-muted [&_*]:text-xs [&_a]:relative [&_button]:relative">
                    {metaCells.map(({ key, node }, index) => (
                      <Fragment key={key}>
                        {index > 0 ? <span aria-hidden="true"> · </span> : null}
                        {node}
                      </Fragment>
                    ))}
                  </p>
                ) : null}
                {statusCells.some(({ node }) => !blank(node)) ? (
                  <div className="flex flex-wrap items-center gap-1.5 [&_a]:relative [&_button]:relative">
                    {statusCells.map(({ key, node }) => (
                      <Fragment key={key}>{node}</Fragment>
                    ))}
                  </div>
                ) : null}
                {actionCells.length > 0 ? (
                  <div className="relative flex flex-wrap items-center gap-2 pt-1">
                    {actionCells.map(({ key, node }) => (
                      <Fragment key={key}>{node}</Fragment>
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const sortable = <Row,>(column: ResponsiveColumn<Row>) =>
  column.value !== undefined && column.sorts !== false;

/** A header cell: plain text, or a button that sorts the column, with aria-sort on the sorted. */
const SortableTH = <Row,>({
  column,
  onSort,
  sort,
}: {
  column: ResponsiveColumn<Row>;
  onSort?: (key: string) => void;
  sort?: DataSort | null;
}) => {
  if (!onSort || !sortable(column)) return <TH>{column.header}</TH>;
  const active = sort?.key === column.key ? sort.dir : undefined;
  return (
    <TH aria-sort={active ? (active === "asc" ? "ascending" : "descending") : undefined}>
      <button
        className="inline-flex items-center gap-1 font-semibold hover:text-primary"
        onClick={() => onSort(column.key)}
        type="button"
      >
        {column.header}
        {active ? (
          active === "asc" ? (
            <ArrowUp aria-hidden="true" className="size-3.5" />
          ) : (
            <ArrowDown aria-hidden="true" className="size-3.5" />
          )
        ) : null}
      </button>
    </TH>
  );
};

type Props<Row> = ResponsiveTableProps<Row>;

const LoadingRows = () => {
  const { t } = useTranslation("common");
  return <ListSkeleton label={t("status.loading")} />;
};

/**
 * The shared table. Columns with a `value` sort from their headers, and the table pages with a
 * jump-to-page dropdown and a page-size choice and filters as you type, all kept in the address
 * (TanStack Table underneath, in `useDataTable`). A table with no such column renders as it
 * always has. Outside a router the state lives in the component.
 */
export const ResponsiveTable = <Row,>(props: Props<Row>) => {
  const inRouter = useInRouterContext();
  if (props.loading) return <LoadingRows />;
  if (!props.columns.some((column) => column.value)) return <PlainTable {...props} />;
  return inRouter ? <RoutedData {...props} /> : <LocalData {...props} />;
};

const RoutedData = <Row,>(props: Props<Row>) => {
  const [parameters, setParameters] = useMirroredSearchParameters();
  return <DataTableView {...props} parameters={parameters} setParameters={setParameters} />;
};

const LocalData = <Row,>(props: Props<Row>) => {
  const [parameters, setParameters] = useState(() => new URLSearchParams());
  return (
    <DataTableView
      {...props}
      parameters={parameters}
      setParameters={(next) => setParameters(next)}
    />
  );
};

const DataTableView = <Row,>({
  parameters,
  setParameters,
  ...props
}: Props<Row> & {
  parameters: URLSearchParams;
  setParameters: (next: URLSearchParams, replace: boolean) => void;
}) => {
  const { t } = useTranslation("common");
  const phone = useMediaQuery(PHONE);
  const dataColumns: DataColumn<Row>[] = props.columns.map((column) => ({
    cell: column.cell,
    filter: column.filter,
    header: typeof column.header === "string" ? column.header : column.key,
    key: column.key,
    sorts: sortable(column),
    value: column.value ?? (() => ""),
  }));
  const table = useDataTableState(
    {
      columns: dataColumns,
      rows: props.rows,
      search: props.search ? (row) => props.search!.text(row) : undefined,
    },
    parameters,
    setParameters,
  );
  const smallest = table.pageSizes[0] ?? 10;
  const searchable = props.rows.length > smallest || props.search !== undefined;
  const filtering = table.query.trim() !== "" || Object.keys(table.columnFilters).length > 0;
  const sortOptions = props.columns.filter(sortable).flatMap((column) => [
    { label: `${column.header} ↑`, value: `${column.key}:asc` },
    { label: `${column.header} ↓`, value: `${column.key}:desc` },
  ]);

  return (
    <div className="flex flex-col gap-3">
      {searchable || (phone && sortOptions.length > 0) ? (
        <div className="flex flex-wrap items-center gap-2">
          {phone && sortOptions.length > 0 ? (
            <select
              aria-label={t("table.sortBy")}
              className="h-9 rounded-md border border-control bg-surface px-2 text-base text-ink"
              onChange={(event) => {
                const [key, direction] = event.target.value.split(":");
                if (key) table.setSort(key, direction === "desc" ? "desc" : "asc");
              }}
              value={table.sort ? `${table.sort.key}:${table.sort.dir}` : ""}
            >
              <option value="">{t("table.sortBy")}</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}
          {searchable ? (
            <SearchInput
              aria-label={props.search?.label ?? t("table.search")}
              onChange={(event) => table.setQuery(event.target.value)}
              placeholder={props.search?.placeholder}
              type="search"
              value={table.query}
              wrapperClassName="max-w-sm flex-1"
            />
          ) : null}
        </div>
      ) : null}
      {table.total === 0 && filtering ? (
        <p className="text-base text-muted">
          {t("table.noMatches", { query: table.query.trim() })}
        </p>
      ) : (
        <PlainTable
          {...props}
          onSort={table.toggleSort}
          rows={table.pageRows}
          search={undefined}
          sort={table.sort}
        />
      )}
      {table.total > smallest ? (
        <Pager
          onPage={table.setPage}
          onPageSize={table.setPageSize}
          page={table.page}
          pageSize={table.pageSize}
          pageSizes={table.pageSizes}
          total={table.total}
        />
      ) : null}
    </div>
  );
};
