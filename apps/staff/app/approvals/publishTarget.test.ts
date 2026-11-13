// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { isFinalApproval, publishTargetOf } from "./publishTarget";

describe("publishTargetOf", () => {
  it("reads the version and lowercases the change type", () => {
    expect(publishTargetOf({ targetChangeType: "MAJOR", targetSemanticVersion: "3.0.0" })).toEqual({
      changeType: "major",
      version: "3.0.0",
    });
  });

  it("keeps the version when the gateway has no change type", () => {
    expect(publishTargetOf({ targetChangeType: null, targetSemanticVersion: "3.0.0" })).toEqual({
      changeType: null,
      version: "3.0.0",
    });
  });

  it("is null without a version, so nothing new renders", () => {
    expect(publishTargetOf({ targetChangeType: "MAJOR", targetSemanticVersion: null })).toBeNull();
    expect(publishTargetOf({})).toBeNull();
    expect(publishTargetOf({ targetSemanticVersion: "" })).toBeNull();
  });
});

const run = (over: object = {}) => ({
  currentStageIdx: 1,
  stageNames: ["Legal", "Finance"],
  stageProgress: [
    { approvals: 1, required: 1 },
    { approvals: 1, required: 2 },
  ],
  stageUnitProgress: [[], []],
  status: "APPROVAL_STATUS_IN_REVIEW",
  ...over,
});

describe("isFinalApproval", () => {
  it("is true when one approval on the last stage is all that is left", () => {
    expect(isFinalApproval(run())).toBe(true);
  });

  it("is false when more than one approval is left", () => {
    expect(
      isFinalApproval(
        run({
          stageProgress: [
            { approvals: 1, required: 1 },
            { approvals: 0, required: 2 },
          ],
        }),
      ),
    ).toBe(false);
  });

  it("is false before the last stage", () => {
    expect(isFinalApproval(run({ currentStageIdx: 0 }))).toBe(false);
  });

  it("is false when the stage has group units, whose tally is their own", () => {
    expect(isFinalApproval(run({ stageUnitProgress: [[], [{}]] }))).toBe(false);
  });

  it("is false when the run is not in review or has no progress", () => {
    expect(isFinalApproval(run({ status: "APPROVAL_STATUS_APPROVED" }))).toBe(false);
    expect(isFinalApproval(run({ stageProgress: [] }))).toBe(false);
  });
});
