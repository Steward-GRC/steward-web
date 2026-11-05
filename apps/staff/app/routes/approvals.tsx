// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { WorkflowStatus } from "@steward-web/api-client";

import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { DocumentType } from "@steward-web/ui/domain";
import { listPolicies } from "@steward-web/ui/domain/server";

import type { Route } from "./+types/approvals";

import {
  getWorkflowStatus,
  listPendingTasks,
  listUpcomingApprovals,
} from "../approvals/approvals.server";
import { ApprovalsInbox } from "../approvals/ApprovalsInbox";
import { type InboxEntry, inboxEntryOf } from "../approvals/inbox";

/** A run's stages, or undefined when it can't be read; the row still lists without them. */
const runOf = async (
  request: Request,
  policyVersionId: string,
): Promise<undefined | WorkflowStatus> => {
  try {
    return await getWorkflowStatus(request, policyVersionId);
  } catch {
    return;
  }
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const [pendingTasks, upcomingApprovals, policies, procedures] = await Promise.all([
    listPendingTasks(request),
    listUpcomingApprovals(request),
    listPolicies(DocumentType.Policy, cookie),
    listPolicies(DocumentType.Procedure, cookie),
  ]);
  const catalog = [...policies, ...procedures];
  const versions = [
    ...new Set([...pendingTasks, ...upcomingApprovals].map((task) => task.policyVersionId)),
  ];
  const runs = new Map(
    await Promise.all(versions.map(async (id) => [id, await runOf(request, id)] as const)),
  );
  return {
    // Runs you've decided that are still moving: the gateway can't list them yet (gateway #68).
    inProgress: [] as InboxEntry[],
    now: new Date().toISOString(),
    pending: pendingTasks.map((task) =>
      inboxEntryOf(task, catalog, runs.get(task.policyVersionId)),
    ),
    upcoming: upcomingApprovals.map((task) =>
      inboxEntryOf(task, catalog, runs.get(task.policyVersionId)),
    ),
  };
};

export default function ApprovalsRoute({ loaderData }: Route.ComponentProps) {
  return (
    <ApprovalsInbox
      inProgress={loaderData.inProgress}
      now={new Date(loaderData.now)}
      pending={loaderData.pending}
      upcoming={loaderData.upcoming}
    />
  );
}
