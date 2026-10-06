// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A resource route (no UI) the editor polls for an async AI job's status. Folding the
// result-content fetch in here once the job succeeds saves the client a second round trip.
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";

import type { Route } from "./+types/resources.ai-jobs.$jobId";

import { getAiJob, getAiJobResultContent } from "../authoring/ai.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const status = await getAiJob(request, params.jobId);
  let resultJson: null | string = null;
  if (status.phase === "AI_JOB_PHASE_SUCCEEDED" && status.resultRef) {
    const content = await getAiJobResultContent(request, status.resultRef);
    resultJson = content.resultJson;
  }
  return { error: status.error, phase: status.phase, resultJson };
};
