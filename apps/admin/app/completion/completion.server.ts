// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AckActivityDay,
  AckExport,
  AckRoster,
  CompletionReport,
  Group,
  Policy,
} from "@steward-web/api-client";

import { DocumentType } from "@steward-web/api-client";
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";
import { data } from "react-router";

import { listGroups } from "../categories/categories.server";
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

/**
 * Acknowledgements per day over the last `days` days (A14's "Activity over time"). Null when
 * the gateway can't say, so the chart says so and the rest of the page still shows.
 */
export const getAckActivity = async (
  request: Request,
  policyVersionId: string,
  days: number,
  groupId: null | string = null,
): Promise<null | readonly AckActivityDay[]> => {
  await requireIdentityFromRequest(request);
  try {
    return await edge.ackActivity(policyVersionId, groupId, days, cookieOf(request));
  } catch {
    return null;
  }
};

export const exportAcks = async (request: Request, policyVersionId: string): Promise<AckExport> => {
  await requireIdentityFromRequest(request);
  return edge.exportAcks(policyVersionId, "csv", cookieOf(request));
};

const policyNumberPattern = /^[\w.-]{1,64}$/;

/**
 * The acknowledgement roster as a file download, for the export resource route. The policy
 * number only names the file, so anything that isn't a plain number is refused rather than
 * written into the header.
 */
export const ackExportDownload = async (request: Request): Promise<Response> => {
  const query = new URL(request.url).searchParams;
  const policyVersionId = query.get("policyVersionId") ?? "";
  const number = query.get("number") ?? "";
  if (!policyVersionId || !policyNumberPattern.test(number)) {
    throw data("missing or malformed policyVersionId or number", { status: 400 });
  }

  const result = await exportAcks(request, policyVersionId);
  return new Response(Uint8Array.from(Buffer.from(result.data, "base64")), {
    headers: {
      "Content-Disposition": `attachment; filename="acks-${number}.csv"`,
      "Content-Type": result.contentType,
    },
  });
};

/**
 * The admin Overview's acknowledgement snapshot (A1): acknowledged against the audience,
 * summed over every policy that requires acknowledgement, from each one's published version.
 */
export const acknowledgementSnapshot = async (
  request: Request,
): Promise<{ acknowledged: number; audience: number }> => {
  const obligating = await listObligatingPolicies(request);
  const reports = await Promise.all(
    obligating.map(({ policy }) =>
      policy.currentPublishedVersionId
        ? getCompletionReport(request, policy.currentPublishedVersionId)
        : null,
    ),
  );
  let acknowledged = 0;
  let audience = 0;
  for (const report of reports) {
    acknowledged += report?.totalAcked ?? 0;
    audience += report?.totalAudience ?? 0;
  }
  return { acknowledged, audience };
};
