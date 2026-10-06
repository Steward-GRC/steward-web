// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { buildIdpConfig, idpConfigToRecord } from "./idpConfig";

describe("buildIdpConfig", () => {
  it("builds the OIDC key/value pair for an OIDC draft", () => {
    expect(
      buildIdpConfig({ clientId: "abc", issuer: "https://idp.example.org", protocol: "oidc" }),
    ).toEqual([
      { key: "issuer", value: "https://idp.example.org" },
      { key: "clientId", value: "abc" },
    ]);
  });

  it("builds the SAML key/value list for a SAML draft, trimming values", () => {
    expect(
      buildIdpConfig({
        entityId: "  https://idp.example.org/metadata  ",
        protocol: "saml",
        signingCertificate: "-----BEGIN CERTIFICATE-----",
        ssoUrl: "https://idp.example.org/sso",
      }),
    ).toEqual([
      { key: "entityId", value: "https://idp.example.org/metadata" },
      { key: "singleSignOnServiceUrl", value: "https://idp.example.org/sso" },
      { key: "signingCertificate", value: "-----BEGIN CERTIFICATE-----" },
    ]);
  });

  it("adds the IdP-initiated SSO URL only when one is given", () => {
    const withUrl = buildIdpConfig({
      idpInitiatedSsoUrl: "https://idp.example.org/initsso",
      protocol: "saml",
    });
    expect(withUrl).toContainEqual({
      key: "idpInitiatedSsoUrl",
      value: "https://idp.example.org/initsso",
    });

    const withoutUrl = buildIdpConfig({ protocol: "saml" });
    expect(withoutUrl.some((entry) => entry.key === "idpInitiatedSsoUrl")).toBe(false);
  });
});

describe("idpConfigToRecord", () => {
  it("flattens a key/value list into a plain record", () => {
    expect(
      idpConfigToRecord([
        { key: "entityId", value: "https://idp.example.org/metadata" },
        { key: "signingCertificate", value: "-----BEGIN CERTIFICATE-----" },
      ]),
    ).toEqual({
      entityId: "https://idp.example.org/metadata",
      signingCertificate: "-----BEGIN CERTIFICATE-----",
    });
  });

  it("returns an empty record for an empty list", () => {
    expect(idpConfigToRecord([])).toEqual({});
  });
});
