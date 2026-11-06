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

const options = { dueText: "Due 9 Oct", youLabel: "you" };

describe("flowStepsOf", () => {
  it("makes a step per stage, titled by the stage and showing who and when", () => {
    const steps = flowStepsOf(
      [
        stage("Legal", "done", [who("Carol", "approved", { decidedAt: "2026-10-02T10:00:00Z" })]),
        stage("Finance", "current", [who("Dave", "pending")]),
        stage("CEO", "upcoming", [who("Frank", "pending")]),
      ],
      options,
    );
    expect(steps.map((s) => s.nodes.map((n) => [n.title, n.who, n.state]))).toEqual([
      [["Legal", "Carol", "done"]],
      [["Finance", "Dave", "current"]],
      [["CEO", "Frank", "upcoming"]],
    ]);
    expect(steps[0]!.nodes[0]!.when).toMatch(/2/);
    expect(steps[0]!.nodes[0]!.when).toMatch(/Oct/);
  });

  it("shows the due date on the box being waited on, and none on a box not yet reached", () => {
    const steps = flowStepsOf(
      [
        stage("Finance", "current", [who("Dave", "pending")]),
        stage("CEO", "upcoming", [who("Frank", "pending")]),
      ],
      options,
    );
    expect(steps[0]!.nodes[0]!.when).toBe("Due 9 Oct");
    expect(steps[1]!.nodes[0]!.when).toBeNull();
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
    expect(step!.nodes.map((n) => [n.title, n.who, n.state])).toEqual([
      ["Finance", "Dave", "done"],
      ["Finance", "Erin", "current"],
      ["Finance", "Gus", "rejected"],
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
    expect(step!.nodes.map((n) => [n.who, n.state])).toEqual([["Carol", "done"]]);
  });

  it("marks the viewer's own box", () => {
    const [step] = flowStepsOf(
      [stage("Finance", "current", [who("Dave", "pending", { isYou: true })])],
      options,
    );
    expect(step!.nodes[0]!.who).toBe("Dave · you");
  });

  it("keeps a stage with nobody assigned as one box in the stage's own state", () => {
    const [step] = flowStepsOf([stage("Legal", "upcoming", [])], options);
    expect(step!.nodes).toHaveLength(1);
    expect(step!.nodes[0]).toMatchObject({ state: "upcoming", title: "Legal", who: null });
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
        entry("PUBLISHED", "2026-09-01T00:00:00Z", "Alice"),
        entry("SUBMITTED", "2026-09-20T00:00:00Z", "Bob"),
        entry("SUBMITTED", "2026-10-01T00:00:00Z", "Bobbi"),
      ]),
    ).toEqual({ at: "2026-10-01T00:00:00Z", by: "Bobbi" });
  });

  it("says nothing when the history has no submit event", () => {
    expect(submittedFrom([entry("PUBLISHED", "2026-09-01T00:00:00Z", "Alice")])).toEqual({
      at: null,
      by: null,
    });
  });
});
