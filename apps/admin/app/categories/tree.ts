// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/** The backend's own max taxonomy depth (root = depth 1); mirrored here only to grey out
 *  doomed move targets in the picker and the tree: the gateway enforces it regardless. */
export const MAX_GROUP_DEPTH = 3;

/** What the tree helpers need of a category: its id and where it hangs. */
export interface TreeNode {
  readonly id: string;
  readonly parentId?: null | string;
}

/** Depth of a group within a flat group list (a root is depth 1). */
export const depthOf = (groups: readonly TreeNode[], groupId: string): number => {
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
export const subtreeHeight = (groups: readonly TreeNode[], groupId: string): number => {
  const children = groups.filter((g) => g.parentId === groupId);
  return children.length === 0
    ? 1
    : 1 + Math.max(...children.map((c) => subtreeHeight(groups, c.id)));
};

/** The group and all its descendants: invalid move targets (a cycle). */
export const descendantIds = (groups: readonly TreeNode[], groupId: string): Set<string> => {
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

/** Why a move is refused, or "ok". `same` is a move to where the category already is. */
export type MoveVerdict = "depth" | "descendant" | "ok" | "same" | "self";

/**
 * Whether `groupId` may move under `newParentId` (null is the top level). The whole branch
 * moves with it, so its height counts against the depth limit.
 */
export const checkMove = (
  groups: readonly TreeNode[],
  groupId: string,
  newParentId: null | string,
): MoveVerdict => {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return "self";
  if (newParentId === groupId) return "self";
  if (newParentId !== null && descendantIds(groups, groupId).has(newParentId)) return "descendant";
  if ((group.parentId ?? null) === newParentId) return "same";
  const base = newParentId === null ? 0 : depthOf(groups, newParentId);
  return base + subtreeHeight(groups, groupId) > MAX_GROUP_DEPTH ? "depth" : "ok";
};

/** The "no parent" choice in a parent picker (a select option can't carry an empty value). */
export const TOP_LEVEL = "__top__";
