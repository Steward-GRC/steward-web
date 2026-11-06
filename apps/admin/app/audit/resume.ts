// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { auditFilterParameters, type AuditFilters } from "./auditFilters";

/**
 * "See more" on a capped list (the Overview's Activity): the audit log opens at the entry right
 * after the last one the list showed, with the same filters. The cursor is the entry's id and
 * time, so it still works when the id has scrolled out of the page the log loads.
 */
export interface AuditCursor {
  after?: string;
  at?: string;
}

interface Timed {
  id: string;
  occurredAt: string;
}

/** The audit log from the newest entry, with the filters kept. */
export const auditBackPath = (filters: AuditFilters): string => {
  const query = auditFilterParameters(filters).toString();
  return query ? `/audit?${query}` : "/audit";
};

export const auditResumePath = (filters: AuditFilters, last: Timed): string => {
  const query = auditFilterParameters(filters);
  query.set("after", last.id);
  query.set("at", last.occurredAt);
  return `/audit?${query.toString()}`;
};

export const olderThan = (parameters: URLSearchParams): AuditCursor => {
  const after = parameters.get("after")?.trim();
  const at = parameters.get("at")?.trim();
  return { ...(after ? { after } : {}), ...(at ? { at } : {}) };
};

/** The records after the cursor entry (the list is newest first). */
export const resumeFrom = <T extends Timed>(records: readonly T[], cursor: AuditCursor): T[] => {
  if (!cursor.after && !cursor.at) return [...records];
  const index = cursor.after ? records.findIndex((r) => r.id === cursor.after) : -1;
  if (index >= 0) return records.slice(index + 1);
  const limit = cursor.at ? Date.parse(cursor.at) : Number.NaN;
  return Number.isNaN(limit)
    ? [...records]
    : records.filter((r) => Date.parse(r.occurredAt) < limit);
};
