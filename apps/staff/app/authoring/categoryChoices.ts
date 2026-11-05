// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The New policy form's Category and Subcategory (U20) from the groups an author may use.
import type { Group } from "@steward-web/api-client";

export interface CategoryChoice {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

/**
 * The top groups are categories and everything under each is a subcategory, deeper ones named
 * by their path ("Facilities › Desks"). A group whose parent isn't usable stands as a category.
 */
export const categoryChoices = (
  groups: readonly Pick<Group, "id" | "name" | "parentId">[],
): CategoryChoice[] => {
  const ids = new Set(groups.map((g) => g.id));
  const children = new Map<string, Pick<Group, "id" | "name" | "parentId">[]>();
  for (const g of groups) {
    if (g.parentId && ids.has(g.parentId)) {
      children.set(g.parentId, [...(children.get(g.parentId) ?? []), g]);
    }
  }
  const below = (id: string, prefix: string): { id: string; name: string }[] =>
    (children.get(id) ?? []).flatMap((child) => {
      const name = prefix ? `${prefix} › ${child.name}` : child.name;
      return [{ id: child.id, name }, ...below(child.id, name)];
    });
  return groups
    .filter((g) => !g.parentId || !ids.has(g.parentId))
    .map((g) => ({ id: g.id, name: g.name, subcategories: below(g.id, "") }));
};
