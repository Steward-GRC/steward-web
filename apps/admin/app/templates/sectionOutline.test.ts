// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { SectionInput } from "@steward-web/api-client";

import { describe, expect, it } from "vitest";

import {
  clampLevel,
  newSection,
  normalizeOutline,
  outlineNumbers,
  slugifyKey,
  uniqueKey,
} from "./sectionOutline";

const section = (
  over: Partial<SectionInput> & Pick<SectionInput, "key" | "title">,
): SectionInput => ({
  blocks: [],
  level: 1,
  order: 0,
  required: false,
  ...over,
});

describe("clampLevel", () => {
  it("keeps a level within H1-H5", () => {
    expect(clampLevel(0)).toBe(1);
    expect(clampLevel(3)).toBe(3);
    expect(clampLevel(9)).toBe(5);
  });
});

describe("normalizeOutline", () => {
  it("forces the first section to level 1", () => {
    const result = normalizeOutline([section({ key: "a", level: 3, title: "A" })]);
    expect(result[0]!.level).toBe(1);
  });

  it("caps each later section at the one above it plus one", () => {
    const result = normalizeOutline([
      section({ key: "a", level: 1, title: "A" }),
      section({ key: "b", level: 5, title: "B" }),
    ]);
    expect(result[1]!.level).toBe(2);
  });

  it("re-sequences order to match array position", () => {
    const result = normalizeOutline([
      section({ key: "a", order: 7, title: "A" }),
      section({ key: "b", order: 9, title: "B" }),
    ]);
    expect(result.map((s) => s.order)).toEqual([0, 1]);
  });

  it("leaves an already-contiguous outline untouched", () => {
    const sections = [
      section({ key: "a", level: 1, order: 0, title: "A" }),
      section({ key: "b", level: 2, order: 1, title: "B" }),
    ];
    expect(normalizeOutline(sections)).toEqual(sections);
  });
});

describe("slugifyKey", () => {
  it("lowercases and hyphenates", () => {
    expect(slugifyKey("Data Retention Policy")).toBe("data-retention-policy");
  });

  it("drops leading and trailing hyphens from punctuation", () => {
    expect(slugifyKey("  -- Scope! -- ")).toBe("scope");
  });
});

describe("uniqueKey", () => {
  it("keeps the base key when it is unused", () => {
    expect(uniqueKey("scope", new Set(), "section-1")).toBe("scope");
  });

  it("appends a counter when the base key collides", () => {
    expect(uniqueKey("scope", new Set(["scope"]), "section-1")).toBe("scope-2");
    expect(uniqueKey("scope", new Set(["scope", "scope-2"]), "section-1")).toBe("scope-3");
  });

  it("falls back to the given name when the base is empty", () => {
    expect(uniqueKey("", new Set(), "section-1")).toBe("section-1");
  });
});

describe("outlineNumbers", () => {
  it("numbers top-level sections sequentially", () => {
    const sections = [
      section({ key: "a", level: 1, title: "A" }),
      section({ key: "b", level: 1, title: "B" }),
    ];
    expect(outlineNumbers(sections)).toEqual(["1", "2"]);
  });

  it("nests sub-sections under their parent's number", () => {
    const sections = [
      section({ key: "a", level: 1, title: "A" }),
      section({ key: "a1", level: 2, title: "A1" }),
      section({ key: "b", level: 1, title: "B" }),
    ];
    expect(outlineNumbers(sections)).toEqual(["1", "1.1", "2"]);
  });
});

describe("newSection", () => {
  it("defaults the first section to level 1 with a fallback key", () => {
    const created = newSection([]);
    expect(created).toMatchObject({ level: 1, order: 0, required: false, title: "" });
    expect(created.key).toBe("section-1");
  });

  it("inherits the previous section's level and avoids a key collision", () => {
    const sections = [section({ key: "section-1", level: 2, order: 0, title: "" })];
    const created = newSection(sections);
    expect(created).toMatchObject({ level: 2, order: 1 });
    expect(created.key).toBe("section-2");
  });
});
