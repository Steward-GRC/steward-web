// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { ReviewThread } from "@steward-web/api-client";

import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

/** The inline comment threads on a version. A version the service can't list for stays empty. */
export const listReviewThreads = (
  request: Request,
  policyVersionId: string,
): Promise<readonly ReviewThread[]> =>
  edge.reviewThreads(policyVersionId, cookieOf(request)).catch(() => []);

const text = (form: FormData, name: string): string => String(form.get(name) ?? "");

/** What the review-thread form can ask for. */
export const REVIEW_THREAD_INTENTS = ["add", "delete", "reply", "resolve"] as const;
export type ReviewThreadIntent = (typeof REVIEW_THREAD_INTENTS)[number];

/** Does one review-thread change, as the signed-in person; the service decides who may. */
export const changeReviewThread = async (request: Request, form: FormData): Promise<void> => {
  const cookie = cookieOf(request);
  const intent = text(form, "intent") as ReviewThreadIntent;
  switch (intent) {
    case "add": {
      await edge.addReviewThread(
        text(form, "policyVersionId"),
        text(form, "quote"),
        Number(text(form, "occurrence")),
        text(form, "body"),
        cookie,
      );
      return;
    }
    case "delete": {
      await edge.deleteReviewThread(text(form, "threadId"), cookie);
      return;
    }
    case "reply": {
      await edge.replyReviewThread(text(form, "threadId"), text(form, "body"), cookie);
      return;
    }
    case "resolve": {
      await edge.setReviewThreadResolved(
        text(form, "threadId"),
        text(form, "resolved") === "true",
        cookie,
      );
      return;
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
};
