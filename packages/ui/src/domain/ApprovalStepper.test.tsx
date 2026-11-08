// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDayMonth } from "@steward-web/i18n";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApprovalStepper, type StepperStage } from "./ApprovalStepper";

const twoStages: StepperStage[] = [
  {
    approvers: [
      {
        comment: "Thirty days matches our month-end close.",
        decidedAt: "2026-10-02T10:00:00Z",
        name: "Dave",
        role: "Category owner",
        state: "approved",
      },
    ],
    name: "Finance review",
    state: "done",
  },
  {
    approvers: [
      { isYou: true, name: "Carol", role: "Approver", state: "pending" },
      { name: "Alice", role: "Site admin", state: "pending" },
    ],
    name: "Final approval",
    rule: { approvals: 1, kind: "quorum", required: 2 },
    state: "current",
  },
];

const sixStages: StepperStage[] = [
  {
    approvers: [{ decidedAt: "2026-09-28T10:00:00Z", name: "Dave", state: "approved" }],
    name: "Facilities review",
    state: "done",
  },
  {
    approvers: [
      { decidedAt: "2026-09-30T10:00:00Z", name: "Carol", state: "approved" },
      { decidedAt: "2026-09-30T11:00:00Z", name: "Grace", state: "approved" },
    ],
    name: "Finance review",
    rule: { approvals: 2, kind: "all", required: 2 },
    state: "done",
  },
  {
    approvers: [
      { name: "Carol", state: "pending" },
      { name: "Grace", state: "pending" },
    ],
    groups: [
      {
        approved: ["Dave"],
        name: "Finance team",
        pending: ["Carol", "Grace"],
        quorum: "majority",
        required: 2,
        roster: 3,
        status: "pending",
      },
    ],
    name: "Finance team",
    state: "current",
  },
  { approvers: [{ name: "Alice", state: "pending" }], name: "Legal check", state: "upcoming" },
  {
    approvers: [
      { name: "Carol", state: "pending" },
      { name: "Alice", state: "pending" },
    ],
    name: "Final approval",
    rule: { approvals: 0, kind: "quorum", required: 2 },
    state: "upcoming",
  },
  { approvers: [{ name: "Dave", state: "pending" }], name: "Sign-off", state: "upcoming" },
];

