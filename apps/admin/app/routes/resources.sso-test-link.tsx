// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A resource route (no UI): "Run IdP test" opens this URL directly in a popup, synchronously
// within the click that triggered it, so the browser's popup blocker sees a direct user
// gesture. The mint itself is a server-side call (it needs the session cookie and must never
// reach the browser as an API token) — this loader makes that call, then redirects the
// now-open popup on to the gateway's minted, absolute test-start URL.
import { redirect } from "react-router";

import type { Route } from "./+types/resources.sso-test-link";

import { mintSsoTestLink } from "../organisations/organisations.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const parameters = new URL(request.url).searchParams;
  const link = await mintSsoTestLink(request, {
    alias: parameters.get("alias") ?? "",
    connectionId: parameters.get("connectionId") ?? "",
    returnPath: parameters.get("returnPath") ?? undefined,
    tenant: parameters.get("tenant") ?? undefined,
  });
  return redirect(link.url);
};
