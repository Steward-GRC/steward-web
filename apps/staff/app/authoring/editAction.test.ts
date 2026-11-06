// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { editActionOf } from "./editAction";

describe("editActionOf", () => {
  it("points an author who can edit at the editor's action", () => {
    expect(editActionOf({ canEdit: true, number: "POL-A-000001" }, true)).toBe(
      "/drafts/POL-A-000001",
    );
  });

  it("offers nothing to someone who can't edit this document", () => {
    expect(editActionOf({ canEdit: false, number: "POL-A-000001" }, true)).toBeUndefined();
    expect(editActionOf({ number: "POL-A-000001" }, true)).toBeUndefined();
  });

  it("offers nothing without the author role, which the editor's routes require", () => {
    expect(editActionOf({ canEdit: true, number: "POL-A-000001" }, false)).toBeUndefined();
  });
});
