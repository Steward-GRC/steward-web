// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type FlowNode, type FlowStep, FlowView } from "./FlowView";

const labels = {
  current: "Waiting",
  done: "Done",
  rejected: "Rejected",
  upcoming: "Not started",
};
const node = (id: string, state: FlowNode["state"], extra: Partial<FlowNode> = {}): FlowNode => ({
  id,
  state,
  title: id,
  ...extra,
});
const submitted = node("Submitted", "done", { when: "1 Oct", who: "Bob" });

const steps: FlowStep[] = [
  { id: "legal", nodes: [node("Legal", "done", { when: "2 Oct", who: "Carol" })] },
  {
    id: "fin",
    nodes: [
      node("Finance", "done", { who: "Dave" }),
      node("Finance", "current", { who: "Erin" }),
    ].map((n, index) => ({ ...n, id: `fin-${index}` })),
  },
  { id: "ceo", nodes: [node("CEO", "upcoming", { who: "Frank" })] },
];

const view = (props: Partial<Parameters<typeof FlowView>[0]> = {}) =>
  render(
    <FlowView
      label="Approval flow"
      orientation="horizontal"
      start={submitted}
      stateLabels={labels}
      steps={steps}
      {...props}
    />,
  );

describe("the flow view", () => {
  it("always starts with the Submitted box, ahead of the first step", () => {
    view();
    const items = within(screen.getByRole("list", { name: "Approval flow" })).getAllByRole(
      "listitem",
    );
    expect(items[0]).toHaveTextContent("Submitted");
    expect(items[0]).toHaveTextContent("Bob");
    expect(items[0]).toHaveTextContent("1 Oct");
    expect(items[1]).toHaveTextContent("Legal");
  });

  it("gives screen readers the whole flow as a list, each box with its state, and marks the current one", () => {
    view();
    const items = within(screen.getByRole("list", { name: "Approval flow" })).getAllByRole(
      "listitem",
    );
    expect(items).toHaveLength(5);
    expect(items[1]).toHaveTextContent("Legal, Carol, 2 Oct: Done");
    expect(items[3]).toHaveTextContent("Finance, Erin: Waiting");
    expect(items[3]).toHaveAttribute("aria-current", "step");
    expect(items[4]).toHaveTextContent("CEO, Frank: Not started");
    expect(items.filter((index) => index.getAttribute("aria-current") === "step")).toHaveLength(1);
  });

  it("hides the drawing itself from screen readers, since the list says it all", () => {
    const { container } = view();
    expect(container.querySelector("[data-flow-canvas]")).toHaveAttribute("aria-hidden", "true");
  });

  it("draws a box per approver in a parallel step", () => {
    const { container } = view();
    expect(container.querySelectorAll('[data-flow-node][data-step="2"]')).toHaveLength(2);
  });

  it("marks each box and line with its state so the path taken, the current step and what is still to come differ", () => {
    const { container } = view();
    const state = (selector: string) =>
      container.querySelector<HTMLElement>(selector)?.dataset.state;
    expect(state('[data-flow-node="Legal"]')).toBe("done");
    expect(state('[data-flow-node="fin-1"]')).toBe("current");
    expect(state('[data-flow-node="CEO"]')).toBe("upcoming");
    expect(state('[data-flow-edge="in:Legal"]')).toBe("taken");
    expect(state('[data-flow-edge="in:fin-1"]')).toBe("active");
    expect(state('[data-flow-edge="in:CEO"]')).toBe("ahead");
  });

  it("animates only the line into the current step, and stills it under reduced motion", () => {
    const { container } = view();
    const active = container.querySelector('[data-flow-edge="in:fin-1"]')!;
    expect(active).toHaveClass("flow-active", "motion-reduce:animate-none");
    expect(container.querySelector('[data-flow-edge="in:Legal"]')).not.toHaveClass("flow-active");
  });

  it("uses the Steward tokens: purple for the path taken, amber for the current step", () => {
    const { container } = view();
    expect(container.querySelector('[data-flow-edge="in:Legal"]')).toHaveClass("stroke-primary");
    expect(container.querySelector('[data-flow-edge="in:fin-1"]')).toHaveClass("stroke-accent");
    expect(container.querySelector('[data-flow-node="fin-1"]')).toHaveClass("border-accent");
    expect(container.querySelector('[data-flow-node="Legal"]')).toHaveClass("border-primary");
  });

  it("dims the steps still to come", () => {
    const { container } = view();
    expect(container.querySelector('[data-flow-node="CEO"]')).toHaveClass("opacity-60");
  });

  it("shows an end box when given one", () => {
    view({ end: node("Publish", "upcoming") });
    const items = within(screen.getByRole("list", { name: "Approval flow" })).getAllByRole(
      "listitem",
    );
    expect(items.at(-1)).toHaveTextContent("Publish");
  });

  it("goes vertical on a phone by itself", async () => {
    const restore = globalThis.matchMedia;
    globalThis.matchMedia = ((query: string) => ({
      addEventListener: () => {},
      matches: query === "(max-width: 47.98rem)",
      media: query,
      removeEventListener: () => {},
    })) as unknown as typeof globalThis.matchMedia;
    try {
      const { container } = view({ orientation: "auto" });
      await screen.findByRole("list", { name: "Approval flow" });
      expect(container.querySelector("[data-flow-canvas]")).toHaveAttribute(
        "data-orientation",
        "vertical",
      );
    } finally {
      globalThis.matchMedia = restore;
    }
  });
});
