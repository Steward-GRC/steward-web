// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { PlatformGroup } from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

/**
 * Identity's platform groups: the groups users are members of, that group managers, SSO group
 * mappings and reporting's `REPORTING_OFFICER_GROUPS` name by id. Not the categories the
 * "Groups" pages manage (`groups.server.ts`). Site-admin only at the gateway; gated here on
 * `user.manage` so a caller without it goes home instead of seeing a refusal.
 */

export interface PlatformGroupRow {
  id: string;
  name: string;
  parentId: null | string;
  /** The group's name with its ancestors', "Parent / Child". */
  path: string;
}

/** Every platform group, breadth-first from the roots, ordered by path. */
export const listPlatformGroups = async (request: Request): Promise<PlatformGroupRow[]> => {
  await requirePermissionFromRequest(request, PERMISSIONS.UserManage, "/");
  const cookie = cookieOf(request);
  const rows: PlatformGroupRow[] = [];
  const seen = new Set<string>();
  let frontier: { id: null | string; path: string }[] = [{ id: null, path: "" }];
  while (frontier.length > 0) {
    const batches = await Promise.all(
      frontier.map(async (parent) => ({
        children: await edge.platformGroups(parent.id, cookie),
        parent,
      })),
    );
    const next: { id: string; path: string }[] = [];
    for (const { children, parent } of batches) {
      for (const group of children) {
        if (seen.has(group.id)) continue;
        seen.add(group.id);
        const path = parent.path ? `${parent.path} / ${group.name}` : group.name;
        rows.push({ id: group.id, name: group.name, parentId: group.parentId ?? null, path });
        next.push({ id: group.id, path });
      }
    }
    frontier = next;
  }
  return rows.toSorted((a, b) => a.path.localeCompare(b.path));
};

/** Creates a platform group under parentId (a root group when null). */
export const createPlatformGroup = async (
  request: Request,
  name: string,
  parentId: null | string,
): Promise<PlatformGroup> => {
  await requirePermissionFromRequest(request, PERMISSIONS.UserManage, "/");
  return edge.createPlatformGroup(name, parentId, cookieOf(request));
};
