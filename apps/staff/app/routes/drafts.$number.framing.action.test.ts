// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The framing an author picks, as the generate and revise actions hand it to the gateway (#399):
// the chosen framing and, for Custom, the trimmed wording; nothing for the default; and a
// request that breaks the rules never reaches the gateway.
import { DraftFraming } from "@steward-web/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";

const submitDraftGeneration = vi.hoisted(() => vi.fn());
const submitPolicyRevision = vi.hoisted(() => vi.fn());

vi.mock("../authoring/ai.server", () => ({
  authoringAssist: vi.fn(),
  submitDraftGeneration,
  submitPolicyReview: vi.fn(),
  submitPolicyRevision,
}));
vi.mock("../authoring/authoring.server", () => ({ policyIdOfNumber: vi.fn(async () => "p-1") }));
vi.mock("../authoring/ai/aiPage.server", () => ({ loadDraftForAi: vi.fn() }));
vi.mock("@steward-web/auth/server", () => ({
  requirePermissionFromRequest: vi.fn(async () => null),
  requireRoleFromRequest: vi.fn(async () => null),
}));

const generate = await import("./drafts.$number.generate");
const revise = await import("./drafts.$number.revise");

type Answer = { data: Record<string, unknown>; init?: { status?: number } | null };

const post = (
  run: typeof generate.action | typeof revise.action,
  fields: Record<string, string>,
) => {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.set(name, value);
  return run({
    params: { number: "POL-VISITOR-000001" },
    request: new Request("https://staff.steward.example/drafts/POL-VISITOR-000001/x", {
      body,
      method: "POST",
    }),
  } as never) as Promise<Answer>;
};

const sections = JSON.stringify([{ key: "purpose", text: "Old.", title: "Purpose" }]);
const draftFields = {
  brief: "Visitors",
  intent: "draft",
  sectionsJson: sections,
  versionId: "v-9",
};
const reviseFields = {
  instruction: "Shorter",
  intent: "revise",
  sectionsJson: sections,
  versionId: "v-9",
};

afterEach(() => vi.clearAllMocks());

describe("generate action: framing", () => {
  it("passes a chosen framing to the gateway", async () => {
    submitDraftGeneration.mockResolvedValue({ jobId: "job-1" });
    await post(generate.action, { ...draftFields, customFraming: "", framing: "PLAIN" });
    expect(submitDraftGeneration).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ framing: DraftFraming.Plain }),
    );
    expect(submitDraftGeneration.mock.calls[0]![1]).not.toHaveProperty("customFraming");
  });

  it("passes Custom with its wording trimmed", async () => {
    submitDraftGeneration.mockResolvedValue({ jobId: "job-1" });
    await post(generate.action, {
      ...draftFields,
      customFraming: "  Warm and direct ",
      framing: "CUSTOM",
    });
    expect(submitDraftGeneration).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ customFraming: "Warm and direct", framing: DraftFraming.Custom }),
    );
  });

  it("sends no framing for the default", async () => {
    submitDraftGeneration.mockResolvedValue({ jobId: "job-1" });
    await post(generate.action, { ...draftFields, customFraming: "", framing: "" });
    const input = submitDraftGeneration.mock.calls[0]![1] as Record<string, unknown>;
    expect(input).not.toHaveProperty("framing");
    expect(input).not.toHaveProperty("customFraming");
  });

  it("passes the framing to a revision turn", async () => {
    submitPolicyRevision.mockResolvedValue({ jobId: "job-2" });
    await post(generate.action, { ...reviseFields, customFraming: "", framing: "FORMAL" });
    expect(submitPolicyRevision).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ framing: DraftFraming.Formal }),
    );
  });

  it("refuses Custom without wording or over the limit, before the gateway", async () => {
    const missing = await post(generate.action, {
      ...draftFields,
      customFraming: "  ",
      framing: "CUSTOM",
    });
    expect(missing.data).toMatchObject({ framingProblem: "missing", ok: false });
    expect(missing.init?.status).toBe(400);
    const long = await post(generate.action, {
      ...draftFields,
      customFraming: "a".repeat(501),
      framing: "CUSTOM",
    });
    expect(long.data).toMatchObject({ framingProblem: "tooLong", ok: false });
    expect(submitDraftGeneration).not.toHaveBeenCalled();
  });
});

describe("revise action: framing", () => {
  it("passes the framing and wording to the gateway", async () => {
    submitPolicyRevision.mockResolvedValue({ jobId: "job-3" });
    await post(revise.action, {
      ...reviseFields,
      customFraming: "For new hires",
      framing: "CUSTOM",
    });
    expect(submitPolicyRevision).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ customFraming: "For new hires", framing: DraftFraming.Custom }),
    );
  });

  it("sends no framing for the default", async () => {
    submitPolicyRevision.mockResolvedValue({ jobId: "job-3" });
    await post(revise.action, { ...reviseFields, customFraming: "", framing: "" });
    expect(submitPolicyRevision.mock.calls[0]![1]).not.toHaveProperty("framing");
  });

  it("refuses bad wording before the gateway", async () => {
    const answer = await post(revise.action, {
      ...reviseFields,
      customFraming: "",
      framing: "CUSTOM",
    });
    expect(answer.data).toMatchObject({ framingProblem: "missing", ok: false });
    expect(answer.init?.status).toBe(400);
    expect(submitPolicyRevision).not.toHaveBeenCalled();
  });
});
