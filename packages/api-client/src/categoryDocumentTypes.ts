// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type CategoryDocumentCounts, CategoryDocumentTypes } from "./generated/schema";

/** What a category holds; one with no setting yet (an older service) holds both. */
export const documentTypesOf = (category: {
  documentTypes?: CategoryDocumentTypes;
}): CategoryDocumentTypes => category.documentTypes ?? CategoryDocumentTypes.Both;

/** Why a category refuses a document type: it is a container, or holds only the other type. */
export const refusalKey = (types: CategoryDocumentTypes): "container" | "policies" | "procedures" =>
  types === CategoryDocumentTypes.None
    ? "container"
    : types === CategoryDocumentTypes.Policies
      ? "policies"
      : "procedures";

/** Whether a category set to `types` takes a document of this type. */
export const acceptsDocumentType = (
  types: CategoryDocumentTypes,
  documentType: "POLICY" | "PROCEDURE",
): boolean =>
  types === CategoryDocumentTypes.Both ||
  (types === CategoryDocumentTypes.Policies && documentType === "POLICY") ||
  (types === CategoryDocumentTypes.Procedures && documentType === "PROCEDURE");

/**
 * How many of the category's documents `next` would no longer accept (published and draft).
 * Narrowing is only allowed at zero; the form says the count and links to where they can be
 * moved.
 */
export const strandedBy = (
  counts: Pick<CategoryDocumentCounts, "policies" | "procedures">,
  next: CategoryDocumentTypes,
): number =>
  (acceptsDocumentType(next, "POLICY") ? 0 : counts.policies) +
  (acceptsDocumentType(next, "PROCEDURE") ? 0 : counts.procedures);
