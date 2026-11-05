// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { SignIn } from "@steward-web/auth";
import { signInAction, signInLoader } from "@steward-web/auth/server";
import { QuickLogin } from "@steward-web/dev-quick-login";
import { redirect } from "react-router";

import type { Route } from "./+types/sign-in";

import { BASENAME } from "../basename";
import { fetchSetupState } from "../setup/setup.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  // Nobody can sign in before first-run setup has made the root administrator.
  const setup = await fetchSetupState();
  if (setup.needsSetup) throw redirect("/setup");
  return signInLoader(request, { basename: BASENAME });
};

export const action = ({ request }: Route.ActionArgs) =>
  signInAction(request, undefined, { basename: BASENAME });

export default function SignInRoute({ actionData, loaderData }: Route.ComponentProps) {
  return (
    <SignIn
      cardTitle="Steward Admin"
      next={loaderData.next}
      quickLogin={<QuickLogin next={loaderData.next} users={loaderData.quickLoginUsers} />}
      state={actionData ?? loaderData.state}
    />
  );
}
