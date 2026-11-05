// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The admin command palette's results (H10) from the same search the admin search page runs.
import type { Category, Group, Policy, Template } from "@steward-web/api-client";
import type { CommandPaletteResults } from "@steward-web/shell";

import { buildSearchIndex, searchHits, type SearchHitType } from "./searchIndex";

const PER_GROUP = 5;

const GROUPS: [SearchHitType, string][] = [
  ["Policy", "policies"],
  ["Category", "categories"],
  ["Template", "templates"],
  ["Group", "groups"],
];

/** Policies, categories, templates and groups matching the words, at most five of each. */
export const paletteGroupsOf = (
  policies: readonly Policy[],
  categories: readonly Category[],
  templates: readonly Template[],
  groups: readonly Group[],
  query: string,
): CommandPaletteResults["groups"] => {
  const hits = searchHits(buildSearchIndex(policies, categories, templates, groups), query);
  return GROUPS.map(([type, id]) => ({
    id,
    items: hits
      .filter((hit) => hit.type === type)
      .slice(0, PER_GROUP)
      .map((hit) => ({
        hint: type === "Category" ? undefined : hit.hint,
        icon: type === "Category" ? ("folder" as const) : undefined,
        id: hit.id,
        label: hit.label,
        to: hit.to,
      })),
  })).filter((group) => group.items.length > 0);
};
