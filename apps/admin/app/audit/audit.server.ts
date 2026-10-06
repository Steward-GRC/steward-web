// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AuditChainVerification, AuditRecord } from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

const requireAuditRead = (request: Request) =>
  requirePermissionFromRequest(request, PERMISSIONS.AuditRead, "/");

export interface AuditLogFilters {
  action?: string;
  actorUserId?: string;
  groupId?: string;
  subject?: string;
}

/**
 * The admin audit log, newest first. groupId/actorUserId/subject filter server-side via the
 * gateway; action is left to the caller (the gateway has no argument for it) and is applied
 * here as a substring match, same as the original.
 */
export const listAuditLog = async (
  request: Request,
  filters: AuditLogFilters = {},
): Promise<readonly AuditRecord[]> => {
  await requireAuditRead(request);
  const page = await edge.auditLog(
    {
      actorUserId: filters.actorUserId || undefined,
      groupId: filters.groupId || undefined,
      pageSize: 200,
      subject: filters.subject || undefined,
    },
    cookieOf(request),
  );
  const action = filters.action?.trim();
  return action ? page.records.filter((r) => r.action.includes(action)) : page.records;
};

/** Recomputes the hash chain across a record range and reports whether it still holds. */
export const verifyAuditChain = async (
  request: Request,
  fromRecordId: string,
  toRecordId: string,
): Promise<AuditChainVerification> => {
  await requireAuditRead(request);
  return edge.verifyAuditChain(fromRecordId, toRecordId, cookieOf(request));
};
