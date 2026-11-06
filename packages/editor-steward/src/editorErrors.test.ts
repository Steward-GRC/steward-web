// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { describeEditorError } from "./editorErrors";

describe("describeEditorError", () => {
  it("keeps the name and the first message line, never the stack", () => {
    const error = new TypeError("Cannot read properties of null\nat Toggle (secret policy text)");
    error.stack = "TypeError: x\n    at secret policy text";
    expect(describeEditorError(error)).toBe("TypeError: Cannot read properties of null");
  });

  it("cuts a long message short", () => {
    expect(describeEditorError(new Error("x".repeat(500))).length).toBeLessThanOrEqual(202);
  });

  it("copes with a thrown value that is not an error", () => {
    expect(describeEditorError("boom")).toBe("Error: boom");
    expect(describeEditorError(null)).toBe("Error:");
  });
});
