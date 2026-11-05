// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Welcome } from "@steward-web/auth";
import { welcomeAction, welcomeLoader } from "@steward-web/auth/server";

import type { Route } from "./+types/welcome";

// G10 is a gate: a centred card outside the app shell (decision 2-layout-and-navigation.s5).
export { GATE_HANDLE as handle } from "@steward-web/shell";

export const loader = ({ request }: Route.LoaderArgs) => welcomeLoader(request);

export const action = ({ request }: Route.ActionArgs) => welcomeAction(request);

export default function WelcomeRoute({ actionData, loaderData }: Route.ComponentProps) {
  return (
    <Welcome next={loaderData.next} person={loaderData.person} problem={actionData?.problem} />
  );
}
