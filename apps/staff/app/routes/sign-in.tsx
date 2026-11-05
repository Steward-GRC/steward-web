// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { SignIn } from "@steward-web/auth";
import { signInAction, signInLoader } from "@steward-web/auth/server";
import { QuickLogin } from "@steward-web/dev-quick-login";
import { useRouteLoaderData } from "react-router";

import type { loader as rootLoader } from "../root";
import type { Route } from "./+types/sign-in";

// Sign-in is a gate: a centred card outside the app shell (decision 2-layout-and-navigation.s5).
export { GATE_HANDLE as handle } from "@steward-web/shell";

export const loader = ({ request }: Route.LoaderArgs) => signInLoader(request);

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
