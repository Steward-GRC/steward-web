// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatNumber, formatPercent, useTranslation } from "@steward-web/i18n";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  PageHeader,
  Progress,
  Select,
  Table,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/completion";

import { getCompletionReport, listObligatingPolicies } from "../completion/completion.server";
import { StatTiles } from "../completion/StatTiles";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const obligating = await listObligatingPolicies(request);
  const rows = await Promise.all(
    obligating.map(async ({ policy }) => {
      const versionId = policy.currentPublishedVersionId;
      // requiresAck already guarantees a published version for every obligating policy.
      const report = versionId ? await getCompletionReport(request, versionId) : null;
      return {
        category: policy.category,
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
    () => [...new Set(rows.map((row) => row.category))].toSorted((a, b) => a.localeCompare(b)),
    [rows],
  );
  const shown = rows
    .filter((row) => (overdueOnly ? row.overdue > 0 : true))
    .filter((row) => (category === ALL ? true : row.category === category));

  const audience = shown.reduce((sum, row) => sum + row.totalAudience, 0);
  const acknowledged = shown.reduce((sum, row) => sum + row.totalAcked, 0);

  return (
    <div className="flex w-full flex-col gap-[18px] p-6">
      <PageHeader subtitle={t("completion.subtitle")} title={t("completion.title")} />

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

      <div className="flex flex-wrap items-end gap-3">
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
      </div>

      {rows.length === 0 ? (
        <EmptyState
          description={t("completion.empty.description")}
          title={t("completion.empty.title")}
        />
      ) : shown.length === 0 ? (
        <p className="text-muted">{t("completion.empty.filtered")}</p>
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
          <Table aria-label={t("completion.table.label")}>
            <THead>
              <tr>
                <TH>{t("completion.table.policy")}</TH>
                <TH>{t("completion.table.category")}</TH>
                <TH>{t("completion.table.acknowledged")}</TH>
                <TH>{t("completion.table.completion")}</TH>
                <TH>{t("completion.table.overdue")}</TH>
              </tr>
            </THead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.number}>
                  <TD>
                    <Link
                      className="font-semibold text-primary hover:text-primary-hover"
                      to={`/completion/${encodeURIComponent(row.number)}`}
                    >
                      {row.title}
                    </Link>
                    <div className="font-mono text-xs text-muted">{row.number}</div>
                  </TD>
                  <TD className="text-muted">{row.category}</TD>
                  <TD className="tabular-nums">
                    {t("completion.table.ackedOf", {
                      acked: formatNumber(row.totalAcked),
                      audience: formatNumber(row.totalAudience),
                    })}
                  </TD>
                  <TD>
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
                  </TD>
                  <TD>
                    {row.overdue > 0 ? (
                      <Badge tone="danger">
                        {t("completion.table.overdueBadge", { count: row.overdue })}
                      </Badge>
                    ) : null}
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
