// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { WorkflowStageInput } from "@steward-web/api-client";

import { describe, expect, it } from "vitest";

import { moveDown, moveUp, newStage } from "./stageOutline";

const stage = (name: string): WorkflowStageInput => ({ approvers: [], name, quorum: "one" });

describe("moveUp", () => {
  it("swaps a stage with the one above it", () => {
    const stages = [stage("A"), stage("B"), stage("C")];
    expect(moveUp(stages, 1).map((s) => s.name)).toEqual(["B", "A", "C"]);
  });

  it("leaves the list unchanged at the top", () => {
    const stages = [stage("A"), stage("B")];
    expect(moveUp(stages, 0)).toEqual(stages);
  });

  it("leaves the list unchanged for an out-of-range index", () => {
    const stages = [stage("A")];
    expect(moveUp(stages, 5)).toEqual(stages);
  });
});

describe("moveDown", () => {
  it("swaps a stage with the one below it", () => {
    const stages = [stage("A"), stage("B"), stage("C")];
    expect(moveDown(stages, 0).map((s) => s.name)).toEqual(["B", "A", "C"]);
  });

  it("leaves the list unchanged at the bottom", () => {
    const stages = [stage("A"), stage("B")];
    expect(moveDown(stages, 1)).toEqual(stages);
  });
});

describe("newStage", () => {
  it("names the stage by its position, with no approvers and a single-approver quorum", () => {
    expect(newStage([])).toEqual({ approvers: [], name: "Stage 1", quorum: "one" });
    expect(newStage([stage("A")])).toEqual({ approvers: [], name: "Stage 2", quorum: "one" });
  });
});
