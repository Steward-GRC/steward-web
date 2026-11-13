// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { stageInput } from "./stageInput";

const STAGE = {
  approvers: ["u-1", "u-2"],
  approversByCategory: [{ approverIds: ["u-3"], categoryId: "c-1" }],
  groupUnits: [{ groupId: "g-1", internalQuorum: "one", memberUserIds: ["u-4"] }],
  id: "s-1",
  name: "Review",
  pinnedLast: false,
  quorum: "majority",
  rejectOnSlaBreach: false,
  slaDays: 2,
  vetoUserIds: ["u-2"],
};

describe("stageInput", () => {
  it("carries the stage's veto people as vetoUserIds", () => {
    expect(stageInput(STAGE).vetoUserIds).toEqual(["u-2"]);
  });

  it("never sends the deprecated veto seat fields", () => {
    const sent = stageInput({ ...STAGE, vetoApproverIds: ["u-1"], vetoGroupIds: ["g-1"] } as never);
    expect(sent).not.toHaveProperty("vetoApproverIds");
    expect(sent).not.toHaveProperty("vetoGroupIds");
  });

  it("sends an empty list for a stage with no veto people", () => {
    expect(stageInput({ ...STAGE, vetoUserIds: [] }).vetoUserIds).toEqual([]);
  });
});
