// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Route } from "./+types/resources.user-search";

import { searchPeople } from "../users/myGroups.server";

/** The people picker's typeahead (A22 "Add member…"): name and email for a few matches. */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  return { people: await searchPeople(request, query) };
};
