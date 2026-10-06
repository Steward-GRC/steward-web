// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useIdentity } from "@steward-web/auth";
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { Link } from "react-router";

import type { Route } from "./+types/home";

/**
 * A placeholder landing page: the staff feature areas (gates, library, reader, authoring,
 * approvals, reporting, ethics) replace this as their own port PRs land. The library's own
 * nav entries come with the shell's left rail, a later port PR; these are a stopgap link in.
 */
export const loader = ({ request }: Route.LoaderArgs) => requireIdentityFromRequest(request);

export default function Home() {
  const identity = useIdentity();
  return (
    <div className="grid gap-4 p-8">
      <p>Signed in as {identity.name || identity.username}.</p>
      <nav className="flex gap-4 text-base">
        <Link className="text-primary hover:underline" to="/policies">
          Policies
        </Link>
        <Link className="text-primary hover:underline" to="/procedures">
          Procedures
        </Link>
        <Link className="text-primary hover:underline" to="/approvals">
          Approvals
        </Link>
        <Link className="text-primary hover:underline" to="/search">
          Search
        </Link>
        <Link className="text-primary hover:underline" to="/reporting/cases">
          Reporting cases
        </Link>
      </nav>
    </div>
  );
}
