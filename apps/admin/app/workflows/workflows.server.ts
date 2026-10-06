// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Workflow, WorkflowDef, WorkflowStageInput } from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

const requireGroupManage = (request: Request) =>
  requirePermissionFromRequest(request, PERMISSIONS.GroupManage, "/");

/** The simple id/name list, for a group's default-workflow picker. */
export const listWorkflows = async (request: Request): Promise<readonly Workflow[]> => {
  await requireGroupManage(request);
  return edge.workflows(cookieOf(request));
};

/** Every workflow's full detail (stages included), for the admin directory. */
export const listWorkflowDefs = async (request: Request): Promise<readonly WorkflowDef[]> => {
  await requireGroupManage(request);
  return edge.workflowDefs(cookieOf(request));
};

export const getWorkflowDef = async (request: Request, id: string): Promise<null | WorkflowDef> => {
  await requireGroupManage(request);
  return edge.workflowDef(id, cookieOf(request));
};

export const createWorkflowDef = async (
  request: Request,
  name: string,
  description: null | string,
  stages: readonly WorkflowStageInput[],
): Promise<WorkflowDef> => {
  await requireGroupManage(request);
  return edge.createWorkflowDef(name, description, stages, cookieOf(request));
};

export const updateWorkflowDef = async (
  request: Request,
  id: string,
  name: string,
  description: null | string,
  stages: readonly WorkflowStageInput[],
): Promise<WorkflowDef> => {
  await requireGroupManage(request);
  return edge.updateWorkflowDef(id, name, description, stages, cookieOf(request));
};

export const archiveWorkflowDef = async (request: Request, id: string): Promise<void> => {
  await requireGroupManage(request);
  await edge.archiveWorkflowDef(id, cookieOf(request));
};
