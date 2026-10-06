// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AckExport,
  AckRoster,
  CompletionReport,
  Group,
  Policy,
} from "@steward-web/api-client";

import { DocumentType } from "@steward-web/api-client";
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

import { listGroups } from "../groups/groups.server";
import { obligatingPolicies } from "./completion.logic";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

/** Every policy or procedure, published or not, across both document types. */
export const listAllPolicies = async (request: Request): Promise<readonly Policy[]> => {
  await requireIdentityFromRequest(request);
  const cookie = cookieOf(request);
  const [policies, procedures] = await Promise.all([
    edge.policies(DocumentType.Policy, cookie),
    edge.policies(DocumentType.Procedure, cookie),
  ]);
  return [...policies, ...procedures];
};

/** Every policy that requires acknowledgement, paired with its owning group. */
export const listObligatingPolicies = async (
  request: Request,
): Promise<{ group?: Group; policy: Policy }[]> => {
  const [policies, groups] = await Promise.all([listAllPolicies(request), listGroups(request)]);
  return obligatingPolicies(policies, groups);
};

export const getCompletionReport = async (
  request: Request,
  policyVersionId: string,
  groupId?: null | string,
): Promise<CompletionReport> => {
  await requireIdentityFromRequest(request);
  return edge.completionReport(policyVersionId, groupId, cookieOf(request));
};

export const getAckRoster = async (
  request: Request,
  policyVersionId: string,
  groupId?: null | string,
): Promise<AckRoster> => {
  await requireIdentityFromRequest(request);
  return edge.ackRoster(policyVersionId, groupId, cookieOf(request));
};

export const exportAcks = async (request: Request, policyVersionId: string): Promise<AckExport> => {
  await requireIdentityFromRequest(request);
  return edge.exportAcks(policyVersionId, "csv", cookieOf(request));
};
