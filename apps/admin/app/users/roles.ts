// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * The global, assignable roles this area grants and revokes (A19's "Elevated roles": Site
 * admin, Template admin, Compliance admin). Reader is every enabled user's implicit baseline,
 * never stored and never a toggle. Category-scoped author and approver grants come from the
 * category access rules (A5), not from here.
 */
export const BASELINE_ROLE = "reader";

export const GLOBAL_ROLES = ["site-admin", "template-admin", "compliance-admin"] as const;

/** The i18n key of a role's name; an unknown role shows as it came. */
export const roleKey = (role: string): string => `admin:users.roles.${role}`;
