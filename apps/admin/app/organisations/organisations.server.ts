// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AddOrganizationInput,
  DomainVerification,
  GroupMapping,
  KeyValueInput,
  Organization,
  SpCertificate,
} from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

const requireSettingsManage = (request: Request) =>
  requirePermissionFromRequest(request, PERMISSIONS.SettingsManage, "/");

/** The whole organisation SSO directory, site-admin only. */
export const listOrganizations = async (request: Request): Promise<readonly Organization[]> => {
  await requireSettingsManage(request);
  return edge.organizations(cookieOf(request));
};

/** One organisation by email domain. There is no single-connection gateway query (mirrors
 *  the original's own directory read), so this re-lists and finds. */
export const findOrganization = async (
  request: Request,
  domain: string,
): Promise<Organization | undefined> => {
  const orgs = await listOrganizations(request);
  return orgs.find((o) => o.domain === domain);
};

/** Registers a new organisation SSO connection: unverified, untested and disabled until the
 *  domain is verified and the IdP connection passes its test. */
export const addOrganization = async (
  request: Request,
  input: AddOrganizationInput,
): Promise<Organization> => {
  await requireSettingsManage(request);
  return edge.addOrganization(input, cookieOf(request));
};

/** Mints a DNS TXT domain-verification challenge. The token is stable by default; rotate
 *  mints a fresh one, which also revokes the domain's prior verified proof. */
export const startDomainVerification = async (
  request: Request,
  domain: string,
  rotate = false,
): Promise<DomainVerification> => {
  await requireSettingsManage(request);
  return edge.startDomainVerification(domain, rotate, cookieOf(request));
};

/** Checks the domain's DNS TXT record against its verification token. */
export const verifyDomain = async (request: Request, domain: string): Promise<Organization> => {
  await requireSettingsManage(request);
  return edge.verifyDomain(domain, cookieOf(request));
};

/** Enables an organisation's SSO connection for sign-in. Refused server-side unless both
 *  gates (verified and testPassed) have already passed. */
export const activateOrganization = async (
  request: Request,
  domain: string,
): Promise<Organization> => {
  await requireSettingsManage(request);
  return edge.activateOrganization(domain, cookieOf(request));
};

/** Disables a live organisation. Does not clear its verified/testPassed gates. */
export const disableOrganization = async (
  request: Request,
  domain: string,
): Promise<Organization> => {
  await requireSettingsManage(request);
  return edge.disableOrganization(domain, cookieOf(request));
};

/** Updates an organisation's per-connection login toggles (JIT provisioning, local-password
 *  fallback). Each toggle is optional; omit one to leave it unchanged. */
export const updateIdPConnection = async (
  request: Request,
  domain: string,
  toggles: { allowLocal?: boolean; jitEnabled?: boolean },
): Promise<Organization> => {
  await requireSettingsManage(request);
  return edge.updateIdPConnection(domain, toggles, cookieOf(request));
};

/** Changes an organisation's IdP protocol. DESTRUCTIVE: resets both gates and disables the
 *  connection, so the domain must be re-verified and re-tested before re-activation. */
export const changeOrgProtocol = async (
  request: Request,
  domain: string,
  protocol: string,
  config?: readonly KeyValueInput[],
  secretRef?: string,
): Promise<Organization> => {
  await requireSettingsManage(request);
  return edge.changeOrgProtocol(domain, protocol, config, secretRef, cookieOf(request));
};

/** Permanently removes an organisation's SSO connection. */
export const deleteOrganization = async (request: Request, domain: string): Promise<void> => {
  await requireSettingsManage(request);
  await edge.deleteOrganization(domain, cookieOf(request));
};

/** An organisation's IdP-group-claim-to-platform-group mappings. */
export const listGroupMappings = async (
  request: Request,
  connectionId: string,
): Promise<readonly GroupMapping[]> => {
  await requireSettingsManage(request);
  return edge.groupMappings(connectionId, cookieOf(request));
};

export const addGroupMapping = async (
  request: Request,
  connectionId: string,
  idpGroupClaimValue: string,
  targetGroupId: string,
): Promise<GroupMapping> => {
  await requireSettingsManage(request);
  return edge.addGroupMapping(connectionId, idpGroupClaimValue, targetGroupId, cookieOf(request));
};

export const deleteGroupMapping = async (request: Request, mappingId: string): Promise<void> => {
  await requireSettingsManage(request);
  await edge.deleteGroupMapping(mappingId, cookieOf(request));
};

/** The platform's one active SP (service-provider) signing certificate. */
export const getSpCertificate = async (request: Request): Promise<SpCertificate> => {
  await requireSettingsManage(request);
  return edge.spCertificate(cookieOf(request));
};

/** Mints a new SP signing certificate and activates it, superseding the previous one. */
export const forceRotateSpCertificate = async (request: Request): Promise<SpCertificate> => {
  await requireSettingsManage(request);
  return edge.forceRotateSpCertificate(cookieOf(request));
};

/** Both gates must pass before an organisation can be activated. */
export const canActivate = (org: Organization): boolean => org.verified && org.testPassed;

/** The danger-zone delete is only offered once the connection is disabled. */
export const canDelete = (org: Organization): boolean => !org.enabled;
