// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/**
 * The address of the form for a new policy or procedure: the type is a lowercase path segment,
 * and the slug path of the folder the person started from follows `/category/`, so the form opens
 * on that category (`/drafts/new/policy/category/it-security/travel`). Each slug is encoded as
 * one path segment. No slugs gives the plain form.
 */
export const newDraftPath = (
  documentType: string,
  categorySlugs: readonly string[] = [],
): string => {
  const base = `/drafts/new/${documentType.toLowerCase()}`;
  if (categorySlugs.length === 0) return base;
  return `${base}/category/${categorySlugs.map((slug) => encodeURIComponent(slug)).join("/")}`;
};
