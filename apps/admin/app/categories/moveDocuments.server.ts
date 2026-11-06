// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { MovePolicyItem, Policy } from "@steward-web/api-client";

import { DocumentType } from "@steward-web/api-client";
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

const requireManage = (request: Request) =>
  requirePermissionFromRequest(request, PERMISSIONS.GroupManage, "/");

/** The policies and procedures sitting in a category now (not the ones in its children). */
export const documentsIn = async (
  request: Request,
  categoryId: string,
): Promise<readonly Policy[]> => {
  await requireManage(request);
  const cookie = cookieOf(request);
  const [policies, procedures] = await Promise.all([
    edge.policies(DocumentType.Policy, cookie),
    edge.policies(DocumentType.Procedure, cookie),
  ]);
  return [...policies, ...procedures].filter((p) => p.homeGroupId === categoryId && !p.retiredAt);
};

/** What moving the documents to the target would do. Changes nothing. */
export const previewMove = async (
  request: Request,
  policyIds: readonly string[],
  homeCategoryId: string,
): Promise<readonly MovePolicyItem[]> => {
  await requireManage(request);
  return edge.previewMovePolicies(policyIds, homeCategoryId, cookieOf(request));
};

/** Moves them together; the service refuses the whole batch if any one would be refused. */
export const moveDocuments = async (
  request: Request,
  policyIds: readonly string[],
  homeCategoryId: string,
): Promise<readonly MovePolicyItem[]> => {
  await requireManage(request);
  return edge.movePolicies(policyIds, homeCategoryId, cookieOf(request));
};
