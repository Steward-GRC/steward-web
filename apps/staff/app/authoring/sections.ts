// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Content plumbing for the editor: a draft's `contentJson` is a JSON-encoded array of plain
// per-section text (the gateway stores `PolicyVersion.contentJson` opaquely), not the
// original's rich Lexical document — no shared document renderer exists yet. Pure helpers
// here so the scaffold/gate logic is unit-tested directly, the same way the original's
// authoring.ts was.

export interface DraftSection {
  sectionKey: string;
  text: string;
  title: string;
}

export interface TemplateSectionOutline {
  key: string;
  level: number;
  order: number;
  required: boolean;
  title: string;
}

/** Stored `contentJson` -> sections, for the editor's read path. An unparseable or absent
 *  value is treated as no sections — the safer outcome — rather than throwing mid-render. */
export const parseDraftSections = (contentJson?: null | string): DraftSection[] => {
  if (!contentJson) return [];
  try {
    const parsed = JSON.parse(contentJson) as unknown;
    return Array.isArray(parsed) ? (parsed as DraftSection[]) : [];
  } catch {
    return [];
  }
};

/** Sections -> the string `saveDraft` persists. */
export const stringifyDraftSections = (sections: readonly DraftSection[]): string =>
  JSON.stringify(sections);

const ordered = (sections: readonly TemplateSectionOutline[]): TemplateSectionOutline[] =>
  [...sections].toSorted((a, b) => a.order - b.order);

/** Build a fresh, empty draft from a template's section outline, in template order. */
export const scaffoldFromTemplate = (sections: readonly TemplateSectionOutline[]): DraftSection[] =>
  ordered(sections).map((s) => ({ sectionKey: s.key, text: "", title: s.title }));

/**
 * When editing a template-based draft, make sure every template section is present, in
 * template order, keeping any already-authored text. A section the author added outside the
 * template's outline (rare, but a template can change after a draft started) is dropped from
 * the editor's own list here — it isn't lost: it stays in the stored `contentJson` for any
 * reader of the raw draft, this just keeps the template's current outline in front of the
 * author.
 */
export const ensureTemplateSections = (
  current: readonly DraftSection[],
  templateSections: readonly TemplateSectionOutline[],
): DraftSection[] => {
  const byKey = new Map(current.map((s) => [s.sectionKey, s]));
  return ordered(templateSections).map(
    (s) => byKey.get(s.key) ?? { sectionKey: s.key, text: "", title: s.title },
  );
};

/**
 * Titles of required template sections with no non-blank text yet — the submit/publish gate.
 * Mirrors the gateway's own `publishDraft` check so the editor can show the same refusal
 * before the round trip, not just after.
 */
export const missingRequiredSections = (
  sections: readonly DraftSection[],
  templateSections: readonly TemplateSectionOutline[],
): string[] => {
  const filled = new Set(sections.filter((s) => s.text.trim() !== "").map((s) => s.sectionKey));
  return templateSections.filter((s) => s.required && !filled.has(s.key)).map((s) => s.title);
};
