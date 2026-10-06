// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * Client mirror of steward-authz's own permission catalog and role to permission map.
 *
 * steward-authz is the source of truth at runtime: `Me.permissions` is what the gateway
 * actually grants, and this file is never consulted to decide access. It exists only so the
 * mock gateway (`@steward-web/mock-gateway`) can compute a believable `Me.permissions` for a
 * chosen role without a real steward-authz to ask.
 */

export const PERMISSIONS = {
  AdminManage: "admin.manage",
  AuditRead: "audit.read",
  GroupManage: "group.manage",
  PolicyApprove: "policy.approve",
  PolicyAuthor: "policy.author",
  PolicyRead: "policy.read",
  PolicyReadSensitive: "policy.read_sensitive",
  ReportingManage: "reporting.manage",
  SessionManage: "session.manage",
  SettingsManage: "settings.manage",
  UserManage: "user.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL = Object.values(PERMISSIONS);

/** Mirrors steward-authz's own role grants. `admin` is intentionally absent as a role name. */
const roleGrants: Record<string, readonly string[]> = {
  approver: [PERMISSIONS.PolicyRead, PERMISSIONS.PolicyApprove],
  author: [PERMISSIONS.PolicyRead, PERMISSIONS.PolicyAuthor],
  "privacy-officer": [PERMISSIONS.PolicyRead, PERMISSIONS.ReportingManage],
  reader: [PERMISSIONS.PolicyRead],
  "site-admin": ALL,
};

/** Resolves a set of roles to the permissions they grant. An unrecognized role grants nothing. */
export const permissionsForRoles = (roles: readonly string[]): string[] => {
  const out = new Set<string>();
  for (const role of roles) {
    for (const permission of roleGrants[role] ?? []) out.add(permission);
  }
  return [...out];
};
