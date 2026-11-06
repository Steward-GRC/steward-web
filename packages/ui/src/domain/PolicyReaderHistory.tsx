// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";

import type { HistoryEntry } from "./policyReaderModel";
import type { DotTone, HistoryStatus, VersionHistoryGroup } from "./VersionHistory";

import { groupHistoryByVersion } from "./policyReaderModel";
import { VersionHistory, versionLabel } from "./VersionHistory";

export { withV } from "./VersionHistory";

/** A kind with no label yet, in words: "workflowStageEscalated" -> "Workflow stage escalated". */
const spelledOut = (kind: string): string => {
  const words = kind.replaceAll(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const STATUS_OF_EVENT: Readonly<Record<string, HistoryStatus>> = {
  approved: "in-review",
  changesRequested: "rejected",
  decided: "in-review",
  inReview: "in-review",
  published: "published",
  rejected: "rejected",
  retired: "retired",
  submitted: "in-review",
  superseded: "superseded",
  withdrawn: "withdrawn",
};

const TONE_OF_EVENT: Readonly<Record<string, DotTone>> = {
  ackRecorded: "ok",
  approved: "ok",
  changesRequested: "danger",
  decided: "ok",
  inReview: "info",
  published: "published",
  rejected: "danger",
  retired: "retired",
  superseded: "superseded",
  withdrawn: "withdrawn",
  workflowSignalApprove: "ok",
  workflowSignalReject: "danger",
};

/** An event's title in the history ("Published v2", "Final approval approved"), from its kind;
 *  a kind with no label yet is spelled out. `label` is its version as "v2". */
export const historyEventTitle = (
  t: (key: string, options: Record<string, string>) => string,
  event: HistoryEntry,
  label: string,
): string =>
  t(`reader.history.events.${event.kind}`, {
    defaultValue: spelledOut(event.kind),
    stage: event.stage ?? "",
    version: label.slice(1),
  });

/** A version's status in the history: its newest event that says one, else draft. */
const statusOfVersion = (events: readonly HistoryEntry[]): HistoryStatus => {
  for (const event of events.toReversed()) {
    const status = STATUS_OF_EVENT[event.kind];
    if (status) return status;
  }
  return "draft";
};

/**
 * History & approvals (U18): one group per version, the current one first and open, each a
 * timeline of that version's events, newest first. It's the append-only record, separate from
 * the approval stepper. The card itself is the shared `VersionHistory`.
 */
export const PolicyReaderHistory = ({ history }: { history: readonly HistoryEntry[] }) => {
  const { t } = useTranslation("policy");
  const groups: VersionHistoryGroup[] = groupHistoryByVersion(history).map((group, index) => {
    const label = versionLabel("policy", group.version);
    return {
      current: index === 0,
      events: group.events.toReversed().map((event) => ({
        at: event.at,
        detail:
          [event.actorName, event.comment ? `“${event.comment}”` : null]
            .filter(Boolean)
            .join(" · ") || undefined,
        title: historyEventTitle(t, event, label),
        tone: TONE_OF_EVENT[event.kind] ?? "neutral",
      })),
      label,
      status: statusOfVersion(group.events),
    };
  });
  return (
    <VersionHistory
      empty={t("reader.history.empty")}
      groups={groups}
      title={t("reader.history.title")}
    />
  );
};
