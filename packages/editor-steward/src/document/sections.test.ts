// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import {
  applySectionText,
  ensureTemplateSections,
  extractSections,
  fillEmptySections,
  insertSectionAfter,
  missingRequiredSections,
  resetRequiredSections,
  scaffoldFromTemplate,
  type TemplateSectionOutline,
} from "./sections";
import { type SerializedDocument, type SerializedNode, wrapRoot } from "./tree";

const outline: TemplateSectionOutline[] = [
  { key: "purpose", level: 1, order: 0, required: true, title: "Purpose" },
  { key: "scope", level: 1, order: 1, required: false, title: "Scope" },
];

const text = (value: string): SerializedNode => ({
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text: value,
  type: "text",
  version: 1,
});
const heading = (title: string, level = 1): SerializedNode => ({
  children: [text(title)],
  direction: null,
  format: "",
  indent: 0,
  tag: `h${level}`,
  type: "heading",
  version: 1,
});
const paragraph = (value?: string): SerializedNode => ({
  children: value === undefined ? [] : [text(value)],
  direction: null,
  format: "",
  indent: 0,
  type: "paragraph",
  version: 1,
});
const headings = (document: SerializedDocument) =>
  document.root.children.filter((n) => n.type === "heading").map((n) => extractTitle(n));
const extractTitle = (node: SerializedNode) =>
  (node.children ?? []).map((child) => String(child.text ?? "")).join("");

describe("scaffoldFromTemplate", () => {
  it("builds a heading and an empty paragraph per section, in template order", () => {
    const document = scaffoldFromTemplate([outline[1]!, outline[0]!]);
    expect(document.root.children.map((n) => n.type)).toEqual([
      "heading",
      "paragraph",
      "heading",
      "paragraph",
    ]);
    expect(headings(document)).toEqual(["Purpose", "Scope"]);
    expect(document.root.children.at(0)).toMatchObject({ tag: "h1" });
  });

  it("gives an empty outline one empty paragraph, never an empty root", () => {
    expect(scaffoldFromTemplate([]).root.children).toEqual([paragraph()]);
  });
});

describe("ensureTemplateSections", () => {
  it("keeps the authored content and splices a missing section in, in template order", () => {
    const current = wrapRoot([heading("Scope"), paragraph("Everyone")]);
    const result = ensureTemplateSections(current, outline);
    expect(headings(result)).toEqual(["Purpose", "Scope"]);
    expect(result.root.children.at(-1)).toEqual(paragraph("Everyone"));
  });

  it("matches headings by title, ignoring case and spacing", () => {
    const current = wrapRoot([heading(" purpose "), paragraph("Why"), heading("SCOPE")]);
    expect(ensureTemplateSections(current, outline)).toBe(current);
  });

  it("scaffolds a fresh document when there is no content", () => {
    expect(headings(ensureTemplateSections(undefined, outline))).toEqual(["Purpose", "Scope"]);
  });
});

