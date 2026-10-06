// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A resource route (no UI) the editor's dialog listens to over server-sent events for one
// async AI job's single terminal result, in place of polling. Folding the result-content
// fetch in here once the job succeeds saves the browser a second round trip, same as the
// polling route this replaces.
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";

import type { Route } from "./+types/resources.ai-jobs.$jobId";

import { awaitAiJobResult, getAiJobResultContent } from "../authoring/ai.server";

interface AiJobPoll {
  error: null | string;
  phase: string;
  resultJson: null | string;
}

const encoder = new TextEncoder();

/** The one `data:` line this stream ever sends. */
const sseMessage = (poll: AiJobPoll): Uint8Array =>
  encoder.encode(`data: ${JSON.stringify(poll)}\n\n`);

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const jobId = params.jobId;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let poll: AiJobPoll;
      try {
        const result = await awaitAiJobResult(request, jobId, request.signal);
        let resultJson: null | string = null;
        if (result.phase === "AI_JOB_PHASE_SUCCEEDED" && result.resultRef) {
          const content = await getAiJobResultContent(request, result.resultRef);
          resultJson = content.resultJson;
        }
        poll = { error: result.error ?? null, phase: result.phase, resultJson };
      } catch {
        // A refused or dropped subscription reads as a failed job, never a raw backend
        // message: the editor's dialog only ever shows a generic retry prompt for this.
        poll = { error: "ai job stream failed", phase: "AI_JOB_PHASE_FAILED", resultJson: null };
      }
      try {
        controller.enqueue(sseMessage(poll));
        controller.close();
      } catch {
        // The browser already disconnected; nothing left to deliver to.
      }
    },
  });

  return new Response(stream, {
    headers: {
      "cache-control": "no-cache",
      "content-type": "text/event-stream",
    },
  });
};
