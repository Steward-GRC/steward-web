// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Category } from "@steward-web/api-client";

/**
 * The slug path (category, then subcategory) of the folder the library's `?category=` and
 * `?subcategory=` filter names, for the New policy and New procedure links (#377). A name that
 * is not a known category or subcategory gives nothing, so the link opens the plain form.
 */
export const folderSlugs = (
  categories: readonly Category[],
  category: string,
  subcategory: string,
): string[] => {
  const root = category ? categories.find((c) => c.name === category) : undefined;
  if (!root) return [];
  if (!subcategory) return [root.slug];
  const child = root.subcategories.find((s) => s.name === subcategory);
  return child ? [root.slug, child.slug] : [];
};
