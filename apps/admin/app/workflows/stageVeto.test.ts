// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { approverPool, pruneVetoes } from "./stageVeto";

const STAGE = {
  approvers: ["u-1", "u-2"],
  approversByCategory: [{ approverIds: ["u-5"], categoryId: "c-1" }],
  groupUnits: [{ groupId: "g-1", internalQuorum: "one", memberUserIds: ["u-3", "u-1"] }],
  name: "Review",
  quorum: "majority",
};

describe("approverPool", () => {
  it("resolves approvers, group members and per-category approvers to unique users", () => {
    expect(approverPool(STAGE)).toEqual(["u-1", "u-2", "u-3", "u-5"]);
  });
});

describe("pruneVetoes", () => {
  it("keeps veto people still in the pool and reports the ones dropped", () => {
    const result = pruneVetoes({ ...STAGE, vetoUserIds: ["u-1", "u-9"] });
    expect(result.stage.vetoUserIds).toEqual(["u-1"]);
    expect(result.dropped).toEqual(["u-9"]);
  });

  it("changes nothing when every veto person is in the pool", () => {
    const stage = { ...STAGE, vetoUserIds: ["u-2"] };
    const result = pruneVetoes(stage);
    expect(result.stage).toBe(stage);
    expect(result.dropped).toEqual([]);
  });

  it("treats a missing list as empty", () => {
    expect(pruneVetoes(STAGE).dropped).toEqual([]);
  });
});
