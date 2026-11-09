// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { blockFormatsOf, diffBlocks, textBlocksOf } from "./liveDiff";
import { type SerializedNode, wrapRoot } from "./tree";

const text = (value: string): SerializedNode => ({ text: value, type: "text" });
const paragraph = (...children: SerializedNode[]): SerializedNode => ({
  children,
  type: "paragraph",
});

describe("the text blocks of a document (live diff)", () => {
  it("lists a block per paragraph and heading, in order, skipping empty ones", () => {
    const document = wrapRoot([
      { children: [text("Purpose")], tag: "h1", type: "heading" },
      paragraph(),
      paragraph(text("File within "), { children: [text("30")], type: "link" }, text(" days.")),
    ]);
    expect(textBlocksOf(document)).toEqual(["Purpose", "File within 30 days."]);
  });

  it("takes each list item and each table cell as a block of its own, and a nested list apart", () => {
    const document = wrapRoot([
      {
        children: [
          {
            children: [
              text("one"),
              { children: [{ children: [text("nested")], type: "listitem" }], type: "list" },
            ],
            type: "listitem",
          },
          { children: [text("two")], type: "listitem" },
        ],
        type: "list",
      },
      {
        children: [
          { children: [{ children: [paragraph(text("a"))], type: "tablecell" }], type: "tablerow" },
        ],
        type: "table",
      },
    ]);
    expect(textBlocksOf(document)).toEqual(["one", "nested", "two", "a"]);
  });

  it("ignores cards, which have no text of their own to compare", () => {
    const document = wrapRoot([{ type: "image" }, paragraph(text("after"))]);
    expect(textBlocksOf(document)).toEqual(["after"]);
  });

  it("reads a line break as a newline", () => {
    expect(
      textBlocksOf(wrapRoot([paragraph(text("a"), { type: "linebreak" }, text("b"))])),
    ).toEqual(["a\nb"]);
  });
});

describe("the live diff against the published text", () => {
  it("marks nothing when the text is the same", () => {
    const result = diffBlocks(["File your claim."], ["File your claim."]);
    expect(result.blocks).toEqual([{ added: [], removed: [] }]);
    expect(result.removedBlocks).toEqual([]);
  });

  it("marks a changed word as added where it stands, and the old word as removed at that spot", () => {
    const result = diffBlocks(["File within 60 days."], ["File within 30 days."]);
    expect(result.blocks[0]).toEqual({
      added: [[12, 14]],
      removed: [{ at: 12, text: "60" }],
    });
  });

  it("marks words added at the end, with nothing removed", () => {
    const result = diffBlocks(["File your claim."], ["File your claim today."]);
    expect(result.blocks[0]!.removed).toEqual([]);
    const [[from, to]] = result.blocks[0]!.added as [[number, number]];
    expect("File your claim today.".slice(from, to).trim()).toBe("today");
  });

  it("marks removed words where they were, with nothing added", () => {
    const result = diffBlocks(["File your claim today."], ["File your claim."]);
    expect(result.blocks[0]!.added).toEqual([]);
    expect(result.blocks[0]!.removed.map((r) => r.text.trim())).toEqual(["today"]);
  });

  it("marks a new block as added whole", () => {
    const result = diffBlocks(["One."], ["One.", "Two."]);
    expect(result.blocks).toEqual([
      { added: [], removed: [] },
      { added: [[0, 4]], removed: [] },
    ]);
  });

  it("reports a block that is gone, before the block that follows it", () => {
    const result = diffBlocks(["One.", "Two.", "Three."], ["One.", "Three."]);
    expect(result.removedBlocks).toEqual([{ before: 1, text: "Two." }]);
    expect(result.blocks.every((block) => block.added.length === 0)).toBe(true);
  });

  it("reports a block removed at the end before the end", () => {
    const result = diffBlocks(["One.", "Two."], ["One."]);
    expect(result.removedBlocks).toEqual([{ before: 1, text: "Two." }]);
  });

  it("pairs a rewritten block with the old one, not as a removal and an addition", () => {
    const result = diffBlocks(
      ["One.", "Old words here.", "Three."],
      ["One.", "New words here.", "Three."],
    );
    expect(result.removedBlocks).toEqual([]);
    expect(result.blocks[1]!.removed.map((r) => r.text)).toEqual(["Old"]);
    expect(result.blocks[1]!.added).toEqual([[0, 3]]);
  });

  it("marks everything as added when there is no published text", () => {
    const result = diffBlocks([], ["Only this."]);
    expect(result.blocks).toEqual([{ added: [[0, 10]], removed: [] }]);
  });
});

