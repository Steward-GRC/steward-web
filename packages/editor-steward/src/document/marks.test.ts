// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { stripMarks } from "./marks";
import { wrapRoot } from "./tree";

describe("stripMarks", () => {
  it("replaces a highlight with the text inside it, at any depth", () => {
    const document = wrapRoot([
      {
        children: [
          { text: "Keep for ", type: "text" },
          { children: [{ text: "seven years", type: "text" }], ids: ["t1"], type: "mark" },
          { text: ".", type: "text" },
        ],
        type: "paragraph",
      },
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: "x", type: "text" }], ids: ["t2"], type: "mark" }],
                type: "paragraph",
              },
            ],
            type: "tablecell",
          },
        ],
        type: "tablerow",
      },
    ]);
    const stripped = stripMarks(document);
    expect(JSON.stringify(stripped)).not.toContain('"mark"');
    expect(JSON.stringify(stripped)).toContain('"seven years"');
    expect(JSON.stringify(stripped)).toContain('"x"');
  });

  it("leaves a document without highlights as it was", () => {
    const document = wrapRoot([{ children: [{ text: "a", type: "text" }], type: "paragraph" }]);
    expect(stripMarks(document)).toEqual(document);
  });
});
