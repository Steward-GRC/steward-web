// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { redirect } from "react-router";

import type { Route } from "./+types/resources.gateway-login";

/**
 * The gateway's SSO callback sends someone back to /login with the second factor it parked
 * them for (`pendingMfa`, `mfaFactors`) or an `error`; this app's sign-in reads both.
 */
export const loader = ({ request }: Route.LoaderArgs) =>
  redirect(`/sign-in${new URL(request.url).search}`);