describe("the approval stepper (U25)", () => {
  it("is horizontal for up to four stages, with both end caps", () => {
    render(
      <ApprovalStepper
        publish={{ changeType: "major", version: "v3.0.0" }}
        stages={twoStages}
        submitted={{ at: "2026-10-01T09:00:00Z", by: "Bob" }}
      />,
    );
    const stepper = screen.getByRole("list", { name: "Approval stages" });
    expect(stepper).toHaveAttribute("data-orientation", "horizontal");
    const steps = within(stepper).getAllByRole("listitem");
    expect(steps).toHaveLength(4);
    expect(steps[0]).toHaveTextContent("Submitted");
    expect(steps[0]).toHaveTextContent(`Bob · ${formatDayMonth("2026-10-01T09:00:00Z")}`);
    expect(steps[3]).toHaveTextContent("Publish");
    expect(steps[3]).toHaveTextContent("as v3.0.0 · Major");
  });

  it("lists each stage's approvers with their state, date and comment", () => {
    render(<ApprovalStepper stages={twoStages} />);
    const finance = screen.getByRole("listitem", { name: "Finance review" });
    expect(within(finance).getByText("Approved", { selector: "span" })).toBeInTheDocument();
    expect(within(finance).getByText("Dave")).toBeInTheDocument();
    expect(within(finance).getByText("· Category owner")).toBeInTheDocument();
    expect(
      within(finance).getByText(`Approved ${formatDayMonth("2026-10-02T10:00:00Z")}`),
    ).toBeInTheDocument();
    expect(
      within(finance).getByText("“Thirty days matches our month-end close.”"),
    ).toBeInTheDocument();
    expect(within(finance).getByText("DA")).toBeInTheDocument();
  });

  it("marks the current stage, its rule badge and you", () => {
    render(<ApprovalStepper stages={twoStages} />);
    const final = screen.getByRole("listitem", { name: "Final approval" });
    expect(final).toHaveAttribute("aria-current", "step");
    expect(within(final).getByText("quorum · 1 of 2")).toBeInTheDocument();
    expect(within(final).getByText("· Approver · you")).toBeInTheDocument();
    expect(within(final).getAllByText("Pending")).toHaveLength(2);
  });

  it("offers Reassign on someone else's pending seat", async () => {
    const onReassign = vi.fn();
    render(<ApprovalStepper onReassign={onReassign} stages={twoStages} />);
    const buttons = screen.getAllByRole("button", { name: /Reassign/ });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAccessibleName("Reassign Alice");
    await userEvent.click(buttons[0]!);
    expect(onReassign).toHaveBeenCalledWith(1, twoStages[1]!.approvers[1]);
  });

  it("shows no rule badge for a one-approver stage", () => {
    render(<ApprovalStepper stages={twoStages} />);
    const finance = screen.getByRole("listitem", { name: "Finance review" });
    expect(within(finance).queryByText(/quorum|all ·/)).toBeNull();
  });

  it("goes vertical beyond four stages, each collapsed to one line", () => {
    render(<ApprovalStepper stages={sixStages} />);
    const stepper = screen.getByRole("list", { name: "Approval stages" });
    expect(stepper).toHaveAttribute("data-orientation", "vertical");
    const legal = screen.getByRole("listitem", { name: "Legal check" });
    expect(within(legal).getByText("· stage 4 of 6")).toBeInTheDocument();
    expect(within(legal).getByText("Alice", { selector: "b" })).toBeInTheDocument();
    expect(within(legal).getByText(/Pending:/)).toBeInTheDocument();
    const finance = screen.getByRole("listitem", { name: "Finance review" });
    expect(within(finance).getByText("all · 2 of 2")).toBeInTheDocument();
    expect(
      within(finance).getByText(
        `Approved by Carol, Grace · ${formatDayMonth("2026-09-30T11:00:00Z")}`,
      ),
    ).toBeInTheDocument();
    expect(within(stepper).getAllByRole("listitem").at(-1)).toHaveTextContent("Publish");
  });

  it("opens the current stage with its group unit, and toggles the others", async () => {
    render(<ApprovalStepper stages={sixStages} />);
    const team = screen.getByRole("listitem", { name: "Finance team" });
    const toggle = within(team).getByRole("button", { name: "Finance team" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(within(team).getByText("— majority: 2/3")).toBeInTheDocument();
    expect(within(team).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(within(team).getByText("Pending: Carol, Grace")).toBeInTheDocument();

    const legal = screen.getByRole("listitem", { name: "Legal check" });
    const legalToggle = within(legal).getByRole("button", { name: "Legal check" });
    expect(legalToggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(legalToggle);
    expect(legalToggle).toHaveAttribute("aria-expanded", "true");
    expect(within(legal).getAllByText("Alice").length).toBeGreaterThan(1);
  });

  it("goes vertical on a phone by itself, however few the stages (U25m)", async () => {
    const restore = globalThis.matchMedia;
    globalThis.matchMedia = ((query: string) => ({
      addEventListener: () => {},
      matches: query === "(max-width: 47.98rem)",
      media: query,
      removeEventListener: () => {},
    })) as unknown as typeof globalThis.matchMedia;
    try {
      render(<ApprovalStepper stages={twoStages} />);
      expect(await screen.findByRole("list", { name: "Approval stages" })).toHaveAttribute(
        "data-orientation",
        "vertical",
      );
    } finally {
      globalThis.matchMedia = restore;
    }
  });

  it("can be forced vertical, as on a phone", () => {
    render(<ApprovalStepper orientation="vertical" stages={twoStages} />);
    expect(screen.getByRole("list", { name: "Approval stages" })).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });
});

describe("ApprovalStepper veto seats (steward-web#256)", () => {
  const vetoed: StepperStage[] = [
    {
      approvers: [
        { name: "Carol", state: "pending" },
        { decidedAt: "2026-10-02T10:00:00Z", name: "Dave", state: "rejected", veto: true },
      ],
      name: "Review",
      state: "rejected",
    },
  ];

  it("marks a seat that holds a veto", () => {
    render(<ApprovalStepper stages={vetoed} />);
    const review = screen.getByRole("listitem", { name: "Review" });
    expect(within(review).getAllByText("Veto")).toHaveLength(1);
  });

  it("says a rejected stage was ended by a veto", () => {
    render(<ApprovalStepper orientation="vertical" stages={vetoed} />);
    expect(screen.getByText(/Rejected by Dave/)).toBeInTheDocument();
    expect(screen.getByText(/by veto/)).toBeInTheDocument();
  });
});
