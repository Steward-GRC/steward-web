// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The template draft's review step (A7): what the draft changes against the published version,
// section by section. Plain data so the review list and its tests share it.

export type SectionChange =
  | { from: string; kind: "renamed"; title: string }
  | { kind: "added" | "moved" | "nowOptional" | "nowRequired" | "removed" | "text"; title: string }
  | { kind: "level"; level: number; title: string };

interface SectionLike {
  readonly blocks: readonly { readonly contentJson?: null | string; readonly type: string }[];
  readonly key: string;
  readonly level?: null | number;
  readonly order: number;
  readonly required?: boolean | null;
  readonly title: string;
}

const byOrder = (sections: readonly SectionLike[]) =>
  sections.toSorted((a, b) => a.order - b.order);

/**
 * The changes from `before` (the published sections) to `after` (the draft), in the draft's
 * order, then the removed sections. A section keeps its key across a rename, so a renamed
 * section is one change, not a removal and an addition.
 */
export const sectionChanges = (
  before: readonly SectionLike[],
  after: readonly SectionLike[],
): SectionChange[] => {
  const old = byOrder(before);
  const next = byOrder(after);
  const oldKeys = old.map((s) => s.key).filter((key) => next.some((s) => s.key === key));
  const nextKeys = next.map((s) => s.key).filter((key) => old.some((s) => s.key === key));
  const changes: SectionChange[] = [];

  for (const section of next) {
    const was = old.find((s) => s.key === section.key);
    if (!was) {
      changes.push({ kind: "added", title: section.title });
      continue;
    }
    if (was.title !== section.title) {
      changes.push({ from: was.title, kind: "renamed", title: section.title });
    }
    if (oldKeys.indexOf(section.key) !== nextKeys.indexOf(section.key)) {
      changes.push({ kind: "moved", title: section.title });
    }
    if ((was.level ?? 1) !== (section.level ?? 1)) {
      changes.push({ kind: "level", level: section.level ?? 1, title: section.title });
    }
    if (Boolean(was.required) !== Boolean(section.required)) {
      changes.push({
        kind: section.required ? "nowRequired" : "nowOptional",
        title: section.title,
      });
    }
    if (JSON.stringify(was.blocks) !== JSON.stringify(section.blocks)) {
      changes.push({ kind: "text", title: section.title });
    }
  }
  for (const section of old) {
    if (!next.some((s) => s.key === section.key)) {
      changes.push({ kind: "removed", title: section.title });
    }
  }
  return changes;
};
