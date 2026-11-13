// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AiSettings,
  ComplianceSettings,
  EmailServiceConfigInput,
  EmailServiceConfigStatus,
  GlobalSettings,
  GlobalSettingsInput,
  HardResetRequest,
  HardResetResult,
  WorkCalendarInput,
} from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { identityFromRequest, requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";
import { data } from "react-router";

import { listUsers } from "../users/users.server";
import { HARD_RESET_MODULE } from "./complianceErrors";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

const requireSettingsManage = (request: Request) =>
  requirePermissionFromRequest(request, PERMISSIONS.SettingsManage, "/");

export const getGlobalSettings = async (request: Request): Promise<GlobalSettings> => {
  await requireSettingsManage(request);
  return edge.globalSettings(cookieOf(request));
};

export const saveGlobalSettings = async (
  request: Request,
  input: GlobalSettingsInput,
): Promise<GlobalSettings> => {
  await requireSettingsManage(request);
  return edge.setGlobalSettings(input, cookieOf(request));
};

/**
 * Saves the site work calendar through setGlobalSettings. The input needs the announcement and
 * the maintenance notice too, so the stored ones are read first and sent back unchanged.
 */
export const saveWorkCalendar = async (
  request: Request,
  workCalendar: WorkCalendarInput,
): Promise<GlobalSettings> => {
  await requireSettingsManage(request);
  const current = await edge.globalSettings(cookieOf(request));
  return edge.setGlobalSettings(
    { announcement: current.announcement, maintenance: current.maintenance, workCalendar },
    cookieOf(request),
  );
};

export const getEmailServiceConfig = async (
  request: Request,
): Promise<EmailServiceConfigStatus> => {
  await requireSettingsManage(request);
  return edge.emailServiceConfig(cookieOf(request));
};

export const saveEmailServiceConfig = async (
  request: Request,
  input: EmailServiceConfigInput,
): Promise<EmailServiceConfigStatus> => {
  await requireSettingsManage(request);
  return edge.setEmailServiceConfig(input, cookieOf(request));
};

/**
 * Where this install runs: the appliance's name on an appliance, which configures AI on its own
 * box, else null (Kubernetes, cloud, the mock). Read from the gateway's diagnostics, never
 * guessed, so the Settings page locks the AI cards only where it is true (#113).
 */
export const getAppliance = async (request: Request): Promise<null | string> => {
  await requireSettingsManage(request);
  return edge
    .diagnostics(cookieOf(request))
    .then((diagnostics) => diagnostics.appliance ?? null)
    .catch(() => null);
};

/** A28's three AI cards: on or off, whether a token is stored, and the retrieval count. */
export const getAiSettings = async (request: Request): Promise<AiSettings> => {
  await requireSettingsManage(request);
  return edge.aiConfig(cookieOf(request));
};

export const setAiEnabled = async (request: Request, enabled: boolean): Promise<void> => {
  await requireSettingsManage(request);
  await edge.setAiEnabled(enabled, cookieOf(request));
};

/** Replaces the provider token, write-only; an empty value clears it ("Clear token"). */
export const setAiToken = async (request: Request, token: string): Promise<void> => {
  await requireSettingsManage(request);
  await edge.setAiProviderCredential(token.trim(), cookieOf(request));
};

/** Results retrieved per question; the gateway clamps it and answers with what's in force. */
export const setAiTopK = async (request: Request, topK: number): Promise<number> => {
  await requireSettingsManage(request);
  return edge.setAiRetrievalConfig(topK, cookieOf(request));
};

/** The Compliance module's switch. Compliance managers and root hold the permission. */
export const getComplianceSettings = async (request: Request): Promise<ComplianceSettings> => {
  await requirePermissionFromRequest(request, PERMISSIONS.ComplianceManage, "/");
  return edge.complianceSettings(cookieOf(request));
};

/** Switches the Compliance module off or on. Off keeps every case. */
export const setComplianceModule = async (
  request: Request,
  enabled: boolean,
): Promise<ComplianceSettings> => {
  await requirePermissionFromRequest(request, PERMISSIONS.ComplianceManage, "/");
  return edge.setComplianceModule(enabled, cookieOf(request));
};

/** The hard reset steps are for site admins; the gateway checks the finer roles again. */
const requireSiteAdmin = async (request: Request) => {
  const identity = await identityFromRequest(request);
  if (!identity.isSiteAdmin) throw data({ needs: "site-admin" }, { status: 403 });
  return identity;
};

/** What the Hard reset card shows: who is looking, the Compliance requests and the names. */
export interface HardResetView {
  names: Record<string, string>;
  requests: readonly HardResetRequest[];
  viewer: { id: string; isRoot: boolean };
}

/**
 * The Compliance hard reset requests, newest first, with the names of the people on them and
 * whether the viewer is the root admin (the identity has no root flag; the user list does).
 */
export const getHardReset = async (request: Request): Promise<HardResetView> => {
  const identity = await requireSiteAdmin(request);
  const [requests, people] = await Promise.all([
    edge.hardResetRequests(HARD_RESET_MODULE, cookieOf(request)),
    listUsers(request),
  ]);
  return {
    names: Object.fromEntries(people.map((person) => [person.userId, person.name])),
    requests,
    viewer: {
      id: identity.id,
      isRoot: people.some((person) => person.isRoot && person.userId === identity.id),
    },
  };
};

/** The root admin asks for a hard reset of the Compliance module. The reason is never logged. */
export const requestComplianceHardReset = async (
  request: Request,
  reason: string,
): Promise<HardResetRequest> => {
  await requireSiteAdmin(request);
  return edge.requestHardReset(HARD_RESET_MODULE, reason, cookieOf(request));
};

/** A site admin other than the requester approves a pending request. */
export const approveComplianceHardReset = async (
  request: Request,
  requestId: string,
): Promise<HardResetRequest> => {
  await requireSiteAdmin(request);
  return edge.approveHardReset(requestId, cookieOf(request));
};

/** The requester withdraws a pending or approved request. */
export const cancelComplianceHardReset = async (
  request: Request,
  requestId: string,
): Promise<HardResetRequest> => {
  await requireSiteAdmin(request);
  return edge.cancelHardReset(requestId, cookieOf(request));
};

/** The root admin runs an approved request with the typed phrase. */
export const executeComplianceHardReset = async (
  request: Request,
  requestId: string,
  confirmation: string,
): Promise<HardResetResult> => {
  await requireSiteAdmin(request);
  return edge.executeHardReset(requestId, confirmation, cookieOf(request));
};
