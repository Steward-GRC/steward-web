// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EmptyState, ListSkeleton, NotFound, PageSkeleton } from "./States";

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

  it("carries the animated book mark, with one status, not two", () => {
    const { container } = render(<PageSkeleton label="Loading policy…" />);
    expect(container.querySelector(".stw-loader-g")).not.toBeNull();
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });
});

describe("the list skeleton", () => {
  afterEach(() => vi.useRealTimers());

  it("shows nothing for a quick load, then the rows and the animated book mark", () => {
    vi.useFakeTimers();
    const { container } = render(<ListSkeleton label="Loading your work…" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(299));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2));
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent("Loading your work…");
    expect(container.querySelector(".stw-loader-g")).not.toBeNull();
    expect(container.querySelectorAll("[data-skeleton-row]")).toHaveLength(5);
  });

  it("takes its own delay and number of rows", () => {
    vi.useFakeTimers();
    const { container } = render(<ListSkeleton delay={0} label="Loading…" rows={3} />);
    act(() => vi.advanceTimersByTime(1));
    expect(container.querySelectorAll("[data-skeleton-row]")).toHaveLength(3);
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

  it("can be one muted line inside a card", () => {
    render(<EmptyState compact title="No sessions" />);
    expect(screen.getByText("No sessions")).toHaveClass("text-sm", "text-muted");
  });

  it("can have a description alone", () => {
    render(<EmptyState description="Notifications are off." />);
    expect(screen.getByText("Notifications are off.")).toBeInTheDocument();
  });
});
