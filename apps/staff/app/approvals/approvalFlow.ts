// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The approval stages as the flow view's steps, and who submitted from the history. Pure, so
// the mapping is unit-tested without the route.
import type { HistoryEntry } from "@steward-web/api-client";
import type { FlowNode, FlowNodeState, FlowStep } from "@steward-web/ui";
import type { StepperApprover, StepperGroup, StepperStage } from "@steward-web/ui/domain";

import { formatDayMonth } from "@steward-web/i18n";

export interface FlowTexts {
  /** "Due 9 Oct", for the box being waited on; null when the viewer's due date isn't known. */
  dueText?: null | string;
  /** "2 of 4 approved", for a screen reader. */
  voteLabel?: (approved: number, needed: number) => string;
  /** "you", beside the viewer's own name. */
  youLabel: string;
}

const nodeState = (seat: StepperApprover, stage: StepperStage): FlowNodeState => {
  if (stage.state === "upcoming") return "upcoming";
  if (seat.state === "approved") return "done";
  if (seat.state === "rejected") return "rejected";
  return stage.state === "current" ? "current" : "upcoming";
};

const groupState = (group: StepperGroup, stage: StepperStage): FlowNodeState => {
  if (stage.state === "upcoming") return "upcoming";
  if (group.status === "satisfied") return "done";
  if (group.status === "rejected") return "rejected";
  return stage.state === "current" ? "current" : "upcoming";
};

/**
 * One step per stage. Each box is titled by the user or group and described by the stage. A
 * group is one box that holds its members; users and groups can share a step, and a step with
 * several boxes is a fan.
 */
export const flowStepsOf = (
  stages: readonly StepperStage[],
  { dueText = null, voteLabel, youLabel }: FlowTexts,
): FlowStep[] =>
  stages.map((stage, index) => {
    const id = `stage-${index}`;
    const done = stage.state === "done";
    const units = stage.groups ?? [];
    const unitIds = new Set(units.flatMap((u) => (u.id ? [u.id] : [])));
    const inGroup = (seat: StepperApprover) => !!seat.groupId && unitIds.has(seat.groupId);
    // A finished stage that met its rule without every seat keeps the ones that decided.
    const kept = (seats: readonly StepperApprover[]) =>
      done && seats.some((a) => a.state === "approved")
        ? seats.filter((a) => a.state === "approved")
        : seats;

    const users = kept(stage.approvers.filter((a) => !inGroup(a)));
    const userNodes = users.map((seat, index_): FlowNode => {
      const state = nodeState(seat, stage);
      return {
        comment: seat.comment ?? null,
        description: stage.name,
        id: `${id}-u${index_}`,
        state,
        title: seat.isYou ? `${seat.name} · ${youLabel}` : seat.name,
        when:
          seat.state === "pending"
            ? // The due date is the viewer's own task's, so only their box carries it.
              state === "current" && seat.isYou
              ? dueText
              : null
            : seat.decidedAt
              ? formatDayMonth(seat.decidedAt)
              : null,
      };
    });

    let approved = users.filter((a) => a.state === "approved").length;
    let needed = users.length;
    const groupNodes = units.flatMap((unit, index_): FlowNode[] => {
      const state = groupState(unit, stage);
      if (done && unit.status !== "satisfied" && (userNodes.length > 0 || units.length > 1)) {
        return [];
      }
      const seats = stage.approvers.filter((a) => a.groupId === unit.id);
      const votes = seats.filter((a) => a.state === "approved").length;
      approved += Math.min(votes, unit.required);
      needed += unit.required;
      return [
        {
          description: stage.name,
          id: `${id}-g${index_}`,
          members: seats.map((seat, m) => ({
            id: `${id}-g${index_}-m${m}`,
            name: seat.isYou ? `${seat.name} · ${youLabel}` : seat.name,
            state: nodeState(seat, stage),
            when: seat.decidedAt ? formatDayMonth(seat.decidedAt) : null,
          })),
          state,
          tally: `${votes}/${unit.required}`,
          title: unit.name,
        },
      ];
    });

    const nodes = [...userNodes, ...groupNodes];
    if (nodes.length === 0) {
      return {
        id,
        nodes: [
          {
            id: `${id}-0`,
            state: done ? "done" : stage.state === "current" ? "current" : "upcoming",
            title: stage.name,
            when: null,
            who: null,
          },
        ],
      };
    }
    return {
      id,
      nodes,
      tally: `${approved}/${needed}`,
      tallyLabel: voteLabel ? voteLabel(approved, needed) : `${approved}/${needed}`,
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
