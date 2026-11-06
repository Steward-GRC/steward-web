// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { type DataColumn, DEFAULT_PAGE_SIZES, Input, Pager, useDataTable } from "@steward-web/ui";
import { Link } from "react-router";

import type { WorkRow } from "./myWork.server";

const PICK = "h-9 rounded-md border border-control bg-surface px-2 text-base text-ink";
const rowAction =
  "flex h-[34px] flex-none items-center rounded-md bg-primary px-3 text-sm font-semibold text-on-primary hover:bg-primary-hover hover:text-on-primary";

/**
 * The To acknowledge list (bug log item 22): cards, not a table, but with a table's engine
 * underneath, so a few hundred pending policies can be filtered as you type, narrowed to a
 * category, grouped, sorted and paged. State is in the address. A short list shows as plain
 * cards with none of the controls.
 */
export const AcknowledgeList = ({ label, rows }: { label: string; rows: readonly WorkRow[] }) => {
  const { t } = useTranslation("approvals");
  const none = t("toAcknowledge.uncategorised");
  const columns: DataColumn<WorkRow>[] = [
    {
      cell: (row) => row.title,
      header: t("toAcknowledge.sort.titleAsc"),
      key: "title",
      value: (row) => row.title,
    },
    {
      cell: (row) => row.number,
      header: t("toAcknowledge.sort.numberAsc"),
      key: "number",
      value: (row) => row.number,
    },
    {
      cell: (row) => row.category ?? none,
      filter: "values",
      header: t("toAcknowledge.category"),
      key: "category",
      value: (row) => row.category ?? none,
    },
  ];
  const table = useDataTable({
    columns,
    defaultSort: { dir: "asc", key: "title" },
    rows,
    search: (row) => `${row.title} ${row.number}`,
  });
  const smallest = DEFAULT_PAGE_SIZES[0];
  const controls = rows.length > smallest;
  const categories = table.valuesOf("category");

  const card = (row: WorkRow) => (
    <li
      className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
      key={row.href}
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <b className="font-semibold">{row.title}</b>
        <span className="font-mono text-xs text-muted">
          {t("toAcknowledge.meta", { number: row.number, version: row.version })}
        </span>
      </span>
      <Link className={rowAction} to={row.href}>
        {t("toAcknowledge.action")}
      </Link>
    </li>
  );

  return (
    <>
      {controls ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <Input
            aria-label={t("toAcknowledge.search")}
            className="max-w-sm flex-1"
            onChange={(event) => table.setQuery(event.target.value)}
            placeholder={t("toAcknowledge.search")}
            type="search"
            value={table.query}
          />
          <select
            aria-label={t("toAcknowledge.category")}
            className={PICK}
            onChange={(event) => table.setColumnFilter("category", event.target.value)}
            value={table.columnFilters.category ?? ""}
          >
            <option value="">{t("toAcknowledge.allCategories")}</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            aria-label={t("toAcknowledge.group")}
            className={PICK}
            onChange={(event) => table.setGroup(event.target.value)}
            value={table.group}
          >
            <option value="">{t("toAcknowledge.groupNone")}</option>
            <option value="category">{t("toAcknowledge.category")}</option>
          </select>
          <select
            aria-label={t("toAcknowledge.sortBy")}
            className={PICK}
            onChange={(event) => {
              const [key, direction] = event.target.value.split(":");
              if (key) table.setSort(key, direction === "desc" ? "desc" : "asc");
            }}
            value={table.sort ? `${table.sort.key}:${table.sort.dir}` : ""}
          >
            <option value="title:asc">{t("toAcknowledge.sort.titleAsc")}</option>
            <option value="title:desc">{t("toAcknowledge.sort.titleDesc")}</option>
            <option value="number:asc">{t("toAcknowledge.sort.numberAsc")}</option>
            <option value="category:asc">{t("toAcknowledge.sort.category")}</option>
          </select>
        </div>
      ) : null}
      {table.total === 0 ? (
        <p className="px-4 py-4 text-base text-muted">{t("toAcknowledge.noMatches")}</p>
      ) : table.groups ? (
        <ul aria-label={label}>
          {table.groups.map((group) => (
            <li key={group.key}>
              <h3 className="border-b border-border bg-sunken px-4 py-2 text-sm font-semibold text-muted">
                {t("toAcknowledge.groupHeading", { count: group.total, name: group.key })}
              </h3>
              <ul>{group.rows.map(card)}</ul>
            </li>
          ))}
        </ul>
      ) : (
        <ul aria-label={label}>{table.pageRows.map(card)}</ul>
      )}
      {controls ? (
        <Pager
          className="border-t border-border"
          onPage={table.setPage}
          onPageSize={table.setPageSize}
          page={table.page}
          pageSize={table.pageSize}
          pageSizes={table.pageSizes}
          total={table.total}
        />
      ) : null}
    </>
  );
};
