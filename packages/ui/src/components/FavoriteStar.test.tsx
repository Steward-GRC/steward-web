// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The star is drawn SVG, so the fill and shadow can only be read from its own markup.
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FavoriteStar } from "./FavoriteStar";

describe("FavoriteStar (#152)", () => {
  it("draws a starred item as a filled gold star with depth", () => {
    const { container } = render(<FavoriteStar starred />);
    const star = container.querySelector("svg")!;
    expect(star).toHaveAttribute("data-starred", "true");
    expect(star).toHaveAttribute("aria-hidden", "true");
    // Depth: a light-to-dark gold gradient fill and a drop shadow, not one flat colour.
    const gradient = star.querySelector("linearGradient")!;
    expect(gradient.querySelectorAll("stop").length).toBeGreaterThanOrEqual(2);
    const fill = star.querySelector("path")!.getAttribute("fill")!;
    expect(fill).toBe(`url(#${gradient.id})`);
    expect(star.getAttribute("style") ?? "").toContain("drop-shadow");
  });

  it("draws an item that isn't starred as an outline", () => {
    const { container } = render(<FavoriteStar starred={false} />);
    const star = container.querySelector("svg")!;
    expect(star).toHaveAttribute("data-starred", "false");
    expect(star.querySelector("linearGradient")).toBeNull();
    expect(star.querySelector("path")).toHaveAttribute("fill", "none");
  });

  it("gives each star its own gradient, so two on a page don't share one", () => {
    const { container } = render(
      <>
        <FavoriteStar starred />
        <FavoriteStar starred />
      </>,
    );
    const ids = [...container.querySelectorAll("linearGradient")].map((g) => g.id);
    expect(new Set(ids).size).toBe(2);
  });
});
