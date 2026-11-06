// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatNumber, formatPercent, useTranslation } from "@steward-web/i18n";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  ListPage,
  Progress,
  ResponsiveTable,
  Select,
} from "@steward-web/ui";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/completion";

import { listGroups, orderedWithPaths } from "../categories/categories.server";
import { getCompletionReport, listObligatingPolicies } from "../completion/completion.server";
import { StatTiles } from "../completion/StatTiles";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const obligating = await listObligatingPolicies(request);
  // The whole category path, root first, as the breadcrumb shows it. Without the right to list
  // categories the policy's own category name stands.
  const paths = await listGroups(request)
    .then((groups) => new Map(orderedWithPaths(groups).map((row) => [row.id, row.path])))
    .catch(() => new Map<string, string>());
  const rows = await Promise.all(
    obligating.map(async ({ policy }) => {
      const versionId = policy.currentPublishedVersionId;
      // requiresAck already guarantees a published version for every obligating policy.
      const report = versionId ? await getCompletionReport(request, versionId) : null;
      return {
        category: policy.category,
        path: paths.get(policy.homeGroupId) ?? policy.category,
        completionPct: report?.completionPct ?? 0,
        number: policy.number,
        overdue: report?.overdue.length ?? 0,
        title: policy.title,
        totalAcked: report?.totalAcked ?? 0,
        totalAudience: report?.totalAudience ?? 0,
      };
    }),
  );
  return { rows };
};

const ALL = "all";

/** The top-level category a row sits under: the first step of its path. */
const topOf = (row: { category: string; path?: string }) =>
  (row.path ?? row.category).split(" › ", 1)[0] ?? row.category;

/**
 * Completion (A13): "Acknowledgement coverage across every policy that requires
 * acknowledgement." Four stat cards over what's shown, a category filter and "Overdue only",
 * then each obligating policy with its progress bar and an overdue badge.
 */
export default function Completion({ loaderData }: Route.ComponentProps) {
  const { rows } = loaderData;
  const { t } = useTranslation("admin");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [...new Set(rows.map((row) => topOf(row)))].toSorted((a, b) => a.localeCompare(b)),
    [rows],
  );
  const shown = rows
    .filter((row) => (overdueOnly ? row.overdue > 0 : true))
    .filter((row) => (category === ALL ? true : topOf(row) === category));

  const audience = shown.reduce((sum, row) => sum + row.totalAudience, 0);
  const acknowledged = shown.reduce((sum, row) => sum + row.totalAcked, 0);

  return (
    <ListPage
      filters={
        <>
          <Field className="w-56" label={t("completion.filters.category")}>
            <Select
              className="h-[38px]"
              onValueChange={setCategory}
              options={[
                { label: t("completion.filters.allCategories"), value: ALL },
                ...categories.map((name) => ({ label: name, value: name })),
              ]}
              value={category}
            />
          </Field>
          <Button
            aria-pressed={overdueOnly}
            className="h-[38px] px-3"
            onClick={() => setOverdueOnly((on) => !on)}
            variant={overdueOnly ? "primary" : "secondary"}
          >
            {t("completion.filters.overdueOnly")}
          </Button>
        </>
      }
      subtitle={t("completion.subtitle")}
      title={t("completion.title")}
    >
      <StatTiles
        className="grid-cols-2 sm:grid-cols-4"
        label={t("completion.stats.label")}
        tiles={[
          { label: t("completion.stats.obligating"), value: formatNumber(shown.length) },
          { label: t("completion.stats.audience"), value: formatNumber(audience) },
          { label: t("completion.stats.acknowledged"), value: formatNumber(acknowledged) },
          {
            label: t("completion.stats.completion"),
            value: audience > 0 ? formatPercent(acknowledged / audience) : "—",
          },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState
          description={t("completion.empty.description")}
          title={t("completion.empty.title")}
        />
      ) : (
        <ResponsiveTable
          columns={[
            {
              card: "title",
              cell: (row) => (
                <>
                  <Link
                    className="font-semibold text-primary hover:text-primary-hover"
                    to={`/completion/${encodeURIComponent(row.number)}`}
                  >
                    {row.title}
                  </Link>
                  <div className="font-mono text-xs font-normal text-muted">{row.number}</div>
                </>
              ),
              header: t("completion.table.policy"),
              key: "policy",
              value: (row) => row.title,
            },
            {
              card: "meta",
              cell: (row) => row.path ?? row.category,
              className: "text-muted",
              header: t("completion.table.category"),
              key: "category",
              value: (row) => row.path ?? row.category,
            },
            {
              card: "meta",
              cell: (row) =>
                t("completion.table.ackedOf", {
                  acked: formatNumber(row.totalAcked),
                  audience: formatNumber(row.totalAudience),
                }),
              className: "tabular-nums",
              header: t("completion.table.acknowledged"),
              key: "acknowledged",
              value: (row) => row.totalAcked,
            },
            {
              card: "status",
              cell: (row) => (
                <div className="flex min-w-36 items-center gap-2">
                  <Progress
                    aria-label={t("completion.table.completion")}
                    className="w-24"
                    value={Math.round(row.completionPct)}
                  />
                  <span className="text-sm tabular-nums">
                    {formatPercent(row.completionPct / 100)}
                  </span>
                </div>
              ),
              header: t("completion.table.completion"),
              key: "completion",
              value: (row) => row.completionPct,
            },
            {
              card: "status",
              cell: (row) =>
                row.overdue > 0 ? (
                  <Badge tone="danger">
                    {t("completion.table.overdueBadge", { count: row.overdue })}
                  </Badge>
                ) : null,
              header: t("completion.table.overdue"),
              key: "overdue",
              value: (row) => row.overdue,
            },
          ]}
          empty={<EmptyState compact title={t("completion.empty.filtered")} />}
          framed
          label={t("completion.table.label")}
          rowHref={(row) => `/completion/${encodeURIComponent(row.number)}`}
          rowKey={(row) => row.number}
          rows={shown}
          search={{
            label: t("completion.search"),
            placeholder: t("completion.search"),
            text: (row) => `${row.title} ${row.number} ${row.path ?? row.category}`,
          }}
        />
      )}
    </ListPage>
  );
}
