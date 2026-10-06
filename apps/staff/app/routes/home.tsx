// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useIdentity } from "@steward-web/auth";
import { requireIdentityFromRequest } from "@steward-web/auth/server";

import type { Route } from "./+types/home";

/**
 * A placeholder landing page: the staff feature areas (gates, library, reader, authoring,
 * approvals, reporting, ethics) replace this as their own port PRs land.
 */
export const loader = ({ request }: Route.LoaderArgs) => requireIdentityFromRequest(request);

export default function Home() {
  const identity = useIdentity();
  return <div className="p-8">Signed in as {identity.name || identity.username}.</div>;
}
