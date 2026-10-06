// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * App-level search module — presentation-free.
 *
 * Builds a unified, query-language-filtered result set spanning the things a staff member
 * can navigate to: policies/procedures and category shortcuts. Each entity becomes a
 * `SearchRecord` (a lowercased `text` blob plus named, lowercased fields) so `compileQuery`
 * can match free text, `"exact phrases"`, `-exclusions`, `OR`, and `field:value` filters.
 *
 * Templates have no Steward port yet (the library's template picker isn't ported), so they
 * are not indexed here; that is a gap, not an intentional narrowing of the original's scope.
 */
import type { Category, Policy } from "@steward-web/api-client";

import { policyPath } from "@steward-web/ui/domain";

import { compileQuery, type SearchRecord } from "./compileQuery";

export type SearchHitType = "Category" | "Policy";

export type SearchHit = {
  hint?: string;
  id: string;
  label: string;
  rec: SearchRecord;
  to: string;
  type: SearchHitType;
};

const lc = (v: string | undefined): string => (v ?? "").toLowerCase();

/** The candidate set, built once per policy/category list; matching is applied per-query. */
export const buildSearchIndex = (
  policies: readonly Policy[],
  categories: readonly Category[],
): SearchHit[] => {
  const hits: SearchHit[] = [];

  for (const p of policies) {
    hits.push({
      hint: `${p.number} · ${p.category}`,
      id: p.id,
      label: p.title,
      rec: {
        category: lc(p.category),
        number: lc(p.number),
        sensitivity: lc(p.sensitivity),
        status: lc(p.status),
        subcategory: lc(p.subcategory),
        text: lc([p.category, p.subcategory, p.status, p.sensitivity, p.number, p.title].join(" ")),
        title: lc(p.title),
        version: lc(p.version),
      },
      to: policyPath(p),
      type: "Policy",
    });
  }

  for (const c of categories) {
    hits.push({
      hint: `${c.subcategories.length} subcategories`,
      id: c.id,
      label: c.name,
      rec: { category: lc(c.name), text: lc(c.name) },
      // The library's browse-by-category path. Categories aren't document-type-specific, but
      // the original search page only ever indexed the Policy library, never Procedures, and
      // always pointed a category hit at /policies — carried as-is.
      to: `/policies/category/${encodeURIComponent(c.slug)}`,
      type: "Category",
    });
  }

  return hits;
};

/** Filters a pre-built index against a query-language string. Empty query returns no hits
 *  (the page shows its own "start typing" prompt instead of the whole catalog). */
export const searchHits = (index: readonly SearchHit[], query: string): SearchHit[] => {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const pred = compileQuery(trimmed);
  return index.filter((h) => pred(h.rec));
};
