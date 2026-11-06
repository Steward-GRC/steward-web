// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType } from "@steward-web/api-client";

/** The document type a `/drafts/new/:type` segment names, or null for anything else. */
export const documentTypeOfSlug = (slug?: string): DocumentType | null => {
  if (slug === "policy") return DocumentType.Policy;
  if (slug === "procedure") return DocumentType.Procedure;
  return null;
};

/**
 * Where an old `/drafts/new?type=POLICY` link goes: the type moves into the path (#147), and
 * the template or folder it carried goes along. Null when the address has no `type`.
 */
export const legacyTypeRedirect = (url: URL): null | string => {
  const slug = documentTypeOfSlug(url.searchParams.get("type")?.toLowerCase());
  if (!slug) return null;
  const rest = new URLSearchParams(url.searchParams);
  rest.delete("type");
  const text = rest.toString();
  return `/drafts/new/${slug.toLowerCase()}${text ? `?${text}` : ""}`;
};

/**
 * The category and subcategory a folder view names, as ids. Unknown names give nothing, so the
 * form opens with no category chosen rather than a wrong one (#148).
 */
export const folderChoice = (
  categories: readonly {
    id: string;
    name: string;
    subcategories: readonly { id: string; name: string }[];
  }[],
  category: null | string,
  subcategory: null | string,
): { groupId: string; subcategoryId: string } | null => {
  const found = category ? categories.find((c) => c.name === category) : undefined;
  if (!found) return null;
  const sub = subcategory ? found.subcategories.find((s) => s.name === subcategory) : undefined;
  return { groupId: found.id, subcategoryId: sub?.id ?? "" };
};
