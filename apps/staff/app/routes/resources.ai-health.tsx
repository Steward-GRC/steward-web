// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A resource route (no UI) AI surfaces poll to share one health check rather than each
// polling the gateway independently.
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";

import type { Route } from "./+types/resources.ai-health";

import { getAiHealth } from "../authoring/ai.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  return getAiHealth(request);
};
