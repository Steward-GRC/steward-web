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
  findOrganization,
  listOrganizations,
  startDomainVerification,
  updateIdPConnection,
  verifyDomain,
} from "./organisations.server";

const siteAdminMe = {
  email: "admin@example.com",
  id: "u-admin",
  name: "Admin",
  permissions: ["settings.manage"],
  roles: ["site-admin"],
  username: "admin",
};

const readerMe = {
  email: "reader@example.com",
  id: "u-reader",
  name: "Reader",
  permissions: [],
  roles: ["reader"],
  username: "reader",
};

const jsonOnce = (data: unknown) => Response.json({ data });

const makeOrg = (
  overrides: Partial<Organization> & Pick<Organization, "domain">,
): Organization => ({
  allowLocal: false,
  connectionId: `conn-${overrides.domain}`,
  displayName: overrides.domain,
  enabled: false,
  jitEnabled: true,
  orgName: overrides.domain,
  protocol: "saml",
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

describe("changeOrgProtocol", () => {
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
