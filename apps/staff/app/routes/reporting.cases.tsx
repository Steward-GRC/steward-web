// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { CaseStatus } from "@steward-web/api-client";
import { useIdentity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { Badge, EmptyState, PageHeader, Select, Table, TD, TH, THead } from "@steward-web/ui";
import { Link, useSearchParams } from "react-router";

import type { Route } from "./+types/reporting.cases";

import { sortQueueByUrgency, statusLabelKey, statusTone } from "../reporting/caseStatus";
import { listReportCases } from "../reporting/reporting.server";

const FILTERS = ["all", "open", "mine"] as const;
type Filter = (typeof FILTERS)[number];

const isFilter = (value: null | string): value is Filter =>
  (FILTERS as readonly string[]).includes(value ?? "");

export const loader = async ({ request }: Route.LoaderArgs) => {
  const requested = new URL(request.url).searchParams.get("filter");
  const filter: Filter = isFilter(requested) ? requested : "open";
  const statuses =
    filter === "open"
      ? (Object.values(CaseStatus).filter((s) => s !== CaseStatus.Closed) as CaseStatus[])
      : undefined;
  const queue = await listReportCases(request, statuses);
  return { filter, queue };
};

export default function ReportingCasesRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("reporting");
  const identity = useIdentity();
  const [, setSearchParameters] = useSearchParams();
  const { filter, queue } = loaderData;

  const visible =
    filter === "mine" ? queue.cases.filter((c) => c.assigneeUserId === identity.id) : queue.cases;
  const rows = sortQueueByUrgency(visible);

  return (
    <div className="grid gap-6 p-6">
      <PageHeader subtitle={t("queue.subtitle")} title={t("queue.title")} />

      <div className="flex gap-2">
        <Select
          aria-label={t("queue.filter.label")}
          onValueChange={(value) => setSearchParameters(value === "open" ? {} : { filter: value })}
          options={FILTERS.map((f) => ({ label: t(`queue.filter.${f}`), value: f }))}
          value={filter}
        />
        <div className="flex items-center gap-2">
          {queue.counts
            .filter((c) => c.count > 0)
            .map((c) => (
              <Badge key={c.status} tone={statusTone(c.status)}>
                {t(`status.${statusLabelKey(c.status)}`)} ({c.count})
              </Badge>
            ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState description={t("queue.empty.description")} title={t("queue.empty.title")} />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>{t("queue.table.case")}</TH>
              <TH>{t("queue.table.kind")}</TH>
              <TH>{t("queue.table.status")}</TH>
              <TH>{t("queue.table.assignee")}</TH>
              <TH>{t("queue.table.received")}</TH>
              <TH>{t("queue.table.deadline")}</TH>
            </tr>
          </THead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <TD className="font-mono text-sm">
                  <Link
                    className="font-medium text-ink hover:underline"
                    to={`/reporting/cases/${row.id}`}
                  >
                    {row.caseCode}
                  </Link>
                  <p className="mt-0.5 max-w-xs truncate text-xs text-muted">{row.summary}</p>
                </TD>
                <TD>{t(`kind.${row.kind.toLowerCase()}`)}</TD>
                <TD>
                  <Badge tone={statusTone(row.status)}>
                    {t(`status.${statusLabelKey(row.status)}`)}
                  </Badge>
                </TD>
                <TD>
                  {row.assigneeUserId === identity.id
                    ? identity.name
                    : row.assigneeUserId || t("queue.unassigned")}
                </TD>
                <TD className="text-sm text-muted">{row.receivedAt.slice(0, 10)}</TD>
                <TD className="text-sm text-muted">{row.nextDeadline ?? t("queue.noDeadline")}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
