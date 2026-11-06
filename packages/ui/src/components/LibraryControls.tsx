// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatNumber, useTranslation } from "@steward-web/i18n";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useId } from "react";

import { cn } from "#ui/lib/cn";

export interface CategoryTile {
  count: number;
  name: string;
  subcategories: readonly string[];
}

/**
 * The library's category tiles (U3; decision 4-components.s7): a 4-column grid, each tile the
 * category's name with its count in mono and its subcategories as chips. The name and each
 * chip filter the library.
 */
export const CategoryTiles = ({
  categories,
  onCategory,
  onSubcategory,
}: {
  categories: readonly CategoryTile[];
  onCategory: (name: string) => void;
  onSubcategory: (category: string, subcategory: string) => void;
}) => (
  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {categories.map((category) => (
      <CategoryTileCard
        category={category}
        key={category.name}
        onCategory={onCategory}
        onSubcategory={onSubcategory}
      />
    ))}
  </ul>
);

const CategoryTileCard = ({
  category,
  onCategory,
  onSubcategory,
}: {
  category: CategoryTile;
  onCategory: (name: string) => void;
  onSubcategory: (category: string, subcategory: string) => void;
}) => {
  const nameId = useId();
  return (
    <li
      aria-labelledby={nameId}
      className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface px-4 py-3.5 shadow-[var(--shadow-1)]"
    >
      <div className="flex items-baseline justify-between gap-2">
        <button
          className="text-left text-md font-semibold text-ink hover:text-primary hover:underline"
          id={nameId}
          onClick={() => onCategory(category.name)}
          type="button"
        >
          {category.name}
        </button>
        <span className="font-mono text-sm text-muted">{formatNumber(category.count)}</span>
      </div>
      {category.subcategories.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {category.subcategories.map((subcategory) => (
            <button
              className="flex h-[26px] items-center rounded-sm bg-sunken px-[9px] text-xs font-medium text-ink hover:bg-primary-soft hover:text-on-primary-soft"
              key={subcategory}
              onClick={() => onSubcategory(category.name, subcategory)}
              type="button"
            >
              {subcategory}
            </button>
          ))}
        </div>
      ) : null}
    </li>
  );
};

export interface FilterChip {
  id: string;
  label: string;
}

/** "Filtered by" with a removable plum chip per filter, "· 3 results" and Clear (U3). */
export const FilterBar = ({
  chips,
  className,
  count,
  onClear,
  onRemove,
}: {
  chips: readonly FilterChip[];
  className?: string;
  count: number;
  onClear: () => void;
  onRemove: (id: string) => void;
}) => {
  const { t } = useTranslation("common");
  const labelId = useId();
  return (
    <section
      aria-labelledby={labelId}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-[8px] bg-surface px-3.5 py-2.5 text-sm shadow-[inset_0_0_0_1px_var(--border)]",
        className,
      )}
    >
      <span className="text-muted" id={labelId}>
        {t("filters.filteredBy")}
      </span>
      {chips.map((chip) => (
        <span
          className="flex h-[26px] items-center gap-1 rounded-full bg-primary-soft pr-1.5 pl-2.5 font-semibold text-on-primary-soft"
          key={chip.id}
        >
          {chip.label}
          <button
            aria-label={t("filters.remove", { label: chip.label })}
            className="flex size-4 items-center justify-center rounded-full hover:bg-surface"
            onClick={() => onRemove(chip.id)}
            type="button"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        </span>
      ))}
      <span className="text-muted">{t("filters.results", { count })}</span>
      <button
        className="ml-auto font-semibold text-primary hover:text-primary-hover hover:underline"
        onClick={onClear}
        type="button"
      >
        {t("filters.clear")}
      </button>
    </section>
  );
};

