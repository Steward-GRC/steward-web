// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";

import type { Route } from "./+types/profile.preferences";

import { preferencesAction, preferencesData } from "../profile/account.server";
import { Preferences } from "../profile/Preferences";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  return preferencesData(request);
};

export const action = async ({ request }: Route.ActionArgs) => {
  await requireIdentityFromRequest(request);
  return preferencesAction(request);
};

/** Profile: preferences (U34): the theme and the display language. */
export default function ProfilePreferences({ loaderData }: Route.ComponentProps) {
  return <Preferences locale={loaderData.locale} />;
}
