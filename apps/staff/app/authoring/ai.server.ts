// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AiHealth,
  AiJobResult,
  AIJobResultContent,
  AssistOperation,
  AuthoringAssistResult,
  SubmitDraftGenerationInput,
  SubmitPolicyReviewInput,
} from "@steward-web/api-client";

import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

/** Whether AI is usable right now. Never rejects; see `AiHealth.reason`. */
export const getAiHealth = (request: Request): Promise<AiHealth> =>
  edge.aiHealth(cookieOf(request));

export interface AssistInput {
  editableContent: string;
  instruction?: string;
  operation: AssistOperation;
  policyId: string;
  sectionKey: string;
  versionId: string;
}

/** One inline authoring suggestion for a section currently being edited. */
export const authoringAssist = (
  request: Request,
  input: AssistInput,
): Promise<AuthoringAssistResult> =>
  edge.authoringAssist({ ...input, instruction: input.instruction ?? null }, cookieOf(request));

export const submitDraftGeneration = (
  request: Request,
  input: SubmitDraftGenerationInput,
): Promise<{ jobId: string }> => edge.submitDraftGeneration(input, cookieOf(request));

export const submitPolicyReview = (
  request: Request,
  input: SubmitPolicyReviewInput,
): Promise<{ jobId: string }> => edge.submitPolicyReview(input, cookieOf(request));

/** Waits for async job `jobId`'s single terminal push over the gateway's `aiJobResult`
 *  subscription. `signal` cancels the wait when the caller (the `ai-jobs` SSE route) is
 *  abandoned. */
export const awaitAiJobResult = (
  request: Request,
  jobId: string,
  signal?: AbortSignal,
): Promise<AiJobResult> => edge.aiJobResult(jobId, cookieOf(request), signal);

export const getAiJobResultContent = (
  request: Request,
  resultRef: string,
): Promise<AIJobResultContent> => edge.aiJobResultContent(resultRef, cookieOf(request));
