// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
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
