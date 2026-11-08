// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { stepperStagesOf } from "./stepperStages";

const seat = (userId: string, name: string, state: string, extra: object = {}) => ({
  comment: null,
  decidedAt: null,
  groupId: null,
  name,
  state,
  userId,
  ...extra,
});

describe("stepperStagesOf", () => {
  it("marks stages done, current and upcoming around the run's current stage", () => {
    const stages = stepperStagesOf(
      {
        currentStageIdx: 1,
        stageAssignees: [
          [
            seat("u-4", "Dave", "approved", {
              comment: "Fine.",
              decidedAt: "2026-10-02T10:00:00Z",
            }),
          ],
          [seat("u-3", "Carol", "pending"), seat("u-1", "Alice", "pending")],
          [seat("u-4", "Dave", "pending")],
        ],
        stageNames: ["Finance review", "Final approval", "Sign-off"],
        stageUnitProgress: [[], [], []],
        status: "APPROVAL_STATUS_IN_REVIEW",
      },
      "u-3",
    );
    expect(stages.map((s) => [s.name, s.state])).toEqual([
      ["Finance review", "done"],
      ["Final approval", "current"],
      ["Sign-off", "upcoming"],
    ]);
    expect(stages[0]!.approvers[0]).toEqual({
      comment: "Fine.",
      decidedAt: "2026-10-02T10:00:00Z",
      groupId: null,
      isYou: false,
      name: "Dave",
      state: "approved",
    });
    expect(stages[1]!.approvers.map((a) => [a.name, a.isYou])).toEqual([
      ["Carol", true],
      ["Alice", false],
    ]);
  });

  it("drops seats nobody needs any more", () => {
    const stages = stepperStagesOf(
      {
        currentStageIdx: 1,
        stageAssignees: [
          [seat("u-4", "Dave", "approved"), seat("u-5", "Grace", "cancelled")],
          [seat("u-3", "Carol", "pending")],
        ],
        stageNames: ["Finance review", "Final approval"],
        stageUnitProgress: [[], []],
        status: "APPROVAL_STATUS_IN_REVIEW",
      },
      "u-3",
    );
    expect(stages[0]!.approvers.map((a) => a.name)).toEqual(["Dave"]);
  });

  it("marks the deciding stage rejected when the run was rejected, and all done once published", () => {
    const run = {
      currentStageIdx: 0,
      stageAssignees: [[seat("u-4", "Dave", "rejected")], [seat("u-3", "Carol", "cancelled")]],
      stageNames: ["Finance review", "Final approval"],
      stageUnitProgress: [[], []],
    };
    expect(
      stepperStagesOf({ ...run, status: "APPROVAL_STATUS_REJECTED" }, "u-3").map((s) => s.state),
    ).toEqual(["rejected", "upcoming"]);
    expect(
      stepperStagesOf(
        { ...run, currentStageIdx: 1, status: "APPROVAL_STATUS_PUBLISHED" },
        "u-3",
      ).map((s) => s.state),
    ).toEqual(["done", "done"]);
  });

  it("turns a stage's group units into the stepper's group tallies", () => {
    const stages = stepperStagesOf(
      {
        currentStageIdx: 0,
        stageAssignees: [
          [
            seat("u-4", "Dave", "approved", { groupId: "g-fin" }),
            seat("u-3", "Carol", "pending", { groupId: "g-fin" }),
            seat("u-5", "Grace", "pending", { groupId: "g-fin" }),
          ],
        ],
        stageNames: ["Finance team"],
        stageUnitProgress: [
          [
            {
              approvals: 1,
              groupId: "g-fin",
              groupName: "Finance team",
              pending: 2,
              quorum: "majority",
              required: 2,
              roster: 3,
              status: "PENDING",
            },
          ],
        ],
        status: "APPROVAL_STATUS_IN_REVIEW",
      },
      "u-3",
    );
    expect(stages[0]!.groups).toEqual([
      {
        approved: ["Dave"],
        id: "g-fin",
        name: "Finance team",
        pending: ["Carol", "Grace"],
        quorum: "majority",
        required: 2,
        roster: 3,
        status: "pending",
      },
    ]);
  });
});

describe("stepperStagesOf veto seats (steward-web#256)", () => {
  const run = {
    currentStageIdx: 0,
    stageAssignees: [[seat("u-1", "Alice", "pending"), seat("u-2", "Dave", "rejected")]],
    stageNames: ["Review"],
    stageUnitProgress: [[]],
    status: "APPROVAL_STATUS_REJECTED",
  };

  it("marks the seats that hold a veto", () => {
    const [stage] = stepperStagesOf(run, "u-1", [["u-2"]]);
    expect(stage?.approvers.map((a) => [a.name, a.veto === true])).toEqual([
      ["Alice", false],
      ["Dave", true],
    ]);
  });

  it("marks none when the gateway reports none", () => {
    const [stage] = stepperStagesOf(run, "u-1");
    expect(stage?.approvers.every((a) => !a.veto)).toBe(true);
  });
});
