// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/** The folder a new draft starts from: the library's `?category=` and `?subcategory=` names. */
export interface NewDraftFolder {
  category?: string;
  subcategory?: string;
}

/**
 * The address of the form for a new policy or procedure: the type is a lowercase path segment,
 * and a folder the person started from rides along so the form opens on that category.
 */
export const newDraftPath = (documentType: string, folder: NewDraftFolder = {}): string => {
  const query = new URLSearchParams();
  if (folder.category) {
    query.set("category", folder.category);
    if (folder.subcategory) query.set("subcategory", folder.subcategory);
  }
  const text = query.toString();
  return `/drafts/new/${documentType.toLowerCase()}${text ? `?${text}` : ""}`;
};
