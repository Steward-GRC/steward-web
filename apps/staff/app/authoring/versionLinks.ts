// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Helpers for the links a policy version holds to the libraries (bug log 227).

/** The ids with the one at `index` moved by `delta` places; unchanged at either end. */
export const moveId = (ids: readonly string[], index: number, delta: -1 | 1): string[] => {
  const target = index + delta;
  if (index < 0 || index >= ids.length || target < 0 || target >= ids.length) return [...ids];
  const next = [...ids];
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
};

/** Library items still free to link: not archived, not linked yet, sorted by their name. */
export const availableTo = <T extends { archived: boolean; id: string }>(
  library: readonly T[],
  linkedIds: readonly string[],
  nameOf: (item: T) => string,
): T[] =>
  library
    .filter((item) => !item.archived && !linkedIds.includes(item.id))
    .toSorted((a, b) => nameOf(a).localeCompare(nameOf(b), undefined, { sensitivity: "base" }));
