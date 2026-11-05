// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The admin command palette's data (H10): the header search's results as you type.
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { refusalOf } from "@steward-web/shell";
import { DocumentType } from "@steward-web/ui/domain";
import { listCategories, listPolicies } from "@steward-web/ui/domain/server";

import type { Route } from "./+types/resources.command-palette";

import { listGroups } from "../groups/groups.server";
import { paletteGroupsOf } from "../search/paletteGroups";
import { listTemplates } from "../templates/templates.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (!query.trim()) return { groups: [] };
  const cookie = request.headers.get("cookie") ?? undefined;
  // A failed read comes back as a failure for the palette's reach error, never as a thrown
  // error: a fetcher's thrown error would replace the whole page with the error boundary.
  try {
    const [policies, categories, templates, groups] = await Promise.all([
      listPolicies(DocumentType.Policy, cookie),
      listCategories(cookie),
      // Templates and groups need group.manage; without it the palette still searches policies.
      listTemplates(request).catch(() => []),
      listGroups(request).catch(() => []),
    ]);
    return { groups: paletteGroupsOf(policies, categories, templates, groups, query) };
  } catch (error) {
    return { failure: refusalOf(error), groups: [] };
  }
};
