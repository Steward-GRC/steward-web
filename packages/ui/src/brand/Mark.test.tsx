// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Loader, Mark } from "./Mark";

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
