// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { ReviewThread } from "@steward-web/api-client";
import type { ReviewComments } from "@steward-web/editor-steward";

import { render, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { useReviewComments } from "./useReviewComments";

const thread: ReviewThread = {
  approverUserId: "user-charlie",
  createdAt: "2026-11-06T12:00:00Z",
  id: "thread-1",
  messages: [],
  occurrence: 1,
  policyVersionId: "v-4",
  quote: "seven years",
  resolved: false,
};

/** Mounts the hook under a router and hands back what it returns and what it posts. */
const setup = (side: "AUTHOR" | "REVIEWER") => {
  const posted = vi.fn();
  let comments: ReviewComments | undefined;
  const Probe = () => {
    comments = useReviewComments({
      canAdd: true,
      meId: "user-charlie",
      policyVersionId: "v-4",
      side,
      threads: [thread],
    });
    return null;
  };
  const Stub = createRoutesStub([
    { Component: Probe, path: "/" },
    {
      action: async ({ request }) => {
        posted(Object.fromEntries(await request.formData()));
        return null;
      },
      path: "/resources/review-threads",
    },
  ]);
  render(<Stub />);
  return { comments: () => comments!, posted };
};

describe("useReviewComments", () => {
  it("hands on which side the person acts on", async () => {
    const { comments } = setup("REVIEWER");
    await waitFor(() => expect(comments()).toBeDefined());
    expect(comments().side).toBe("REVIEWER");
  });

  it("starts a thread with the suggested text when there is one", async () => {
    const { comments, posted } = setup("REVIEWER");
    await waitFor(() => expect(comments()).toBeDefined());
    await comments().onAdd?.({
      body: "Shorter?",
      occurrence: 1,
      quote: "seven years",
      suggestedText: "six years",
    });
    await waitFor(() =>
      expect(posted).toHaveBeenCalledWith({
        body: "Shorter?",
        intent: "add",
        occurrence: "1",
        policyVersionId: "v-4",
        quote: "seven years",
        suggestedText: "six years",
      }),
    );
  });

  it("counters and closes through the review-thread route", async () => {
    const { comments, posted } = setup("AUTHOR");
    await waitFor(() => expect(comments()).toBeDefined());
    await comments().onCounter?.("thread-1", "five years");
    await waitFor(() =>
      expect(posted).toHaveBeenCalledWith({
        intent: "counter",
        text: "five years",
        threadId: "thread-1",
      }),
    );
    await comments().onClose?.("thread-1", "NOT_AGREED", "The law says seven.");
    await waitFor(() =>
      expect(posted).toHaveBeenCalledWith({
        intent: "close",
        outcome: "NOT_AGREED",
        reason: "The law says seven.",
        threadId: "thread-1",
      }),
    );
  });
});
