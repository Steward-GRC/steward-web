// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatNumber, useTranslation } from "@steward-web/i18n";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useId, useLayoutEffect, useRef, useState } from "react";

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

/** How many slots the page numbers take, gaps included, once there are more pages than this. */
const SLOTS = 7;

/**
 * The page numbers to show: all of them when there are few, else always SLOTS entries (the first,
 * the last, the ones beside the current page, and a gap, null, where the rest are). The count
 * never changes from one page to the next, so the pager keeps its width and the button someone
 * pressed stays where it was.
 */
const visiblePages = (page: number, pages: number): (null | number)[] => {
  if (pages <= SLOTS) return Array.from({ length: pages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, null, pages];
  if (page >= pages - 3) return [1, null, pages - 4, pages - 3, pages - 2, pages - 1, pages];
  return [1, null, page - 1, page, page + 1, null, pages];
};

/** The nearest ancestor that scrolls, or the page itself. */
const scrollerOf = (element: HTMLElement): { scrollBy: (options: ScrollToOptions) => void } => {
  for (let at = element.parentElement; at; at = at.parentElement) {
    const { overflowY } = getComputedStyle(at);
    if ((overflowY === "auto" || overflowY === "scroll") && at.scrollHeight > at.clientHeight)
      return at;
  }
  return globalThis;
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
  const root = useRef<HTMLElement>(null);
  const pressedAt = useRef<null | number>(null);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  // A new page can have fewer rows, so the table, and the pager under it, would jump up or down
  // away from the button just pressed. After the new rows are in, hold the pager where it was on
  // screen: with space above it while the table is shorter, then by scrolling once that is used.
  const [gap, setGap] = useState(0);
  const gapNow = useRef(0);
  useLayoutEffect(() => {
    const element = root.current;
    const was = pressedAt.current;
    pressedAt.current = null;
    if (!element || was === null) return;
    const delta = element.getBoundingClientRect().top - was;
    if (Math.abs(delta) < 1) return;
    const next = gapNow.current - delta;
    gapNow.current = Math.max(0, next);
    setGap(gapNow.current);
    if (next < 0) scrollerOf(element).scrollBy({ top: -next });
  }, [page, pageSize]);
  // A different set of rows (a filter, a search) starts the table over.
  useLayoutEffect(() => {
    gapNow.current = 0;
    setGap(0);
  }, [total]);
  const keep = (next: () => void) => () => {
    pressedAt.current = root.current?.getBoundingClientRect().top ?? null;
    next();
  };
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  return (
    <nav
      aria-label={t("pager.label")}
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3.5 py-2.5 text-sm text-muted",
        className,
      )}
      ref={root}
      style={gap > 0 ? { marginTop: gap } : undefined}
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
              onChange={(event) => keep(() => onPageSize(Number(event.target.value)))()}
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
              onChange={(event) => keep(() => onPage(Number(event.target.value)))()}
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
            onClick={keep(() => onPage(page - 1))}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          {visiblePages(page, pages).map((number, index) =>
            number === null ? (
              <span
                aria-hidden="true"
                className="flex h-6 min-w-7 items-center justify-center"
                key={`gap-${index}`}
              >
                …
              </span>
            ) : (
              <button
                aria-current={number === page ? "page" : undefined}
                aria-label={t("pager.page", { page: number })}
                className={cn(
                  "h-6 min-w-7 rounded-sm px-1 tabular-nums hover:bg-sunken hover:text-ink",
                  number === page && "bg-sunken font-semibold text-ink",
                )}
                key={number}
                onClick={keep(() => onPage(number))}
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
            onClick={keep(() => onPage(page + 1))}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </span>
      </span>
    </nav>
  );
};
