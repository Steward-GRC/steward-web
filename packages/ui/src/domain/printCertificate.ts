// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { HistoryEntry } from "./policyReaderModel";

import { withV } from "./PolicyReaderHistory";

export type CertificateRole =
  | "approved"
  | "changesRequested"
  | "drafted"
  | "published"
  | "rejected"
  | "reviewed"
  | "submitted";

export interface CertificateRow {
  actorName: null | string;
  at: string;
  comment: null | string;
  role: CertificateRole;
  stage: null | string;
}

const ROLE_OF_KIND: Readonly<Record<string, CertificateRole>> = {
  approved: "approved",
  changesRequested: "changesRequested",
  created: "drafted",
  decided: "reviewed",
  published: "published",
  rejected: "rejected",
  submitted: "submitted",
};

/**
 * The version-history page's rows: who drafted, submitted, reviewed, approved and published
 * one version, and when, oldest first. It reads the same events as the History tab (the
 * policy's `history`), so the two never disagree; other kinds (saves, moves, acknowledgements)
 * are not part of the version's sign-off and are left out.
 */
export const certificateOf = (
  history: readonly HistoryEntry[],
  version: string,
): CertificateRow[] => {
  const label = withV(version);
  const rows: CertificateRow[] = [];
  for (const event of history) {
    if (withV(event.versionLabel) !== label) continue;
    const role = ROLE_OF_KIND[event.kind];
    if (!role) continue;
    if (role === "drafted" && rows.some((row) => row.role === "drafted")) continue;
    rows.push({
      actorName: event.actorName ?? null,
      at: event.at,
      comment: event.comment ?? null,
      role,
      stage: event.stage ?? null,
    });
  }
  return rows.toSorted((a, b) => a.at.localeCompare(b.at));
};
