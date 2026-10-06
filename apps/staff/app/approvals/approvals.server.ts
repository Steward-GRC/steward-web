// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  PendingTask,
  SignalType,
  UpcomingApproval,
  WorkflowStatus,
} from "@steward-web/api-client";

import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

/** The authenticated viewer's pending-approval inbox (approver bound server-side). */
export const listPendingTasks = (request: Request): Promise<readonly PendingTask[]> =>
  edge.pendingTasks(cookieOf(request));

/** Approvals coming to the viewer at a future stage — heads-up only, not yet actionable. */
export const listUpcomingApprovals = (request: Request): Promise<readonly UpcomingApproval[]> =>
  edge.upcomingApprovals(cookieOf(request));

/** Approval-saga status for a policy version, for the stepper and the decision form. */
export const getWorkflowStatus = (
  request: Request,
  policyVersionId: string,
): Promise<WorkflowStatus> => edge.workflowStatus(policyVersionId, cookieOf(request));

/** Delivers the viewer's approve/reject decision. The actor is bound server-side. */
export const decideApproval = (
  request: Request,
  arguments_: {
    comment: string;
    policyVersionId: string;
    runId: string;
    signal: SignalType;
    taskId: string;
  },
): Promise<boolean> =>
  edge.signalWorkflow(
    arguments_.policyVersionId,
    arguments_.runId,
    arguments_.taskId,
    arguments_.signal,
    arguments_.comment,
    cookieOf(request),
  );
