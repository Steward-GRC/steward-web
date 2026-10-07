// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Organization } from "@steward-web/api-client";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  activateOrganization,
  addOrganization,
  canActivate,
  canDelete,
  changeOrgProtocol,
  deleteOrganization,
  disableOrganization,
  fetchIdpCertFromUrl,
  findOrganization,
  importIdpMetadataFromUrl,
  listOrganizations,
  mintSsoTestLink,
  parseIdpMetadataFile,
  startDomainVerification,
  updateIdPConnection,
  verifyDomain,
} from "./organisations.server";

const siteAdminMe = {
  email: "admin@example.com",
  id: "u-admin",
  managedGroupIds: [],
  name: "Admin",
  permissions: ["settings.manage"],
  roles: ["site-admin"],
  username: "admin",
};

const readerMe = {
  email: "reader@example.com",
  id: "u-reader",
  managedGroupIds: [],
  name: "Reader",
  permissions: [],
  roles: ["reader"],
  username: "reader",
};

const jsonOnce = (data: unknown) => Response.json({ data });

/** The gateway's REST (non-GraphQL) IdP-import / SSO-test-link endpoints answer with the
 *  flat body directly, unlike the GraphQL `{data: ...}` envelope `jsonOnce` builds. */
const restJsonOnce = (body: unknown, status = 200) => Response.json(body, { status });

const makeOrg = (
  overrides: Partial<Organization> & Pick<Organization, "domain">,
): Organization => ({
  allowLocal: false,
  connectionAlias: `alias-${overrides.domain}`,
  connectionId: `conn-${overrides.domain}`,
  displayName: overrides.domain,
  enabled: false,
  jitEnabled: true,
  orgName: overrides.domain,
  protocol: "saml",
  secretReentryRequired: false,
  testPassed: false,
  verified: false,
  ...overrides,
});

const request = () => new Request("https://admin.steward.example/organisations");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listOrganizations", () => {
  it("redirects a caller who lacks settings.manage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: readerMe })));
    const thrown: unknown = await listOrganizations(request()).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("location")).toBe("/");
  });

  it("lists every configured connection", async () => {
    const org = makeOrg({ domain: "partner.example.net" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ organizations: [org] }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await listOrganizations(request())).toEqual([org]);
  });
});

describe("findOrganization", () => {
  it("finds a connection by domain out of the directory", async () => {
    const org = makeOrg({ domain: "partner.example.net" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ organizations: [org] }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await findOrganization(request(), "partner.example.net")).toEqual(org);
  });
});

describe("addOrganization", () => {
  it("requires settings.manage and posts the add mutation", async () => {
    const created = makeOrg({ domain: "acme.example.org" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ addOrganization: created }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await addOrganization(request(), {
      domain: "acme.example.org",
      orgName: "Acme",
      protocol: "saml",
    });
    expect(result).toEqual(created);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({
      input: { domain: "acme.example.org", orgName: "Acme", protocol: "saml" },
    });
  });
});

describe("importIdpMetadataFromUrl / parseIdpMetadataFile / fetchIdpCertFromUrl", () => {
  const imported = {
    displayName: "Example IdP",
    entityId: "https://idp.example.org/metadata",
    signingCertificate: "-----BEGIN CERTIFICATE-----\nEXAMPLE\n-----END CERTIFICATE-----",
    ssoUrl: "https://idp.example.org/sso",
  };

  it("imports metadata fetched by URL", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(restJsonOnce(imported));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await importIdpMetadataFromUrl(request(), "https://idp.example.org/metadata")).toEqual(
      imported,
    );
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ url: "https://idp.example.org/metadata" });
  });

  it("parses an uploaded metadata document", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(restJsonOnce(imported));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await parseIdpMetadataFile(request(), "<EntityDescriptor/>")).toEqual(imported);
  });

  it("surfaces the gateway's error message on a failed fetch", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(restJsonOnce({ error: "This URL points to a blocked address" }, 400));
    vi.stubGlobal("fetch", fetchSpy);

    await expect(
      importIdpMetadataFromUrl(request(), "https://169.254.169.254/metadata"),
    ).rejects.toMatchObject({ message: "This URL points to a blocked address", status: 400 });
  });

  it("fetches a signing certificate by URL", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(restJsonOnce({ certificatePem: imported.signingCertificate }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await fetchIdpCertFromUrl(request(), "https://idp.example.org/cert")).toBe(
      imported.signingCertificate,
    );
  });
});

