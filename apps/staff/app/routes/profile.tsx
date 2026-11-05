// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";

import type { Route } from "./+types/profile";

import { ProfileLayout } from "../profile/ProfileLayout";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  return null;
};

export default function Profile() {
  return <ProfileLayout />;
}
