// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { appendixDocument } from "./appendixDocument";

const texts = (json: string) =>
  JSON.stringify(appendixDocument(json))
    .match(/"text":"[^"]*"/g)
    ?.map((m) => m.slice(8, -1));

describe("appendixDocument", () => {
  it("reads a document the editor wrote as it is", () => {
    const document = {
      root: {
        children: [
          {
            children: [{ text: "Hello", type: "text", version: 1 }],
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
    };
    expect(appendixDocument(JSON.stringify(document))).toEqual(document);
  });

  it("turns the old plain-text shape into one paragraph per line", () => {
    expect(texts(JSON.stringify({ text: "Line one\nLine two" }))).toEqual(["Line one", "Line two"]);
  });

  it("starts an empty or unreadable appendix as an empty document", () => {
    expect(appendixDocument("")).toBeTruthy();
    expect(appendixDocument("not json")).toBeTruthy();
  });
});
