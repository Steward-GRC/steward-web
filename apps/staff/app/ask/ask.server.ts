// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Ask (U6): the gateway's grounded answer, with each citation turned into a link to its section.
import type { AskAnswer, Policy } from "@steward-web/api-client";

import edge from "@steward-web/edge.server";
import { policyPath } from "@steward-web/ui/domain";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

const SUGGESTIONS = 6;

export interface Answer {
  answer: string;
  citations: AskCitation[];
  hasSensitiveSource: boolean;
  noAuthorizedSource: boolean;
  segments: AskAnswer["segments"];
}

/** A citation as the page shows it: "POL-… Title · §2", linking to that section. */
export interface AskCitation {
  label: string;
  policyId: string;
  sectionKey: string;
  to: string;
}

/** "Try asking": the questions asked most. Empty when AI is unavailable or can't say. */
export const topQuestions = (request: Request): Promise<readonly string[]> =>
  edge.topPolicyQuestions(SUGGESTIONS, cookieOf(request)).catch(() => []);

/** The citations' documents, by id, for their numbers and links. */
export const citationsOf = (answer: AskAnswer, documents: readonly Policy[]): AskCitation[] => {
  const byId = new Map(documents.map((d) => [d.id, d]));
  return answer.citations.map((citation) => {
    const document = byId.get(citation.policyId);
    const anchor = `#${encodeURIComponent(citation.sectionKey)}`;
    return {
      label: [document?.number, citation.policyTitle, `· §${citation.sectionKey}`]
        .filter(Boolean)
        .join(" "),
      policyId: citation.policyId,
      sectionKey: citation.sectionKey,
      to: document ? `${policyPath(document)}${anchor}` : anchor,
    };
  });
};

/** Asks the gateway. The read scope is the gateway's own, from the session. */
export const ask = async (
  request: Request,
  question: string,
  documents: () => Promise<readonly Policy[]>,
): Promise<Answer> => {
  const answer = await edge.searchAndAnswer(question, cookieOf(request));
  return {
    answer: answer.answer,
    citations: citationsOf(answer, answer.citations.length > 0 ? await documents() : []),
    hasSensitiveSource: answer.hasSensitiveSource,
    noAuthorizedSource: answer.noAuthorizedSource,
    segments: answer.segments,
  };
};
