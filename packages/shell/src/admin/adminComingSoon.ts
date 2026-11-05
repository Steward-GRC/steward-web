// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * The admin shell's designed destinations that aren't built yet (H2, H14). Each answers the
 * "Coming soon" not-found page until its feature PR replaces the route. Plain data with no
 * imports: the admin app's `routes.ts` reads it at config time.
 */
export const ADMIN_COMING_SOON = {
  access: "/access",
  caseSettings: "/compliance/settings",
  logOutEverywhere: "/log-out-everywhere",
  notifications: "/notifications",
} as const;

export const ADMIN_COMING_SOON_PATHS: readonly string[] = Object.values(ADMIN_COMING_SOON);
