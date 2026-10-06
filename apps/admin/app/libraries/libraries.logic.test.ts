// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { canCurate, isDeletable, visibleByTab } from "./libraries.logic";

describe("visibleByTab", () => {
  const entries = [
    { archived: false, id: "a" },
    { archived: true, id: "b" },
    { archived: false, id: "c" },
  ];

  it("active shows only the non-archived entries", () => {
    expect(visibleByTab(entries, "active").map((entry) => entry.id)).toEqual(["a", "c"]);
  });

  it("archived shows only the archived entries", () => {
    expect(visibleByTab(entries, "archived").map((entry) => entry.id)).toEqual(["b"]);
  });
});

describe("canCurate", () => {
  it("a tri-admin may curate any entry, including one with no creator", () => {
    expect(canCurate({ isAdmin: true })).toBe(true);
    expect(canCurate({ isAdmin: true, userId: "u1" }, "u2")).toBe(true);
  });

  it("a non-admin may curate only the entry they created", () => {
    expect(canCurate({ isAdmin: false, userId: "u1" }, "u1")).toBe(true);
    expect(canCurate({ isAdmin: false, userId: "u1" }, "u2")).toBe(false);
  });

  it("a non-admin may never curate a creatorless entry (contact blocks)", () => {
    expect(canCurate({ isAdmin: false, userId: "u1" })).toBe(false);
  });

  it("a signed-out or unknown viewer may not curate anything", () => {
    expect(canCurate({ isAdmin: false }, "u1")).toBe(false);
  });
});

describe("isDeletable", () => {
  it("is deletable only when nothing attaches it", () => {
    expect(isDeletable(0)).toBe(true);
    expect(isDeletable(1)).toBe(false);
  });
});
