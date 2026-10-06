// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { DeleteUserResult, Session, User, UserDeletionPreview } from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

import { GLOBAL_ROLES } from "./roles";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

export interface ListUsersParameters {
  includeDeleted?: boolean;
  search?: string;
}

/** The admin user directory, site-admin only. */
export const listUsers = async (
  request: Request,
  parameters: ListUsersParameters = {},
): Promise<readonly User[]> => {
  await requirePermissionFromRequest(request, PERMISSIONS.UserManage, "/");
  const page = await edge.users(parameters, cookieOf(request));
  return page.users;
};

/** One user by id. There is no single-user gateway query (T12 mirrors the original's own
 *  directory read), so this re-lists and finds — the admin directory is small enough that a
 *  full-page read per edit is the same shape the original UI already used. */
export const findUser = async (request: Request, userId: string): Promise<undefined | User> => {
  const users = await listUsers(request, { includeDeleted: true });
  return users.find((u) => u.userId === userId);
};

/** Enables or disables an account. Refused server-side for the protected root. */
export const setUserEnabled = async (
  request: Request,
  userId: string,
  enabled: boolean,
): Promise<User> => {
  await requirePermissionFromRequest(request, PERMISSIONS.UserManage, "/");
  const cookie = cookieOf(request);
  return enabled ? edge.enableUser(userId, cookie) : edge.disableUser(userId, cookie);
};

/**
 * Reconciles a user's GLOBAL roles to exactly `nextRoles` (grants what's missing, revokes
 * what's no longer present), scoped to the roles this area assigns (`GLOBAL_ROLES`) so it
 * never touches a category-scoped or not-yet-portable grant it didn't list.
 */
export const setUserGlobalRoles = async (
  request: Request,
  user: User,
  nextRoles: readonly string[],
): Promise<User> => {
  await requirePermissionFromRequest(request, PERMISSIONS.UserManage, "/");
  const cookie = cookieOf(request);
  const assignable = new Set<string>(GLOBAL_ROLES.map((r) => r.value));
  const current = new Set(user.roles.filter((r) => assignable.has(r)));
  const next = new Set(nextRoles.filter((r) => assignable.has(r)));

  let latest = user;
  for (const role of next) {
    if (!current.has(role)) latest = await edge.grantRole(latest.userId, role, cookie);
  }
  for (const role of current) {
    if (!next.has(role)) latest = await edge.revokeRole(latest.userId, role, cookie);
  }
  return latest;
};

/** Edits another user's name and email. Local accounts only, enforced by the gateway. */
export const saveUserProfile = async (
  request: Request,
  userId: string,
  name: string,
  email: string,
): Promise<User> => {
  await requirePermissionFromRequest(request, PERMISSIONS.UserManage, "/");
  return edge.updateUserProfile(userId, name, email, cookieOf(request));
};

/** A user's sessions, newest first. Session management is its own, narrower capability. */
export const listUserSessions = async (
  request: Request,
  userId: string,
): Promise<readonly Session[]> => {
  await requirePermissionFromRequest(request, PERMISSIONS.SessionManage, "/");
  const sessions = await edge.listUserSessions(userId, cookieOf(request));
  return sessions.toSorted((a, b) => b.issuedAt.localeCompare(a.issuedAt));
};

/** Signs a user out everywhere. Returns how many active sessions were revoked. */
export const revokeUserSessions = async (request: Request, userId: string): Promise<number> => {
  await requirePermissionFromRequest(request, PERMISSIONS.SessionManage, "/");
  return edge.revokeUserSessions(userId, "Revoked by site-admin", cookieOf(request));
};

/** The delete confirmation's read-only dry run. */
export const previewUserDeletion = async (
  request: Request,
  userId: string,
): Promise<UserDeletionPreview> => {
  await requirePermissionFromRequest(request, PERMISSIONS.UserManage, "/");
  return edge.previewUserDeletion(userId, cookieOf(request));
};

/** Soft-deletes a user. The gateway refuses this while the preview reports `blocksDelete`. */
export const deleteUser = async (request: Request, userId: string): Promise<DeleteUserResult> => {
  await requirePermissionFromRequest(request, PERMISSIONS.UserManage, "/");
  return edge.deleteUser(userId, cookieOf(request));
};
