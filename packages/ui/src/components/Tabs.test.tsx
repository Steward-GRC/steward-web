// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { TabLink, TabNav, Tabs, TabsList, TabsTrigger } from "./Tabs";

const strip = (props: { empty?: boolean; stretch?: boolean } = {}) =>
  render(
    <Tabs defaultValue="a">
      <TabsList aria-label="Record" stretch={props.stretch}>
        <TabsTrigger count={3} value="a">
          Alpha
        </TabsTrigger>
        <TabsTrigger empty={props.empty} value="b">
          B
        </TabsTrigger>
      </TabsList>
    </Tabs>,
  );

describe("the shared tab strip", () => {
  it("gives every tab the same width, whatever its label", () => {
    strip();
    expect(screen.getByRole("tablist")).toHaveClass("grid-flow-col", "auto-cols-fr");
  });

  it("sits on the white surface", () => {
    strip();
    expect(screen.getByRole("tablist")).toHaveClass("bg-surface");
  });

  it("marks the active tab with a 3px amber underline that eases in, but not under reduced motion", () => {
    strip();
    const tab = screen.getByRole("tab", { name: /Alpha/ });
    expect(tab.className).toContain("data-[state=active]:shadow-[inset_0_-3px_var(--accent)]");
    expect(tab).toHaveClass("transition-shadow", "motion-reduce:transition-none");
  });

  it("keeps the underline inside the strip, which clips anything past its bottom edge (#64)", () => {
    strip();
    // The strip scrolls sideways and so clips vertically; a tab pulled down over the strip's
    // border (a negative bottom margin) had the foot of its underline cut off.
    expect(screen.getByRole("tablist")).toHaveClass("overflow-y-hidden");
    for (const tab of screen.getAllByRole("tab")) expect(tab.className).not.toMatch(/-m[by]?-/);
  });

  it("shows a count as an amber badge, and only when given one", () => {
    strip();
    expect(screen.getByText("3")).toHaveClass("bg-accent");
    expect(screen.getByRole("tab", { name: "B" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });

  it("leaves out a tab that has nothing to show", () => {
    strip({ empty: true });
    expect(screen.queryByRole("tab", { name: "B" })).toBeNull();
    expect(screen.getAllByRole("tab")).toHaveLength(1);
  });

  it("scrolls sideways, never up and down, when the tabs don't fit", () => {
    strip();
    expect(screen.getByRole("tablist")).toHaveClass("overflow-x-auto", "overflow-y-hidden");
  });

  it("is as wide as its tabs, or fills its box when asked", () => {
    strip();
    expect(screen.getByRole("tablist")).toHaveClass("w-fit");
  });

  it("fills its box when stretched", () => {
    strip({ stretch: true });
    expect(screen.getByRole("tablist")).toHaveClass("w-full");
  });
});

describe("the shared tab links", () => {
  it("look the same as the tabs, with the open one underlined in amber", () => {
    const router = createMemoryRouter(
      [
        {
          element: (
            <TabNav aria-label="Profile">
              <TabLink end to="/">
                Name
              </TabLink>
              <TabLink to="/other">Other</TabLink>
            </TabNav>
          ),
          path: "*",
        },
      ],
      { initialEntries: ["/"] },
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("navigation", { name: "Profile" })).toHaveClass(
      "grid-flow-col",
      "auto-cols-fr",
      "overflow-y-hidden",
      "bg-surface",
    );
    expect(screen.getByRole("link", { name: "Name" }).className).toContain(
      "shadow-[inset_0_-3px_var(--accent)]",
    );
    expect(screen.getByRole("link", { name: "Name" }).className).not.toMatch(/-m[by]?-/);
    expect(screen.getByRole("link", { name: "Other" }).className).not.toContain(
      "shadow-[inset_0_-3px_var(--accent)]",
    );
  });
});
