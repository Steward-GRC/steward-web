// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { scrollBehavior } from "./motion";

afterEach(() => {
  delete document.documentElement.dataset.reduceMotion;
  vi.unstubAllGlobals();
});

const system = (reduce: boolean) =>
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query === "(prefers-reduced-motion: reduce)",
  }));

describe("scrollBehavior", () => {
  it("scrolls smoothly by default", () => {
    system(false);
    expect(scrollBehavior()).toBe("smooth");
  });

  it("jumps instead when the system asks for less motion", () => {
    system(true);
    expect(scrollBehavior()).toBe("auto");
  });

  it("jumps instead when the person turned on Reduce motion (H12)", () => {
    system(false);
    document.documentElement.dataset.reduceMotion = "";
    expect(scrollBehavior()).toBe("auto");
  });
});
