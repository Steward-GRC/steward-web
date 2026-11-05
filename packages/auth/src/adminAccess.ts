// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Identity } from "./identity";

/** The permissions that each open some part of the admin console. */
const ADMIN_PERMISSIONS = [
  "admin.manage",
  "audit.read",
  "group.manage",
  "settings.manage",
  "template.manage",
  "user.manage",
];

/**
 * Whether someone has a way into the admin console: site, template or compliance admins
 * (through those permissions) and anyone who manages a group. Everyone else gets "Admins
 * only" (G12) there, and the staff header shows them no Admin link.
 */
export const canOpenAdmin = (identity: Identity): boolean =>
  identity.isSiteAdmin ||
  identity.isGroupManager ||
  ADMIN_PERMISSIONS.some((permission) => identity.permissions.has(permission));
