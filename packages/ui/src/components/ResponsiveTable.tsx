// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { ChevronRight } from "lucide-react";
import { Fragment, type ReactNode, useState } from "react";

import { Table, TD, TH, THead } from "#ui/components/Display";
import { Input } from "#ui/components/Input";
import { cn } from "#ui/lib/cn";
import { PHONE, useMediaQuery } from "#ui/lib/media";

/** Where a column's cell goes on a phone's card: the bold title (one column), the muted meta
 *  line, the row of status pills, the actions along the foot, or nowhere. */
export type CardSlot = "action" | "hidden" | "meta" | "status" | "title";

export interface ResponsiveColumn<Row> {
  card: CardSlot;
  cell: (row: Row) => ReactNode;
  /** The wide table's cell class; the phone's card doesn't use it. */
  className?: string;
  header: ReactNode;
  key: string;
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
  rowClassName?: (row: Row) => string | undefined;
  rowKey: (row: Row) => string;
  rows: readonly Row[];
  /** A search field above the cards on a phone, matching the words in `text(row)`. */
  search?: { label: string; placeholder?: string; text: (row: Row) => string };
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
export const ResponsiveTable = <Row,>({
  className,
  columns,
  empty,
  framed = false,
  hideHeader = false,
  label,
  rowClassName,
  rowKey,
  rows,
  search,
}: ResponsiveTableProps<Row>) => {
  const { t } = useTranslation("common");
  const phone = useMediaQuery(PHONE);
  const [query, setQuery] = useState("");

  if (rows.length === 0) return <>{empty}</>;

  if (!phone) {
    const table = (
      <Table aria-label={label} className={className}>
        <THead className={hideHeader ? "sr-only" : undefined}>
          <tr>
            {columns.map((column) => (
              <TH key={column.key}>{column.header}</TH>
            ))}
          </tr>
        </THead>
        <tbody>
          {rows.map((row) => (
            <tr className={rowClassName?.(row)} key={rowKey(row)}>
              {columns.map((column) => (
                <TD className={column.className} key={column.key}>
                  {column.cell(row)}
                </TD>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    );
    return framed ? (
      <div className="overflow-hidden rounded-[10px] border border-border bg-surface">{table}</div>
    ) : (
      table
    );
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
        <Input
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
