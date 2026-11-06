// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  {
    id: "legal",
    nodes: [node("Legal", "done", { comment: "Fine by me.", when: "2 Oct", who: "Carol" })],
  },
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
    expect(items[1]).toHaveTextContent("Legal, Carol, 2 Oct: Done. “Fine by me.”");
    expect(items[3]).toHaveTextContent("Finance, Erin: Waiting");
    expect(items[3]).toHaveAttribute("aria-current", "step");
    expect(items[4]).toHaveTextContent("CEO, Frank: Not started");
    expect(items.filter((index) => index.getAttribute("aria-current") === "step")).toHaveLength(1);
  });

  it("hides the plain boxes from screen readers, since the list says it all", () => {
    const { container } = view();
    expect(container.querySelector('[data-flow-node="Legal"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
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

  it("uses the Steward tokens: purple for the path taken, the dark amber for the current step", () => {
    const { container } = view();
    expect(container.querySelector('[data-flow-edge="in:Legal"]')).toHaveClass("stroke-primary");
    expect(container.querySelector('[data-flow-edge="in:fin-1"]')).toHaveClass(
      "stroke-accent-line",
    );
    expect(container.querySelector('[data-flow-node="fin-1"]')).toHaveClass("border-accent-line");
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

  describe("a group box", () => {
    const team: FlowNode = {
      ...node("team", "current", { description: "Review", tally: "2/3" }),
      members: [
        { id: "m1", name: "Carol", state: "done", when: "2 Oct" },
        { id: "m2", name: "Dave", state: "done", when: null },
        { id: "m3", name: "Erin", state: "current" },
        { id: "m4", name: "Frank", state: "rejected", when: "3 Oct" },
      ],
      title: "Legal team",
    };
    const user = node("alice", "current", { description: "Review", title: "Alice" });
    const mixed: FlowStep[] = [{ id: "review", nodes: [team, user] }];
    const open = () => view({ steps: mixed });

    it("is titled by the group, with the step as its description and the tally on the box", () => {
      open();
      const toggle = screen.getByRole("button", { name: /Legal team/ });
      expect(toggle).toHaveTextContent("Review");
      expect(toggle).toHaveTextContent("2/3");
      expect(screen.getByText("Alice").closest("[data-flow-node]")).toHaveTextContent("Review");
    });

    it("starts collapsed, with the members out of sight, and the user box has no toggle", () => {
      open();
      expect(screen.getByRole("button", { name: /Legal team/ })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      expect(screen.queryByRole("list", { name: "Legal team" })).not.toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    it("expands on click to each member's status and when, and collapses again", async () => {
      open();
      const toggle = screen.getByRole("button", { name: /Legal team/ });
      await userEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      const members = within(screen.getByRole("list", { name: "Legal team" })).getAllByRole(
        "listitem",
      );
      expect(members).toHaveLength(4);
      expect(members[0]).toHaveTextContent("Carol");
      expect(members[0]).toHaveTextContent("Done");
      expect(members[0]).toHaveTextContent("2 Oct");
      expect(members[2]).toHaveTextContent("Erin");
      expect(members[2]).toHaveTextContent("Waiting");
      expect(members[3]).toHaveTextContent("Rejected");
      await userEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("list", { name: "Legal team" })).not.toBeInTheDocument();
    });

    it("opens from the keyboard", async () => {
      open();
      await userEvent.tab();
      expect(screen.getByRole("button", { name: /Legal team/ })).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      expect(screen.getByRole("button", { name: /Legal team/ })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await userEvent.keyboard(" ");
      expect(screen.getByRole("button", { name: /Legal team/ })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    it("grows the drawn box when expanded", async () => {
      const { container } = open();
      const box = () => container.querySelector<HTMLElement>('[data-flow-node="team"]')!;
      const before = box().style.height;
      await userEvent.click(screen.getByRole("button", { name: /Legal team/ }));
      expect(box().style.height).not.toBe(before);
    });

    it("tells screen readers the members and the tally even while collapsed", () => {
      open();
      const items = within(screen.getByRole("list", { name: "Approval flow" })).getAllByRole(
        "listitem",
      );
      const text = items.map((item) => item.textContent).join("|");
      expect(text).toContain("Legal team, Review, 2/3");
      expect(text).toContain("Carol");
      expect(text).toContain("Frank");
    });

    it("keeps the box state on the box, so a group follows its vote", () => {
      const { container } = open();
      expect(container.querySelector('[data-flow-node="team"]')).toHaveAttribute(
        "data-state",
        "current",
      );
    });
  });
});
