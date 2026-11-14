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

const run = (stageProgress: object[] | undefined) => ({
  currentStageIdx: 1,
  stageAssignees: [[seat("u-1", "Alice", "approved")], [seat("u-3", "Carol", "pending")], []],
  stageNames: ["Legal", "Finance", "CEO"],
  stageProgress: stageProgress as never,
  stageUnitProgress: [[], [], []],
  status: "APPROVAL_STATUS_IN_REVIEW",
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

  it("carries each seat's role label, and none when the gateway has none", () => {
    const [stage] = stepperStagesOf(
      {
        currentStageIdx: 0,
        stageAssignees: [
          [
            seat("u-1", "Alice", "pending", { roleLabel: "Approver" }),
            seat("u-2", "Bob", "pending", { roleLabel: "Category owner" }),
            seat("u-3", "Carol", "pending", { roleLabel: null }),
            seat("u-4", "Dave", "pending"),
          ],
        ],
        stageNames: ["Review"],
        stageUnitProgress: [[]],
        status: "APPROVAL_STATUS_IN_REVIEW",
      },
      "u-9",
    );
    expect(stage!.approvers.map((a) => a.role)).toEqual([
      "Approver",
      "Category owner",
      undefined,
      undefined,
    ]);
  });
});

describe("the stage's due date and rule (stageProgress)", () => {
  it("carries each stage's due date and a rule badge for quorum and all", () => {
    const stages = stepperStagesOf(
      run([
        { approvals: 1, dueAt: "2026-10-09T00:00:00Z", quorum: "one", quorumN: 0, required: 1 },
        {
          approvals: 1,
          dueAt: "2026-10-12T00:00:00Z",
          quorum: "majority",
          quorumN: 0,
          required: 2,
        },
        { approvals: 0, dueAt: null, quorum: "all", quorumN: 0, required: 2 },
      ]),
      "u-3",
    );
    expect(stages.map((s) => s.dueAt)).toEqual([
      "2026-10-09T00:00:00Z",
      "2026-10-12T00:00:00Z",
      undefined,
    ]);
    expect(stages.map((s) => s.rule)).toEqual([
      undefined,
      { approvals: 1, kind: "quorum", required: 2 },
      { approvals: 0, kind: "all", required: 2 },
    ]);
  });

  it("reads an n-of-m rule as a quorum", () => {
    const [stage] = stepperStagesOf(
      run([{ approvals: 0, dueAt: null, quorum: "nofm", quorumN: 2, required: 2 }]),
      "u-3",
    );
    expect(stage!.rule).toEqual({ approvals: 0, kind: "quorum", required: 2 });
  });

  it("adds neither when the run has no stage progress or an unknown rule", () => {
    for (const progress of [undefined, [], [{ approvals: 0, quorum: "mystery", required: 1 }]]) {
      const [stage] = stepperStagesOf(run(progress as never), "u-3");
      expect(stage).not.toHaveProperty("rule");
      expect(stage).not.toHaveProperty("dueAt");
    }
  });
});
