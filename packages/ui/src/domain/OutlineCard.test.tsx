// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OutlineCard, type OutlineItem } from "./OutlineCard";

const items: OutlineItem[] = [
  { id: "purpose", label: "Purpose", number: "1" },
  { id: "scope", label: "Scope", number: "2" },
  { id: "booking", label: "Booking a desk", number: "3" },
  { id: "changing", label: "3.1 Changing a booking", level: 2 },
  { id: "responsibilities", label: "Responsibilities", number: "4" },
  { id: "appendix-a", label: "Appendix A: Desk zones", number: "A" },
];

let observed: ((entries: Partial<IntersectionObserverEntry>[]) => void) | undefined;
const headings = new Map<string, HTMLElement>();

beforeEach(() => {
  observed = undefined;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
        observed = callback;
      }
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );
  for (const item of items) {
    const heading = document.createElement("h2");
    heading.id = item.id;
    document.body.append(heading);
    headings.set(item.id, heading);
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
  for (const heading of headings.values()) heading.remove();
  headings.clear();
});

describe("the reader outline (U7)", () => {
  it("lists the sections, numbered, with sub-sections indented", () => {
    render(<OutlineCard items={items} />);
    const outline = screen.getByRole("navigation", { name: "On this page" });
    const links = within(outline).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      "1 Purpose",
      "2 Scope",
      "3 Booking a desk",
      "3.1 Changing a booking",
      "4 Responsibilities",
      "A Appendix A: Desk zones",
    ]);
    expect(links[0]).toHaveAttribute("href", "#purpose");
    expect(links[3]).toHaveAttribute("data-level", "2");
  });

  it("starts on the first section and counts only the top-level ones", () => {
    render(<OutlineCard items={items} />);
    expect(screen.getByRole("link", { name: "1 Purpose" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getByText("1 of 5")).toBeInTheDocument();
  });

  it("tracks the section being read", () => {
    render(<OutlineCard items={items} />);
    act(() =>
      observed?.([
        {
          boundingClientRect: { top: 40 } as DOMRectReadOnly,
          isIntersecting: true,
          target: headings.get("responsibilities")!,
        },
      ]),
    );
    expect(screen.getByRole("link", { name: "4 Responsibilities" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getByText("4 of 5")).toBeInTheDocument();
  });

  it("collapses to a vertical side tab and opens again", async () => {
    const onCollapsedChange = vi.fn();
    render(<OutlineCard items={items} onCollapsedChange={onCollapsedChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Collapse outline" }));
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    const tab = screen.getByRole("button", { name: "Show outline: On this page" });
    expect(tab).toHaveAttribute("aria-expanded", "false");
    expect(tab).toHaveTextContent("1/5");
    expect(screen.queryByRole("navigation", { name: "On this page" })).toBeNull();
    await userEvent.click(tab);
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("navigation", { name: "On this page" })).toBeInTheDocument();
  });

  it("carries the footer links", () => {
    render(<OutlineCard footer={<a href="#history">History &amp; approvals</a>} items={items} />);
    expect(screen.getByRole("link", { name: "History & approvals" })).toBeInTheDocument();
  });
});
