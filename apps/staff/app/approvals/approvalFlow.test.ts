// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { StepperStage } from "@steward-web/ui/domain";

import { describe, expect, it } from "vitest";

import { flowStepsOf, submittedFrom } from "./approvalFlow";

const stage = (
  name: string,
  state: StepperStage["state"],
  approvers: StepperStage["approvers"],
): StepperStage => ({ approvers, name, state });
const who = (
  name: string,
  state: "approved" | "pending" | "rejected",
  extra: object = {},
): StepperStage["approvers"][number] => ({ name, state, ...extra });

const options = {
  dueText: "Due 9 Oct",
  voteLabel: (approved: number, needed: number) => `${approved} of ${needed} approved`,
  youLabel: "you",
};

describe("flowStepsOf", () => {
  it("makes a step per stage, each box titled by the user and described by the stage, with when", () => {
    const steps = flowStepsOf(
      [
        stage("Legal", "done", [who("Carol", "approved", { decidedAt: "2026-10-02T10:00:00Z" })]),
        stage("Finance", "current", [who("Dave", "pending")]),
        stage("CEO", "upcoming", [who("Frank", "pending")]),
      ],
      options,
    );
    expect(steps.map((s) => s.nodes.map((n) => [n.title, n.description, n.state]))).toEqual([
      [["Carol", "Legal", "done"]],
      [["Dave", "Finance", "current"]],
      [["Frank", "CEO", "upcoming"]],
    ]);
    expect(steps[0]!.nodes[0]!.when).toMatch(/2/);
    expect(steps[0]!.nodes[0]!.when).toMatch(/Oct/);
  });

  it("carries the approver's decision comment onto the box", () => {
    const [step] = flowStepsOf(
      [stage("Legal", "done", [who("Carol", "approved", { comment: "Fine by me." })])],
      options,
    );
    expect(step!.nodes[0]!.comment).toBe("Fine by me.");
  });

  it("shows the due date on the box being waited on, and none on a box not yet reached", () => {
    const steps = flowStepsOf(
      [
        stage("Finance", "current", [who("Dave", "pending", { isYou: true })]),
        stage("CEO", "upcoming", [who("Frank", "pending")]),
      ],
      options,
    );
    expect(steps[0]!.nodes[0]!.when).toBe("Due 9 Oct");
    expect(steps[1]!.nodes[0]!.when).toBeNull();
  });

  it("shows the due date only on the viewer's own box, since it is the viewer's task that carries it", () => {
    const [step] = flowStepsOf(
      [
        stage("Finance", "current", [
          who("Dave", "pending"),
          who("Erin", "pending", { isYou: true }),
        ]),
      ],
      options,
    );
    expect(step!.nodes.map((n) => n.when)).toEqual([null, "Due 9 Oct"]);
  });

  it("fans a stage with several approvers out into one box each, with their own state", () => {
    const [step] = flowStepsOf(
      [
        stage("Finance", "current", [
          who("Dave", "approved", { decidedAt: "2026-10-03T10:00:00Z" }),
          who("Erin", "pending"),
          who("Gus", "rejected", { decidedAt: "2026-10-04T10:00:00Z" }),
        ]),
      ],
      options,
    );
    expect(step!.nodes.map((n) => [n.title, n.description, n.state])).toEqual([
      ["Dave", "Finance", "done"],
      ["Erin", "Finance", "current"],
      ["Gus", "Finance", "rejected"],
    ]);
    expect(new Set(step!.nodes.map((n) => n.id)).size).toBe(3);
  });

  it("drops the seats a finished stage never needed, so it reads as done", () => {
    const [step] = flowStepsOf(
      [
        stage("Legal", "done", [
          who("Carol", "approved", { decidedAt: "2026-10-02T10:00:00Z" }),
          who("Dave", "pending"),
        ]),
      ],
      options,
    );
    expect(step!.nodes.map((n) => [n.title, n.state])).toEqual([["Carol", "done"]]);
  });

  it("marks the viewer's own box", () => {
    const [step] = flowStepsOf(
      [stage("Finance", "current", [who("Dave", "pending", { isYou: true })])],
      options,
    );
    expect(step!.nodes[0]!.title).toBe("Dave · you");
  });

  it("keeps a stage with nobody assigned as one box in the stage's own state", () => {
    const [step] = flowStepsOf([stage("Legal", "upcoming", [])], options);
    expect(step!.nodes).toHaveLength(1);
    expect(step!.nodes[0]).toMatchObject({ state: "upcoming", title: "Legal", who: null });
    expect(step!.nodes[0]!.members).toBeUndefined();
  });

  it("titles a box with the role label after the name, and nothing when there is none", () => {
    const [step] = flowStepsOf(
      [
        stage("Review", "current", [
          who("Alice", "pending", { role: "Approver" }),
          who("Bob", "pending", { role: "Category owner", isYou: true }),
          who("Carol", "pending", { role: null }),
          who("Dave", "pending"),
        ]),
      ],
      options,
    );
    expect(step!.nodes.map((n) => n.title)).toEqual([
      "Alice · Approver",
      "Bob · Category owner · you",
      "Carol",
      "Dave",
    ]);
  });
});

