// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Template sections on the Lexical tree. A template section is a heading whose text is the
// section title, followed by its body up to the next heading of the same or a higher level;
// deeper headings belong to the section. This is the shape the scaffold writes and the
// shape older documents already have.
import {
  emptyParagraph,
  hasText,
  nodeText,
  type SerializedDocument,
  type SerializedNode,
  wrapRoot,
} from "./tree";

/** One template section's body as plain text, keyed by the template. */
export interface SectionText {
  key: string;
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

const norm = (value: string): string => value.trim().toLowerCase();

const ordered = (sections: readonly TemplateSectionOutline[]): TemplateSectionOutline[] =>
  [...sections].toSorted((a, b) => a.order - b.order);

const clampLevel = (level: number): number => Math.min(6, Math.max(1, Math.trunc(level) || 1));

const isHeading = (node: SerializedNode): boolean => node.type === "heading";

const headingLevel = (node: SerializedNode): number => {
  const parsed = Number.parseInt(String(node.tag ?? "").replace(/^h/i, ""), 10);
  return Number.isFinite(parsed) ? parsed : 1;
};

const textNode = (value: string): SerializedNode => ({
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text: value,
  type: "text",
  version: 1,
});

const headingNode = (title: string, level: number): SerializedNode => ({
  children: [textNode(title)],
  direction: null,
  format: "",
  indent: 0,
  tag: `h${clampLevel(level)}`,
  type: "heading",
  version: 1,
});

/** Plain text -> one paragraph per blank-line-separated block (one empty paragraph for none). */
export const paragraphsFromText = (value: string): SerializedNode[] => {
  const blocks = value
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (blocks.length === 0) return [emptyParagraph()];
  return blocks.map((block) => ({ ...emptyParagraph(), children: [textNode(block)] }));
};

/** A heading's title as the required check reads it: stray spaces ignored, nothing else. */
const exactTitle = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Where a section's heading is, only when it is still its title, letter for letter. */
const findExactHeading = (children: readonly SerializedNode[], title: string): number =>
  children.findIndex((node) => isHeading(node) && exactTitle(nodeText(node)) === exactTitle(title));

const findHeading = (children: readonly SerializedNode[], title: string): number =>
  children.findIndex((node) => isHeading(node) && norm(nodeText(node)) === norm(title));

/** Where a section's body ends: the next heading at the same or a higher level. */
const sectionEnd = (children: readonly SerializedNode[], start: number): number => {
  const level = headingLevel(children[start]!);
  for (let index = start + 1; index < children.length; index++) {
    const node = children[index]!;
    if (isHeading(node) && headingLevel(node) <= level) return index;
  }
  return children.length;
};

/** A fresh document from a template's outline: each section's heading, then an empty
 *  paragraph to type into, in template order. */
export const scaffoldFromTemplate = (
  sections: readonly TemplateSectionOutline[],
): SerializedDocument =>
  wrapRoot(ordered(sections).flatMap((s) => [headingNode(s.title, s.level), emptyParagraph()]));

/**
 * Make sure every template section's heading is present, so the author sees the whole
 * outline. Missing sections are spliced in, in template order, before the first later
 * section that is present; authored content is left as it is. Returns `current` itself when
 * nothing is missing.
 */
export const ensureTemplateSections = (
  current: SerializedDocument | undefined,
  sections: readonly TemplateSectionOutline[],
): SerializedDocument => {
  if (!current) return scaffoldFromTemplate(sections);
  const outline = ordered(sections);
  const children = [...current.root.children];
  const missing = outline.filter((s) => findHeading(children, s.title) === -1);
  if (missing.length === 0) return current;
  for (const section of missing) {
    const later = new Set(outline.slice(outline.indexOf(section) + 1).map((s) => norm(s.title)));
    const insertAt = children.findIndex(
      (node) => isHeading(node) && later.has(norm(nodeText(node))),
    );
    const nodes = [headingNode(section.title, section.level), emptyParagraph()];
    if (insertAt === -1) children.push(...nodes);
    else children.splice(insertAt, 0, ...nodes);
  }
  return { ...current, root: { ...current.root, children } };
};

/**
 * Titles of required template sections with no text yet: the publish gate, the same check
 * the gateway makes. A section with no heading at all, or content that can't be read,
 * counts as unfilled.
 */
export const missingRequiredSections = (
  document: SerializedDocument | undefined,
  sections: readonly TemplateSectionOutline[],
): string[] => {
  const children = document?.root.children ?? [];
  return sections
    .filter((section) => {
      if (!section.required) return false;
      const start = findExactHeading(children, section.title);
      if (start === -1) return true;
      const end = sectionEnd(children, start);
      return !children.slice(start + 1, end).some((node) => !isHeading(node) && hasText(node));
    })
    .map((section) => section.title);
};

/**
 * Put a document's required headings back, quickly: a required heading that is missing or was
 * renamed is restored, in template order, and every other node, text included, stays as it is.
 * A renamed heading is told from an author's own by where it sits (the only heading of the
 * section's level between its neighbours that is not any template heading): it gets its title
 * back and keeps its text. When that is not clear, a fresh heading and an empty paragraph go in
 * before the next required heading that is present. Sections that are not required are not added.
 */
export const resetRequiredSections = (
  current: SerializedDocument | undefined,
  sections: readonly TemplateSectionOutline[],
): SerializedDocument => {
  const required = ordered(sections).filter((section) => section.required);
  if (!current) return scaffoldFromTemplate(required);
  let children = [...current.root.children];
  let changed = false;
  const templateTitles = new Set(sections.map((section) => exactTitle(section.title)));

  for (const [index, section] of required.entries()) {
    if (findExactHeading(children, section.title) !== -1) continue;
    changed = true;
    const before = required
      .slice(0, index)
      .map((earlier) => findExactHeading(children, earlier.title))
      .filter((position) => position !== -1);
    const after = required
      .slice(index + 1)
      .map((later) => findExactHeading(children, later.title))
      .filter((position) => position !== -1);
    const from = before.length > 0 ? Math.max(...before) + 1 : 0;
    const to = after.length > 0 ? Math.min(...after) : children.length;
    const candidates: number[] = [];
    for (let position = from; position < to; position++) {
      const node = children[position]!;
      if (
        isHeading(node) &&
        headingLevel(node) === clampLevel(section.level) &&
        !templateTitles.has(exactTitle(nodeText(node)))
      ) {
        candidates.push(position);
      }
    }
    if (candidates.length === 1) {
      const position = candidates[0]!;
      children = children.map((node, at) =>
        at === position ? { ...node, children: [textNode(section.title)] } : node,
      );
    } else {
      children.splice(to, 0, headingNode(section.title, section.level), emptyParagraph());
    }
  }
  return changed ? { ...current, root: { ...current.root, children } } : current;
};

/** Each template section's body as plain text, in template order: what the AI features read. */
export const extractSections = (
  document: SerializedDocument | undefined,
  sections: readonly TemplateSectionOutline[],
): SectionText[] => {
  const children = document?.root.children ?? [];
  return ordered(sections).map((section) => {
    const start = findHeading(children, section.title);
    if (start === -1) return { key: section.key, text: "", title: section.title };
    const body = children
      .slice(start + 1, sectionEnd(children, start))
      .filter((node) => !isHeading(node))
      .map((node) => nodeText(node).trim())
      .filter(Boolean)
      .join("\n\n");
    return { key: section.key, text: body, title: section.title };
  });
};

/** Replace one section's body with `value`, one paragraph per blank-line-separated block.
 *  Adds the section first when its heading is missing. */
export const applySectionText = (
  document: SerializedDocument,
  sections: readonly TemplateSectionOutline[],
  sectionKey: string,
  value: string,
): SerializedDocument => {
  const section = sections.find((s) => s.key === sectionKey);
  if (!section) return document;
  const withSection = ensureTemplateSections(document, sections);
  const children = [...withSection.root.children];
  const start = findHeading(children, section.title);
  const end = sectionEnd(children, start);
  const keptSubsections = children.slice(start + 1, end).findIndex((node) => isHeading(node));
  const bodyEnd = keptSubsections === -1 ? end : start + 1 + keptSubsections;
  children.splice(start + 1, bodyEnd - start - 1, ...paragraphsFromText(value));
  return { ...withSection, root: { ...withSection.root, children } };
};

/** Apply generated text to the sections that are still empty, leaving authored ones alone. */
export const fillEmptySections = (
  document: SerializedDocument,
  sections: readonly TemplateSectionOutline[],
  generated: readonly { sectionKey: string; text: string }[],
): SerializedDocument => {
  const current = extractSections(document, sections);
  let result = document;
  for (const item of generated) {
    const existing = current.find((s) => s.key === item.sectionKey);
    if (!existing || existing.text.trim() !== "" || item.text.trim() === "") continue;
    result = applySectionText(result, sections, item.sectionKey, item.text);
  }
  return result;
};

/**
 * Add a section the template doesn't have (a revision's new section): its heading, at the
 * level of the section it follows, and its text, after that section's whole body. With no
 * known section to follow it goes at the end.
 */
export const insertSectionAfter = (
  document: SerializedDocument,
  sections: readonly TemplateSectionOutline[],
  afterKey: string | undefined,
  title: string,
  value: string,
): SerializedDocument => {
  const children = [...document.root.children];
  const after = sections.find((s) => s.key === afterKey);
  const start = after ? findHeading(children, after.title) : -1;
  const level = start === -1 ? (sections[0]?.level ?? 2) : headingLevel(children[start]!);
  const nodes = [headingNode(title, level), ...paragraphsFromText(value)];
  if (start === -1) children.push(...nodes);
  else children.splice(sectionEnd(children, start), 0, ...nodes);
  return { ...document, root: { ...document.root, children } };
};
