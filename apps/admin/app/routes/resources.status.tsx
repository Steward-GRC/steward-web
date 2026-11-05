// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { InstanceStatus } from "@steward-web/shell";

import { instanceState, siteSettingsFromRequest } from "@steward-web/shell/server";

import type { Route } from "./+types/resources.status";

/** What the status gates (G1, G2, G11) check every few seconds to move on by themselves. */
export const loader = async ({ request }: Route.LoaderArgs): Promise<InstanceStatus> => {
  const [instance, settings] = await Promise.all([
    instanceState(),
    siteSettingsFromRequest(request),
  ]);
  return { instance, maintenance: settings?.maintenance.enabled ?? false };
};
