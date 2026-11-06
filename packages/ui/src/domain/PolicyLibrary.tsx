// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { ChevronDown, ChevronRight, Star } from "lucide-react";
import { Fragment, type ReactNode, useId, useMemo } from "react";
import { Link, useSearchParams } from "react-router";

import { Button } from "#ui/components/Button";
import { Card, Table, TD, TH, THead } from "#ui/components/Display";
import { CategoryTiles, FilterBar, Pager, SortHeader } from "#ui/components/LibraryControls";
import {
  Menu,
  MenuContent,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "#ui/components/Overlays";
import { EmptyState } from "#ui/feedback/States";
import { PageHeader } from "#ui/layout/PageHeader";
import { cn } from "#ui/lib/cn";
import { PHONE, useMediaQuery } from "#ui/lib/media";

import type { Category, DocumentType, Policy } from "./policy";

import { DocumentStatusPill } from "./DocumentStatusPill";
import { useFavorites } from "./favorites";
import {
  CELL_CLASS,
  ColumnFilter,
  ColumnsMenu,
  filterParameter,
  LIBRARY_COLUMNS,
  matchesColumnFilters,
  useColumnPreferences,
} from "./libraryColumns";
import { documentTypeCopy, policyPath } from "./policy";

/** A category chip on a phone (U3m): plum when it's the one shown. */
const chip = (active: boolean) =>
  cn(
    "flex h-9 flex-none items-center rounded-full px-3",
    active
      ? "bg-primary font-semibold text-on-primary"
      : "bg-surface shadow-[inset_0_0_0_1px_var(--border-strong)]",
  );

export interface PolicyLibraryProps {
  /** The header's own actions after Starred and Status: Import and New policy for an author. */
  actions?: ReactNode;
  categories: readonly Category[];
  /** Column filters under the headers, and "Columns" to hide and reorder them, as the admin
   *  catalog has (A10). Off by default, so the staff library (U3) stays as it is. */
  columnOptions?: boolean;
  documentType: DocumentType;
  policies: readonly Policy[];
  /** The header's line under the title; the staff library's own when it's left out. */
  subtitle?: ReactNode;
  /** The header's title; the staff library's own when it's left out. The admin catalog (A10)
   *  says "Catalog". */
  title?: ReactNode;
}

type SortKey = "category" | "number" | "status" | "subcategory" | "title" | "updated" | "version";

const PAGE_SIZE = 20;
const SORT_KEYS: ReadonlySet<SortKey> = new Set<SortKey>([
  "category",
  "number",
  "status",
  "subcategory",
  "title",
  "updated",
  "version",
]);
/** The status filter's words in the address: the pills' own, "in-progress" for anything not
 *  yet published (the admin Overview's In progress card links there), and "all" for the whole
 *  library, which is how the table shows without another filter (U3). */
const STATUS_FILTERS: Readonly<Record<string, readonly string[]>> = {
  all: ["DRAFT", "IN_REVIEW", "PUBLISHED", "REJECTED", "SUPERSEDED", "WITHDRAWN"],
  draft: ["DRAFT"],
  "in-progress": ["DRAFT", "IN_REVIEW"],
  "in-review": ["IN_REVIEW"],
  published: ["PUBLISHED"],
};

const sortValue = (policy: Policy, key: SortKey): string => (policy[key] ?? "").toString();

/**
 * The policies/procedures library (U3/U4; decision 4-components.s7): the category tiles with
 * their subcategory chips, a "Filtered by" bar of removable chips with the result count and
 * Clear, then the table with sortable headers and a pager. Starring is a per-browser
 * preference (`useFavorites`); filters, sort and page live in the URL (category, subcategory,
 * status, q, starred, sort, dir, page) so the state survives a refresh or a shared link.
 */
export const PolicyLibrary = ({
  actions,
  categories,
  columnOptions = false,
  documentType,
  policies,
  subtitle,
  title,
}: PolicyLibraryProps) => {
  const { t } = useTranslation(["policy", "common"]);
  const { isFavorite, toggle } = useFavorites();
  const columns = useColumnPreferences(documentType);
  // Without column options the table keeps the staff library's columns, in its order.
  const visibleColumns = columnOptions ? columns.visible : LIBRARY_COLUMNS;
  const phone = useMediaQuery(PHONE);
  const headingId = useId();
  const [parameters, setParameters] = useSearchParams();

  const category = parameters.get("category") ?? "";
  const subcategory = parameters.get("subcategory") ?? "";
  const status = parameters.get("status") ?? "";
  const q = parameters.get("q") ?? "";
  const starredOnly = parameters.get("starred") === "1";
  const sortParameter = parameters.get("sort") as null | SortKey;
  const sort: SortKey = sortParameter && SORT_KEYS.has(sortParameter) ? sortParameter : "title";
  const direction = parameters.get("dir") === "desc" ? "desc" : "asc";
  const copy = documentTypeCopy(documentType);

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(parameters);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in changes)) next.delete("page");
    setParameters(next, { preventScrollReset: true });
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const statusValue = STATUS_FILTERS[status];
    return policies
      .filter((p) => (category ? p.category === category : true))
      .filter((p) => (subcategory ? p.subcategory === subcategory : true))
      .filter((p) => (statusValue ? statusValue.includes(p.status) : true))
      .filter((p) => (starredOnly ? isFavorite(p.number) : true))
      .filter((p) => (needle ? `${p.number} ${p.title}`.toLowerCase().includes(needle) : true))
      .filter((p) => (columnOptions ? matchesColumnFilters(p, parameters) : true))
      .toSorted((a, b) => {
        const order = sortValue(a, sort).localeCompare(sortValue(b, sort), undefined, {
          numeric: true,
        });
        return direction === "asc" ? order : -order;
      });
  }, [
    category,
    columnOptions,
    direction,
    isFavorite,
    parameters,
    policies,
    q,
    sort,
    starredOnly,
    status,
    subcategory,
  ]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(Number(parameters.get("page")) || 1, 1), pages);
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusLabel = (value: string) => {
    if (value === "all") return t(`library.filters.all.${copy.nounPlural}`);
    if (value === "in-progress") return t("library.filters.inProgress");
    return t(`status.${value}`);
  };

  // Each column filter in the address is a chip too, removable like the others.
  const columnChips = LIBRARY_COLUMNS.flatMap((column) => {
    const value = parameters.get(filterParameter(column.key));
    if (!value || !column.filter) return [];
    const name = t(`library.table.${column.key}`);
    return [
      {
        id: filterParameter(column.key),
        label:
          column.filter === "text"
            ? t("library.columns.chipText", { column: name, value })
            : t("library.columns.chipValue", { column: name, value: column.label(value, t) }),
      },
    ];
  });

  const chips = [
    category ? { id: "category", label: category } : null,
    subcategory ? { id: "subcategory", label: subcategory } : null,
    STATUS_FILTERS[status]
      ? {
          id: "status",
          label: statusLabel(status),
        }
      : null,
    starredOnly ? { id: "starred", label: t("library.filters.starred") } : null,
    q ? { id: "q", label: `“${q}”` } : null,
    ...(columnOptions ? columnChips : []),
  ].filter((chip): chip is { id: string; label: string } => chip !== null);

  const header = (key: SortKey, label: string) => (
    <SortHeader
      direction={direction}
      label={label}
      onSort={() => update({ dir: sort === key && direction === "asc" ? "desc" : "", sort: key })}
      sorted={sort === key}
    />
  );

  const heading = title ?? t(`library.${copy.nounPlural}.title`);
  if (phone) {
    return (
      // U3m: the title, a row of category chips, then every document as a card.
      <div className="flex flex-col gap-3 px-4 py-[18px] text-base text-ink">
        <h1 className="text-[26px] font-semibold" id={headingId}>
          {heading}
        </h1>
        <div
          aria-label={t("library.phone.category")}
          className="-mx-4 flex gap-2 overflow-x-auto px-4"
          role="group"
        >
          <button
            aria-pressed={!category}
            className={chip(!category)}
            onClick={() => update({ category: "", subcategory: "" })}
            type="button"
          >
            {t("library.phone.all")}
          </button>
          {categories.map((c) => (
            <button
              aria-pressed={category === c.name}
              className={chip(category === c.name)}
              key={c.id}
              onClick={() => update({ category: c.name, subcategory: "" })}
              type="button"
            >
              {c.name}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            description={t("library.empty.description")}
            title={t("library.empty.title", { noun: copy.nounPlural })}
          />
        ) : (
          <ul aria-labelledby={headingId} className="flex flex-col gap-3">
            {shown.map((policy) => (
              <li key={policy.id}>
                <Link
                  className="flex flex-col gap-1.5 rounded-[10px] border border-border bg-surface px-3.5 py-3 text-ink hover:bg-sunken"
                  to={policyPath(policy)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <b className="font-semibold">{policy.title}</b>
                    <ChevronRight aria-hidden="true" className="size-4 flex-none text-muted" />
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {policy.number} · v{policy.version}
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <DocumentStatusPill status={policy.status} />
                    <span className="text-xs text-muted">
                      {[policy.category, policy.subcategory].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Pager
          onPage={(next) => update({ page: next > 1 ? String(next) : "" })}
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-[18px] p-6">
      <PageHeader
        actions={
          <>
            <Button
              aria-pressed={starredOnly}
              className="h-[38px] px-3"
              onClick={() => update({ starred: starredOnly ? "" : "1" })}
              variant={starredOnly ? "primary" : "secondary"}
            >
              <Star aria-hidden="true" />
              {t("library.filters.starred")}
            </Button>
            <Menu>
              <MenuTrigger asChild>
                <Button className="h-[38px] px-3" variant="secondary">
                  {t("library.filters.status")}
                  <ChevronDown aria-hidden="true" />
                </Button>
              </MenuTrigger>
              <MenuContent>
                <MenuRadioGroup
                  onValueChange={(value) => update({ status: value })}
                  value={STATUS_FILTERS[status] ? status : ""}
                >
                  {["all", "draft", "in-review", "published", "in-progress"].map((value) => (
                    <MenuRadioItem key={value} value={value}>
                      {statusLabel(value)}
                    </MenuRadioItem>
                  ))}
                </MenuRadioGroup>
              </MenuContent>
            </Menu>
            {columnOptions ? (
              <ColumnsMenu
                hidden={columns.preferences.hidden}
                onMove={columns.move}
                onToggle={columns.toggle}
                order={columns.order}
              />
            ) : null}
            {actions}
          </>
        }
        subtitle={subtitle ?? t(`library.${copy.nounPlural}.subtitle`)}
        title={heading}
      />

      {chips.length === 0 ? (
        <CategoryTiles
          categories={categories.map((c) => ({
            count: policies.filter((p) => p.category === c.name).length,
            name: c.name,
            subcategories: c.subcategories,
          }))}
          onCategory={(name) => update({ category: name, subcategory: "" })}
          onSubcategory={(name, sub) => update({ category: name, subcategory: sub })}
        />
      ) : null}

      {chips.length > 0 ? (
        <FilterBar
          chips={chips}
          count={filtered.length}
          onClear={() => setParameters(new URLSearchParams(), { preventScrollReset: true })}
          onRemove={(id) =>
            update(id === "category" ? { category: "", subcategory: "" } : { [id]: "" })
          }
        />
      ) : null}

      {chips.length === 0 ? null : filtered.length === 0 ? (
        <EmptyState
          description={t("library.empty.description")}
          title={t("library.empty.title", { noun: copy.nounPlural })}
        />
      ) : (
        <Card className="text-sm">
          <Table className="text-sm">
            <THead>
              <tr>
                <TH className="w-9 px-3.5 py-2.5">
                  <span className="sr-only">{t("library.filters.starred")}</span>
                </TH>
                {visibleColumns.map((column) =>
                  column.sorts ? (
                    <Fragment key={column.key}>
                      {header(column.key as SortKey, t(`library.table.${column.key}`))}
                    </Fragment>
                  ) : (
                    <TH className="px-3.5 py-2.5 text-sm text-muted" key={column.key}>
                      {t(`library.table.${column.key}`)}
                    </TH>
                  ),
                )}
              </tr>
              {columnOptions ? (
                <tr>
                  <TH className="px-3.5 pb-2" />
                  {visibleColumns.map((column) => (
                    <TH className="px-3.5 pb-2 font-normal" key={column.key}>
                      <ColumnFilter
                        column={column}
                        onChange={(value) => update({ [filterParameter(column.key)]: value })}
                        policies={policies}
                        value={parameters.get(filterParameter(column.key)) ?? ""}
                      />
                    </TH>
                  ))}
                </tr>
              ) : null}
            </THead>
            <tbody>
              {shown.map((policy) => (
                <tr key={policy.id}>
                  <TD className="px-3.5 py-[11px] align-middle">
                    <button
                      aria-label={t("library.toggleStar", { number: policy.number })}
                      aria-pressed={isFavorite(policy.number)}
                      className="flex text-muted hover:text-ink"
                      onClick={() => toggle(policy.number)}
                      type="button"
                    >
                      <Star
                        aria-hidden="true"
                        className={cn(
                          "size-4",
                          isFavorite(policy.number) && "fill-current text-accent",
                        )}
                      />
                    </button>
                  </TD>
                  {visibleColumns.map((column) => (
                    <TD className={cn(CELL_CLASS, column.cellClass)} key={column.key}>
                      {column.render(policy)}
                    </TD>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
          <Pager
            onPage={(next) => update({ page: next > 1 ? String(next) : "" })}
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
          />
        </Card>
      )}
    </div>
  );
};
