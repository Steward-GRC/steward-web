// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { SsoTestOutcome } from "@steward-web/auth";

import { SsoTestResult } from "@steward-web/shell";

import type { Route } from "./+types/sso-test.result";

// G18r opens without signing in, outside the app shell (decision 2-layout-and-navigation.s5).
export { GATE_HANDLE as handle } from "@steward-web/shell";

const OUTCOMES: ReadonlySet<string> = new Set(["expired", "failed", "passed"]);

/**
 * How a remote SSO test ended (G18r), read from `?test=passed|failed|expired&reason=…`, the
 * shape of the gateway's own test-result address. Anything it doesn't recognise is a failure.
 */
export const loader = ({ request }: Route.LoaderArgs) => {
  const query = new URL(request.url).searchParams;
  const test = query.get("test") ?? "";
  const outcome = (OUTCOMES.has(test) ? test : "failed") as SsoTestOutcome;
  const reason = query.get("reason");
  return outcome === "failed" && reason ? { outcome, reason } : { outcome };
};

export default function SsoTestResultRoute({ loaderData }: Route.ComponentProps) {
  return (
    <SsoTestResult
      outcome={loaderData.outcome}
      reason={"reason" in loaderData ? loaderData.reason : undefined}
    />
  );
}
