// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";

import type { Route } from "./+types/profile.notifications";

import { notificationAction, notificationData } from "../profile/account.server";
import { NotificationPreferences } from "../profile/NotificationPreferences";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  return { preferences: await notificationData(request) };
};

export const action = async ({ request }: Route.ActionArgs) => {
  await requireIdentityFromRequest(request);
  return notificationAction(request);
};

/** Notification preferences (U35). */
export default function ProfileNotifications({ loaderData }: Route.ComponentProps) {
  return <NotificationPreferences preferences={loaderData.preferences} />;
}
