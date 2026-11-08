// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { ReviewThread, SuggestionSide } from "@steward-web/api-client";
import type { ReviewComments } from "@steward-web/editor-steward";

import { WordDiff, wordDiffRuns } from "@steward-web/ui/domain";
import { useMemo } from "react";
import { useFetcher } from "react-router";

const ACTION = "/resources/review-threads";

/**
 * The editor's review comments for one version, backed by the service: every change posts to the
 * review-thread resource route, and the loaders refresh the threads after it. `canAdd` is who may
 * start a thread (the approver's review view); everyone with the threads can reply and resolve.
 */
export const useReviewComments = ({
  canAdd,
  meId,
  policyVersionId,
  side,
  threads,
}: {
  canAdd: boolean;
  meId: string;
  policyVersionId: string;
  /** Which side of a suggestion the person acts on: the screen knows (the draft is the author's). */
  side: SuggestionSide;
  threads: readonly ReviewThread[];
}): ReviewComments => {
  const fetcher = useFetcher();
  const { submit } = fetcher;
  return useMemo(() => {
    const post = (fields: Record<string, string>) =>
      submit(fields, { action: ACTION, method: "post" });
    return {
      meId,
      onAdd: canAdd
        ? ({ body, occurrence, quote, suggestedText }) =>
            post({
              body,
              intent: "add",
              occurrence: String(occurrence),
              policyVersionId,
              quote,
              ...(suggestedText ? { suggestedText } : {}),
            })
        : undefined,
      onClose: (threadId, outcome, reason) =>
        post({ intent: "close", outcome, threadId, ...(reason ? { reason } : {}) }),
      onCounter: (threadId, text) => post({ intent: "counter", text, threadId }),
      onDelete: (threadId) => post({ intent: "delete", threadId }),
      onReply: (threadId, body) => post({ body, intent: "reply", threadId }),
      onResolve: (threadId, resolved) =>
        post({ intent: "resolve", resolved: String(resolved), threadId }),
      renderDiff: (before, after) => <WordDiff runs={wordDiffRuns(before, after)} />,
      side,
      threads: threads.map((thread) => ({
        ...thread,
        messages: thread.messages.map((message) => ({ ...message })),
      })),
    };
  }, [canAdd, meId, policyVersionId, side, submit, threads]);
};
