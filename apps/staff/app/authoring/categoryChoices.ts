// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The New policy form's Category and Subcategory (U20) from the groups an author may use.
import type { CategoryDocumentTypes, Group } from "@steward-web/api-client";

export interface CategoryChoice extends TemplateDefault {
  /** What it holds; missing reads as both. */
  documentTypes?: CategoryDocumentTypes;
  id: string;
  name: string;
  subcategories: ({
    documentTypes?: CategoryDocumentTypes;
    id: string;
    name: string;
  } & TemplateDefault)[];
}

type ChoiceGroup = Pick<
  Group,
  | "defaultTemplateId"
  | "defaultTemplateLocked"
  | "defaultTemplateNone"
  | "documentTypes"
  | "id"
  | "name"
  | "parentId"
>;

/** What a new policy starts from here, when the category or one above it sets it. */
interface TemplateDefault {
  /** The template a new policy here starts from. */
  defaultTemplateId?: string;
  /** Set to no template: a new policy here is freeform. */
  defaultTemplateNone?: true;
  /** The category that sets the template locks it: authors here must use it (steward-web#262). */
  templateLocked?: true;
}

/** What a group holds, when the service says; otherwise nothing, which reads as both. */
const typed = (g: Pick<Group, "documentTypes">) =>
  g.documentTypes ? { documentTypes: g.documentTypes } : {};

/**
 * The top groups are categories and everything under each is a subcategory, deeper ones named
 * by their path ("Facilities › Desks"). A group whose parent isn't usable stands as a category.
 */
export const categoryChoices = (groups: readonly ChoiceGroup[]): CategoryChoice[] => {
  const ids = new Set(groups.map((g) => g.id));
  const byId = new Map(groups.map((g) => [g.id, g]));
  // The nearest group, from this one up, that sets a template or sets none: what a policy here starts from.
  const templateDefault = (group: ChoiceGroup): TemplateDefault => {
    for (
      let current: ChoiceGroup | undefined = group;
      current;
      current = current.parentId ? byId.get(current.parentId) : undefined
    ) {
      if (current.defaultTemplateNone) return { defaultTemplateNone: true };
      if (current.defaultTemplateId) {
        return {
          defaultTemplateId: current.defaultTemplateId,
          ...(current.defaultTemplateLocked ? { templateLocked: true as const } : {}),
        };
      }
    }
    return {};
  };
  const children = new Map<string, ChoiceGroup[]>();
  for (const g of groups) {
    if (g.parentId && ids.has(g.parentId)) {
      children.set(g.parentId, [...(children.get(g.parentId) ?? []), g]);
    }
  }
  const below = (id: string, prefix: string): CategoryChoice["subcategories"] =>
    (children.get(id) ?? []).flatMap((child) => {
      const name = prefix ? `${prefix} › ${child.name}` : child.name;
      return [
        { ...typed(child), ...templateDefault(child), id: child.id, name },
        ...below(child.id, name),
      ];
    });
  return groups
    .filter((g) => !g.parentId || !ids.has(g.parentId))
    .map((g) => ({
      ...typed(g),
      ...templateDefault(g),
      id: g.id,
      name: g.name,
      subcategories: below(g.id, ""),
    }));
};
