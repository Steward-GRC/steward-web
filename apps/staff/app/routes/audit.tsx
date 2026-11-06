// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Audit log (staff, U26): every policy and approval action across the caller's group. The
// organisation-wide log with chain verification stays in the admin console.
import { formatDateTime, useTranslation } from "@steward-web/i18n";
import { EmptyState } from "@steward-web/ui";

import type { Route } from "./+types/audit";

import { listAuditRows } from "../audit/audit.server";

export const loader = async ({ request }: Route.LoaderArgs) => ({
  records: await listAuditRows(request),
});

export default function Audit({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("approvals");
  const { records } = loaderData;
  return (
    <div className="flex flex-col gap-3 px-4 pt-6 pb-8 text-ink sm:px-8">
      <h1 className="text-2xl font-semibold">{t("audit.title")}</h1>
      <p className="leading-[1.5] text-muted">{t("audit.description")}</p>
      {records.length === 0 ? (
        <EmptyState description={t("audit.empty.body")} title={t("audit.empty.title")} />
      ) : (
        <div className="overflow-x-auto rounded-[10px] border border-border bg-surface">
          <table className="w-full">
            <thead className="border-b border-border-strong bg-sunken text-left text-xs font-semibold text-muted">
              <tr>
                <th className="px-3.5 py-2">{t("audit.columns.when")}</th>
                <th className="px-3.5 py-2">{t("audit.columns.policy")}</th>
                <th className="px-3.5 py-2">{t("audit.columns.title")}</th>
                <th className="px-3.5 py-2">{t("audit.columns.action")}</th>
                <th className="px-3.5 py-2">{t("audit.columns.by")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr className="border-b border-border last:border-b-0" key={record.id}>
                  <td className="px-3.5 py-[11px] whitespace-nowrap text-muted">
                    {formatDateTime(record.occurredAt)}
                  </td>
                  <td className="px-3.5 py-[11px] font-mono">{record.subject}</td>
                  <td className="px-3.5 py-[11px]">{record.subjectLabel}</td>
                  <td className="px-3.5 py-[11px]">{record.action}</td>
                  <td className="px-3.5 py-[11px] text-muted">{record.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
