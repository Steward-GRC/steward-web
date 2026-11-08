// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { sameContent } from "./comparable";

const stored = JSON.stringify({
  root: {
    children: [
      {
        children: [{ text: "Purpose", type: "text", version: 1 }],
        tag: "h1",
        type: "heading",
        version: 1,
      },
      { children: [{ text: "Why.", type: "text", version: 1 }], type: "paragraph", version: 1 },
    ],
    type: "root",
  },
});

// what the editor reports for the same document once it has loaded it (bug log 175)
const reported = JSON.stringify({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Purpose",
            type: "text",
            version: 1,
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        tag: "h1",
        type: "heading",
        version: 1,
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Why.",
            type: "text",
            version: 1,
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        type: "paragraph",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});

const codeBlock = (children: unknown[]) =>
  JSON.stringify({
    root: { children: [{ children, language: "js", type: "code", version: 1 }], type: "root" },
  });

describe("sameContent", () => {
  it("treats the editor's default fields as no change", () => {
    expect(sameContent(stored, reported)).toBe(true);
  });

  it("sees a changed word", () => {
    expect(sameContent(stored, reported.replace("Why.", "Why?"))).toBe(false);
  });

  it("sees real formatting as a change", () => {
    expect(sameContent(stored, reported.replace('"format":0,"mode"', '"format":1,"mode"'))).toBe(
      false,
    );
  });

  it("sees a changed heading level", () => {
    expect(sameContent(stored, reported.replace('"tag":"h1"', '"tag":"h2"'))).toBe(false);
  });

  it("does not count the highlighting of code as an edit", () => {
    const plain = codeBlock([{ text: "let a = 1;", type: "text", version: 1 }]);
    const highlighted = codeBlock([
      { highlightType: "keyword", text: "let", type: "code-highlight", version: 1 },
      { text: " a = ", type: "code-highlight", version: 1 },
      { highlightType: "number", text: "1", type: "code-highlight", version: 1 },
      { text: ";", type: "code-highlight", version: 1 },
    ]);
    expect(sameContent(plain, highlighted)).toBe(true);
    expect(sameContent(plain, highlighted.replace('"1"', '"2"'))).toBe(false);
  });

  it("falls back to exact text when either side is not a document", () => {
    expect(sameContent("not json", "not json")).toBe(true);
    expect(sameContent("not json", stored)).toBe(false);
  });
});
