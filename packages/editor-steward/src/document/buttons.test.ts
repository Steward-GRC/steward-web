// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { incompleteButtons } from "./buttons";
import { type SerializedNode, wrapRoot } from "./tree";

const button = (buttonText: string, buttonUrl: string): SerializedNode => ({
  alignment: "center",
  buttonText,
  buttonUrl,
  type: "button",
  version: 1,
});

describe("buttons without a label or a link (bug log 183)", () => {
  it("counts a button whose label or link is empty or blank", () => {
    const document = wrapRoot([
      button("Read more", "https://example.com"),
      button("", "https://example.com"),
      button("Read more", " ".repeat(3)),
      button("", ""),
    ]);
    expect(incompleteButtons(document)).toBe(3);
  });

  it("finds one inside another card", () => {
    const document = wrapRoot([{ children: [button("", "")], type: "toggle", version: 1 }]);
    expect(incompleteButtons(document)).toBe(1);
  });

  it("is zero for a document with no buttons or only complete ones", () => {
    expect(incompleteButtons(wrapRoot([]))).toBe(0);
    expect(incompleteButtons(wrapRoot([button("Go", "/policies")]))).toBe(0);
  });
});
