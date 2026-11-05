// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type SerializedNode, serializeDocument, wrapRoot } from "@steward-web/editor-steward";
import { describe, expect, it } from "vitest";

import {
  aiSections,
  applyAiText,
  applyChangeSet,
  applyGenerated,
  draftDocument,
  fillGenerated,
  missingRequiredSections,
} from "./sections";

const outline = [
  { key: "purpose", level: 1, order: 0, required: true, title: "Purpose" },
  { key: "scope", level: 1, order: 1, required: false, title: "Scope" },
];

const text = (value: string): SerializedNode => ({ text: value, type: "text", version: 1 });
const heading = (title: string, level = 1): SerializedNode => ({
  children: [text(title)],
  tag: `h${level}`,
  type: "heading",
  version: 1,
});
const paragraph = (value: string): SerializedNode => ({
  children: [text(value)],
  type: "paragraph",
  version: 1,
});
const stored = (...children: SerializedNode[]) => serializeDocument(wrapRoot(children));

describe("draftDocument", () => {
  it("opens a template draft with every template section present", () => {
    const document = draftDocument(stored(heading("Scope"), paragraph("All staff")), outline);
    expect(aiSections(document, outline).map((s) => s.key)).toEqual(["purpose", "scope"]);
    expect(aiSections(document, outline)[1]?.text).toBe("All staff");
  });

  it("starts a template draft from its scaffold when nothing is stored yet", () => {
    expect(missingRequiredSections(draftDocument(null, outline), outline)).toEqual(["Purpose"]);
  });

  it("drops a stored value that isn't an editor state, such as the earlier plain-text format", () => {
    const old = JSON.stringify([{ sectionKey: "purpose", text: "old", title: "Purpose" }]);
    const document = draftDocument(old, []);
    expect(document.root.children).toHaveLength(1);
    expect(JSON.stringify(document)).not.toContain("old");
  });
});

describe("missingRequiredSections (the publish gate) on the Lexical tree", () => {
  it("blocks while a required section's heading has nothing under it", () => {
    const document = draftDocument(stored(heading("Purpose"), heading("Scope")), outline);
    expect(missingRequiredSections(document, outline)).toEqual(["Purpose"]);
  });

  it("clears once the section has text, including text under a sub-heading", () => {
    const filled = draftDocument(stored(heading("Purpose"), paragraph("Why")), outline);
    const nested = draftDocument(
      stored(heading("Purpose"), heading("Detail", 2), paragraph("Why")),
      outline,
    );
    expect(missingRequiredSections(filled, outline)).toEqual([]);
    expect(missingRequiredSections(nested, outline)).toEqual([]);
  });

  it("ignores whitespace-only text", () => {
    const document = draftDocument(stored(heading("Purpose"), paragraph(" ".repeat(3))), outline);
    expect(missingRequiredSections(document, outline)).toEqual(["Purpose"]);
  });

  it("never blocks a freeform draft", () => {
    expect(missingRequiredSections(draftDocument(null, []), [])).toEqual([]);
  });
});

describe("the AI section helpers", () => {
  it("treat a freeform draft as one Content section", () => {
    const document = draftDocument(stored(paragraph("One"), paragraph("Two")), []);
    expect(aiSections(document, [])).toEqual([
      { key: "content", text: "One\n\nTwo", title: "Content" },
    ]);
    const rewritten = applyAiText(document, [], "content", "Rewritten");
    expect(aiSections(rewritten, [])[0]?.text).toBe("Rewritten");
  });

  it("apply a suggestion to one template section only", () => {
    const document = draftDocument(stored(heading("Purpose"), paragraph("Old")), outline);
    const result = applyAiText(document, outline, "purpose", "New");
    expect(aiSections(result, outline).map((s) => s.text)).toEqual(["New", ""]);
  });

  it("fill generated text into empty sections and leave authored ones", () => {
    const document = draftDocument(stored(heading("Purpose"), paragraph("Mine")), outline);
    const result = fillGenerated(document, outline, [
      { sectionKey: "purpose", text: "Generated purpose" },
      { sectionKey: "scope", text: "Generated scope" },
    ]);
    expect(aiSections(result, outline).map((s) => s.text)).toEqual(["Mine", "Generated scope"]);
  });
});

describe("applying a whole generated draft (U30)", () => {
  it("writes every generated section, authored ones included", () => {
    const document = draftDocument(stored(heading("Purpose"), paragraph("Old")), outline);
    const result = applyGenerated(document, outline, [
      { sectionKey: "purpose", text: "New purpose" },
      { sectionKey: "scope", text: "All staff" },
    ]);
    expect(aiSections(result, outline).map((s) => s.text)).toEqual(["New purpose", "All staff"]);
  });

  it("leaves a section the generation left empty as it is", () => {
    const document = draftDocument(stored(heading("Purpose"), paragraph("Keep")), outline);
    const result = applyGenerated(document, outline, [{ sectionKey: "purpose", text: " " }]);
    expect(aiSections(result, outline)[0]?.text).toBe("Keep");
  });
});

describe("applying a revision's change set (U31)", () => {
  it("changes, empties and adds sections as the change set says", () => {
    const document = draftDocument(
      stored(heading("Purpose"), paragraph("Old"), heading("Scope"), paragraph("Everyone")),
      outline,
    );
    const result = applyChangeSet(document, outline, [
      { after: "New", before: "Old", key: "purpose", kind: "changed", title: "Purpose" },
      { after: "", before: "Everyone", key: "scope", kind: "removed", title: "Scope" },
      {
        after: "Go back.",
        afterKey: "purpose",
        before: "",
        key: "new-0",
        kind: "new",
        title: "Rolling back",
      },
    ]);
    expect(aiSections(result, outline).map((s) => s.text)).toEqual(["New", ""]);
    expect(JSON.stringify(result)).toContain("Rolling back");
    expect(JSON.stringify(result)).toContain("Go back.");
  });

  it("rewrites a freeform draft's body and adds new sections at the end", () => {
    const document = draftDocument(stored(paragraph("One")), []);
    const result = applyChangeSet(
      document,
      [],
      [
        { after: "Two", before: "One", key: "content", kind: "changed", title: "Content" },
        { after: "Extra.", before: "", key: "new-0", kind: "new", title: "Annex" },
      ],
    );
    expect(aiSections(result, [])[0]?.text).toBe("Two\n\nAnnex\n\nExtra.");
  });
});
