// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(path.join(import.meta.dirname, "steward.css"), "utf8");
const rule = (selector: string) => {
  const escaped = selector.replaceAll(".", String.raw`\.`);
  return new RegExp(String.raw`(^|\n)\s*${escaped}\s*\{([^}]*)\}`).exec(css)?.[2] ?? "";
};

describe("the stored component recipes", () => {
  it("has the serif reading style", () => {
    expect(rule(".doc")).toContain("font-family: var(--font-serif)");
    expect(rule(".doc")).toContain("font-size: var(--text-doc)");
    expect(rule(".doc")).toContain("line-height: var(--text-doc--line-height)");
    expect(rule(".doc h2")).toContain("margin-top: 2.2em");
    expect(rule(".doc h3")).toContain("margin-top: 1.8em");
  });

  it("keeps the reading style full width (decision 2-layout-and-navigation.s9)", () => {
    expect(rule(".doc")).not.toContain("max-width");
  });

  it("has the hatched ink environment banner", () => {
    expect(rule(".env-banner")).toContain(
      "repeating-linear-gradient(135deg, #261b25 0 10px, #3a2d3d 10px 20px)",
    );
    expect(rule(".env-banner")).toContain("color: #f3ecf2");
  });
});

describe("the dialog scrim", () => {
  it("is night plum at 45% in light and black at 65% in dark and high contrast", () => {
    expect(rule(":root")).toContain("--scrim: rgb(29 21 32 / 0.45)");
    expect(rule(".dark")).toContain("--scrim: rgb(0 0 0 / 0.65)");
    expect(rule(".hc")).toContain("--scrim: rgb(0 0 0 / 0.65)");
    expect(css).toMatch(/\.system:not\(\.hc\)\s*\{[^}]*--scrim: rgb\(0 0 0 \/ 0\.65\)/);
  });
});
