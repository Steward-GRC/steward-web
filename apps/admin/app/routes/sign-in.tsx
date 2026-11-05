// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { SignIn } from "@steward-web/auth";
import { signInAction, signInLoader } from "@steward-web/auth/server";
import { QuickLogin } from "@steward-web/dev-quick-login";
import { redirect, useRouteLoaderData } from "react-router";

import type { loader as rootLoader } from "../root";
import type { Route } from "./+types/sign-in";

import { BASENAME } from "../basename";
import { fetchSetupState } from "../setup/setup.server";

// Sign-in is a gate: a centred card outside the app shell (decision 2-layout-and-navigation.s5).
export { GATE_HANDLE as handle } from "@steward-web/shell";

export const loader = async ({ request }: Route.LoaderArgs) => {
  // Nobody can sign in before first-run setup has made the root administrator.
  const setup = await fetchSetupState();
  if (setup.needsSetup) throw redirect("/setup");
  return signInLoader(request, { basename: BASENAME });
};

export const action = ({ request }: Route.ActionArgs) =>
  signInAction(request, undefined, { basename: BASENAME });

export default function SignInRoute({ actionData, loaderData }: Route.ComponentProps) {
  const root = useRouteLoaderData<typeof rootLoader>("root");
  return (
    <SignIn
      admin
      capabilities={loaderData.capabilities}
      next={loaderData.next}
      organisation={root?.shell.config.organisation}
      quickLogin={<QuickLogin next={loaderData.next} users={loaderData.quickLoginUsers} />}
      state={actionData && "view" in actionData ? actionData : loaderData.state}
    />
  );
}
