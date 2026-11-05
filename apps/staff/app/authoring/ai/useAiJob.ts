// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// One async AI job, as every AI task in the editor follows it (U28). The gateway's
// `aiJobResult` subscription carries only the job's end, which `resources/ai-jobs/:jobId`
// relays as one server-sent event, so the stages in between are inferred: Queued while it's
// being submitted, Generating once it has an id, then Done or Failed.
import type { AiJobStage } from "@steward-web/ui/domain";

import { reportApiError } from "@steward-web/api-client";
import { useEffect, useState } from "react";

export interface AiJob {
  error: null | string;
  resultJson: null | string;
  /** Null while there's no job at all. */
  stage: AiJobStage | null;
}

interface JobEnd {
  error: null | string;
  jobId: string;
  phase: string;
  resultJson: null | string;
}

export const useAiJob = (jobId: null | string, submitting: boolean): AiJob => {
  const [end, setEnd] = useState<JobEnd | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const source = new EventSource(`/resources/ai-jobs/${jobId}`);
    const onMessage = (event: MessageEvent<string>) => {
      const poll = JSON.parse(event.data) as Omit<JobEnd, "jobId">;
      setEnd({ ...poll, jobId });
      source.close();
    };
    const onError = () => {
      reportApiError("AiJobStream", "ai job stream failed");
      setEnd({ error: null, jobId, phase: "AI_JOB_PHASE_FAILED", resultJson: null });
      source.close();
    };
    source.addEventListener("message", onMessage);
    source.addEventListener("error", onError);
    return () => source.close();
  }, [jobId]);

  if (submitting) return { error: null, resultJson: null, stage: "queued" };
  if (!jobId) return { error: null, resultJson: null, stage: null };
  if (end?.jobId !== jobId) return { error: null, resultJson: null, stage: "generating" };
  return end.phase === "AI_JOB_PHASE_SUCCEEDED"
    ? { error: null, resultJson: end.resultJson, stage: "done" }
    : { error: end.error, resultJson: null, stage: "failed" };
};
