// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Pure usability rules for a workflow definition, shared by the list and detail routes'
// client-rendered badges — framework-free and server-free, unlike workflows.server.ts.

/** Just what the rules read of a stage: its people, its groups and its per-category approvers. */
export interface StageApprovers {
  readonly approvers: readonly string[];
  readonly approversByCategory?: null | readonly unknown[];
  readonly groupUnits?: null | readonly unknown[];
}

const hasApprover = (stage: StageApprovers) =>
  stage.approvers.length > 0 ||
  (stage.groupUnits?.length ?? 0) > 0 ||
  (stage.approversByCategory?.length ?? 0) > 0;

/** A workflow isn't usable (selectable/runnable) until every stage has at least one approver,
 *  a person or a group, and there's at least one stage. */
export const notUsable = <Stage extends StageApprovers>(workflow: {
  readonly stages: readonly Stage[];
}): boolean => workflow.stages.length === 0 || workflow.stages.some((s) => !hasApprover(s));

/** True when any stage names a disabled user as an approver — a usability warning, not a
 *  block (the gateway still enforces who may actually sign off). */
export const hasDisabledApprover = <Stage extends StageApprovers>(
  workflow: { readonly stages: readonly Stage[] },
  disabledUserIds: ReadonlySet<string>,
): boolean => workflow.stages.some((s) => s.approvers.some((a) => disabledUserIds.has(a)));
