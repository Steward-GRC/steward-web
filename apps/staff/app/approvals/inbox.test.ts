// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { inboxEntryOf, overdueDays } from "./inbox";

const catalog = [
  {
    category: "Finance",
    currentDraftVersionId: "version-3",
    currentPublishedVersionId: "version-2",
    number: "POL-EXPENSES-000002",
    title: "Expense Claims Policy",
    version: "3",
  },
];

const run = { currentStageIdx: 1, stageNames: ["Finance review", "Final approval"] };

describe("inboxEntryOf", () => {
  it("names the stage and where it sits in the run, with the number, version and link", () => {
    expect(
      inboxEntryOf(
        {
          dueAt: "2026-10-04T00:00:00Z",
          policyTitle: "Expense Claims Policy",
          policyVersionId: "version-3",
          stageIndex: 1,
          taskId: "task-1",
        },
        catalog,
        run,
      ),
    ).toEqual({
      dueAt: "2026-10-04T00:00:00Z",
      href: "/approvals/POL-EXPENSES-000002",
      key: "task-1",
      nowAt: "Final approval",
      number: "POL-EXPENSES-000002",
      stageCount: 2,
      stageName: "Final approval",
      stageNumber: 2,
      title: "Expense Claims Policy",
      version: "3",
    });
  });

  it("opens the inbox for a draft the library hides, never an address with a version id, and keeps the task's own stage name", () => {
    const entry = inboxEntryOf(
      {
        policyTitle: "Remote Work",
        policyVersionId: "version-9",
        stageIndex: 0,
        stageName: "Sign-off",
      },
      catalog,
    );
    expect(entry).toMatchObject({
      href: "/approvals",
      key: "version-9:0",
      number: "",
      stageCount: 1,
      stageName: "Sign-off",
      stageNumber: 1,
      title: "Remote Work",
    });
  });
});

describe("overdueDays", () => {
  const now = new Date("2026-10-06T09:00:00Z");
  it("counts whole days past the due date", () => {
    expect(overdueDays("2026-10-04T00:00:00Z", now)).toBe(2);
    expect(overdueDays("2026-10-05T12:00:00Z", now)).toBe(1);
  });
  it("is null before the due date, or with none", () => {
    expect(overdueDays("2026-10-07T00:00:00Z", now)).toBeNull();
    expect(overdueDays(null, now)).toBeNull();
  });
});
