// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The AI job stream fetches a finished job's content with the job's id (#399), so a result
// whose cache entry has expired still loads from the gateway's stored copy.
import { afterEach, describe, expect, it, vi } from "vitest";

const awaitAiJobResult = vi.hoisted(() => vi.fn());
const getAiJobResultContent = vi.hoisted(() => vi.fn());

vi.mock("../authoring/ai.server", () => ({ awaitAiJobResult, getAiJobResultContent }));
vi.mock("@steward-web/auth/server", () => ({
  requirePermissionFromRequest: vi.fn(async () => null),
}));

const { loader } = await import("./resources.ai-jobs.$jobId");

const stream = async (jobId: string) => {
  const response = (await loader({
    params: { jobId },
    request: new Request(`https://staff.steward.example/resources/ai-jobs/${jobId}`),
  } as never)) as Response;
  const text = await response.text();
  return JSON.parse(text.replace(/^data: /, "").trim()) as Record<string, unknown>;
};

afterEach(() => vi.clearAllMocks());

describe("resources.ai-jobs loader", () => {
  it("fetches the content by its reference and the job id", async () => {
    awaitAiJobResult.mockResolvedValue({
      error: null,
      phase: "AI_JOB_PHASE_SUCCEEDED",
      resultRef: "ref-1",
    });
    getAiJobResultContent.mockResolvedValue({ operation: "DRAFT", resultJson: '{"a":1}' });
    const poll = await stream("job-7");
    expect(getAiJobResultContent).toHaveBeenCalledWith(expect.anything(), "ref-1", "job-7");
    expect(poll).toMatchObject({ phase: "AI_JOB_PHASE_SUCCEEDED", resultJson: '{"a":1}' });
  });

  it("reads a failed content fetch as a failed job", async () => {
    awaitAiJobResult.mockResolvedValue({
      error: null,
      phase: "AI_JOB_PHASE_SUCCEEDED",
      resultRef: "ref-1",
    });
    getAiJobResultContent.mockRejectedValue(new Error("gone"));
    expect(await stream("job-7")).toMatchObject({ phase: "AI_JOB_PHASE_FAILED" });
  });

  it("does not fetch content for a job that did not succeed", async () => {
    awaitAiJobResult.mockResolvedValue({
      error: "boom",
      phase: "AI_JOB_PHASE_FAILED",
      resultRef: null,
    });
    await stream("job-8");
    expect(getAiJobResultContent).not.toHaveBeenCalled();
  });
});