const seat = (
  name: string,
  state: "approved" | "pending" | "rejected",
  groupId: null | string,
  extra: object = {},
): StepperStage["approvers"][number] => ({ groupId, name, state, ...extra });
const unit = (
  id: string,
  name: string,
  required: number,
  status: "pending" | "rejected" | "satisfied",
): NonNullable<StepperStage["groups"]>[number] => ({
  approved: [],
  id,
  name,
  pending: [],
  quorum: "majority",
  required,
  roster: 3,
  status,
});

const review = (
  state: StepperStage["state"],
  approvers: StepperStage["approvers"],
  status: "pending" | "rejected" | "satisfied" = "pending",
): StepperStage => ({
  approvers,
  groups: [unit("g-fin", "Finance team", 2, status)],
  name: "Review",
  state,
});

const voteOf = (status: "pending" | "rejected" | "satisfied", stage: StepperStage["state"]) =>
  flowStepsOf(
    [review(stage, [seat("Carol", "approved", "g-fin"), seat("Dave", "pending", "g-fin")], status)],
    options,
  )[0]!.nodes[0]!;

describe("flowStepsOf with groups", () => {
  it("titles a group box by the group, describes it by the step, and lists the members", () => {
    const [step] = flowStepsOf(
      [
        review("current", [
          seat("Carol", "approved", "g-fin", { decidedAt: "2026-10-02T10:00:00Z" }),
          seat("Dave", "pending", "g-fin"),
          seat("Erin", "rejected", "g-fin"),
        ]),
      ],
      options,
    );
    expect(step!.nodes).toHaveLength(1);
    const box = step!.nodes[0]!;
    expect([box.title, box.description]).toEqual(["Finance team", "Review"]);
    expect(box.members!.map((m) => [m.name, m.state])).toEqual([
      ["Carol", "done"],
      ["Dave", "current"],
      ["Erin", "rejected"],
    ]);
    expect(box.members![0]!.when).toMatch(/Oct/);
  });

  it("follows the current vote: the tally against the quorum, and the group's own status", () => {
    expect(voteOf("pending", "current")).toMatchObject({ state: "current", tally: "1/2" });
    expect(voteOf("satisfied", "current")).toMatchObject({ state: "done", tally: "1/2" });
    expect(voteOf("rejected", "current")).toMatchObject({ state: "rejected" });
    expect(voteOf("pending", "upcoming").state).toBe("upcoming");
  });

  it("combines users and groups in one step, keeping the group's seats out of the user boxes", () => {
    const [step] = flowStepsOf(
      [
        review("current", [
          seat("Carol", "approved", "g-fin"),
          seat("Dave", "pending", "g-fin"),
          seat("Alice", "approved", null),
        ]),
      ],
      options,
    );
    expect(step!.nodes.map((n) => [n.title, n.members === undefined ? "user" : "group"])).toEqual([
      ["Alice", "user"],
      ["Finance team", "group"],
    ]);
  });

  it("totals the step's vote across users and groups, in digits and in words", () => {
    const [step] = flowStepsOf(
      [
        review("current", [
          seat("Carol", "approved", "g-fin"),
          seat("Dave", "pending", "g-fin"),
          seat("Alice", "approved", null),
          seat("Bob", "pending", null),
        ]),
      ],
      options,
    );
    // Alice 1 of 1, Bob 0 of 1, the group 1 of 2.
    expect(step!.tally).toBe("2/4");
    expect(step!.tallyLabel).toBe("2 of 4 approved");
  });

  it("drops a group that never met its rule from a finished stage, like a seat that never voted", () => {
    const [step] = flowStepsOf(
      [review("done", [seat("Alice", "approved", null), seat("Dave", "pending", "g-fin")])],
      options,
    );
    expect(step!.nodes.map((n) => n.title)).toEqual(["Alice"]);
  });
});

const entry = (kind: string, at: string, actorName: null | string) => ({
  actorName,
  at,
  kind,
  versionLabel: "v2",
});

describe("submittedFrom", () => {
  it("takes who and when from the latest submit event in the history", () => {
    expect(
      submittedFrom([
        entry("published", "2026-09-01T00:00:00Z", "Alice"),
        entry("submitted", "2026-09-20T00:00:00Z", "Bob"),
        entry("submitted", "2026-10-01T00:00:00Z", "Bobbi"),
      ]),
    ).toEqual({ at: "2026-10-01T00:00:00Z", by: "Bobbi" });
  });

  it("ignores other events that merely mention a submit", () => {
    expect(submittedFrom([entry("submittedBack", "2026-10-01T00:00:00Z", "Bob")])).toEqual({
      at: null,
      by: null,
    });
  });

  it("says nothing when the history has no submit event", () => {
    expect(submittedFrom([entry("published", "2026-09-01T00:00:00Z", "Alice")])).toEqual({
      at: null,
      by: null,
    });
  });
});
