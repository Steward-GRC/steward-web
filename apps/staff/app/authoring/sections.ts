// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The draft's content for the editor: `contentJson` holds the Lexical serialized editor state
// (the format steward-core validates), with each template section as a heading followed by
// its body. A freeform draft has no outline and is one "Content" section for the AI features.
import {
  applySectionText,
  ensureTemplateSections,
  extractSections,
  fillEmptySections,
  insertSectionAfter,
  nodeText,
  paragraphsFromText,
  parseDocument,
  type SectionText,
  type SerializedDocument,
  type TemplateSectionOutline,
  wrapRoot,
} from "@steward-web/editor-steward/document";

import type { ChangeEntry } from "./ai/results";

export {
  missingRequiredSections,
  resetRequiredSections,
  type SectionText,
  type SerializedDocument,
  type TemplateSectionOutline,
} from "@steward-web/editor-steward/document";

const FREEFORM_KEY = "content";
const FREEFORM_TITLE = "Content";

/**
 * Stored `contentJson` -> the document the editor opens. A template draft always shows the
 * template's whole outline. Anything that isn't an editor state (the earlier plain-text
 * section array included) is not fed to the editor: the draft opens from the scaffold.
 */
export const draftDocument = (
  contentJson: null | string | undefined,
  outline: readonly TemplateSectionOutline[],
): SerializedDocument => {
  const parsed = parseDocument(contentJson);
  if (outline.length > 0) return ensureTemplateSections(parsed, outline);
  return parsed ?? wrapRoot([]);
};

/** The draft's sections as plain text, for AI review, generation and assist. */
export const aiSections = (
  document: SerializedDocument,
  outline: readonly TemplateSectionOutline[],
): SectionText[] => {
  if (outline.length > 0) return extractSections(document, outline);
  const body = document.root.children
    .map((node) => nodeText(node).trim())
    .filter(Boolean)
    .join("\n\n");
  return [{ key: FREEFORM_KEY, text: body, title: FREEFORM_TITLE }];
};

/** Put AI text into one section; for a freeform draft it replaces the whole body. */
export const applyAiText = (
  document: SerializedDocument,
  outline: readonly TemplateSectionOutline[],
  sectionKey: string,
  value: string,
): SerializedDocument => {
  if (outline.length > 0) return applySectionText(document, outline, sectionKey, value);
  return { ...document, root: { ...document.root, children: paragraphsFromText(value) } };
};

/** Apply a generation job's sections to the ones still empty. */
export const fillGenerated = (
  document: SerializedDocument,
  outline: readonly TemplateSectionOutline[],
  generated: readonly { sectionKey: string; text: string }[],
): SerializedDocument => {
  if (outline.length > 0) return fillEmptySections(document, outline, generated);
  const freeform = generated.find((g) => g.sectionKey === FREEFORM_KEY);
  const current = aiSections(document, outline)[0]?.text ?? "";
  return freeform && current === ""
    ? applyAiText(document, outline, FREEFORM_KEY, freeform.text)
    : document;
};

/** Apply a whole generated draft (U30's Apply draft): every section the generation wrote,
 *  authored ones included; a section it left empty stays as it is. */
export const applyGenerated = (
  document: SerializedDocument,
  outline: readonly TemplateSectionOutline[],
  generated: readonly { sectionKey: string; text: string }[],
): SerializedDocument => {
  let result = document;
  for (const section of generated) {
    if (section.text.trim() === "") continue;
    result = applyAiText(result, outline, section.sectionKey, section.text);
  }
  return result;
};

/**
 * Apply a revision's change set (U31's Apply as draft revision): a changed section takes its
 * new text, a removed one is emptied (a template keeps its headings), and a new section goes
 * after the one it follows, or at the end.
 */
export const applyChangeSet = (
  document: SerializedDocument,
  outline: readonly TemplateSectionOutline[],
  entries: readonly ChangeEntry[],
): SerializedDocument => {
  let result = document;
  for (const entry of entries) {
    if (entry.kind === "changed") result = applyAiText(result, outline, entry.key, entry.after);
    if (entry.kind === "removed") result = applyAiText(result, outline, entry.key, "");
    if (entry.kind === "new") {
      result = insertSectionAfter(result, outline, entry.afterKey, entry.title, entry.after);
    }
  }
  return result;
};
