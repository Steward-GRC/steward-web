// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The approval run (WorkflowStatus) as the approval stepper's stages (U25). Pure, so the
// mapping is unit-tested without the route.
import type {
  StepperApprover,
  StepperGroup,
  StepperRule,
  StepperStage,
} from "@steward-web/ui/domain";

interface Run {
  currentStageIdx: number;
  stageAssignees: readonly (readonly Seat[])[];
  stageNames: readonly string[];
  /** Each stage's due date and rule; absent or short where the gateway sent none. */
  stageProgress?: readonly StageProgress[];
  stageUnitProgress: readonly (readonly Unit[])[];
  status: string;
}

interface Seat {
  comment?: null | string;
  decidedAt?: null | string;
  groupId?: null | string;
  name?: null | string;
  /** Why the person holds the seat ("Approver", "Category owner"); null when not recorded. */
  roleLabel?: null | string;
  state: string;
  userId: string;
}

interface StageProgress {
  approvals: number;
  dueAt?: null | string;
  quorum?: null | string;
  required: number;
}

interface Unit {
  approvals?: number;
  groupId: string;
  groupName?: null | string;
  pending?: number;
  quorum: string;
  required: number;
  roster: number;
  status: string;
}

const SEAT_STATES = new Set(["approved", "pending", "rejected"]);
const QUORUMS = new Set(["all", "majority", "one"]);

/** "one" (and anything unknown) has no badge; "all" and the majority and n-of-m rules do. */
const ruleOf = (progress: StageProgress | undefined): StepperRule | undefined => {
  const quorum = progress?.quorum?.toLowerCase();
  if (!progress || !quorum) return undefined;
  const kind =
    quorum === "all" ? "all" : quorum === "majority" || quorum === "nofm" ? "quorum" : null;
  return kind ? { approvals: progress.approvals, kind, required: progress.required } : undefined;
};

const approverOf = (seat: Seat, meId: string, veto: boolean): StepperApprover => ({
  comment: seat.comment ?? null,
  decidedAt: seat.decidedAt ?? null,
  groupId: seat.groupId ?? null,
  isYou: seat.userId === meId,
  name: seat.name ?? seat.userId,
  ...(seat.roleLabel ? { role: seat.roleLabel } : {}),
  state: seat.state as StepperApprover["state"],
  ...(veto ? { veto: true } : {}),
});

const groupOf = (unit: Unit, seats: readonly Seat[]): StepperGroup => {
  const members = seats.filter((s) => s.groupId === unit.groupId);
  const names = (state: string) =>
    members.filter((s) => s.state === state).map((s) => s.name ?? s.userId);
  const status = unit.status.toLowerCase();
  return {
    approved: names("approved"),
    id: unit.groupId,
    name: unit.groupName ?? unit.groupId,
    pending: names("pending"),
    quorum: (QUORUMS.has(unit.quorum) ? unit.quorum : "one") as StepperGroup["quorum"],
    required: unit.required,
    roster: unit.roster,
    status: status === "satisfied" || status === "rejected" ? status : "pending",
  };
};

const stateOf = (run: Run, index: number): StepperStage["state"] => {
  const status = run.status.replace(/^APPROVAL_STATUS_/, "");
  if (["APPROVED", "PUBLISHED", "SCHEDULED"].includes(status)) return "done";
  if (index < run.currentStageIdx) return "done";
  if (index > run.currentStageIdx) return "upcoming";
  if (status === "REJECTED") return "rejected";
  return status === "IN_REVIEW" ? "current" : "upcoming";
};

/** Each stage with its live seats (cancelled ones dropped), its state and its group units. */
/** `vetoes` lists, per stage, the user ids holding a veto there (none where the gateway has none). */
export const stepperStagesOf = (
  run: Run,
  meId: string,
  vetoes: readonly (readonly string[])[] = [],
): StepperStage[] =>
  run.stageNames.map((name, index) => {
    const seats = run.stageAssignees[index] ?? [];
    const units = run.stageUnitProgress[index] ?? [];
    const progress = run.stageProgress?.[index];
    const rule = ruleOf(progress);
    return {
      ...(progress?.dueAt ? { dueAt: progress.dueAt } : {}),
      approvers: seats
        .filter((s) => SEAT_STATES.has(s.state))
        .map((s) => approverOf(s, meId, vetoes[index]?.includes(s.userId) ?? false)),
      groups: units.map((unit) => groupOf(unit, seats)),
      name,
      ...(rule ? { rule } : {}),
      state: stateOf(run, index),
    };
  });
