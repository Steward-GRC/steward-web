// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AccountMergePreview, MergeAccountsResult } from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

/** A read-only, side-effect-free dry run of what merging sourceUserId INTO targetUserId
 *  would move, surfaced before the irreversible `mergeAccounts` call. Site-admin only. */
export const previewAccountMerge = async (
  request: Request,
  sourceUserId: string,
  targetUserId: string,
): Promise<AccountMergePreview> => {
  await requirePermissionFromRequest(request, PERMISSIONS.UserManage, "/");
  return edge.previewAccountMerge(sourceUserId, targetUserId, cookieOf(request));
};

/** Merges sourceUserId INTO targetUserId and closes (soft-deletes) the source account.
 *  Irreversible. `confirmPrivileged` must be true when the preview reported
 *  `requiresPrivilegedConfirm`. Site-admin only. */
export const mergeAccounts = async (
  request: Request,
  sourceUserId: string,
  targetUserId: string,
  confirmPrivileged: boolean,
): Promise<MergeAccountsResult> => {
  await requirePermissionFromRequest(request, PERMISSIONS.UserManage, "/");
  return edge.mergeAccounts(
    sourceUserId,
    targetUserId,
    confirmPrivileged,
    undefined,
    cookieOf(request),
  );
};
