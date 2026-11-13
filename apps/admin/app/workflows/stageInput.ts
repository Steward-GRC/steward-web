// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { WorkflowDef, WorkflowStageInput } from "@steward-web/api-client";

/**
 * A stored stage as the gateway's input takes it. The stage's veto people go as `vetoUserIds`;
 * the deprecated `vetoApproverIds` and `vetoGroupIds` are never sent.
 */
export const stageInput = (stage: WorkflowDef["stages"][number]): WorkflowStageInput => ({
  approvers: stage.approvers,
  approversByCategory: stage.approversByCategory.map(({ approverIds, categoryId }) => ({
    approverIds,
    categoryId,
  })),
  groupUnits: stage.groupUnits.map(({ groupId, internalQuorum, memberUserIds }) => ({
    groupId,
    internalQuorum,
    memberUserIds,
  })),
  id: stage.id,
  name: stage.name,
  pinnedLast: stage.pinnedLast,
  quorum: stage.quorum,
  rejectOnSlaBreach: stage.rejectOnSlaBreach,
  slaDays: stage.slaDays,
  vetoUserIds: stage.vetoUserIds,
});
