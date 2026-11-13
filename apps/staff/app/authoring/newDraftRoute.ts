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
 * the template it carried goes along. A category name from an old link is dropped: the folder is
 * addressed by slug in the path (#377). Null when the address has no `type`.
 */
export const legacyTypeRedirect = (url: URL): null | string => {
  const slug = documentTypeOfSlug(url.searchParams.get("type")?.toLowerCase());
  if (!slug) return null;
  const rest = new URLSearchParams(url.searchParams);
  rest.delete("type");
  rest.delete("category");
  rest.delete("subcategory");
  const text = rest.toString();
  return `/drafts/new/${slug.toLowerCase()}${text ? `?${text}` : ""}`;
};

/**
 * The category and subcategory a `/category/<slug>/<slug>...` address names, as ids. The first
 * slug is the category; any slugs after it are the path down to a subcategory, so the same slug
 * under two parents resolves by its parent. An address that does not resolve gives nothing, so
 * the form opens with no category chosen rather than a wrong one (#148, #377).
 */
export const folderChoice = (
  categories: readonly {
    id: string;
    slug: string;
    subcategories: readonly { id: string; path: readonly string[] }[];
  }[],
  slugs: readonly string[],
): { groupId: string; subcategoryId: string } | null => {
  const [first, ...below] = slugs;
  const found = first ? categories.find((c) => c.slug === first) : undefined;
  if (!found) return null;
  if (below.length === 0) return { groupId: found.id, subcategoryId: "" };
  const sub = found.subcategories.find(
    (s) => s.path.length === below.length && s.path.every((slug, at) => slug === below[at]),
  );
  return sub ? { groupId: found.id, subcategoryId: sub.id } : null;
};
