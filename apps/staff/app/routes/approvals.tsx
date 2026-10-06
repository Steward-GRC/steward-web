// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { Badge, Button, EmptyState, PageHeader, Table, TD, TH, THead } from "@steward-web/ui";
import { DocumentType } from "@steward-web/ui/domain";
import { listPolicies } from "@steward-web/ui/domain/server";
import { Link } from "react-router";

import type { Route } from "./+types/approvals";

import { buildInboxRow } from "../approvals/approvalRows";
import { listPendingTasks, listUpcomingApprovals } from "../approvals/approvals.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const [pendingTasks, upcomingApprovals, policies, procedures] = await Promise.all([
    listPendingTasks(request),
    listUpcomingApprovals(request),
    listPolicies(DocumentType.Policy, cookie),
    listPolicies(DocumentType.Procedure, cookie),
  ]);
  const catalog = [...policies, ...procedures];
  return {
    pending: pendingTasks.map((task) => buildInboxRow(task, catalog)),
    upcoming: upcomingApprovals.map((task) => buildInboxRow(task, catalog)),
  };
};

export default function ApprovalsRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("approvals");
  const { pending, upcoming } = loaderData;

  return (
    <div className="grid gap-6 p-6">
      <PageHeader subtitle={t("inbox.subtitle")} title={t("inbox.title")} />

      {pending.length === 0 ? (
        <EmptyState description={t("inbox.empty.description")} title={t("inbox.empty.title")} />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>{t("inbox.table.number")}</TH>
              <TH>{t("inbox.table.title")}</TH>
              <TH>{t("inbox.table.category")}</TH>
              <TH>{t("inbox.table.stage")}</TH>
              <TH>{t("inbox.table.due")}</TH>
              <TH />
            </tr>
          </THead>
          <tbody>
            {pending.map((row) => (
              <tr key={row.taskId}>
                <TD className="font-mono text-sm">{row.number || "—"}</TD>
                <TD>
                  <Link
                    className="font-medium text-ink hover:underline"
                    to={`/approvals/${row.number || row.policyVersionId}`}
                  >
                    {row.title || t("inbox.untitled")}
                  </Link>
                </TD>
                <TD>{row.category}</TD>
                <TD>{row.stageIndex + 1}</TD>
                <TD>{row.dueAt ? row.dueAt.slice(0, 10) : "—"}</TD>
                <TD>
                  <Button asChild size="sm">
                    <Link to={`/approvals/${row.number || row.policyVersionId}`}>
                      {t("inbox.review")}
                    </Link>
                  </Button>
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {upcoming.length > 0 ? (
        <section className="grid gap-3">
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold text-ink">{t("inbox.upcoming.title")}</h2>
            <p className="text-sm text-muted">{t("inbox.upcoming.description")}</p>
          </div>
          <Table>
            <THead>
              <tr>
                <TH>{t("inbox.table.number")}</TH>
                <TH>{t("inbox.table.title")}</TH>
                <TH>{t("inbox.table.category")}</TH>
                <TH>{t("inbox.upcoming.table.stage")}</TH>
                <TH />
              </tr>
            </THead>
            <tbody>
              {upcoming.map((row) => (
                <tr key={`${row.policyVersionId}:${row.stageIndex}`}>
                  <TD className="font-mono text-sm">{row.number || "—"}</TD>
                  <TD>{row.title || t("inbox.untitled")}</TD>
                  <TD>{row.category}</TD>
                  <TD>{row.stageName}</TD>
                  <TD>
                    <Badge tone="info">{t("inbox.upcoming.upcomingBadge")}</Badge>
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      ) : null}
    </div>
  );
}
