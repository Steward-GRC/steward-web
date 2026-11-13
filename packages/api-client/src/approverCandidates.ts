// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { WorkflowApproverCandidatesQuery } from "./generated/graphql";

/**
 * Who may be named as an approver on a workflow: the people its categories' rows let approve
 * (never the site admin), and whether any category uses the workflow yet. `attached` is false
 * when none does; `users` is then empty.
 */
export type WorkflowApproverCandidates =
  WorkflowApproverCandidatesQuery["workflowApproverCandidates"];
