// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AiHealth,
  AiJobResult,
  AIJobResultContent,
  AssistOperation,
  AuthoringAssistResult,
  ReferenceUrlCheck,
  SubmitDraftGenerationInput,
  SubmitPolicyReviewInput,
  SubmitPolicyRevisionInput,
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

export const submitPolicyRevision = (
  request: Request,
  input: SubmitPolicyRevisionInput,
): Promise<{ jobId: string }> => edge.submitPolicyRevision(input, cookieOf(request));

/** A reference document's text, read by the gateway (PDF, Word, RTF, Markdown or text). */
export const extractDocument = (
  request: Request,
  file: File,
): Promise<{ content: string; title: string }> => edge.extractDocument(file, cookieOf(request));

/** Whether the gateway can read a reference URL. */
export const validateReferenceUrl = (request: Request, url: string): Promise<ReferenceUrlCheck> =>
  edge.validateReferenceUrl(url, cookieOf(request));

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

/** A finished job's content. `jobId` lets the gateway fall back to the stored result when the
 *  cached one has expired. */
export const getAiJobResultContent = (
  request: Request,
  resultRef: string,
  jobId?: string,
): Promise<AIJobResultContent> => edge.aiJobResultContent(resultRef, cookieOf(request), jobId);
