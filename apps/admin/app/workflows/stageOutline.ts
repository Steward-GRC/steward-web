// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A workflow definition's stage list: reordered top-to-bottom (the order IS the approval
// sequence — no separate `order` field, unlike a template's sections). Framework-free so it
// carries its own unit tests independent of the editor component.
import type { WorkflowStageInput } from "@steward-web/api-client";

export const moveUp = (
  stages: readonly WorkflowStageInput[],
  index: number,
): WorkflowStageInput[] => {
  if (index <= 0 || index >= stages.length) return [...stages];
  const next = [...stages];
  [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
  return next;
};

export const moveDown = (
  stages: readonly WorkflowStageInput[],
  index: number,
): WorkflowStageInput[] => moveUp(stages, index + 1);

/** A fresh stage appended to the list: no approvers yet, single-approver quorum. */
export const newStage = (stages: readonly WorkflowStageInput[]): WorkflowStageInput => ({
  approvers: [],
  name: `Stage ${stages.length + 1}`,
  quorum: "one",
});
