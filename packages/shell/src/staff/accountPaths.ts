// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * Where the staff shell's account destinations live (U33, U35, U36): the bell's inbox, the
 * account menu's notification settings, and the security page the second-factor nudge's
 * "Set up" opens.
 *
 * Plain data with no imports, like `comingSoon.ts`.
 */
export const ACCOUNT_PATHS = {
  inbox: "/inbox",
  notifications: "/notifications",
  security: "/profile/security",
} as const;
