// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The command palette's results (H10) from the same search the search page runs.
import type { Category, Policy } from "@steward-web/api-client";
import type { CommandPaletteResults } from "@steward-web/shell";

import { buildSearchIndex, searchHits } from "./searchIndex";

const PER_GROUP = 5;

/** Policies, procedures and categories matching the words, at most five of each. */
export const paletteGroupsOf = (
  policies: readonly Policy[],
  procedures: readonly Policy[],
  categories: readonly Category[],
  query: string,
): CommandPaletteResults["groups"] => {
  const hits = searchHits(buildSearchIndex([...policies, ...procedures], categories), query);
  if (hits.length === 0) return [];
  const procedureIds = new Set(procedures.map((p) => p.id));
  const item = (hit: (typeof hits)[number]) => ({
    hint: hit.hint,
    id: hit.id,
    label: hit.label,
    to: hit.to,
  });
  return [
    {
      id: "policies",
      items: hits
        .filter((h) => h.type === "Policy" && !procedureIds.has(h.id))
        .slice(0, PER_GROUP)
        .map((hit) => item(hit)),
    },
    {
      id: "procedures",
      items: hits
        .filter((h) => h.type === "Policy" && procedureIds.has(h.id))
        .slice(0, PER_GROUP)
        .map((hit) => item(hit)),
    },
    {
      id: "categories",
      items: hits
        .filter((h) => h.type === "Category")
        .slice(0, PER_GROUP)
        .map((hit) => ({ icon: "folder" as const, id: hit.id, label: hit.label, to: hit.to })),
    },
  ].filter((group) => group.items.length > 0);
};
