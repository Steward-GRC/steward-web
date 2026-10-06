// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { KeyValueInput } from "@steward-web/api-client";

import type { IdpProtocol } from "./idpProviders";

/** The raw, protocol-shaped IdP fields collected by the add/manage connection form. */
export interface IdpConfigDraft {
  clientId?: string;
  // SAML
  entityId?: string;
  idpInitiatedSsoUrl?: string;
  // OIDC
  issuer?: string;
  protocol: IdpProtocol;
  signingCertificate?: string;
  ssoUrl?: string;
}

const trimmed = (v: string | undefined): string => (v ?? "").trim();

/**
 * Builds the connection config key/value list the gateway's `AddOrganizationInput.config`
 * and `changeOrgProtocol` read: OIDC -> issuer/clientId (the secret is carried separately
 * as `secretRef`); SAML -> entityId/singleSignOnServiceUrl/signingCertificate, plus an
 * optional idpInitiatedSsoUrl for a tile-only IdP's launch URL.
 */
export const buildIdpConfig = (draft: IdpConfigDraft): KeyValueInput[] => {
  if (draft.protocol === "oidc") {
    return [
      { key: "issuer", value: trimmed(draft.issuer) },
      { key: "clientId", value: trimmed(draft.clientId) },
    ];
  }
  const saml: KeyValueInput[] = [
    { key: "entityId", value: trimmed(draft.entityId) },
    { key: "singleSignOnServiceUrl", value: trimmed(draft.ssoUrl) },
    { key: "signingCertificate", value: trimmed(draft.signingCertificate) },
  ];
  if (trimmed(draft.idpInitiatedSsoUrl)) {
    saml.push({ key: "idpInitiatedSsoUrl", value: trimmed(draft.idpInitiatedSsoUrl) });
  }
  return saml;
};

/** Flattens a `buildIdpConfig` list into the plain record the setup bootstrap's `sso.config`
 *  carries (the gateway's Day-0 SSO provisioning input isn't key/value-shaped). */
export const idpConfigToRecord = (config: KeyValueInput[]): Record<string, string> =>
  Object.fromEntries(config.map(({ key, value }) => [key, value]));
