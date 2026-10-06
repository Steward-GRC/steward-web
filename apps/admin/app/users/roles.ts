// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * The global, assignable roles this area grants and revokes. Reader is every enabled user's
 * implicit baseline (never stored, never shown as a toggle). Category-scoped author/approver
 * grants stay on the access-review surface for their domain, not here, and the rest of the
 * platform-role catalog (template-admin, compliance-admin, ...) is added as its owning area
 * ports and the permission catalog grows to match.
 */
export const BASELINE_ROLE = "reader";

export const GLOBAL_ROLES = [{ label: "Site admin", value: "site-admin" }] as const;

export const roleLabel = (value: string): string =>
  GLOBAL_ROLES.find((r) => r.value === value)?.label ?? value;
