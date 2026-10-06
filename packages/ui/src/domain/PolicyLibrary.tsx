// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Star } from "lucide-react";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";

import { SensitivityBadge, StatusPill } from "#ui/components/Badges";
import { Button } from "#ui/components/Button";
import { Select } from "#ui/components/Controls";
import { Card, CardBody, Table, TD, TH, THead } from "#ui/components/Display";
import { Input } from "#ui/components/Input";
import { EmptyState } from "#ui/feedback/States";
import { PageHeader } from "#ui/layout/PageHeader";
import { cn } from "#ui/lib/cn";

import type { Category, DocumentType, Policy } from "./policy";

import { useFavorites } from "./favorites";
import { documentStatusOf, documentTypeCopy, policyPath } from "./policy";

export interface PolicyLibraryProps {
  categories: readonly Category[];
  documentType: DocumentType;
  policies: readonly Policy[];
}

/**
 * The policies/procedures library: category tiles when unfiltered, a filtered table
 * otherwise (the original's U3/U4 — the same screen serves both document types). Starring
 * is a per-browser preference (`useFavorites`); filters live in the URL (category,
 * subcategory, q, starred) so the browse state survives a refresh or a shared link.
 */
export const PolicyLibrary = ({ categories, documentType, policies }: PolicyLibraryProps) => {
  const { t } = useTranslation("policy");
  const { isFavorite, toggle } = useFavorites();
  const [parameters, setParameters] = useSearchParams();

  const category = parameters.get("category") ?? "";
  const subcategory = parameters.get("subcategory") ?? "";
  const q = parameters.get("q") ?? "";
  const starredOnly = parameters.get("starred") === "1";
  const copy = documentTypeCopy(documentType);

  const setParameter = (key: string, value: string) => {
    const next = new URLSearchParams(parameters);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "category") next.delete("subcategory");
    setParameters(next, { preventScrollReset: true });
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return policies
      .filter((p) => (category ? p.category === category : true))
      .filter((p) => (subcategory ? p.subcategory === subcategory : true))
      .filter((p) => (starredOnly ? isFavorite(p.number) : true))
      .filter((p) => (needle ? `${p.number} ${p.title}`.toLowerCase().includes(needle) : true))
      .toSorted((a, b) => b.updated.localeCompare(a.updated));
  }, [category, isFavorite, policies, q, starredOnly, subcategory]);

  const subcategories = categories.find((c) => c.name === category)?.subcategories ?? [];
  const filtersActive = Boolean(category || subcategory || q || starredOnly);

  return (
    <div className="grid gap-6 p-6">
      <PageHeader
        subtitle={t(`library.${copy.nounPlural}.subtitle`)}
        title={t(`library.${copy.nounPlural}.title`)}
      />

      {filtersActive ? null : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.id}>
              <CardBody className="grid gap-1">
                <Button
                  className="h-auto justify-start px-0 text-base font-semibold"
                  onClick={() => setParameter("category", c.name)}
                  variant="link"
                >
                  {c.name}
                </Button>
                <p className="text-sm text-muted">
                  {(() => {
                    const count = policies.filter((p) => p.category === c.name).length;
                    return t("library.categoryCount", {
                      count,
                      noun: count === 1 ? copy.noun : copy.nounPlural,
                    });
                  })()}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <Select
          aria-label={t("library.filters.category")}
          onValueChange={(value) => setParameter("category", value)}
          options={categories.map((c) => ({ label: c.name, value: c.name }))}
          placeholder={t("library.filters.category")}
          value={category}
        />
        <Select
          aria-label={t("library.filters.subcategory")}
          disabled={subcategories.length === 0}
          onValueChange={(value) => setParameter("subcategory", value)}
          options={subcategories.map((s) => ({ label: s, value: s }))}
          placeholder={t("library.filters.subcategory")}
          value={subcategory}
        />
        <Input
          aria-label={t("library.filters.search")}
          onChange={(event) => setParameter("q", event.target.value)}
          placeholder={t("library.filters.search")}
          value={q}
        />
        <Button
          aria-pressed={starredOnly}
          onClick={() => setParameter("starred", starredOnly ? "" : "1")}
          variant={starredOnly ? "primary" : "secondary"}
        >
          <Star aria-hidden="true" />
          {t("library.filters.starred")}
        </Button>
        {filtersActive ? (
          <Button onClick={() => setParameters(new URLSearchParams())} variant="ghost">
            {t("library.filters.clear")}
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          description={t("library.empty.description")}
          title={t("library.empty.title", { noun: copy.nounPlural })}
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>
                <span className="sr-only">{t("library.filters.starred")}</span>
              </TH>
              <TH>{t("library.table.number")}</TH>
              <TH>{t("library.table.title")}</TH>
              <TH>{t("library.table.category")}</TH>
              <TH>{t("library.table.subcategory")}</TH>
              <TH>{t("library.table.sensitivity")}</TH>
              <TH>{t("library.table.status")}</TH>
              <TH>{t("library.table.version")}</TH>
              <TH>{t("library.table.updated")}</TH>
            </tr>
          </THead>
          <tbody>
            {filtered.map((policy) => (
              <tr key={policy.id}>
                <TD>
                  <button
                    aria-label={t("library.toggleStar", { number: policy.number })}
                    aria-pressed={isFavorite(policy.number)}
                    className="text-muted hover:text-ink"
                    onClick={() => toggle(policy.number)}
                    type="button"
                  >
                    <Star
                      aria-hidden="true"
                      className={cn(
                        "size-4",
                        isFavorite(policy.number) && "fill-current text-warn",
                      )}
                    />
                  </button>
                </TD>
                <TD className="font-mono text-sm">{policy.number}</TD>
                <TD>
                  <Link className="font-medium text-ink hover:underline" to={policyPath(policy)}>
                    {policy.title}
                  </Link>
                </TD>
                <TD>{policy.category}</TD>
                <TD>{policy.subcategory}</TD>
                <TD>
                  <SensitivityBadge sensitive={policy.sensitivity === "SENSITIVE"} />
                </TD>
                <TD>
                  <StatusPill status={documentStatusOf(policy.status)} />
                </TD>
                <TD className="font-mono text-sm">{policy.version}</TD>
                <TD>{policy.updated}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};
