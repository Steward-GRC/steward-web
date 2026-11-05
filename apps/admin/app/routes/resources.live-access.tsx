// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The signed-in person's access changes, as server-sent events, for the shell to reload its
// identity without a new sign-in (#7). A signed-out request is told to stop.
import { identityFromRequest } from "@steward-web/auth/server";
import { liveAccessResponse } from "@steward-web/shell/server";

import type { Route } from "./+types/resources.live-access";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const identity = await identityFromRequest(request);
  return liveAccessResponse(request, identity.id);
};
