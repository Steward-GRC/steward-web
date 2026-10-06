// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  BreachDecision,
  CaseNote,
  CaseNotice,
  CaseOutcome,
  CaseQueue,
  CaseStatus,
  CorrectiveActionInput,
  NoticeRecipient,
  NoticeStatus,
  ReportCase,
  RiskAssessment,
  RiskFactorsInput,
  ThreadMessage,
} from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

const requireReportingAccess = (request: Request) =>
  requirePermissionFromRequest(request, PERMISSIONS.ReportingManage, "/");

/** The case queue, optionally filtered by status and/or assignee. */
export const listReportCases = async (
  request: Request,
  statuses?: readonly CaseStatus[],
  assigneeUserId?: string,
): Promise<CaseQueue> => {
  await requireReportingAccess(request);
  return edge.reportCases(statuses, assigneeUserId, cookieOf(request));
};

/** One case's full detail. */
export const getReportCase = async (request: Request, caseId: string): Promise<ReportCase> => {
  await requireReportingAccess(request);
  return edge.reportCase(caseId, cookieOf(request));
};

/** Posts a message the reporter can see in the two-way thread. */
export const postCaseMessage = async (
  request: Request,
  caseId: string,
  body: string,
): Promise<ThreadMessage> => {
  await requireReportingAccess(request);
  return edge.postCaseMessage(caseId, body, cookieOf(request));
};

/** Adds an internal case note, never shown to the reporter. */
export const addCaseNote = async (
  request: Request,
  caseId: string,
  body: string,
): Promise<CaseNote> => {
  await requireReportingAccess(request);
  return edge.addCaseNote(caseId, body, cookieOf(request));
};

/** Sets or clears (null) a case's assignee. */
export const assignCase = async (
  request: Request,
  caseId: string,
  assigneeUserId: null | string,
): Promise<ReportCase> => {
  await requireReportingAccess(request);
  return edge.assignCase(caseId, assigneeUserId, cookieOf(request));
};

/** Any status but CLOSED; closing goes through `closeReportCase`. */
export const setCaseStatus = async (
  request: Request,
  caseId: string,
  status: CaseStatus,
): Promise<ReportCase> => {
  await requireReportingAccess(request);
  return edge.setCaseStatus(caseId, status, cookieOf(request));
};

/** Sets the discovery date every notification deadline counts from. */
export const setCaseDiscoveryDate = async (
  request: Request,
  caseId: string,
  discoveredOn: string,
): Promise<ReportCase> => {
  await requireReportingAccess(request);
  return edge.setCaseDiscoveryDate(caseId, discoveredOn, cookieOf(request));
};

/** Records the guided risk assessment and its reportable/not-reportable decision. */
export const recordRiskAssessment = async (
  request: Request,
  caseId: string,
  factors: RiskFactorsInput,
  decision: BreachDecision,
  reason: string,
): Promise<RiskAssessment> => {
  await requireReportingAccess(request);
  return edge.recordRiskAssessment(caseId, factors, decision, reason, cookieOf(request));
};

/** Adds a notification-tracker entry; its deadline is set server-side from the discovery date. */
export const addCaseNotice = async (
  request: Request,
  caseId: string,
  recipient: NoticeRecipient,
  label?: string,
  method?: string,
): Promise<CaseNotice> => {
  await requireReportingAccess(request);
  return edge.addCaseNotice(caseId, recipient, label, method, cookieOf(request));
};

/** Updates a notification-tracker entry's status; `sentOn` is required with SENT. */
export const updateCaseNotice = async (
  request: Request,
  caseId: string,
  noticeId: string,
  status: NoticeStatus,
  sentOn?: string,
): Promise<CaseNotice> => {
  await requireReportingAccess(request);
  return edge.updateCaseNotice(caseId, noticeId, status, sentOn, cookieOf(request));
};

/** The outcome, corrective actions and the optional closing message to the reporter. */
export const closeReportCase = async (
  request: Request,
  caseId: string,
  outcome: CaseOutcome,
  correctiveActions: readonly CorrectiveActionInput[],
  closingMessage?: string,
): Promise<ReportCase> => {
  await requireReportingAccess(request);
  return edge.closeCase(caseId, outcome, correctiveActions, closingMessage, cookieOf(request));
};
