// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The AI jobs' results, as steward-ai writes them into `aiJobResultContent.resultJson` (the
// gateway passes the JSON through untouched): drafted sections, review findings, and a
// revision's change set. Anything malformed reads as empty rather than throwing.

export interface DraftedSection {
  sectionKey: string;
  text: string;
}

export type FindingSeverity = "blocker" | "info" | "warn";

export interface ReviewFinding {
  finding: string;
  sectionKey?: string;
  severity: FindingSeverity;
  suggestion?: string;
}

export interface Revision {
  newSections: { afterKey?: string; content: string; title: string }[];
  sections: { changed: boolean; content?: string; removed: boolean; sectionKey: string }[];
}

const SEVERITIES = new Set<FindingSeverity>(["blocker", "info", "warn"]);

const parse = (json: null | string | undefined): Record<string, unknown> => {
  try {
    const value: unknown = JSON.parse(json ?? "");
    return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};

const records = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    : [];

const text = (value: unknown): string => (typeof value === "string" ? value : "");

/** A draft generation's sections. */
export const parseDraftResult = (json: null | string | undefined): DraftedSection[] =>
  records(parse(json).sections)
    .map((section) => ({ sectionKey: text(section.sectionKey), text: text(section.content) }))
    .filter((section) => section.sectionKey !== "");

/** A review's findings; one with an unknown severity or no text is left out. */
export const parseReviewResult = (json: null | string | undefined): ReviewFinding[] =>
  records(parse(json).findings).flatMap((item) => {
    const severity = text(item.severity) as FindingSeverity;
    const finding = text(item.finding);
    if (!SEVERITIES.has(severity) || !finding) return [];
    const sectionKey = text(item.sectionKey);
    const suggestion = text(item.suggestion);
    return [
      {
        finding,
        ...(sectionKey ? { sectionKey } : {}),
        severity,
        ...(suggestion ? { suggestion } : {}),
      },
    ];
  });

/** A revision's change set, as the model returned it. */
export const parseRevisionResult = (json: null | string | undefined): Revision => {
  const value = parse(json);
  return {
    newSections: records(value.newSections).map((section) => ({
      ...(text(section.afterKey) ? { afterKey: text(section.afterKey) } : {}),
      content: text(section.content),
      title: text(section.title),
    })),
    sections: records(value.sections).map((section) => ({
      changed: section.changed === true,
      ...(typeof section.content === "string" ? { content: section.content } : {}),
      removed: section.removed === true,
      sectionKey: text(section.sectionKey),
    })),
  };
};

export interface ChangeEntry {
  after: string;
  /** The section the new one follows; empty for the end. Only for `new`. */
  afterKey?: string;
  before: string;
  /** The existing section's key, or a made-up one for a new section. */
  key: string;
  kind: ChangeKind;
  title: string;
}

export type ChangeKind = "changed" | "new" | "removed" | "unchanged";

export interface ChangeSet {
  counts: Record<ChangeKind, number>;
  entries: ChangeEntry[];
  /** True when the revision changes nothing ("Nothing to change"). */
  nothing: boolean;
}

/** U31's review: each section of the policy as it now stands, with new sections slotted in
 *  after the one they follow (or at the end), and the counts for the summary line. */
export const changeSetOf = (
  current: readonly { key: string; text: string; title: string }[],
  revision: Revision,
): ChangeSet => {
  const byKey = new Map(revision.sections.map((section) => [section.sectionKey, section]));
  const added = revision.newSections.map((section, index): ChangeEntry => ({
    after: section.content,
    ...(section.afterKey ? { afterKey: section.afterKey } : {}),
    before: "",
    key: `new-${index}`,
    kind: "new",
    title: section.title,
  }));
  const known = new Set(current.map((section) => section.key));
  const entries: ChangeEntry[] = [];
  for (const section of current) {
    const revised = byKey.get(section.key);
    const kind: ChangeKind = revised?.removed
      ? "removed"
      : revised?.changed && revised.content !== undefined && revised.content !== section.text
        ? "changed"
        : "unchanged";
    entries.push(
      {
        after:
          kind === "changed" ? (revised?.content ?? "") : kind === "removed" ? "" : section.text,
        before: section.text,
        key: section.key,
        kind,
        title: section.title,
      },
      ...added.filter((entry) => entry.afterKey === section.key),
    );
  }
  entries.push(...added.filter((entry) => !entry.afterKey || !known.has(entry.afterKey)));

  const counts: Record<ChangeKind, number> = { changed: 0, new: 0, removed: 0, unchanged: 0 };
  for (const entry of entries) counts[entry.kind] += 1;
  return { counts, entries, nothing: counts.changed + counts.new + counts.removed === 0 };
};
