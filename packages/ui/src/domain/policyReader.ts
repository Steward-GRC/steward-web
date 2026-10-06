// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AckStatus, HistoryEntry, PolicyDetail, PolicyStatus } from "@steward-web/api-client";

export type {
  AckStatus,
  HistoryEntry,
  PolicyAppendix,
  PolicyContact,
  PolicyDefinition,
  PolicyDetail,
  PolicyReference,
  PolicySectionDiff,
  PolicyVersionSummary,
  RelatedPolicy,
} from "@steward-web/api-client";
export { ReferenceKind } from "@steward-web/api-client";

export type AckBannerState = "done" | "hidden" | "pending";

/**
 * The acknowledgement banner's state (U8): hidden when the document carries no
 * acknowledgement at all or this caller isn't in the ack audience, pending until they
 * acknowledge, done once they have.
 */
export const ackBannerState = (ack: AckStatus | null | undefined): AckBannerState => {
  if (!ack?.required) return "hidden";
  return ack.acknowledged ? "done" : "pending";
};

export type RedactionState = "redacted-no-permission" | "redacted-reveal" | "visible";

/**
 * The sensitive-content gate's state (U9): visible content, content redacted with a
 * break-glass offer, or redacted with no way to reveal it from this screen.
 */
export const redactionState = (
  detail: Pick<PolicyDetail, "canBreakGlass" | "contentObfuscated">,
): RedactionState => {
  if (!detail.contentObfuscated) return "visible";
  return detail.canBreakGlass ? "redacted-reveal" : "redacted-no-permission";
};

export type RevisionNoticeKind = "inReview" | "rejected" | "superseded" | "withdrawn";

/**
 * Which read-only revision notice (U10) a status shows above the body, if any. Draft and
 * published carry no notice here — editing and its own notices are the authoring area, not
 * the reader.
 */
export const revisionNoticeOf = (status: PolicyStatus): null | RevisionNoticeKind => {
  switch (status) {
    case "IN_REVIEW": {
      return "inReview";
    }
    case "REJECTED": {
      return "rejected";
    }
    case "SUPERSEDED": {
      return "superseded";
    }
    case "WITHDRAWN": {
      return "withdrawn";
    }
    default: {
      return null;
    }
  }
};

/**
 * Strips markup from the gateway's word-level diff HTML (`PolicySectionDiff.wordDiffHtml`)
 * down to plain text. The reader has no sanitizer for arbitrary server HTML yet (a follow-up
 * for when the shared document renderer lands with the authoring area), so the Changes
 * panel shows the diff's words without the `<ins>`/`<del>` styling rather than risk
 * rendering unsanitized markup.
 */
export const plainTextOf = (html: string): string =>
  html
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();

export interface HistoryVersionGroup {
  events: readonly HistoryEntry[];
  version: string;
}

/**
 * Groups a flat history (U18) into one accordion section per version, current version
 * first (open by default) and each section's own events kept in their given order. The
 * backend returns one flat append-only list; the reader is the one that groups it by
 * version for the accordion, so a version change here never has to touch the schema.
 */
export const groupHistoryByVersion = (history: readonly HistoryEntry[]): HistoryVersionGroup[] => {
  const byVersion = new Map<string, HistoryEntry[]>();
  for (const event of history) {
    const events = byVersion.get(event.versionLabel);
    if (events) events.push(event);
    else byVersion.set(event.versionLabel, [event]);
  }
  return [...byVersion.entries()].toReversed().map(([version, events]) => ({ events, version }));
};
