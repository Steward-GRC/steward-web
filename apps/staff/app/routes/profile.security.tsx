// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";

import type { Route } from "./+types/profile.security";

import { securityAction, securityData } from "../profile/account.server";
import { SecurityMethods } from "../profile/SecurityMethods";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  return securityData(request);
};

export const action = async ({ request }: Route.ActionArgs) => {
  await requireIdentityFromRequest(request);
  return securityAction(request);
};

/** Profile: security (U33), where the second-factor nudge's "Set up" leads. */
export default function ProfileSecurity({ loaderData }: Route.ComponentProps) {
  return <SecurityMethods factors={loaderData.factors} passkeys={loaderData.passkeys} />;
}
