// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * Client mirror of steward-authz's permission catalog: the names `Me.permissions` carries.
 *
 * steward-authz is the source of truth at runtime: `Me.permissions` is what the gateway
 * actually grants. The apps use these names to ask whether the signed-in user holds one.
 */

export const PERMISSIONS = {
  AdminManage: "admin.manage",
  AuditRead: "audit.read",
  ComplianceManage: "compliance.manage",
  GroupManage: "group.manage",
  PolicyApprove: "policy.approve",
  PolicyAuthor: "policy.author",
  PolicyRead: "policy.read",
  PolicyReadSensitive: "policy.read_sensitive",
  ReportingManage: "reporting.manage",
  SessionManage: "session.manage",
  SettingsManage: "settings.manage",
  TemplateManage: "template.manage",
  UserManage: "user.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
