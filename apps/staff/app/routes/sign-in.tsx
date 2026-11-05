// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { SignIn } from "@steward-web/auth";
import { safeNext, signInAction, signInLoader } from "@steward-web/auth/server";
import { statusGatePreview } from "@steward-web/dev-gate-preview.server";
import { QuickLogin } from "@steward-web/dev-quick-login";
import { instanceState } from "@steward-web/shell/server";
import { redirect, useRouteLoaderData } from "react-router";

import type { loader as rootLoader } from "../root";
import type { Route } from "./+types/sign-in";

// Sign-in is a gate: a centred card outside the app shell (decision 2-layout-and-navigation.s5).
export { GATE_HANDLE as handle } from "@steward-web/shell";

export const loader = async ({ request }: Route.LoaderArgs) => {
  // Nobody can sign in before first-run setup has made the root administrator (G2). A dev
  // build's `?gate=G11` previews the lockdown here, so it skips the check.
  const previewing = statusGatePreview(new URL(request.url)) !== undefined;
  if (!previewing && (await instanceState()) === "needsSetup") {
    const next = safeNext(new URL(request.url).searchParams.get("next"));
    throw redirect(`/not-set-up?next=${encodeURIComponent(next)}`);
  }
  return signInLoader(request);
};

export const action = ({ request }: Route.ActionArgs) => signInAction(request);

export default function SignInRoute({ actionData, loaderData }: Route.ComponentProps) {
  const root = useRouteLoaderData<typeof rootLoader>("root");
  return (
    <SignIn
      capabilities={loaderData.capabilities}
      next={loaderData.next}
      organisation={root?.shell.config.organisation}
      quickLogin={<QuickLogin next={loaderData.next} users={loaderData.quickLoginUsers} />}
      state={actionData && "view" in actionData ? actionData : loaderData.state}
    />
  );
}
