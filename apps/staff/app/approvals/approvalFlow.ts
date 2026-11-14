// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The approval stages as the flow view's steps, and who submitted from the history. Pure, so
// the mapping is unit-tested without the route.
import type { HistoryEntry } from "@steward-web/api-client";
import type { FlowNode, FlowNodeState, FlowStep } from "@steward-web/ui";
import type {
  StepperApprover,
  StepperGroup,
  StepperRule,
  StepperStage,
} from "@steward-web/ui/domain";

import { formatDayMonth } from "@steward-web/i18n";

export interface FlowTexts {
  /** "Due 12 Oct", for a stage's own due date; a stage with no date shows none. */
  dueOf?: (iso: string) => string;
  /** "Due 9 Oct", for the box being waited on; null when the viewer's due date isn't known. */
  dueText?: null | string;
  /** "quorum · 1 of 2", a stage's rule; a plain one-approver stage has none. */
  ruleOf?: (rule: StepperRule) => string;
  /** "2 of 4 approved", for a screen reader. */
  voteLabel?: (approved: number, needed: number) => string;
  /** "you", beside the viewer's own name. */
  youLabel: string;
}

/** "Dave · Approver · you": the name, then the role when the gateway names one, then you. */
const seatTitle = (seat: StepperApprover, youLabel: string): string =>
  [seat.name, seat.role, seat.isYou ? youLabel : null].filter(Boolean).join(" · ");

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
  { dueOf, dueText = null, ruleOf, voteLabel, youLabel }: FlowTexts,
): FlowStep[] =>
  stages.map((stage, index) => {
    const id = `stage-${index}`;
    // The stage's line under each box: its name, then its rule when it has one.
    const described = [stage.name, stage.rule && ruleOf ? ruleOf(stage.rule) : null]
      .filter(Boolean)
      .join(" · ");
    // The stage's own due date, for a box still waiting; a decided box shows its decision date.
    const stageDue = stage.dueAt && dueOf && stage.state !== "done" ? dueOf(stage.dueAt) : null;
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
        description: described,
        id: `${id}-u${index_}`,
        state,
        title: seatTitle(seat, youLabel),
        when:
          seat.state === "pending"
            ? // The viewer's own task due date wins on their box; the others show the stage's.
              state === "current" && seat.isYou && dueText
              ? dueText
              : stageDue
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
          description: described,
          id: `${id}-g${index_}`,
          members: seats.map((seat, m) => ({
            id: `${id}-g${index_}-m${m}`,
            name: seatTitle(seat, youLabel),
            state: nodeState(seat, stage),
            when: seat.decidedAt ? formatDayMonth(seat.decidedAt) : null,
          })),
          state,
          tally: `${votes}/${unit.required}`,
          title: unit.name,
          when: state === "done" || state === "rejected" ? null : stageDue,
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
