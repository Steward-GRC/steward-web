// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { safeNext } from "@steward-web/auth/server";
import { statusGatePreview } from "@steward-web/dev-gate-preview.server";
import { InstanceGate } from "@steward-web/shell";
import { instanceState } from "@steward-web/shell/server";
import { redirect } from "react-router";

import type { Route } from "./+types/not-set-up";

// G1 and G2 are gates: a centred card outside the app shell (decision 2-layout-and-navigation.s5).
export { GATE_HANDLE as handle } from "@steward-web/shell";

/**
 * Where sign-in sends a visitor until first-run setup has made the root administrator: G2
 * while it isn't set up, G1 while the gateway can't say. Once it is set up, on to sign-in. In a
 * dev build, `?gate=G1` and `?gate=G2` hold either one on screen.
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const preview = statusGatePreview(url);
  if (preview === "G1") return { instance: "unknown" as const, next, preview };
  if (preview === "G2") return { instance: "needsSetup" as const, next, preview };
  const instance = await instanceState();
  if (instance === "ready") throw redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return { instance, next };
};

export default function NotSetUpRoute({ loaderData }: Route.ComponentProps) {
  return (
    <InstanceGate
      instance={loaderData.instance}
      next={loaderData.next}
      poll={!("preview" in loaderData)}
    />
  );
}
