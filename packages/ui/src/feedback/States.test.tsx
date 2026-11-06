// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { EmptyState, NotFound, PageSkeleton } from "./States";

describe("not found (U7s)", () => {
  it("names what's missing, says why, and offers the way back", () => {
    const Stub = createRoutesStub([
      {
        Component: () => (
          <NotFound
            back={{ label: "Back to policies", to: "/policies" }}
            description="No policy matches POL-FACILITIES-000099."
            title="Policy not found"
          />
        ),
        path: "/",
      },
    ]);
    render(<Stub />);
    expect(screen.getByRole("heading", { name: "Policy not found" })).toBeInTheDocument();
    expect(screen.getByText("No policy matches POL-FACILITIES-000099.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← Back to policies" })).toHaveAttribute(
      "href",
      "/policies",
    );
  });
});

describe("skeleton loading", () => {
  it("is busy and tells a screen reader what's loading", () => {
    render(<PageSkeleton label="Loading policy…" />);
    const skeleton = screen.getByRole("status");
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton).toHaveTextContent("Loading policy…");
  });
});

describe("empty state", () => {
  it("says what's empty, why, and offers an action", () => {
    render(
      <EmptyState
        action={<button type="button">New draft</button>}
        description="Nothing is waiting for you."
        title="All caught up"
      />,
    );
    expect(screen.getByText("All caught up")).toBeInTheDocument();
    expect(screen.getByText("Nothing is waiting for you.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New draft" })).toBeInTheDocument();
  });

  it("shows a decorative icon above the title", () => {
    render(<EmptyState icon={<svg data-testid="icon" />} title="No results" />);
    // eslint-disable-next-line testing-library/no-node-access -- the wrapper has no role of its own
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("can sit on its own card when it isn't inside one", () => {
    render(<EmptyState framed title="No results" />);
    expect(screen.getByTestId("empty-state")).toHaveClass(
      "rounded-lg",
      "border",
      "border-border",
      "bg-surface",
    );
  });

  it("has no card edge by default", () => {
    render(<EmptyState title="No results" />);
    expect(screen.getByTestId("empty-state")).not.toHaveClass("border");
  });
});
