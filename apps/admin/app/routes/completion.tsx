// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  Badge,
  Card,
  CardBody,
  EmptyState,
  PageHeader,
  Progress,
  Table,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/completion";

import { getCompletionReport, listObligatingPolicies } from "../completion/completion.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const obligating = await listObligatingPolicies(request);
  const rows = await Promise.all(
    obligating.map(async ({ group, policy }) => {
      const versionId = policy.currentPublishedVersionId;
      // requiresAck already guarantees a published version for every obligating policy.
      const report = versionId ? await getCompletionReport(request, versionId) : null;
      return {
        completionPct: report?.completionPct ?? 0,
        groupName: group?.name ?? "—",
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

export default function Completion({ loaderData }: Route.ComponentProps) {
  const { rows } = loaderData;
  const [overdueOnly, setOverdueOnly] = useState(false);

  const filtered = useMemo(
    () => (overdueOnly ? rows.filter((r) => r.overdue > 0) : rows),
    [rows, overdueOnly],
  );

  const totals = useMemo(() => {
    const sums = { acked: 0, audience: 0, overdue: 0 };
    for (const row of filtered) {
      sums.acked += row.totalAcked;
      sums.audience += row.totalAudience;
      sums.overdue += row.overdue;
    }
    return sums;
  }, [filtered]);
  const overallPct =
    totals.audience === 0 ? null : Math.round((totals.acked / totals.audience) * 100);

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        eyebrow="Compliance"
        subtitle="Acknowledgement coverage across every policy that requires acknowledgement."
        title="Completion"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardBody className="flex flex-col gap-1">
            <span className="text-2xl font-semibold tabular-nums text-ink">{filtered.length}</span>
            <span className="text-sm text-muted">Obligating policies</span>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-col gap-1">
            <span className="text-2xl font-semibold tabular-nums text-ink">
              {overallPct === null ? "—" : `${overallPct}%`}
            </span>
            <span className="text-sm text-muted">Overall completion</span>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-col gap-1">
            <span className="text-2xl font-semibold tabular-nums text-ink">
              {totals.audience - totals.acked}
            </span>
            <span className="text-sm text-muted">Pending</span>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-col gap-1">
            <span className="text-2xl font-semibold tabular-nums text-ink">{totals.overdue}</span>
            <span className="text-sm text-muted">Overdue</span>
          </CardBody>
        </Card>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm text-ink">
        <input
          checked={overdueOnly}
          onChange={(event) => setOverdueOnly(event.target.checked)}
          type="checkbox"
        />
        Overdue only
      </label>

      {filtered.length === 0 ? (
        <EmptyState
          description="Completion coverage appears once a published policy has an acknowledgement trigger."
          title="No policies to report on"
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Policy</TH>
              <TH>Owning group</TH>
              <TH>Acked</TH>
              <TH>Total</TH>
              <TH>Completion</TH>
              <TH>Overdue</TH>
            </tr>
          </THead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.number}>
                <TD>
                  <Link
                    className="font-medium text-primary hover:underline"
                    to={`/completion/${encodeURIComponent(row.number)}`}
                  >
                    {row.title}
                  </Link>
                  <div className="font-mono text-xs text-muted">{row.number}</div>
                </TD>
                <TD>
                  <Badge tone="neutral">{row.groupName}</Badge>
                </TD>
                <TD className="tabular-nums">{row.totalAcked}</TD>
                <TD className="tabular-nums">{row.totalAudience}</TD>
                <TD>
                  <div className="flex min-w-32 items-center gap-2">
                    <Progress className="w-20" value={row.completionPct} />
                    <span className="text-sm tabular-nums">{row.completionPct}%</span>
                  </div>
                </TD>
                <TD>
                  {row.overdue > 0 ? (
                    <Badge tone="danger">{row.overdue}</Badge>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
