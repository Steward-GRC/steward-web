// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * The identity-provider catalog for the add-organisation flow. Choosing a provider fixes the
 * protocol (SAML vs OIDC) so the admin never has to reason about it, and surfaces a
 * provider-specific setup checklist pointing at the copyable values in "Identity provider
 * setup". The underlying connection config is still just protocol-shaped (SAML:
 * entityId/ssoUrl/signingCertificate; OIDC: issuer/clientId/secret) — the provider only
 * changes the guidance and the protocol default, not the fields.
 */
export type IdpProtocol = "oidc" | "saml";

export interface IdpProvider {
  /** One-line description shown under the picker. */
  blurb: string;
  /** Stable id (UI-only; the server stores just the protocol). */
  id: string;
  /** Display label shown in the picker and the created-connection summary. */
  label: string;
  /** Protocol this provider brokers as — fixes the form so the admin doesn't pick it. */
  protocol: IdpProtocol;
  /** Provider-specific setup checklist. Steps reference the copyable values in
   *  the "Identity provider setup" panel (ACS URL / Entity ID / Redirect URI). */
  steps: readonly string[];
}

export const IDP_PROVIDERS: readonly IdpProvider[] = [
  {
    blurb: "Google Admin custom SAML app",
    id: "google",
    label: "Google Workspace",
    protocol: "saml",
    steps: [
      "In the Google Admin console, open Apps -> Web and mobile apps -> Add app -> Add custom SAML app.",
      "Name it. On the Google Identity Provider details screen, download the metadata (or copy the Metadata URL).",
      "Paste the Entity ID and the ACS URL from Identity provider setup below into Google's Service provider details screen. Set Name ID format = EMAIL and Name ID = Basic Information -> Primary email.",
      "Under Attribute mapping, map Primary email -> email. Turn the app ON for your users, then finish the steps here.",
    ],
  },
  {
    blurb: "Entra Enterprise application, SAML SSO",
    id: "entra",
    label: "Microsoft Entra ID",
    protocol: "saml",
    steps: [
      "In the Microsoft Entra admin center, open Enterprise applications -> New application -> Create your own application.",
      "Open Single sign-on and choose SAML.",
      'In "Basic SAML Configuration", paste the Entity ID (Identifier) and the ACS URL (Reply URL) from Identity provider setup below.',
      "Download the Federation Metadata XML and import it below to fill in the IdP fields.",
      "Confirm the Unique User Identifier (Name ID) is the user's email. Assign users, then finish the steps here.",
    ],
  },
  {
    blurb: "Okta SAML 2.0 app integration",
    id: "okta",
    label: "Okta",
    protocol: "saml",
    steps: [
      "In the Okta admin console, open Applications -> Create App Integration -> SAML 2.0.",
      "Set Single sign-on URL to the ACS URL and Audience URI (SP Entity ID) to the Entity ID from Identity provider setup below.",
      "Set Name ID format = EmailAddress and map the user's email attribute.",
      "After creating, open Sign On -> Identity Provider metadata and import it below to fill in the IdP fields.",
      "Assign users or groups, then finish the steps here.",
    ],
  },
  {
    blurb: "Any SAML 2.0 identity provider",
    id: "generic-saml",
    label: "Generic SAML 2.0",
    protocol: "saml",
    steps: [
      "In your IdP, create a SAML 2.0 application or relying party.",
      "Use the ACS URL (assertion consumer service) and Entity ID (audience) from Identity provider setup below.",
      "Configure the NameID to be the user's email address.",
      "Publish the IdP metadata and enter its entity ID, SSO URL and signing certificate below.",
    ],
  },
  {
    blurb: "Any OpenID Connect identity provider",
    id: "generic-oidc",
    label: "Generic OIDC",
    protocol: "oidc",
    steps: [
      "In your IdP, register an OIDC confidential (web) client.",
      "Set the client's redirect URI to the Redirect URI from Identity provider setup below.",
      "Copy the issuer URL and client ID into the fields below, along with the client secret.",
      "Ensure the client returns the email claim — it is required to provision users.",
    ],
  },
] as const;

export const findProvider = (id: string): IdpProvider | undefined =>
  IDP_PROVIDERS.find((p) => p.id === id);
