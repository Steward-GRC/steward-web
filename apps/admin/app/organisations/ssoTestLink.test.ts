// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { ssoTestLinkPath, ssoTestLinkQuery } from "./ssoTestLink";

const org = {
  connectionAlias: "partner-saml",
  connectionId: "conn-1",
  domain: "partner.example.net",
};

describe("ssoTestLinkPath", () => {
  it("keeps the app's basename on the link and on the path the gateway returns to", () => {
    const url = new URL(ssoTestLinkPath("/admin", org), "https://steward.example.org");
    expect(url.pathname).toBe("/admin/resources/sso-test-link");
    expect(url.searchParams.get("returnPath")).toBe("/admin/organisations/partner.example.net");
    expect(url.searchParams.get("connectionId")).toBe("conn-1");
    expect(url.searchParams.get("alias")).toBe("partner-saml");
    expect(url.searchParams.get("tenant")).toBe("partner.example.net");
  });

  it("treats a trailing slash on the basename the same way", () => {
    expect(ssoTestLinkPath("/admin/", org)).toBe(ssoTestLinkPath("/admin", org));
  });

  it("encodes a domain so it stays one path segment", () => {
    const url = new URL(
      ssoTestLinkPath("/admin", { ...org, domain: "a/b.example.net" }),
      "https://steward.example.org",
    );
    expect(url.searchParams.get("returnPath")).toBe("/admin/organisations/a%2Fb.example.net");
  });
});

describe("ssoTestLinkQuery", () => {
  it("reads the link's query", () => {
    const query = new URL(ssoTestLinkPath("/admin", org), "https://steward.example.org")
      .searchParams;
    expect(ssoTestLinkQuery(query)).toEqual({
      alias: "partner-saml",
      connectionId: "conn-1",
      returnPath: "/admin/organisations/partner.example.net",
      tenant: "partner.example.net",
    });
  });

  it("refuses a request without a connection or alias with a 400", () => {
    for (const query of ["", "connectionId=conn-1", "alias=partner-saml"]) {
      let thrown: unknown;
      try {
        ssoTestLinkQuery(new URLSearchParams(query));
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toMatchObject({ init: { status: 400 } });
    }
  });
});
