// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { MAX_REMINDER_DAYS, parseReminderDays, withReminderRules } from "./stageReminders";

const STAGE = { approvers: ["u-1"], name: "Review", quorum: "one" };

describe("parseReminderDays", () => {
  it("reads whole working days", () => {
    expect(parseReminderDays("2")).toBe(2);
    expect(parseReminderDays("365")).toBe(365);
  });

  it("treats empty, zero, negative and junk as off", () => {
    for (const raw of ["", "0", "-3", "abc", " "]) expect(parseReminderDays(raw)).toBe(0);
  });

  it("drops a fraction and caps at 365", () => {
    expect(parseReminderDays("2.9")).toBe(2);
    expect(parseReminderDays("366")).toBe(MAX_REMINDER_DAYS);
    expect(parseReminderDays("9999")).toBe(365);
  });
});

describe("withReminderRules", () => {
  it("keeps both values on a stage with a due date that does not reject", () => {
    const stage = { ...STAGE, escalateAfterDays: 4, remindEveryDays: 2, slaDays: 3 };
    expect(withReminderRules(stage)).toBe(stage);
  });

  it("clears both when there is no due date", () => {
    const next = withReminderRules({ ...STAGE, escalateAfterDays: 4, remindEveryDays: 2 });
    expect(next).toMatchObject({ escalateAfterDays: 0, remindEveryDays: 0 });
  });

  it("clears both when the due date is cleared or zero", () => {
    for (const slaDays of [null, 0]) {
      const next = withReminderRules({
        ...STAGE,
        escalateAfterDays: 4,
        remindEveryDays: 2,
        slaDays,
      });
      expect(next).toMatchObject({ escalateAfterDays: 0, remindEveryDays: 0 });
    }
  });

  it("clears both when the stage rejects at the due date", () => {
    const next = withReminderRules({
      ...STAGE,
      escalateAfterDays: 4,
      rejectOnSlaBreach: true,
      remindEveryDays: 2,
      slaDays: 3,
    });
    expect(next).toMatchObject({
      escalateAfterDays: 0,
      rejectOnSlaBreach: true,
      remindEveryDays: 0,
      slaDays: 3,
    });
  });

  it("returns the same object when nothing needs clearing", () => {
    const stage = { ...STAGE, slaDays: null };
    expect(withReminderRules(stage)).toBe(stage);
  });
});
