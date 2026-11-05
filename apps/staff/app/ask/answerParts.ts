// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Ask's answer (U6) as text pieces, each followed by the numbers of the citations that back it.

export interface AnswerPart {
  /** 1-based citation numbers, in citation order, to show after the text. */
  cites: number[];
  text: string;
}

interface Segment {
  end: number;
  sources: readonly Source[];
  start: number;
}

interface Source {
  policyId: string;
  sectionKey: string;
}

/** Splits the answer at its segments; each segment's sources become citation numbers. */
export const answerParts = (
  answer: string,
  citations: readonly Source[],
  segments: readonly Segment[],
): AnswerPart[] => {
  const numberOf = (source: Source) =>
    citations.findIndex(
      (c) => c.policyId === source.policyId && c.sectionKey === source.sectionKey,
    ) + 1;
  const parts: AnswerPart[] = [];
  let at = 0;
  for (const segment of segments.toSorted((a, b) => a.start - b.start)) {
    const start = Math.max(segment.start, at);
    const end = Math.min(Math.max(segment.end, start), answer.length);
    if (start > at) parts.push({ cites: [], text: answer.slice(at, start) });
    if (end > start) {
      const cites = [...new Set(segment.sources.map(numberOf).filter((n) => n > 0))].toSorted(
        (a, b) => a - b,
      );
      parts.push({ cites, text: answer.slice(start, end) });
    }
    at = Math.max(at, end);
  }
  if (at < answer.length || parts.length === 0) parts.push({ cites: [], text: answer.slice(at) });
  return parts;
};