describe("mintSsoTestLink", () => {
  it("mints a scoped, time-bound test link", async () => {
    const link = {
      expiresAt: "2026-10-06T12:30:00Z",
      url: "https://gateway.steward.example/auth/sso/start?connection=acme-saml&mode=test&testToken=tok",
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(restJsonOnce(link));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await mintSsoTestLink(request(), {
      alias: "acme-saml",
      connectionId: "conn-acme.example.org",
    });
    expect(result).toEqual(link);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      alias: "acme-saml",
      connectionId: "conn-acme.example.org",
      returnPath: "",
      tenant: "",
    });
  });
});

describe("startDomainVerification / verifyDomain", () => {
  it("mints a verification challenge", async () => {
    const challenge = {
      dnsRecordName: "_steward-verify.acme.example.org",
      dnsRecordValue: "steward-verify=tok",
      instructions: "Add the TXT record, then verify.",
      token: "tok",
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ startDomainVerification: challenge }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await startDomainVerification(request(), "acme.example.org")).toEqual(challenge);
  });

  it("checks the domain and returns the updated connection", async () => {
    const verified = makeOrg({ domain: "acme.example.org", verified: true });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ verifyDomain: verified }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await verifyDomain(request(), "acme.example.org")).toEqual(verified);
  });
});

describe("activateOrganization / disableOrganization", () => {
  it("posts the activate mutation", async () => {
    const active = makeOrg({ domain: "acme.example.org", enabled: true });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ activateOrganization: active }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await activateOrganization(request(), "acme.example.org")).toEqual(active);
  });

  it("posts the disable mutation", async () => {
    const disabled = makeOrg({ domain: "acme.example.org" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ disableOrganization: disabled }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await disableOrganization(request(), "acme.example.org")).toEqual(disabled);
  });
});

describe("updateIdPConnection", () => {
  it("posts only the toggles that were passed", async () => {
    const updated = makeOrg({ allowLocal: true, domain: "acme.example.org" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ updateIdPConnection: updated }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await updateIdPConnection(request(), "acme.example.org", { allowLocal: true });
    expect(result).toEqual(updated);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    const variables = JSON.parse(init.body as string).variables;
    expect(variables.allowLocal).toBe(true);
    expect("jitEnabled" in variables).toBe(false);
  });
});

describe("updateIdPConnection client secret", () => {
  it("posts a re-entered client secret write-only", async () => {
    const updated = makeOrg({ domain: "acme.example.org" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ updateIdPConnection: updated }));
    vi.stubGlobal("fetch", fetchSpy);

    await updateIdPConnection(request(), "acme.example.org", { clientSecret: "s3cr3t" });
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    const variables = JSON.parse(init.body as string).variables;
    expect(variables.clientSecret).toBe("s3cr3t");
    expect("secretRef" in variables).toBe(false);
  });
});

describe("changeOrgProtocol", () => {
  it("posts an OIDC client secret as clientSecret", async () => {
    const changed = makeOrg({ domain: "acme.example.org", protocol: "oidc" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ changeOrgProtocol: changed }));
    vi.stubGlobal("fetch", fetchSpy);

    await changeOrgProtocol(request(), "acme.example.org", "oidc", undefined, {
      clientSecret: "s3cr3t",
    });
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    const variables = JSON.parse(init.body as string).variables;
    expect(variables.clientSecret).toBe("s3cr3t");
    expect("secretRef" in variables).toBe(false);
  });

  it("posts the protocol change", async () => {
    const changed = makeOrg({ domain: "acme.example.org", protocol: "oidc" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ changeOrgProtocol: changed }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await changeOrgProtocol(request(), "acme.example.org", "oidc")).toEqual(changed);
  });
});

describe("deleteOrganization", () => {
  it("posts the delete mutation", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ deleteOrganization: true }));
    vi.stubGlobal("fetch", fetchSpy);

    await expect(deleteOrganization(request(), "acme.example.org")).resolves.toBeUndefined();
  });
});

describe("canActivate / canDelete", () => {
  it("canActivate requires both gates", () => {
    expect(canActivate(makeOrg({ domain: "d", testPassed: true, verified: true }))).toBe(true);
    expect(canActivate(makeOrg({ domain: "d", testPassed: false, verified: true }))).toBe(false);
    expect(canActivate(makeOrg({ domain: "d", testPassed: true, verified: false }))).toBe(false);
  });

  it("canDelete requires the connection to be disabled", () => {
    expect(canDelete(makeOrg({ domain: "d", enabled: false }))).toBe(true);
    expect(canDelete(makeOrg({ domain: "d", enabled: true }))).toBe(false);
  });
});
