// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { sectionChanges } from "./sectionChanges";

const section = (key: string, title: string, order: number, level = 1, required = true) => ({
  blocks: [],
  key,
  level,
  order,
  required,
  title,
});

describe("the review step's changes against the published version (A7)", () => {
  it("finds added, removed, renamed, re-levelled, required and moved sections", () => {
    const before = [
      section("purpose", "Purpose", 0),
      section("scope", "Scope", 1),
      section("roles", "Roles", 2),
      section("old", "Old", 3),
    ];
    const after = [
      section("scope", "Scope", 0),
      section("purpose", "Aim", 1),
      section("roles", "Roles", 2, 2, false),
      section("new", "Exceptions", 3, 2, false),
    ];
    expect(sectionChanges(before, after)).toEqual([
      { kind: "moved", title: "Scope" },
      { kind: "renamed", from: "Purpose", title: "Aim" },
      { kind: "moved", title: "Aim" },
      { kind: "level", level: 2, title: "Roles" },
      { kind: "nowOptional", title: "Roles" },
      { kind: "added", title: "Exceptions" },
      { kind: "removed", title: "Old" },
    ]);
  });

  it("finds a changed boilerplate text", () => {
    const before = [{ ...section("a", "A", 0), blocks: [{ contentJson: "x", type: "doc" }] }];
    const after = [{ ...section("a", "A", 0), blocks: [{ contentJson: "y", type: "doc" }] }];
    expect(sectionChanges(before, after)).toEqual([{ kind: "text", title: "A" }]);
  });

  it("finds nothing when nothing changed", () => {
    const sections = [section("a", "A", 0)];
    expect(sectionChanges(sections, sections)).toEqual([]);
  });
});
