// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Loader, Lockup, Mark } from "./Mark";
import { Wordmark } from "./Wordmark";

describe("Mark", () => {
  it("drops the text lines below 40 px", () => {
    const { rerender } = render(<Mark size={24} title="Steward" />);
    expect(screen.getByRole("img")).toHaveAttribute("data-variant", "small");
    rerender(<Mark size={48} title="Steward" />);
    expect(screen.getByRole("img")).toHaveAttribute("data-variant", "full");
  });

  it("never renders below the 16 px minimum", () => {
    render(<Mark size={8} title="Steward" />);
    expect(screen.getByRole("img")).toHaveAttribute("width", "16");
  });

  it("keeps the text lines when asked for the full mark at a small size, as the shell headers do", () => {
    render(<Mark size={26} title="Steward" variant="full" />);
    expect(screen.getByRole("img")).toHaveAttribute("data-variant", "full");
  });

  it("has the high-contrast cut: a white page with a keyline around the yellow ribbon", () => {
    render(<Mark size={48} title="Steward" />);
    // Shown only under .hc, as in assets/steward-mark-hc.svg.
    expect(screen.getByRole("img")).toContainHTML("M25.5 4h12v24.3l-6-5.5-6 5.5z");
  });

  it("is decorative unless it has a title", () => {
    const { rerender } = render(<Mark />);
    expect(screen.queryByRole("img")).toBeNull();
    rerender(<Mark title="Steward" />);
    expect(screen.getByRole("img", { name: "Steward" })).toBeInTheDocument();
  });
});

describe("Loader", () => {
  it("announces what's loading", () => {
    render(<Loader label="Loading your work…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading your work…");
  });

  it("says Loading… by default", () => {
    render(<Loader />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });
});

describe("Lockup", () => {
  it("draws the supplied outlined wordmark instead of typing Steward in the serif", () => {
    render(<Lockup />);
    const lockup = screen.getByRole("img", { name: "Steward" });
    expect(lockup).toContainHTML("data-wordmark");
    expect(screen.queryByText("Steward")).toBeNull();
  });

  it("sizes to the header lockup by default: a 26 px mark and a 20 px wordmark, 8 px apart", () => {
    render(<Lockup />);
    const lockup = screen.getByRole("img", { name: "Steward" });
    expect(lockup).toContainHTML('width="26"');
    expect(lockup).toContainHTML('data-variant="full"');
    expect(lockup).toContainHTML('height="16.18"');
    expect(lockup).toHaveClass("gap-2");
  });
});

describe("Wordmark", () => {
  it("takes the text colour, so it follows the theme", () => {
    render(<Wordmark title="Steward" />);
    expect(screen.getByRole("img", { name: "Steward" })).toContainHTML('fill="currentColor"');
  });

  it("is decorative unless it has a title", () => {
    const { rerender } = render(<Wordmark />);
    expect(screen.queryByRole("img")).toBeNull();
    rerender(<Wordmark title="Steward" />);
    expect(screen.getByRole("img", { name: "Steward" })).toBeInTheDocument();
  });
});
