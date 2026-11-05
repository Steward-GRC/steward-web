// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate, useTranslation } from "@steward-web/i18n";
import { Star } from "lucide-react";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";

import { SensitivityBadge } from "#ui/components/Badges";
import { Button } from "#ui/components/Button";
import { Table, TD, TH, THead } from "#ui/components/Display";
import { CategoryTiles, FilterBar, Pager, SortHeader } from "#ui/components/LibraryControls";
import { EmptyState } from "#ui/feedback/States";
import { PageHeader } from "#ui/layout/PageHeader";
import { cn } from "#ui/lib/cn";

import type { Category, DocumentType, Policy } from "./policy";

import { DocumentStatusPill } from "./DocumentStatusPill";
import { useFavorites } from "./favorites";
import { documentTypeCopy, policyPath } from "./policy";

export interface PolicyLibraryProps {
  categories: readonly Category[];
  documentType: DocumentType;
  policies: readonly Policy[];
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
/** The status filter's words in the address: the pills' own, and "in-progress" for anything
 *  not yet published (the admin Overview's In progress card links there). */
const STATUS_FILTERS: Readonly<Record<string, readonly string[]>> = {
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
export const PolicyLibrary = ({ categories, documentType, policies }: PolicyLibraryProps) => {
  const { t } = useTranslation(["policy", "common"]);
  const { isFavorite, toggle } = useFavorites();
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
      .toSorted((a, b) => {
        const order = sortValue(a, sort).localeCompare(sortValue(b, sort), undefined, {
          numeric: true,
        });
        return direction === "asc" ? order : -order;
      });
  }, [category, direction, isFavorite, policies, q, sort, starredOnly, status, subcategory]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(Number(parameters.get("page")) || 1, 1), pages);
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const chips = [
    category ? { id: "category", label: category } : null,
    subcategory ? { id: "subcategory", label: subcategory } : null,
    STATUS_FILTERS[status]
      ? {
          id: "status",
          label: status === "in-progress" ? t("library.filters.inProgress") : t(`status.${status}`),
        }
      : null,
    starredOnly ? { id: "starred", label: t("library.filters.starred") } : null,
    q ? { id: "q", label: `“${q}”` } : null,
  ].filter((chip): chip is { id: string; label: string } => chip !== null);

  const header = (key: SortKey, label: string) => (
    <SortHeader
      direction={direction}
      label={label}
      onSort={() => update({ dir: sort === key && direction === "asc" ? "desc" : "", sort: key })}
      sorted={sort === key}
    />
  );

  return (
    <div className="grid gap-[18px] p-6">
      <PageHeader
        actions={
          <Button
            aria-pressed={starredOnly}
            className="h-[38px] px-3"
            onClick={() => update({ starred: starredOnly ? "" : "1" })}
            variant={starredOnly ? "primary" : "secondary"}
          >
            <Star aria-hidden="true" />
            {t("library.filters.starred")}
          </Button>
        }
        subtitle={t(`library.${copy.nounPlural}.subtitle`)}
        title={t(`library.${copy.nounPlural}.title`)}
      />

      <CategoryTiles
        categories={categories.map((c) => ({
          count: policies.filter((p) => p.category === c.name).length,
          name: c.name,
          subcategories: c.subcategories,
        }))}
        onCategory={(name) => update({ category: name, subcategory: "" })}
        onSubcategory={(name, sub) => update({ category: name, subcategory: sub })}
      />

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

      {filtered.length === 0 ? (
        <EmptyState
          description={t("library.empty.description")}
          title={t("library.empty.title", { noun: copy.nounPlural })}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface text-sm">
          <Table className="text-sm">
            <THead>
              <tr>
                <TH className="w-9 px-3.5 py-2.5">
                  <span className="sr-only">{t("library.filters.starred")}</span>
                </TH>
                {header("number", t("library.table.number"))}
                {header("title", t("library.table.title"))}
                {header("category", t("library.table.category"))}
                {header("subcategory", t("library.table.subcategory"))}
                <TH className="px-3.5 py-2.5 text-sm text-muted">
                  {t("library.table.sensitivity")}
                </TH>
                {header("status", t("library.table.status"))}
                {header("version", t("library.table.version"))}
                {header("updated", t("library.table.updated"))}
              </tr>
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
                  <TD className="px-3.5 py-[11px] align-middle font-mono text-xs">
                    {policy.number}
                  </TD>
                  <TD className="px-3.5 py-[11px] align-middle">
                    <Link
                      className="font-semibold text-ink hover:underline"
                      to={policyPath(policy)}
                    >
                      {policy.title}
                    </Link>
                  </TD>
                  <TD className="px-3.5 py-[11px] align-middle">{policy.category}</TD>
                  <TD className="px-3.5 py-[11px] align-middle">{policy.subcategory}</TD>
                  <TD className="px-3.5 py-[11px] align-middle">
                    <SensitivityBadge sensitive={policy.sensitivity === "SENSITIVE"} />
                  </TD>
                  <TD className="px-3.5 py-[11px] align-middle">
                    <DocumentStatusPill status={policy.status} />
                  </TD>
                  <TD className="px-3.5 py-[11px] align-middle font-mono">{policy.version}</TD>
                  <TD className="px-3.5 py-[11px] align-middle text-muted">
                    {formatDate(policy.updated)}
                  </TD>
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
        </div>
      )}
    </div>
  );
};