describe("missingRequiredSections", () => {
  it("flags a required section whose heading has no text under it", () => {
    expect(missingRequiredSections(scaffoldFromTemplate(outline), outline)).toEqual(["Purpose"]);
  });

  it("clears once text sits between the heading and the next heading", () => {
    const document = wrapRoot([heading("Purpose"), paragraph("Why"), heading("Scope")]);
    expect(missingRequiredSections(document, outline)).toEqual([]);
  });

  it("counts text under a deeper sub-heading as part of the section", () => {
    const document = wrapRoot([heading("Purpose"), heading("Detail", 2), paragraph("Why")]);
    expect(missingRequiredSections(document, outline)).toEqual([]);
  });

  it("does not count text that belongs to the next sibling section", () => {
    const document = wrapRoot([heading("Purpose"), heading("Scope"), paragraph("Everyone")]);
    expect(missingRequiredSections(document, outline)).toEqual(["Purpose"]);
  });

  it("counts text nested in lists, quotes and tables", () => {
    const list: SerializedNode = {
      children: [{ children: [text("item")], type: "listitem", version: 1 }],
      listType: "bullet",
      type: "list",
      version: 1,
    };
    expect(missingRequiredSections(wrapRoot([heading("Purpose"), list]), outline)).toEqual([]);
  });

  it("treats a missing heading or unreadable content as unfilled", () => {
    expect(missingRequiredSections(wrapRoot([paragraph("orphan")]), outline)).toEqual(["Purpose"]);
    expect(missingRequiredSections(undefined, outline)).toEqual(["Purpose"]);
  });

  it("never flags a section the template doesn't mark required", () => {
    expect(missingRequiredSections(undefined, [outline[1]!])).toEqual([]);
  });

  // bug log 173: a required section is met only when its heading is still there, unchanged, with
  // real text under it. A sub-heading may come first, but a sub-heading alone is not content.
  it("does not count a sub-heading with no text after it as content", () => {
    expect(
      missingRequiredSections(wrapRoot([heading("Purpose"), heading("Detail", 2)]), outline),
    ).toEqual(["Purpose"]);
    expect(
      missingRequiredSections(
        wrapRoot([heading("Purpose"), heading("Detail", 2), paragraph()]),
        outline,
      ),
    ).toEqual(["Purpose"]);
  });

  it("counts text after a first sub-heading as content", () => {
    const document = wrapRoot([heading("Purpose"), heading("Detail", 2), paragraph("Why")]);
    expect(missingRequiredSections(document, outline)).toEqual([]);
  });

  it("fails a required section whose heading was renamed, even with text under it", () => {
    const document = wrapRoot([heading("Purposes"), paragraph("Why")]);
    expect(missingRequiredSections(document, outline)).toEqual(["Purpose"]);
  });

  it("treats a change of letter case in the heading as a rename", () => {
    expect(
      missingRequiredSections(wrapRoot([heading("purpose"), paragraph("Why")]), outline),
    ).toEqual(["Purpose"]);
    expect(
      missingRequiredSections(wrapRoot([heading("PURPOSE"), paragraph("Why")]), outline),
    ).toEqual(["Purpose"]);
  });

  it("ignores stray spaces around a heading that is otherwise unchanged", () => {
    const document = wrapRoot([heading("  Purpose "), paragraph("Why")]);
    expect(missingRequiredSections(document, outline)).toEqual([]);
  });

  it("fails a required section whose heading was deleted, even with text where it was", () => {
    expect(
      missingRequiredSections(wrapRoot([paragraph("Why"), heading("Scope")]), outline),
    ).toEqual(["Purpose"]);
  });
});

describe("resetRequiredSections", () => {
  const required: TemplateSectionOutline[] = [
    { key: "purpose", level: 1, order: 0, required: true, title: "Purpose" },
    { key: "scope", level: 1, order: 1, required: true, title: "Scope" },
    { key: "policy", level: 1, order: 2, required: true, title: "Policy" },
    { key: "notes", level: 1, order: 3, required: false, title: "Notes" },
  ];

  it("returns the same document when every required heading is there", () => {
    const document = wrapRoot([heading("Purpose"), heading("Scope"), heading("Policy")]);
    expect(resetRequiredSections(document, required)).toBe(document);
  });

  it("puts a deleted required heading back in template order and keeps every other node", () => {
    const document = wrapRoot([
      heading("Purpose"),
      paragraph("Why"),
      heading("Policy"),
      paragraph("Do this"),
    ]);
    const reset = resetRequiredSections(document, required);
    expect(headings(reset)).toEqual(["Purpose", "Scope", "Policy"]);
    expect(
      reset.root.children.filter((n) => n.type === "paragraph").map((n) => extractTitle(n)),
    ).toEqual(["Why", "", "Do this"]);
  });

  it("gives a renamed heading its title back and keeps the text under it", () => {
    const document = wrapRoot([
      heading("Purpose"),
      paragraph("Why"),
      heading("The scope of this"),
      paragraph("Everyone"),
      heading("Policy"),
      paragraph("Do this"),
    ]);
    const reset = resetRequiredSections(document, required);
    expect(headings(reset)).toEqual(["Purpose", "Scope", "Policy"]);
    expect(missingRequiredSections(reset, required)).toEqual([]);
    expect(reset.root.children.map((n) => extractTitle(n))).toEqual([
      "Purpose",
      "Why",
      "Scope",
      "Everyone",
      "Policy",
      "Do this",
    ]);
  });

  it("restores a heading whose only change is its letter case", () => {
    const document = wrapRoot([
      heading("purpose"),
      paragraph("Why"),
      heading("Scope"),
      heading("Policy"),
    ]);
    const reset = resetRequiredSections(document, required);
    expect(headings(reset)).toEqual(["Purpose", "Scope", "Policy"]);
    expect(extractTitle(reset.root.children.at(1)!)).toBe("Why");
  });

  it("inserts a fresh heading, and leaves the others as they are, when it cannot tell which was renamed", () => {
    const document = wrapRoot([
      heading("Purpose"),
      paragraph("Why"),
      heading("First thing"),
      paragraph("A"),
      heading("Second thing"),
      paragraph("B"),
      heading("Policy"),
    ]);
    const reset = resetRequiredSections(document, required);
    expect(headings(reset)).toEqual(["Purpose", "First thing", "Second thing", "Scope", "Policy"]);
    expect(reset.root.children.map((n) => extractTitle(n))).toContain("A");
    expect(reset.root.children.map((n) => extractTitle(n))).toContain("B");
  });

  it("does not add an optional section that is missing", () => {
    const document = wrapRoot([heading("Purpose"), heading("Scope"), heading("Policy")]);
    expect(headings(resetRequiredSections(document, required))).not.toContain("Notes");
  });

  it("scaffolds the required headings when there is no document", () => {
    expect(headings(resetRequiredSections(undefined, required))).toEqual([
      "Purpose",
      "Scope",
      "Policy",
    ]);
  });
});

