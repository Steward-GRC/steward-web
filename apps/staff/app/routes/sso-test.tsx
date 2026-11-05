// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { SsoTestState } from "@steward-web/auth";

import { ssoTestPreview } from "@steward-web/dev-gate-preview.server";
import { SsoTestLanding, SsoTestResult, SsoTestUnavailable } from "@steward-web/shell";

import type { Route } from "./+types/sso-test";

// G18 opens without signing in, outside the app shell (decision 2-layout-and-navigation.s5).
export { GATE_HANDLE as handle } from "@steward-web/shell";

/**
 * A remote SSO test link (G18). steward-gateway has no public SSO-test lookup yet
 * (Steward-GRC/steward-gateway#54), so a link can't say whose sign-in it tests and answers
 * "unavailable" until it does. In a dev build, `?gate=G18` shows the landing with a sample.
 */
export const loader = ({ request }: Route.LoaderArgs): SsoTestState =>
  ssoTestPreview(new URL(request.url)) ?? { view: "unavailable" };

export default function SsoTestRoute({ loaderData }: Route.ComponentProps) {
  switch (loaderData.view) {
    case "expired": {
      return <SsoTestResult outcome="expired" />;
    }
    case "landing": {
      return <SsoTestLanding {...loaderData} />;
    }
    case "unavailable": {
      return <SsoTestUnavailable />;
    }
  }
}
