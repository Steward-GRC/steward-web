// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Reminders and escalation on a workflow stage (row 53). Both count whole working days after the
// stage's due date, and both only notify: they never approve and never add an approver. The rules
// mirror the gateway's, so a stage the editor offers is a stage the gateway accepts.
import type { WorkflowStageInput } from "@steward-web/api-client";

/** The most working days either setting takes, the same ceiling the gateway applies. */
export const MAX_REMINDER_DAYS = 365;

/** What a days box holds as a number: whole days, 0 for empty or unreadable, at most 365. */
export const parseReminderDays = (raw: string): number => {
  const days = Math.trunc(Number(raw));
  if (!Number.isFinite(days) || days <= 0) return 0;
  return Math.min(days, MAX_REMINDER_DAYS);
};

type RuleStage = Pick<
  WorkflowStageInput,
  "escalateAfterDays" | "rejectOnSlaBreach" | "remindEveryDays" | "slaDays"
>;

/**
 * The stage with its reminder and escalation days cleared when they cannot apply: either needs a
 * due date, and neither is allowed while the stage rejects at the due date. The same object comes
 * back when nothing had to change.
 */
export const withReminderRules = <T extends RuleStage>(stage: T): T => {
  const allowed = (stage.slaDays ?? 0) > 0 && !stage.rejectOnSlaBreach;
  if (allowed) return stage;
  if (!stage.remindEveryDays && !stage.escalateAfterDays) return stage;
  return { ...stage, escalateAfterDays: 0, remindEveryDays: 0 };
};
