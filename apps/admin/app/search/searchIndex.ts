// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * App-level search module — presentation-free.
 *
 * Builds a unified, query-language-filtered result set spanning the things an admin can
 * navigate to: policies/procedures, category shortcuts, templates and groups (the original's
 * scope, minus workflows — not ported to this area yet; a gap, not an intentional narrowing).
 * Each entity becomes a `SearchRecord` (a lowercased `text` blob plus named, lowercased
 * fields) so `compileQuery` can match free text, `"exact phrases"`, `-exclusions`, `OR`, and
 * `field:value` filters.
 */
import type { Category, Group, Policy, Template } from "@steward-web/api-client";

import { policyPath } from "@steward-web/ui/domain";

import { compileQuery, type SearchRecord } from "./compileQuery";

export type SearchHit = {
  hint?: string;
  id: string;
  label: string;
  rec: SearchRecord;
  to: string;
  type: SearchHitType;
};

export type SearchHitType = "Category" | "Group" | "Policy" | "Template";

const lc = (v: string | undefined): string => (v ?? "").toLowerCase();

/** The candidate set, built once per policy/category/template/group list; matching is applied
 *  per-query. `templates` and `groups` are optional: a caller without `group.manage` still
 *  gets a usable search over the policy library. */
export const buildSearchIndex = (
  policies: readonly Policy[],
  categories: readonly Category[],
  templates: readonly Template[] = [],
  groups: readonly Group[] = [],
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
      // The library filters by category NAME through its own `?category=` query param
      // (there is no dedicated category path); categories aren't document-type-specific, so
      // this always points at the policy library, same as the original.
      to: `/policies?category=${encodeURIComponent(c.name)}`,
      type: "Category",
    });
  }

  for (const t of templates) {
    hits.push({
      hint: t.code,
      id: t.id,
      label: t.name,
      rec: { code: lc(t.code), text: lc(`${t.code} ${t.name}`) },
      to: `/templates/${encodeURIComponent(t.code)}`,
      type: "Template",
    });
  }

  for (const g of groups) {
    hits.push({
      hint: g.slug,
      id: g.id,
      label: g.name,
      rec: { name: lc(g.name), slug: lc(g.slug), text: lc(`${g.name} ${g.slug}`) },
      to: `/groups/${encodeURIComponent(g.id)}`,
      type: "Group",
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
