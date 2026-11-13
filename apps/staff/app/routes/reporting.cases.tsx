// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { CaseStatus } from "@steward-web/api-client";
import { useIdentity } from "@steward-web/auth";
import { formatDate, useTranslation } from "@steward-web/i18n";
import { Badge, EmptyState, PageHeader, ResponsiveTable, Select } from "@steward-web/ui";
import { Link, useSearchParams } from "react-router";

import type { Route } from "./+types/reporting.cases";

import { sortQueueByUrgency, statusLabelKey, statusTone } from "../reporting/caseStatus";
import { requireReporting } from "../reporting/enabled.server";
import { isModuleOff } from "../reporting/moduleOff";
import { listReportCases } from "../reporting/reporting.server";
import { ReportingOff } from "../reporting/ReportingOff";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

const FILTERS = ["all", "open", "mine"] as const;
type Filter = (typeof FILTERS)[number];

const isFilter = (value: null | string): value is Filter =>
  (FILTERS as readonly string[]).includes(value ?? "");

export const loader = async ({ request }: Route.LoaderArgs) => {
  requireReporting();
  const requested = new URL(request.url).searchParams.get("filter");
  const filter: Filter = isFilter(requested) ? requested : "open";
  const statuses =
    filter === "open"
      ? (Object.values(CaseStatus).filter((s) => s !== CaseStatus.Closed) as CaseStatus[])
      : undefined;
  try {
    const queue = await listReportCases(request, statuses);
    return { filter, moduleOff: false, queue };
  } catch (error) {
    // A site admin switched the Compliance module off: say so, rather than failing the page.
    if (isModuleOff(error)) return { filter, moduleOff: true, queue: { cases: [], counts: [] } };
    throw error;
  }
};

export default function ReportingCasesRoute(props: Route.ComponentProps) {
  return props.loaderData.moduleOff ? <ReportingOff /> : <ReportingQueue {...props} />;
}

const ReportingQueue = ({ loaderData }: Route.ComponentProps) => {
  const { t } = useTranslation("reporting");
  const identity = useIdentity();
  const [, setSearchParameters] = useSearchParams();
  const { filter, queue } = loaderData;

  const visible =
    filter === "mine" ? queue.cases.filter((c) => c.assigneeUserId === identity.id) : queue.cases;
  const rows = sortQueueByUrgency(visible);
  const assignee = (row: (typeof rows)[number]) =>
    row.assigneeUserId === identity.id
      ? identity.name
      : row.assigneeUserId || t("queue.unassigned");

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
        <ResponsiveTable
          columns={[
            {
              card: "title",
              cell: (row) => (
                <>
                  <Link
                    className="font-mono text-sm font-medium text-ink hover:underline"
                    to={`/reporting/cases/${row.id}`}
                  >
                    {row.caseCode}
                  </Link>
                  <p className="mt-0.5 max-w-xs truncate text-xs text-muted">{row.summary}</p>
                </>
              ),
              header: t("queue.table.case"),
              key: "case",
              value: (row) => row.caseCode,
            },
            {
              card: "meta",
              cell: (row) => t(`kind.${row.kind.toLowerCase()}`),
              header: t("queue.table.kind"),
              key: "kind",
              value: (row) => t(`kind.${row.kind.toLowerCase()}`),
            },
            {
              card: "status",
              cell: (row) => (
                <Badge tone={statusTone(row.status)}>
                  {t(`status.${statusLabelKey(row.status)}`)}
                </Badge>
              ),
              header: t("queue.table.status"),
              key: "status",
              value: (row) => t(`status.${statusLabelKey(row.status)}`),
            },
            {
              card: "meta",
              cell: (row) => assignee(row),
              header: t("queue.table.assignee"),
              key: "assignee",
              value: (row) => assignee(row),
            },
            {
              card: "meta",
              cell: (row) => formatDate(row.receivedAt),
              className: "text-sm text-muted",
              header: t("queue.table.received"),
              key: "received",
              value: (row) => row.receivedAt,
            },
            {
              card: "meta",
              cell: (row) =>
                row.nextDeadline ? formatDate(row.nextDeadline) : t("queue.noDeadline"),
              className: "text-sm text-muted",
              header: t("queue.table.deadline"),
              key: "deadline",
              value: (row) => row.nextDeadline ?? "9999",
            },
          ]}
          empty={null}
          label={t("queue.title")}
          rowKey={(row) => row.id}
          rows={rows}
        />
      )}
    </div>
  );
};
