// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Veto people of a workflow stage (bug log 17). A veto person is one of the stage's own approvers,
// as a user: there are no veto-only seats, no groups, and no workflow-wide switch.
import type { WorkflowStageInput } from "@steward-web/api-client";

type PoolStage = Pick<WorkflowStageInput, "approvers" | "approversByCategory" | "groupUnits">;

/**
 * The users a stage's approver pool resolves to, in first-seen order: its named approvers, the
 * members of each group seat and the approvers it names per category. Nobody else can veto.
 */
export const approverPool = (stage: PoolStage): readonly string[] => {
  const pool = new Set<string>(stage.approvers);
  for (const unit of stage.groupUnits ?? []) {
    for (const id of unit.memberUserIds) pool.add(id);
  }
  for (const entry of stage.approversByCategory ?? []) {
    for (const id of entry.approverIds) pool.add(id);
  }
  return [...pool];
};

/**
 * The stage with its veto people limited to its approver pool, and who was dropped. The same
 * object comes back when nobody had to go, so a caller can tell nothing changed.
 */
export const pruneVetoes = <T extends Pick<WorkflowStageInput, "vetoUserIds"> & PoolStage>(
  stage: T,
): { dropped: readonly string[]; stage: T } => {
  const held = stage.vetoUserIds ?? [];
  const pool = new Set(approverPool(stage));
  const dropped = held.filter((id) => !pool.has(id));
  if (dropped.length === 0) return { dropped, stage };
  return { dropped, stage: { ...stage, vetoUserIds: held.filter((id) => pool.has(id)) } };
};
