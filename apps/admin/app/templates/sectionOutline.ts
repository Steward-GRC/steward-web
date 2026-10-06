// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// An outline editor's pure logic for a draft template version's sections: nesting is expressed
// by `level` (H1-H5) on a flat ordered list, reordered by drag, re-leveled by indent/outdent.
// Framework-free so it carries its own unit tests independent of the editor component.
import type { SectionInput } from "@steward-web/api-client";

const MIN_LEVEL = 1;
const MAX_LEVEL = 5;

export const clampLevel = (level: number): number =>
  Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, level));

/** Enforces contiguity across the whole list: the first section is forced to level 1; every
 *  later one is capped at the section above it + 1. */
export const normalizeLevels = (sections: readonly SectionInput[]): SectionInput[] => {
  let previous = 0;
  return sections.map((s, index) => {
    const max = index === 0 ? MIN_LEVEL : previous + 1;
    const level = clampLevel(Math.min(s.level ?? MIN_LEVEL, max));
    previous = level;
    return (s.level ?? MIN_LEVEL) === level ? s : { ...s, level };
  });
};

/** Re-sequences `order` to 0..n-1 following the array's current order. */
export const resequence = (sections: readonly SectionInput[]): SectionInput[] =>
  sections.map((s, index) => (s.order === index ? s : { ...s, order: index }));

/** Applies both normalizations together, the shape every commit (reorder, indent, add, remove)
 *  persists to local state before a save. */
export const normalizeOutline = (sections: readonly SectionInput[]): SectionInput[] =>
  normalizeLevels(resequence(sections));

export const slugifyKey = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");

export const uniqueKey = (
  base: string,
  existing: ReadonlySet<string>,
  fallback: string,
): string => {
  const key = base || fallback;
  if (!existing.has(key)) return key;
  let n = 2;
  while (existing.has(`${key}-${n}`)) n += 1;
  return `${key}-${n}`;
};

/** Outline numbers (1, 2, 2.1, 3, 3.1.1, ...) derived from the level sequence, for the live
 *  preview. */
export const outlineNumbers = (sections: readonly SectionInput[]): string[] => {
  const counters: number[] = [];
  return sections.map((s) => {
    const level = s.level ?? MIN_LEVEL;
    const depth = level - 1;
    counters.length = depth + 1;
    for (let index = 0; index <= depth; index += 1) {
      if (counters[index] == undefined) counters[index] = 0;
    }
    counters[depth] = (counters[depth] ?? 0) + 1;
    return counters.slice(0, depth + 1).join(".");
  });
};

/** A fresh section appended to the list: inherits the previous section's level (first section
 *  defaults to H1), an empty title and a unique key. */
export const newSection = (sections: readonly SectionInput[]): SectionInput => {
  const n = sections.length;
  const level = n === 0 ? MIN_LEVEL : (sections[n - 1]!.level ?? MIN_LEVEL);
  const existing = new Set(sections.map((s) => s.key));
  return {
    blocks: [],
    key: uniqueKey(slugifyKey(""), existing, `section-${n + 1}`),
    level,
    order: n,
    required: false,
    title: "",
  };
};
