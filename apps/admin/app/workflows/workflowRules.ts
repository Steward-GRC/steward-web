// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Pure usability rules for a workflow definition, shared by the list and detail routes'
// client-rendered badges — framework-free and server-free, unlike workflows.server.ts.
import type { WorkflowDef } from "@steward-web/api-client";

/** A workflow isn't usable (selectable/runnable) until every stage has at least one approver
 *  and there's at least one stage. */
export const notUsable = (workflow: Pick<WorkflowDef, "stages">): boolean =>
  workflow.stages.length === 0 || workflow.stages.some((s) => s.approvers.length === 0);

/** True when any stage names a disabled user as an approver — a usability warning, not a
 *  block (the gateway still enforces who may actually sign off). */
export const hasDisabledApprover = (
  workflow: Pick<WorkflowDef, "stages">,
  disabledUserIds: ReadonlySet<string>,
): boolean => workflow.stages.some((s) => s.approvers.some((a) => disabledUserIds.has(a)));
