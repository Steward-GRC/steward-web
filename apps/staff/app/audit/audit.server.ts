// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AuditRecord } from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";
import { actionLabel, displayLabel, isReportingRecord } from "@steward-web/shell";

export interface AuditRow {
  action: string;
  actor: string;
  id: string;
  occurredAt: string;
  subject: string;
  subjectLabel: string;
}

/**
 * The staff audit log's rows. Reporting-case records are left out entirely: nothing in a staff
 * list may point at who handled, or filed, a case.
 */
export const toRows = (records: readonly AuditRecord[]): AuditRow[] =>
  records
    .filter((record) => !isReportingRecord(record))
    .map((record) => ({
      action: actionLabel(record.action),
      actor: displayLabel(record.actorName, record.actorUserId),
      id: record.id,
      occurredAt: record.occurredAt,
      subject: record.subject,
      subjectLabel: displayLabel(record.subjectLabel, record.subject),
    }));

/** Policy and approval actions the gateway lets this caller see (`audit.read`), newest first. */
export const listAuditRows = async (request: Request): Promise<AuditRow[]> => {
  await requirePermissionFromRequest(request, PERMISSIONS.AuditRead);
  const page = await edge.auditLog(
    { pageSize: 200 },
    request.headers.get("cookie") ?? undefined,
  );
  return toRows(page.records);
};
