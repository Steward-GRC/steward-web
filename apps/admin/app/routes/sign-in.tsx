// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { SignIn } from "@steward-web/auth";
import { signInAction, signInLoader } from "@steward-web/auth/server";

import type { Route } from "./+types/sign-in";

export const loader = ({ request }: Route.LoaderArgs) => signInLoader(request);

export const action = ({ request }: Route.ActionArgs) => signInAction(request);

export default function SignInRoute({ actionData, loaderData }: Route.ComponentProps) {
  return (
    <SignIn
      cardTitle="Steward Admin"
      next={loaderData.next}
      state={actionData ?? loaderData.state}
    />
  );
}
