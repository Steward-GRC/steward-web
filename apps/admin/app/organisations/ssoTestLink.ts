// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The "Run IdP test" link. The page opens it with window.open, outside the router, so the
// app's basename has to be written in here: on the link itself, and on the return path,
// which the gateway only accepts under /admin/ (steward-gateway internal/bff/sso.go).
import { data } from "react-router";

export interface SsoTestLinkQuery {
  alias: string;
  connectionId: string;
  returnPath?: string;
  tenant?: string;
}

interface SsoTestOrganisation {
  connectionAlias: string;
  connectionId: string;
  domain: string;
}

const withoutTrailingSlash = (basename: string) => basename.replace(/\/+$/, "");

export const ssoTestLinkPath = (basename: string, org: SsoTestOrganisation): string => {
  const base = withoutTrailingSlash(basename);
  const query = new URLSearchParams({
    alias: org.connectionAlias,
    connectionId: org.connectionId,
    returnPath: `${base}/organisations/${encodeURIComponent(org.domain)}`,
    tenant: org.domain,
  });
  return `${base}/resources/sso-test-link?${query.toString()}`;
};

export const ssoTestLinkQuery = (query: URLSearchParams): SsoTestLinkQuery => {
  const connectionId = query.get("connectionId") ?? "";
  const alias = query.get("alias") ?? "";
  if (!connectionId || !alias) {
    throw data("connectionId and alias are required", { status: 400 });
  }
  return {
    alias,
    connectionId,
    returnPath: query.get("returnPath") ?? undefined,
    tenant: query.get("tenant") ?? undefined,
  };
};
