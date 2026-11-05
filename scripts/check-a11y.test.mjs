// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { expectedLayout, focusVisible, ROUTES, THEMES, WIDTHS } from "./check-a11y.mjs";

describe("check-a11y", () => {
  it("covers the three widths and the three themes #24 asks for", () => {
    expect(WIDTHS).toEqual([390, 1024, 1280]);
    expect(THEMES).toEqual(["light", "dark", "hc"]);
  });

  it("expects the drawer on a phone, the icon rail at 1024 px and the sidebar at 1280 px", () => {
    expect([390, 1024, 1280].map((width) => expectedLayout(width))).toEqual([
      "drawer",
      "rail",
      "sidebar",
    ]);
  });

  it("counts an outline or a ring on the focused element as visible focus", () => {
    const none = { boxShadow: "none", outlineStyle: "none", outlineWidth: "0px" };
    expect(focusVisible({ ...none, outlineStyle: "solid", outlineWidth: "2px" })).toBe(true);
    expect(focusVisible({ ...none, boxShadow: "rgb(0, 0, 0) 0px 0px 0px 3px" })).toBe(true);
    expect(focusVisible({ ...none, outlineWidth: "2px" })).toBe(false);
    expect(focusVisible({ ...none, outlineStyle: "solid" })).toBe(false);
  });

  it("counts a change around the element (a focus-within ring) as visible focus", () => {
    const none = { boxShadow: "none", outlineStyle: "none", outlineWidth: "0px" };
    expect(focusVisible(none, "ring", "flat")).toBe(true);
    expect(focusVisible(none, "same", "same")).toBe(false);
  });

  it("opens every page signed in as someone, and every gate signed out", () => {
    for (const route of ROUTES) expect(route.shell).toBe(route.as !== null);
  });
});
