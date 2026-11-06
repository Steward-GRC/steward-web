// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The approval stages as the flow view's steps, and who submitted from the history. Pure, so
// the mapping is unit-tested without the route.
import type { HistoryEntry } from "@steward-web/api-client";
import type { FlowNode, FlowNodeState, FlowStep } from "@steward-web/ui";
import type { StepperApprover, StepperStage } from "@steward-web/ui/domain";

import { formatDayMonth } from "@steward-web/i18n";

export interface FlowTexts {
  /** "Due 9 Oct", for the box being waited on; null when the viewer's due date isn't known. */
  dueText?: null | string;
  /** "you", beside the viewer's own name. */
  youLabel: string;
}

const nodeState = (seat: StepperApprover, stage: StepperStage): FlowNodeState => {
  if (stage.state === "upcoming") return "upcoming";
  if (seat.state === "approved") return "done";
  if (seat.state === "rejected") return "rejected";
  return stage.state === "current" ? "current" : "upcoming";
};

/** One step per stage, and within it one box per approver: a stage with several is a fan. */
export const flowStepsOf = (
  stages: readonly StepperStage[],
  { dueText = null, youLabel }: FlowTexts,
): FlowStep[] =>
  stages.map((stage, index) => {
    // A finished stage that met its rule without every seat keeps the ones that decided.
    const seats =
      stage.state === "done" && stage.approvers.some((a) => a.state === "approved")
        ? stage.approvers.filter((a) => a.state === "approved")
        : stage.approvers;
    if (seats.length === 0) {
      return {
        id: `stage-${index}`,
        nodes: [
          {
            id: `stage-${index}-0`,
            state:
              stage.state === "done" ? "done" : stage.state === "current" ? "current" : "upcoming",
            title: stage.name,
            when: null,
            who: null,
          },
        ],
      };
    }
    return {
      id: `stage-${index}`,
      nodes: seats.map((seat, seatIndex): FlowNode => {
        const state = nodeState(seat, stage);
        return {
          comment: seat.comment ?? null,
          id: `stage-${index}-${seatIndex}`,
          state,
          title: stage.name,
          when:
            seat.state === "pending"
              ? // The due date is the viewer's own task's, so only their box carries it.
                state === "current" && seat.isYou
                ? dueText
                : null
              : seat.decidedAt
                ? formatDayMonth(seat.decidedAt)
                : null,
          who: seat.isYou ? `${seat.name} · ${youLabel}` : seat.name,
        };
      }),
    };
  });

/**
 * Who submitted this run and when: the latest "submitted" event in the history, if any. The
 * audit trail carries no per-version number, so this is the policy's latest submit.
 */
export const submittedFrom = (
  history: readonly HistoryEntry[],
): { at: null | string; by: null | string } => {
  const submits = history
    .filter((h) => h.kind === "submitted")
    .toSorted((a, b) => a.at.localeCompare(b.at));
  const latest = submits.at(-1);
  return { at: latest?.at ?? null, by: latest?.actorName ?? null };
};
