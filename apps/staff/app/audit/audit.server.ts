// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type AuditRecord, DocumentType } from "@steward-web/api-client";
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";
import { actionLabel, displayLabel, isReportingRecord } from "@steward-web/shell";

export interface AuditRow {
  action: string;
  actor: string;
  id: string;
  /** The policy or procedure number, or a dash when the subject isn't one. */
  number: string;
  occurredAt: string;
  subjectLabel: string;
}

/** The screen is policy and approval actions only: not logins, role grants or settings. */
const isPolicyOrApproval = (record: AuditRecord): boolean =>
  /^(policy|policy_version|procedure|approval|workflow)[:.]/.test(record.subject) ||
  /^(policy|approval|workflow)[._]/.test(record.action);

/**
 * The staff audit log's rows. Reporting-case records are left out entirely: nothing in a staff
 * list may point at who handled, or filed, a case.
 */
export const toRows = (
  numbers: ReadonlyMap<string, string>,
  records: readonly AuditRecord[],
): AuditRow[] =>
  records
    .filter((record) => !isReportingRecord(record) && isPolicyOrApproval(record))
    .map((record) => ({
      action: actionLabel(record.action),
      actor: displayLabel(record.actorName, record.actorUserId),
      id: record.id,
      number: numbers.get(record.subject.replace(/^policy:/, "")) ?? "—",
      occurredAt: record.occurredAt,
      subjectLabel: displayLabel(record.subjectLabel, record.subject),
    }));

/** Policy and approval actions the gateway lets this caller see (`audit.read`), newest first. */
export const listAuditRows = async (request: Request): Promise<AuditRow[]> => {
  await requirePermissionFromRequest(request, PERMISSIONS.AuditRead);
  const cookie = request.headers.get("cookie") ?? undefined;
  const [page, policies, procedures] = await Promise.all([
    edge.auditLog({ pageSize: 200 }, cookie),
    edge.policies(DocumentType.Policy, cookie).catch(() => []),
    edge.policies(DocumentType.Procedure, cookie).catch(() => []),
  ]);
  const numbers = new Map([...policies, ...procedures].map((p) => [p.id, p.number] as const));
  return toRows(numbers, page.records);
};
