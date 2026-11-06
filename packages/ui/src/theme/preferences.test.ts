// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyPreferences,
  DEFAULT_PREFERENCES,
  parsePreferences,
  tabTransitionOf,
} from "./preferences";

afterEach(() => {
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.tabTransition;
});

describe("tab transition (#154)", () => {
  it("is not chosen by default", () => {
    expect(DEFAULT_PREFERENCES.tabTransition).toBeNull();
    expect(parsePreferences(null).tabTransition).toBeNull();
  });

  it("keeps a saved None, Current or Smooth and ignores anything else", () => {
    for (const value of ["none", "current", "smooth"] as const) {
      expect(parsePreferences(JSON.stringify({ tabTransition: value })).tabTransition).toBe(value);
    }
    expect(parsePreferences(JSON.stringify({ tabTransition: "spin" })).tabTransition).toBeNull();
  });

  it("follows reduced motion when nothing is chosen", () => {
    expect(tabTransitionOf({ ...DEFAULT_PREFERENCES }, false)).toBe("current");
    expect(tabTransitionOf({ ...DEFAULT_PREFERENCES }, true)).toBe("none");
    expect(tabTransitionOf({ ...DEFAULT_PREFERENCES, reduceMotion: true }, false)).toBe("none");
  });

  it("uses the choice when there is one", () => {
    expect(tabTransitionOf({ ...DEFAULT_PREFERENCES, tabTransition: "smooth" }, true)).toBe(
      "smooth",
    );
  });

  it("puts the effective transition on the page", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    applyPreferences(document.documentElement, DEFAULT_PREFERENCES);
    expect(document.documentElement.dataset.tabTransition).toBe("none");
    applyPreferences(document.documentElement, { ...DEFAULT_PREFERENCES, tabTransition: "smooth" });
    expect(document.documentElement.dataset.tabTransition).toBe("smooth");
  });
});

describe("text size steps (#155)", () => {
  const css = readFileSync(path.resolve(import.meta.dirname, "../styles/steward.css"), "utf8");

  const percent = (size: string) =>
    Number(
      new RegExp(`html\\[data-text-size="${size}"\\]\\s*\\{\\s*font-size:\\s*([\\d.]+)%`).exec(
        css,
      )![1],
    );

  it("moves in even steps from X-Small to X-Large around 100%", () => {
    const steps = [percent("x-small"), percent("small"), 100, percent("large"), percent("x-large")];
    const gaps = steps.slice(1).map((value, index) => value - steps[index]!);
    expect(new Set(gaps).size).toBe(1);
  });

  it("keeps X-Large no bigger than 112.5%", () => {
    expect(percent("x-large")).toBeLessThanOrEqual(112.5);
  });
});