describe("extractSections", () => {
  it("reads each template section's body as plain text, keyed by the template", () => {
    const document = wrapRoot([
      heading("Purpose"),
      paragraph("First"),
      paragraph("Second"),
      heading("Scope"),
    ]);
    expect(extractSections(document, outline)).toEqual([
      { key: "purpose", text: "First\n\nSecond", title: "Purpose" },
      { key: "scope", text: "", title: "Scope" },
    ]);
  });
});

describe("applySectionText", () => {
  it("replaces a section's body with one paragraph per block of text", () => {
    const document = wrapRoot([heading("Purpose"), paragraph("old"), heading("Scope")]);
    const result = applySectionText(document, outline, "purpose", "New one\n\nNew two");
    expect(result.root.children).toEqual([
      heading("Purpose"),
      paragraph("New one"),
      paragraph("New two"),
      heading("Scope"),
    ]);
  });

  it("adds the section when its heading is missing", () => {
    const result = applySectionText(wrapRoot([paragraph()]), outline, "scope", "All staff");
    expect(extractSections(result, outline).find((s) => s.key === "scope")?.text).toBe("All staff");
  });
});

describe("fillEmptySections", () => {
  it("fills only sections that are still empty", () => {
    const document = wrapRoot([heading("Purpose"), paragraph("Keep me"), heading("Scope")]);
    const result = fillEmptySections(document, outline, [
      { sectionKey: "purpose", text: "Replaced?" },
      { sectionKey: "scope", text: "Generated scope" },
    ]);
    expect(extractSections(result, outline)).toEqual([
      { key: "purpose", text: "Keep me", title: "Purpose" },
      { key: "scope", text: "Generated scope", title: "Scope" },
    ]);
  });
});

describe("insertSectionAfter", () => {
  it("puts a new section after the one it follows, at that section's level", () => {
    const document = wrapRoot([
      heading("Purpose"),
      paragraph("Why"),
      heading("Detail", 2),
      paragraph("More"),
      heading("Scope"),
      paragraph("Who"),
    ]);
    const result = insertSectionAfter(document, outline, "purpose", "Rolling back", "Go back.");
    expect(result.root.children).toEqual([
      heading("Purpose"),
      paragraph("Why"),
      heading("Detail", 2),
      paragraph("More"),
      heading("Rolling back"),
      paragraph("Go back."),
      heading("Scope"),
      paragraph("Who"),
    ]);
  });

  it("puts it at the end when it follows nothing known", () => {
    const document = wrapRoot([heading("Purpose"), paragraph("Why")]);
    const result = insertSectionAfter(document, outline, undefined, "Annex", "Extra.");
    expect(headings(result)).toEqual(["Purpose", "Annex"]);
    expect(result.root.children.at(-1)).toEqual(paragraph("Extra."));
  });
});
