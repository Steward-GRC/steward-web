// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Pure helpers for the "My drafts" list (the original's ui#70): a short, most-recent-first
// slice by default, expands to the full list, and filters by title/number. No React or DOM,
// so the predicate is unit-tested directly.

/**
 * The drafts a person can pick up: the ones they own, plus every library document that has a
 * saved working draft and that they can edit. There is one shared draft per document for
 * everyone who can edit it, so a draft saved by someone else (or on a document someone else is
 * accountable for) still belongs in this person's list (#75).
 */
export const mergeWorkingDrafts = <
  T extends { currentDraftVersionId?: null | string; id: string; viewerCan: { edit: boolean } },
>(
  owned: readonly T[],
  library: readonly T[],
): T[] => {
  const byId = new Map(owned.map((p) => [p.id, p]));
  for (const p of library) {
    if (p.currentDraftVersionId && p.viewerCan.edit && !byId.has(p.id)) byId.set(p.id, p);
  }
  return [...byId.values()];
};

/** How many drafts the list shows before "Show all (N)" is offered. */
export const DRAFTS_COLLAPSED_CAP = 5;

type DraftRow = { number: string; title: string; updated: null | string };

/** Most-recent first (an ISO timestamp string compares correctly lexically); ties break on
 *  number for a stable order, and a draft with no recorded update time sorts last. Returns a
 *  new array — never mutates the caller's list. */
export const sortDraftsByRecent = <T extends DraftRow>(drafts: readonly T[]): T[] =>
  [...drafts].toSorted(
    (a, b) => (b.updated ?? "").localeCompare(a.updated ?? "") || a.number.localeCompare(b.number),
  );

/** Case-insensitive filter by title or number. A blank/whitespace query returns the list
 *  unchanged so an empty search box never hides anything. */
export const filterDrafts = <T extends DraftRow>(drafts: readonly T[], query: string): T[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [...drafts];
  return drafts.filter(
    (d) => d.title.toLowerCase().includes(q) || d.number.toLowerCase().includes(q),
  );
};

/** What the list actually renders: the full (sorted + filtered) set once expanded, otherwise
 *  just the first `cap` rows. */
export const visibleDrafts = <T>(
  matching: readonly T[],
  expanded: boolean,
  cap: number = DRAFTS_COLLAPSED_CAP,
): T[] => (expanded ? [...matching] : matching.slice(0, cap));
