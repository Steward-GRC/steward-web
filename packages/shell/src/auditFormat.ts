// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AuditRecord } from "@steward-web/api-client";

/**
 * Readable labels for the audit actions the services emit today. An action missing from
 * this map (a new one, or a typo in a filter) falls back to a generic transform rather
 * than failing: dots and underscores become spaces, the whole string sentence-cased.
 */
const ACTION_LABELS: Record<string, string> = {
  "group.created": "Group created",
  "group.deleted": "Group deleted",
  "group.updated": "Group updated",
  "organization.activated": "Organisation activated",
  "policy.published": "Policy published",
  "role.granted": "Role granted",
  "role.revoked": "Role revoked",
  "session.login": "Session login",
  "session.revoked": "Session revoked",
  "user.disabled": "User disabled",
  "user.enabled": "User enabled",
};

export const actionLabel = (action: string): string => {
  if (action in ACTION_LABELS) return ACTION_LABELS[action]!;
  const readable = action.replaceAll(/[._]/g, " ");
  return readable.charAt(0).toUpperCase() + readable.slice(1).toLowerCase();
};

/** Shortens a long opaque id for display when there is no resolved label to show instead. */
export const shortId = (id: string): string => (id.length > 12 ? `${id.slice(0, 12)}…` : id);

/**
 * The gateway resolves actorName/groupName/subjectLabel server-side and leaves one null on
 * a resolution miss (see the schema). This is the one fallback the UI needs: show the
 * resolved label when there is one, else a shortened form of the raw id.
 */
export const displayLabel = (label: null | string | undefined, rawId: string): string =>
  label ?? shortId(rawId);

/** The inclusive [fromRecordId, toRecordId] range covering every given record, compared as
 *  the backend's own 64-bit ids (BigInt, never a JS Number: a plain numeric comparison would
 *  silently lose precision above 2^53). Undefined when there is nothing to check. */
export const auditChainRange = (
  records: readonly AuditRecord[],
): { fromRecordId: string; toRecordId: string } | undefined => {
  if (records.length === 0) return undefined;
  let min = records[0]!.id;
  let max = records[0]!.id;
  for (const record of records.slice(1)) {
    if (BigInt(record.id) < BigInt(min)) min = record.id;
    if (BigInt(record.id) > BigInt(max)) max = record.id;
  }
  return { fromRecordId: min, toRecordId: max };
};

/**
 * Whether a record belongs to a reporting case (or a report). A reporter's identity must not be
 * recoverable from any audit list, so lists meant for staff leave these out entirely
 * (anonymous reporting: nothing identifies the reporter, and the people who handle a case stay
 * with the case screens).
 */
export const isReportingRecord = (
  record: Pick<AuditRecord, "action" | "subject" | "tier">,
): boolean =>
  /^(case|report|reporting)[._:]/.test(record.action) ||
  /^(case|report|reporting)[._:]/.test(record.subject) ||
  record.tier === "reporting";
