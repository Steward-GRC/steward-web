// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Group, User, UserLabel } from "@steward-web/api-client";

import { requireIdentityFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

/**
 * Every taxonomy group, depth-first. Walks `groupChildren` directly rather than going
 * through `groups.server`'s `listGroups` (which gates on `group.manage`): a LOCAL
 * group-manager may hold no such permission and must still resolve the names of the groups
 * they themselves manage.
 */
const allGroups = async (request: Request): Promise<Group[]> => {
  const cookie = cookieOf(request);
  const all: Group[] = [];
  const seen = new Set<string>();
  let frontier: (null | string)[] = [null];
  while (frontier.length > 0) {
    const batches = await Promise.all(
      frontier.map((parentId) => edge.groupChildren(parentId, cookie)),
    );
    const next: string[] = [];
    for (const kids of batches) {
      for (const g of kids) {
        if (seen.has(g.id)) continue;
        seen.add(g.id);
        all.push(g);
        next.push(g.id);
      }
    }
    frontier = next;
  }
  return all;
};

export interface ManagedGroup {
  id: string;
  name: string;
}

/** The groups the signed-in caller is a LOCAL group-manager of, by name, alphabetical. Empty
 *  for anyone who manages none. */
export const listManagedGroups = async (request: Request): Promise<ManagedGroup[]> => {
  const identity = await requireIdentityFromRequest(request);
  if (identity.managedGroupIds.length === 0) return [];
  const managed = new Set(identity.managedGroupIds);
  const groups = await allGroups(request);
  return groups
    .filter((g) => managed.has(g.id))
    .map((g) => ({ id: g.id, name: g.name }))
    .toSorted((a, b) => a.name.localeCompare(b.name));
};

export interface GroupMember {
  email: string;
  name: string;
  /** "manual" or "idp-sync"; a synced membership is read-only in this editor. */
  source: string;
  userId: string;
}

const memberView = (user: User, groupId: string): GroupMember => ({
  email: user.email,
  name: user.name,
  source: user.memberships.find((m) => m.groupId === groupId)?.source ?? "manual",
  userId: user.userId,
});

/** The direct members of one managed group. Authorized at the gateway for a site-admin or a
 *  LOCAL group-manager of groupId; no permission check here. */
export const listManagedGroupMembers = async (
  request: Request,
  groupId: string,
): Promise<GroupMember[]> => {
  const users = await edge.managedGroupMembers(groupId, cookieOf(request));
  return users.map((u) => memberView(u, groupId));
};

/** Resolves an exact email out of the lightweight `searchUsers` typeahead — the only user
 *  read a group-manager (who may lack `user.manage`) is authorized to make. */
export const findUserByEmail = async (
  request: Request,
  email: string,
): Promise<undefined | UserLabel> => {
  const needle = email.trim().toLowerCase();
  const matches = await edge.searchUsers(needle, 5, cookieOf(request));
  return matches.find((u) => u.email?.toLowerCase() === needle);
};

/** Adds a MANUAL membership. Authorized at the gateway for a site-admin or a LOCAL
 *  group-manager of groupId. */
export const addUserToGroup = async (
  request: Request,
  userId: string,
  groupId: string,
): Promise<void> => {
  await edge.addUserToGroup(userId, groupId, cookieOf(request));
};

/** Removes a MANUAL membership; the gateway refuses an IdP-synced one. */
export const removeUserFromGroup = async (
  request: Request,
  userId: string,
  groupId: string,
): Promise<void> => {
  await edge.removeUserFromGroup(userId, groupId, cookieOf(request));
};
