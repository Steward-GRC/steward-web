// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";

import type { Route } from "./+types/resources.sections";

import { fetchAllGroups, orderedWithPaths } from "../categories/categories.server";

/** Move to section's destinations (D6): every category with its full path, tree order. */
export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const groups = await fetchAllGroups(request.headers.get("cookie") ?? undefined);
  return { sections: orderedWithPaths(groups) };
};