/** A sortable column header: "Title ↑", with aria-sort on the sorted one (U3). */
export const SortHeader = ({
  className,
  direction,
  label,
  onSort,
  sorted,
}: {
  className?: string;
  direction: "asc" | "desc";
  label: string;
  onSort: () => void;
  sorted: boolean;
}) => (
  <th
    aria-sort={sorted ? (direction === "asc" ? "ascending" : "descending") : undefined}
    className={cn(
      "border-b border-border-strong px-3.5 py-2.5 text-left text-sm font-semibold text-muted",
      className,
    )}
  >
    <button
      className="inline-flex items-center gap-1 hover:text-ink"
      onClick={onSort}
      type="button"
    >
      {label}
      {sorted ? <span aria-hidden="true">{direction === "asc" ? " ↑" : " ↓"}</span> : null}
    </button>
  </th>
);

/** The page numbers to show: all of them when there are few, else the first, the last and the
 *  ones beside the current page, with a gap (null) where the rest are. */
const visiblePages = (page: number, pages: number): (null | number)[] => {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  const keep = new Set([1, page, page - 1, page + 1, pages]);
  const out: (null | number)[] = [];
  for (let number = 1; number <= pages; number += 1) {
    if (keep.has(number)) out.push(number);
    else if (out.at(-1) !== null) out.push(null);
  }
  return out;
};

const PICK =
  "h-7 rounded-sm border border-control bg-surface px-1.5 text-sm text-ink hover:bg-sunken";

/**
 * The pager under a table: "1–4 of 4", a few page numbers, "Jump to page" as a dropdown of every
 * page, and "Rows per page" when `pageSizes` is given (U3). Pages count from 1.
 */
export const Pager = ({
  className,
  onPage,
  onPageSize,
  page,
  pageSize,
  pageSizes,
  total,
}: {
  className?: string;
  onPage: (page: number) => void;
  onPageSize?: (size: number) => void;
  page: number;
  pageSize: number;
  pageSizes?: readonly number[];
  total: number;
}) => {
  const { t } = useTranslation("common");
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  return (
    <nav
      aria-label={t("pager.label")}
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3.5 py-2.5 text-sm text-muted",
        className,
      )}
    >
      <span>
        {t("pager.range", {
          first: formatNumber(first),
          last: formatNumber(last),
          total: formatNumber(total),
        })}
      </span>
      <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {pageSizes && onPageSize ? (
          <label className="flex items-center gap-1.5">
            {t("pager.pageSize")}
            <select
              className={PICK}
              onChange={(event) => onPageSize(Number(event.target.value))}
              value={String(pageSize)}
            >
              {pageSizes.map((size) => (
                <option key={size} value={String(size)}>
                  {formatNumber(size)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {pages > 1 ? (
          <label className="flex items-center gap-1.5">
            {t("pager.jump")}
            <select
              className={PICK}
              onChange={(event) => onPage(Number(event.target.value))}
              value={String(page)}
            >
              {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
                <option key={number} value={String(number)}>
                  {formatNumber(number)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <span className="flex items-center gap-1.5">
          <button
            aria-label={t("pager.previous")}
            className="flex size-6 items-center justify-center rounded-sm hover:bg-sunken hover:text-ink disabled:opacity-45"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          {visiblePages(page, pages).map((number, index) =>
            number === null ? (
              <span aria-hidden="true" key={`gap-${index}`}>
                …
              </span>
            ) : (
              <button
                aria-current={number === page ? "page" : undefined}
                aria-label={t("pager.page", { page: number })}
                className={cn(
                  "min-w-6 rounded-sm px-1 hover:bg-sunken hover:text-ink",
                  number === page && "font-bold text-ink",
                )}
                key={number}
                onClick={() => onPage(number)}
                type="button"
              >
                {number}
              </button>
            ),
          )}
          <button
            aria-label={t("pager.next")}
            className="flex size-6 items-center justify-center rounded-sm hover:bg-sunken hover:text-ink disabled:opacity-45"
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </span>
      </span>
    </nav>
  );
};
