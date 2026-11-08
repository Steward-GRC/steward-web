// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { beforeEach, describe, expect, it, vi } from "vitest";

const edge = vi.hoisted(() => ({
  addReviewThread: vi.fn(async () => ({})),
  closeReviewSuggestion: vi.fn(async () => ({})),
  counterReviewSuggestion: vi.fn(async () => ({})),
  deleteReviewThread: vi.fn(async () => true),
  replyReviewThread: vi.fn(async () => ({})),
  reviewThreads: vi.fn(async () => [] as unknown[]),
  setReviewThreadResolved: vi.fn(async () => ({})),
}));

vi.mock("@steward-web/edge.server", () => ({ default: edge }));

const { changeReviewThread, listReviewThreads } = await import("./reviewThreads.server");

const request = new Request("https://app.example.test/", { headers: { cookie: "session=1" } });
const form = (fields: Record<string, string>) => {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.set(name, value);
  return body;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("changeReviewThread", () => {
  it("starts a thread with its quote, which match of it and the first message", async () => {
    await changeReviewThread(
      request,
      form({
        body: "Why?",
        intent: "add",
        occurrence: "2",
        policyVersionId: "v-4",
        quote: "seven years",
      }),
    );
    expect(edge.addReviewThread).toHaveBeenCalledWith(
      "v-4",
      "seven years",
      2,
      "Why?",
      undefined,
      "session=1",
    );
  });

  it("starts a thread with a suggested text, and treats a blank one as none", async () => {
    const fields = {
      body: "Shorter?",
      intent: "add",
      occurrence: "1",
      policyVersionId: "v-4",
      quote: "seven years",
    };
    await changeReviewThread(request, form({ ...fields, suggestedText: "six years" }));
    expect(edge.addReviewThread).toHaveBeenLastCalledWith(
      "v-4",
      "seven years",
      1,
      "Shorter?",
      "six years",
      "session=1",
    );
    await changeReviewThread(request, form({ ...fields, suggestedText: "  " }));
    expect(edge.addReviewThread).toHaveBeenLastCalledWith(
      "v-4",
      "seven years",
      1,
      "Shorter?",
      undefined,
      "session=1",
    );
  });

  it("counters a suggestion and closes it with an outcome and a reason", async () => {
    await changeReviewThread(
      request,
      form({ intent: "counter", text: "five years", threadId: "t-1" }),
    );
    expect(edge.counterReviewSuggestion).toHaveBeenCalledWith("t-1", "five years", "session=1");
    await changeReviewThread(
      request,
      form({
        intent: "close",
        outcome: "NOT_AGREED",
        reason: "The law says seven.",
        threadId: "t-1",
      }),
    );
    expect(edge.closeReviewSuggestion).toHaveBeenLastCalledWith(
      "t-1",
      "NOT_AGREED",
      "The law says seven.",
      "session=1",
    );
    await changeReviewThread(
      request,
      form({ intent: "close", outcome: "CHANGED", threadId: "t-1" }),
    );
    expect(edge.closeReviewSuggestion).toHaveBeenLastCalledWith(
      "t-1",
      "CHANGED",
      undefined,
      "session=1",
    );
  });

  it("refuses an outcome it doesn't know", async () => {
    await expect(
      changeReviewThread(request, form({ intent: "close", outcome: "NUKED", threadId: "t-1" })),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("replies, resolves, reopens and deletes", async () => {
    await changeReviewThread(request, form({ body: "Fixed", intent: "reply", threadId: "t-1" }));
    expect(edge.replyReviewThread).toHaveBeenCalledWith("t-1", "Fixed", "session=1");
    await changeReviewThread(
      request,
      form({ intent: "resolve", resolved: "true", threadId: "t-1" }),
    );
    expect(edge.setReviewThreadResolved).toHaveBeenLastCalledWith("t-1", true, "session=1");
    await changeReviewThread(
      request,
      form({ intent: "resolve", resolved: "false", threadId: "t-1" }),
    );
    expect(edge.setReviewThreadResolved).toHaveBeenLastCalledWith("t-1", false, "session=1");
    await changeReviewThread(request, form({ intent: "delete", threadId: "t-1" }));
    expect(edge.deleteReviewThread).toHaveBeenCalledWith("t-1", "session=1");
  });

  it("refuses an intent it doesn't know", async () => {
    await expect(changeReviewThread(request, form({ intent: "nuke" }))).rejects.toMatchObject({
      status: 400,
    });
  });
});

describe("listReviewThreads", () => {
  it("is empty when the service can't list them", async () => {
    edge.reviewThreads.mockRejectedValueOnce(new Error("down"));
    expect(await listReviewThreads(request, "v-4")).toEqual([]);
  });
});
