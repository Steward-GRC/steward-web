// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The reviewer's editor (bug log 200, 206, 207): the Steward editor reduced to reading the version
// under review and commenting on it. It is read-only, so it takes no edit from any input, and its
// selection toolbar offers the one Comment action. Its content is drawn the way the policy reads
// everywhere else (the reader's page: width, type and spacing), and its comments sit under it.
import type { FC, ReactNode } from "react";

import type { ReviewComments } from "./ReviewComments";

import { StewardEditor, type StewardEditorProps } from "./StewardEditor";

/** What a reviewer's editor takes: the version and the review. No collaboration, no AI, no toolbar. */
export type ReviewerEditorProps = {
  review: ReviewComments;
} & Omit<
  StewardEditorProps,
  "collaboration" | "commentsPlacement" | "onRework" | "readOnly" | "review" | "toolbar"
>;

const readerPage = (document: ReactNode) => (
  <div
    className="rounded-[10px] border border-border bg-surface px-5 pt-8 pb-10 font-serif text-ink sm:px-14 sm:pt-10 sm:pb-12"
    data-reviewer-document=""
  >
    {document}
  </div>
);

export const ReviewerEditor: FC<ReviewerEditorProps> = ({ review, ...props }) => (
  <StewardEditor {...props} commentsPlacement="below" frame={readerPage} readOnly review={review} />
);
