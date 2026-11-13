// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDateTime, useTranslation } from "@steward-web/i18n";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type ReactNode, useId, useState } from "react";

import { Card, CardHeader } from "#ui/components/Display";
import { EmptyState } from "#ui/feedback/States";

type DotTone =
  | "danger"
  | "info"
  | "neutral"
  | "ok"
  | "published"
  | "retired"
  | "superseded"
  | "withdrawn";

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

export type VersionHistoryKind = "policy" | "procedure" | "template";

/**
 * A version as the history shows it. Templates keep plain versions (v1, v2, v3); policies and
 * procedures show semantic ones (v1.0.1). Only the label differs between the three (#89).
 */
export const versionLabel = (
  kind: VersionHistoryKind,
  version: number | string,
  semantic?: null | string,
): string => {
  if (kind === "template") {
    const ordinal = `v${String(version).replace(/^v/, "").split(".", 1)[0]}`;
    // the semantic version sits beside the number core keeps (#390)
    return semantic ? `${ordinal} (${semantic})` : ordinal;
  }
  return withV(String(version));
};

export interface VersionHistoryEvent {
  at?: string;
  detail?: string;
  title: string;
  tone: DotTone;
}

export interface VersionHistoryGroup {
  current: boolean;
  events: readonly VersionHistoryEvent[];
  /** The label as shown ("v2", "v1.0.1"); build it with `versionLabel`. */
  label: string;
  /** Muted words beside the label, such as the version's ordinal under a semantic label. */
  note?: string;
  status: HistoryStatus;
}

export type { DotTone, HistoryStatus };

const VersionGroup = ({ group }: { group: VersionHistoryGroup }) => {
  const { t } = useTranslation("policy");
  const { current, events, label, note, status } = group;
  const [open, setOpen] = useState(current);
  const panelId = useId();
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
        {note ? <span className="font-normal text-muted">{note}</span> : null}
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
          {events.map((event, index) => {
            const tone = event.tone;
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
                    {event.title}
                  </span>
                  {event.detail ? <span className="text-muted">{event.detail}</span> : null}
                </div>
                {event.at ? (
                  <span className="col-start-2 font-mono text-xs text-muted sm:col-start-3 sm:text-right">
                    {formatDateTime(event.at)}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
};

/**
 * The version history card (U18, #89): one group per version, the current one first and open,
 * each a timeline of that version's events with a dot coloured by status and the time in mono.
 * Policies, procedures and templates all draw it, so they look alike.
 */
export const VersionHistory = ({
  empty,
  groups,
  title,
}: {
  empty?: ReactNode;
  groups: readonly VersionHistoryGroup[];
  title: string;
}) => {
  const titleId = useId();
  return (
    <Card aria-labelledby={titleId} className="text-ink">
      <CardHeader>
        <h2 id={titleId}>{title}</h2>
      </CardHeader>
      {groups.length === 0 ? (
        <EmptyState title={empty ?? ""} />
      ) : (
        groups.map((group) => <VersionGroup group={group} key={group.label} />)
      )}
    </Card>
  );
};
