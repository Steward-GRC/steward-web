// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AiSettings,
  EmailServiceConfigInput,
  EmailServiceConfigStatus,
  GlobalSettings,
  GlobalSettingsInput,
} from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

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
