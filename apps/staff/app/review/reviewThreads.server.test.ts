// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { beforeEach, describe, expect, it, vi } from "vitest";

const edge = vi.hoisted(() => ({
  addReviewThread: vi.fn(async () => ({})),
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
    expect(edge.addReviewThread).toHaveBeenCalledWith("v-4", "seven years", 2, "Why?", "session=1");
  });

  it("replies, resolves, reopens and deletes", async () => {
    await changeReviewThread(request, form({ body: "Fixed", intent: "reply", threadId: "t-1" }));
    expect(edge.replyReviewThread).toHaveBeenCalledWith("t-1", "Fixed", "session=1");
    await changeReviewThread(request, form({ intent: "resolve", resolved: "true", threadId: "t-1" }));
    expect(edge.setReviewThreadResolved).toHaveBeenLastCalledWith("t-1", true, "session=1");
    await changeReviewThread(request, form({ intent: "resolve", resolved: "false", threadId: "t-1" }));
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
