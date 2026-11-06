// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { acceptsDocumentType, documentTypesOf, strandedBy } from "./categoryDocumentTypes";
import { CategoryDocumentTypes } from "./generated/schema";

const { Both, None, Policies, Procedures } = CategoryDocumentTypes;

describe("documentTypesOf", () => {
  it("reads a category with no setting as holding both", () => {
    expect(documentTypesOf({})).toBe(Both);
    expect(documentTypesOf({ documentTypes: Procedures })).toBe(Procedures);
  });
});

describe("acceptsDocumentType (#87)", () => {
  it.each([
    [Both, "POLICY", true],
    [Both, "PROCEDURE", true],
    [Policies, "POLICY", true],
    [Policies, "PROCEDURE", false],
    [Procedures, "POLICY", false],
    [Procedures, "PROCEDURE", true],
    [None, "POLICY", false],
    [None, "PROCEDURE", false],
  ] as const)("%s holds a %s: %s", (types, documentType, expected) => {
    expect(acceptsDocumentType(types, documentType)).toBe(expected);
  });
});

describe("strandedBy (#87)", () => {
  const counts = { policies: 3, procedures: 2 };

  it("counts the documents the narrower setting would no longer accept", () => {
    expect(strandedBy(counts, Policies)).toBe(2);
    expect(strandedBy(counts, Procedures)).toBe(3);
    expect(strandedBy(counts, None)).toBe(5);
  });

  it("is zero when widening or keeping the setting", () => {
    expect(strandedBy(counts, Both)).toBe(0);
    expect(strandedBy({ policies: 3, procedures: 0 }, Policies)).toBe(0);
  });

  it("is zero for a category with nothing in it", () => {
    expect(strandedBy({ policies: 0, procedures: 0 }, None)).toBe(0);
  });
});
