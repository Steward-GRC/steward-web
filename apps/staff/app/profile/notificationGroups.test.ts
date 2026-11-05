// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { cadenceOptions, notificationGroups } from "./notificationGroups";

const preferences = {
  catalog: [
    {
      category: "COMPLIANCE",
      delivery: "REMINDER_SCHEDULE",
      kind: "ack_reminder",
      mandatory: true,
    },
    {
      category: "WORKFLOW",
      delivery: "IMMEDIATE_OR_DIGEST",
      kind: "approval_needed",
      mandatory: false,
    },
    {
      category: "WORKFLOW",
      delivery: "IMMEDIATE_ONLY",
      kind: "approval_escalated",
      mandatory: false,
    },
    {
      category: "INFORMATIONAL",
      delivery: "DIGEST_PREFERRED",
      kind: "policy_published",
      mandatory: false,
    },
  ],
  settings: {
    categories: [
      { cadence: "IMMEDIATE", category: "COMPLIANCE", mandatory: true },
      { cadence: "IMMEDIATE", category: "WORKFLOW", mandatory: false },
      { cadence: "WEEKLY", category: "INFORMATIONAL", mandatory: false },
    ],
    channels: { email: true, inApp: true, push: false },
    digest: { dailyHour: 8, weeklyDow: 1 },
    overrides: [
      {
        cadence: "DAILY",
        category: "WORKFLOW",
        delivery: "IMMEDIATE_OR_DIGEST",
        kind: "approval_needed",
        mandatory: false,
      },
    ],
  },
} as const;

describe("notificationGroups", () => {
  it("gives the five groups in the frame's order, with their cadence, types and overrides", () => {
    const groups = notificationGroups(preferences);
    expect(
      groups.map((g) => [g.category, g.cadence, g.mandatory, g.types.length, g.custom]),
    ).toEqual([
      ["COMPLIANCE", "IMMEDIATE", true, 1, false],
      ["SECURITY", "IMMEDIATE", true, 0, false],
      ["TRANSACTIONAL", "IMMEDIATE", true, 0, false],
      ["WORKFLOW", "IMMEDIATE", false, 2, true],
      ["INFORMATIONAL", "WEEKLY", false, 1, false],
    ]);
    const workflow = groups[3]!;
    expect(workflow.types).toEqual([
      {
        cadence: "DAILY",
        delivery: "IMMEDIATE_OR_DIGEST",
        kind: "approval_needed",
        mandatory: false,
        overridden: true,
      },
      {
        cadence: "IMMEDIATE",
        delivery: "IMMEDIATE_ONLY",
        kind: "approval_escalated",
        mandatory: false,
        overridden: false,
      },
    ]);
  });
});

describe("cadenceOptions", () => {
  it("offers every cadence, but never Off for a required notice", () => {
    expect(cadenceOptions({ delivery: "IMMEDIATE_OR_DIGEST", mandatory: false })).toEqual([
      { disabled: false, value: "IMMEDIATE" },
      { disabled: false, value: "DAILY" },
      { disabled: false, value: "WEEKLY" },
      { disabled: false, value: "OFF" },
    ]);
    expect(cadenceOptions({ mandatory: true }).at(-1)).toEqual({ disabled: true, value: "OFF" });
  });

  it("offers no digest for a notice that's only ever sent at once", () => {
    expect(cadenceOptions({ delivery: "IMMEDIATE_ONLY", mandatory: false })).toEqual([
      { disabled: false, value: "IMMEDIATE" },
      { disabled: true, value: "DAILY" },
      { disabled: true, value: "WEEKLY" },
      { disabled: false, value: "OFF" },
    ]);
  });
});
