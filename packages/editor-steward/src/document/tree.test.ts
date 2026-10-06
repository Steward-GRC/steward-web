// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { nodeText, parseDocument, serializeDocument, wrapRoot } from "./tree";

describe("parseDocument", () => {
  it("reads a stored Lexical editor state", () => {
    const stored = JSON.stringify(wrapRoot([{ children: [], type: "paragraph", version: 1 }]));
    expect(parseDocument(stored)?.root.children).toHaveLength(1);
  });

  it("answers undefined for absent, malformed or non-document content", () => {
    expect(parseDocument(null)).toBeUndefined();
    expect(parseDocument("")).toBeUndefined();
    expect(parseDocument("{not json")).toBeUndefined();
    expect(parseDocument("null")).toBeUndefined();
    expect(parseDocument('{"root":"nope"}')).toBeUndefined();
  });

  it("drops the old plain-text section array rather than treating it as a document", () => {
    const old = JSON.stringify([{ sectionKey: "purpose", text: "hi", title: "Purpose" }]);
    expect(parseDocument(old)).toBeUndefined();
  });

  it("gives an empty root one empty paragraph, the shape core accepts", () => {
    const parsed = parseDocument('{"root":{"children":[],"type":"root"}}');
    expect(parsed?.root.children).toEqual([
      { children: [], direction: null, format: "", indent: 0, type: "paragraph", version: 1 },
    ]);
  });
});

describe("serializeDocument", () => {
  it("writes the editor state core validates: a root with typed children", () => {
    const json = serializeDocument(wrapRoot([{ children: [], type: "paragraph", version: 1 }]));
    const parsed = JSON.parse(json) as { root: { children: { type: string }[]; type: string } };
    expect(parsed.root.type).toBe("root");
    expect(parsed.root.children.every((child) => child.type !== "")).toBe(true);
  });
});

const cell = (value: string) => ({
  children: [{ children: [{ text: value, type: "text" }], type: "paragraph" }],
  type: "tablecell",
});

describe("nodeText", () => {
  it("joins nested text and lays a table out as tab and newline separated cells", () => {
    const table = {
      children: [
        { children: [cell("Name"), cell("Dose")], type: "tablerow" },
        { children: [cell("Aspirin"), cell("81mg")], type: "tablerow" },
      ],
      type: "table",
    };
    expect(nodeText(table)).toBe("Name\tDose\nAspirin\t81mg");
  });
});
