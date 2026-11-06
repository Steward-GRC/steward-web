import { formatDateTime, useTranslation } from "@steward-web/i18n";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useId, useState } from "react";

// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Card, CardHeader } from "#ui/components/Display";
import { EmptyState } from "#ui/feedback/States";

import type { HistoryEntry } from "./policyReaderModel";

import { groupHistoryByVersion } from "./policyReaderModel";

/** A kind with no label yet, in words: "workflowStageEscalated" -> "Workflow stage escalated". */
const spelledOut = (kind: string): string => {
  const words = kind.replaceAll(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** The history's status words: the five pills plus the three that are history events only. */
type HistoryStatus =
  | "approved"
  | "draft"
  | "in-review"
  | "published"
  | "rejected"
  | "retired"
  | "superseded"
  | "withdrawn";

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

type DotTone =
  | "danger"
  | "info"
  | "neutral"
  | "ok"
  | "published"
  | "retired"
  | "superseded"
  | "withdrawn";

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

const DOT_COLOUR: Readonly<Record<DotTone, string>> = {
  danger: "var(--danger)",
  info: "var(--info)",
  neutral: "var(--neutral)",
  ok: "var(--ok)",
  published: "var(--status-published)",
  retired: "var(--status-retired)",
  superseded: "var(--status-superseded)",
  withdrawn: "var(--status-withdrawn)",
};

/** "2" or "v2" as "v2". */
export const withV = (version: string) => (version.startsWith("v") ? version : `v${version}`);

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

const VersionGroup = ({
  current,
  events,
  version,
}: {
  current: boolean;
  events: readonly HistoryEntry[];
  version: string;
}) => {
  const { t } = useTranslation("policy");
  const [open, setOpen] = useState(current);
  const panelId = useId();
  const label = withV(version);
  const status = statusOfVersion(events);
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-5 py-3 text-left text-base font-semibold"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Chevron aria-hidden="true" className="size-4 shrink-0" />
        <span className="font-mono">{label}</span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold hc:outline hc:outline-1"
          style={{ background: `var(--status-${status}-soft)`, color: `var(--status-${status})` }}
        >
          {t(`status.${status}`)}
        </span>
        {current ? (
          <span className="font-normal text-muted">{t("reader.history.current")}</span>
        ) : null}
      </button>
      {open ? (
        <ol
          aria-label={label}
          className="flex flex-col border-t border-border pt-4 pr-5 pb-[18px] pl-[46px] text-base leading-[1.45]"
          id={panelId}
        >
          {events.toReversed().map((event, index) => {
            const tone = TONE_OF_EVENT[event.kind] ?? "neutral";
            const detail = [event.actorName, event.comment ? `“${event.comment}”` : null]
              .filter(Boolean)
              .join(" · ");
            return (
              <li
                className="grid grid-cols-[20px_1fr] gap-3 pb-3.5 sm:grid-cols-[20px_1fr_140px]"
                data-tone={tone}
                key={index}
              >
                <span
                  aria-hidden="true"
                  className="mt-1 size-3 rounded-full"
                  style={{
                    background: DOT_COLOUR[tone],
                    boxShadow: `0 0 0 3px var(--surface), 0 0 0 4px ${DOT_COLOUR[tone]}`,
                  }}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold" data-testid="history-event-title">
                    {historyEventTitle(t, event, label)}
                  </span>
                  {detail ? <span className="text-muted">{detail}</span> : null}
                </div>
                <span className="col-start-2 font-mono text-xs text-muted sm:col-start-3 sm:text-right">
                  {formatDateTime(event.at)}
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
};

/**
 * History & approvals (U18): one group per version, the current one first and open, each a
 * timeline of that version's events, newest first, with a dot coloured by status and the time
 * in mono. It's the append-only record, separate from the approval stepper.
 */
export const PolicyReaderHistory = ({ history }: { history: readonly HistoryEntry[] }) => {
  const { t } = useTranslation("policy");
  const groups = groupHistoryByVersion(history);
  const titleId = useId();

  return (
    <Card aria-labelledby={titleId} className="text-ink">
      <CardHeader>
        <h2 id={titleId}>{t("reader.history.title")}</h2>
      </CardHeader>
      {groups.length === 0 ? (
        <EmptyState title={t("reader.history.empty")} />
      ) : (
        groups.map((group, index) => (
          <VersionGroup
            current={index === 0}
            events={group.events}
            key={group.version}
            version={group.version}
          />
        ))
      )}
    </Card>
  );
};