const heading = (tag: string, ...children: SerializedNode[]): SerializedNode => ({
  children,
  tag,
  type: "heading",
});
const bold = (value: string): SerializedNode => ({ format: 1, text: value, type: "text" });

const list = (listType: string) => ({
  children: [{ children: [text("one")], type: "listitem" }],
  listType,
  type: "list",
});

/** The diff of two documents, text and format, as the editor and the Published tab ask for it. */
const compare = (before: SerializedNode[], after: SerializedNode[]) =>
  diffBlocks(textBlocksOf(wrapRoot(before)), textBlocksOf(wrapRoot(after)), {
    current: blockFormatsOf(wrapRoot(after)),
    published: blockFormatsOf(wrapRoot(before)),
  });

describe("the format of each block (bug log 261)", () => {
  it("names a heading by its level, a list item by its list, and plain text as a paragraph", () => {
    const formats = blockFormatsOf(
      wrapRoot([
        heading("h1", text("Appendix A")),
        paragraph(text("plain")),
        {
          children: [{ children: [text("one")], type: "listitem" }],
          listType: "number",
          type: "list",
        },
        { children: [text("said")], type: "quote" },
      ]),
    );
    expect(formats.map((format) => format.kind)).toEqual([
      "heading:h1",
      "paragraph",
      "listitem:number",
      "quote",
    ]);
  });
});

describe("the live diff treats a format change as a change (bug log 261)", () => {
  it("marks a heading that became plain text, though the words are the same", () => {
    const result = compare(
      [heading("h1", text("Appendix A")), paragraph(text("Rates."))],
      [paragraph(text("Appendix A")), paragraph(text("Rates."))],
    );
    expect(result.blocks[0]!.added).toEqual([]);
    expect(result.blocks[0]!.format).toMatchObject({
      from: { kind: "heading:h1" },
      to: { kind: "paragraph" },
    });
    expect(result.blocks[1]!.format).toBeUndefined();
  });

  it("marks a change of heading level", () => {
    const result = compare([heading("h1", text("Scope"))], [heading("h2", text("Scope"))]);
    expect(result.blocks[0]!.format).toMatchObject({
      from: { kind: "heading:h1" },
      to: { kind: "heading:h2" },
    });
  });

  it("marks a list that changed type", () => {
    const result = compare([list("bullet")], [list("number")]);
    expect(result.blocks[0]!.format?.to.kind).toBe("listitem:number");
  });

  it("marks words that became bold or lost it, and a link added", () => {
    const made = compare([paragraph(text("Pay now"))], [paragraph(bold("Pay"), text(" now"))]);
    expect(made.blocks[0]!.format?.to.names).toEqual(["bold"]);
    const gone = compare([paragraph(bold("Pay now"))], [paragraph(text("Pay now"))]);
    expect(gone.blocks[0]!.format?.from.names).toEqual(["bold"]);
    const linked = compare(
      [paragraph(text("See policy"))],
      [
        paragraph(text("See "), {
          children: [text("policy")],
          type: "link",
          url: "https://example.org",
        }),
      ],
    );
    expect(linked.blocks[0]!.format?.to.names).toEqual(["link"]);
  });

  it("marks a format change together with a word change in the same block", () => {
    const result = compare(
      [heading("h1", text("File in 60 days"))],
      [paragraph(text("File in 30 days"))],
    );
    expect(result.blocks[0]!.added.length).toBeGreaterThan(0);
    expect(result.blocks[0]!.format?.from.kind).toBe("heading:h1");
  });

  it("marks nothing when text and format are the same, or when no formats are given", () => {
    const same = compare([heading("h1", text("Scope"))], [heading("h1", text("Scope"))]);
    expect(same.blocks[0]!.format).toBeUndefined();
    expect(diffBlocks(["a"], ["a"]).blocks[0]!.format).toBeUndefined();
  });
});
