// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Group, ReviewCadence, Template, Workflow } from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

/** The backend's own max taxonomy depth (root = depth 1); mirrored here only to grey out
 *  doomed move targets in the picker — the gateway enforces it regardless. */
export const MAX_GROUP_DEPTH = 3;

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const isValidSlug = (slug: string): boolean => SLUG_PATTERN.test(slug);

export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");

/** Depth of a group within a flat group list (a root is depth 1). */
export const depthOf = (groups: readonly Group[], groupId: string): number => {
  let depth = 0;
  let current = groups.find((g) => g.id === groupId);
  while (current) {
    depth += 1;
    const parentId = current.parentId;
    current = parentId ? groups.find((g) => g.id === parentId) : undefined;
  }
  return depth;
};

/** Height of a group's subtree (a leaf has height 1). */
export const subtreeHeight = (groups: readonly Group[], groupId: string): number => {
  const children = groups.filter((g) => g.parentId === groupId);
  return children.length === 0
    ? 1
    : 1 + Math.max(...children.map((c) => subtreeHeight(groups, c.id)));
};

/** The group and all its descendants — invalid move targets (would form a cycle). */
export const descendantIds = (groups: readonly Group[], groupId: string): Set<string> => {
  const ids = new Set<string>([groupId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const g of groups) {
      if (g.parentId && ids.has(g.parentId) && !ids.has(g.id)) {
        ids.add(g.id);
        grew = true;
      }
    }
  }
  return ids;
};

export interface GroupPath {
  id: string;
  path: string;
}

/** Every group, depth-first (roots first, siblings together), each with its full
 *  parent -> child display path (e.g. "Meridian Holdings > IT Security"). */
export const orderedWithPaths = (
  groups: readonly Group[],
  excludeIds?: Set<string>,
): GroupPath[] => {
  const byParent = new Map<null | string, Group[]>();
  for (const g of groups) {
    const key = g.parentId ?? null;
    byParent.set(key, [...(byParent.get(key) ?? []), g]);
  }
  const out: GroupPath[] = [];
  const walk = (parentId: null | string, prefix: string) => {
    for (const g of byParent.get(parentId) ?? []) {
      if (excludeIds?.has(g.id)) continue;
      const path = prefix ? `${prefix} › ${g.name}` : g.name;
      out.push({ id: g.id, path });
      walk(g.id, path);
    }
  };
  walk(null, "");
  return out;
};

/** Valid re-parent targets for groupId: not itself or a descendant (a cycle), and shallow
 *  enough that the moved subtree still fits within MAX_GROUP_DEPTH. */
export const moveCandidates = (groups: readonly Group[], groupId: string): GroupPath[] => {
  const excluded = descendantIds(groups, groupId);
  const height = subtreeHeight(groups, groupId);
  return orderedWithPaths(groups, excluded).filter(
    ({ id }) => depthOf(groups, id) + height <= MAX_GROUP_DEPTH,
  );
};

/**
 * A sub-group (anything below a top-level department) doesn't set its own owners: it
 * inherits them, read-only, from its nearest top-level-department ancestor. A root (no
 * parent) and a top-level department (a root's direct child) always own their own list.
 */
export const effectiveOwners = (groups: readonly Group[], group: Group): readonly string[] => {
  const rootIds = new Set(groups.filter((g) => g.parentId == null).map((g) => g.id));
  if (group.parentId == null || rootIds.has(group.parentId)) return group.owners;
  let current: Group | undefined = group;
  while (current?.parentId && !rootIds.has(current.parentId)) {
    current = groups.find((g) => g.id === current!.parentId);
  }
  return current?.owners ?? [];
};

/** True for a root or a top-level department — the levels that own their own `owners`. */
export const ownsOwners = (groups: readonly Group[], group: Group): boolean => {
  const rootIds = new Set(groups.filter((g) => g.parentId == null).map((g) => g.id));
  return group.parentId == null || rootIds.has(group.parentId);
};

const requireGroupManage = (request: Request) =>
  requirePermissionFromRequest(request, PERMISSIONS.GroupManage, "/");

/** The whole group directory, flat. The gateway has no "all groups" query, so this walks
 *  the tree breadth-first via groupChildren (parentId: null = the roots). */
export const listGroups = async (request: Request): Promise<Group[]> => {
  await requireGroupManage(request);
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

export const findGroup = async (request: Request, groupId: string): Promise<Group | undefined> => {
  const groups = await listGroups(request);
  return groups.find((g) => g.id === groupId);
};

export const listTemplates = async (request: Request): Promise<readonly Template[]> => {
  await requireGroupManage(request);
  return edge.templates(cookieOf(request));
};

export const listWorkflows = async (request: Request): Promise<readonly Workflow[]> => {
  await requireGroupManage(request);
  return edge.workflows(cookieOf(request));
};

export const createGroup = async (
  request: Request,
  input: { name: string; parentId: null | string; slug: string },
): Promise<Group> => {
  await requireGroupManage(request);
  return edge.createGroup(input, cookieOf(request));
};

export const renameGroup = async (
  request: Request,
  input: { groupId: string; name: string; slug: string },
): Promise<Group> => {
  await requireGroupManage(request);
  return edge.renameGroup(input.groupId, input.name, input.slug, cookieOf(request));
};

export const deleteGroup = async (request: Request, groupId: string): Promise<void> => {
  await requireGroupManage(request);
  await edge.deleteGroup(groupId, cookieOf(request));
};

export const moveGroup = async (
  request: Request,
  groupId: string,
  newParentId: null | string,
): Promise<Group> => {
  await requireGroupManage(request);
  return edge.moveGroup(groupId, newParentId, cookieOf(request));
};

export interface GroupSettingsPatch {
  defaultTemplateId: null | string;
  defaultTemplateNone: boolean;
  defaultWorkflowId: null | string;
  owners: readonly string[];
  reviewCadence: ReviewCadence;
  reviewDate: null | string;
}

export const updateGroupSettings = async (
  request: Request,
  groupId: string,
  patch: GroupSettingsPatch,
): Promise<Group> => {
  await requireGroupManage(request);
  return edge.updateGroupSettings({ id: groupId, ...patch }, cookieOf(request));
};
