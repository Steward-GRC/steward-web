// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Who the workflow editor may offer as an approver (steward-web bug 15): the gateway's own answer
// for one workflow, never the site-wide user list.
import type { User } from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

import type { ApproverCandidatesView } from "./ApproverPicker";

/**
 * The people the workflow's categories let approve, and whether any category uses it. Null when
 * the gateway refuses or is behind, so the editor can say so instead of claiming the workflow
 * is unattached. A caller without group.manage is sent home, as on every workflow read.
 */
export const getApproverCandidates = async (
  request: Request,
  workflowId: string,
): Promise<ApproverCandidatesView | null> => {
  await requirePermissionFromRequest(request, PERMISSIONS.GroupManage, "/");
  try {
    const answer = await edge.workflowApproverCandidates(
      workflowId,
      request.headers.get("cookie") ?? undefined,
    );
    return {
      attached: answer.attached,
      users: answer.attached
        ? answer.users.map((user) => ({ id: user.userId, name: user.name }))
        : [],
    };
  } catch {
    return null;
  }
};

/** Platform group id to the ids of its direct members, from the user directory the loader read. */
export const groupMembersOf = (users: readonly User[]): Record<string, readonly string[]> => {
  const members: Record<string, string[]> = {};
  for (const user of users) {
    if (user.deletedAt) continue;
    for (const groupId of user.groupIds) (members[groupId] ??= []).push(user.userId);
  }
  return members;
};
