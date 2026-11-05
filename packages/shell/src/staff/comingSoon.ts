// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * Where the staff shell's designed destinations will live once they're built. Until then each
 * path answers with the "Coming soon" not-found page, so the shell can show every item the
 * design has (H1) without a dead link. A feature PR replaces its path's route and drops it here.
 *
 * Plain data with no imports: the app's `routes.ts` reads it at config time.
 */
export const COMING_SOON = {
  auditLog: "/audit",
  feedback: "/feedback",
  // U21 (CSV import) lands with the editor and new-draft issue (#15).
  importPolicies: "/drafts/import",
  inbox: "/inbox",
  logOutEverywhere: "/log-out-everywhere",
  myReports: "/compliance/reports",
  notifications: "/notifications",
  reportConcern: "/compliance/report",
  // U33, the security page, lands with the profile issue (#17).
  security: "/profile/security",
  templates: "/templates",
} as const;

export const COMING_SOON_PATHS: readonly string[] = Object.values(COMING_SOON);
