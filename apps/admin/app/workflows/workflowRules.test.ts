// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { hasDisabledApprover, notUsable } from "./workflowRules";

describe("notUsable", () => {
  it("flags a workflow with no stages", () => {
    expect(notUsable({ stages: [] })).toBe(true);
  });

  it("flags a workflow where any stage has no approvers", () => {
    expect(
      notUsable({
        stages: [
          {
            approvers: ["u-1"],
            approversByCategory: [],
            groupUnits: [],
            id: "s-1",
            name: "A",
            pinnedLast: false,
            quorum: "one",
            rejectOnSlaBreach: false,
            slaDays: null,
          },
          {
            approvers: [],
            approversByCategory: [],
            groupUnits: [],
            id: "s-2",
            name: "B",
            pinnedLast: false,
            quorum: "one",
            rejectOnSlaBreach: false,
            slaDays: null,
          },
        ],
      }),
    ).toBe(true);
  });

  it("is usable when every stage has at least one approver", () => {
    expect(
      notUsable({
        stages: [
          {
            approvers: ["u-1"],
            approversByCategory: [],
            groupUnits: [],
            id: "s-1",
            name: "A",
            pinnedLast: false,
            quorum: "one",
            rejectOnSlaBreach: false,
            slaDays: null,
          },
        ],
      }),
    ).toBe(false);
  });
});

describe("hasDisabledApprover", () => {
  it("flags a stage naming a disabled user", () => {
    const workflow = {
      stages: [
        {
          approvers: ["u-1", "u-2"],
          approversByCategory: [],
          groupUnits: [],
          id: "s-1",
          name: "A",
          pinnedLast: false,
          quorum: "one",
          rejectOnSlaBreach: false,
          slaDays: null,
        },
      ],
    };
    expect(hasDisabledApprover(workflow, new Set(["u-2"]))).toBe(true);
    expect(hasDisabledApprover(workflow, new Set(["u-9"]))).toBe(false);
  });
});
