// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate, formatDayMonth, useTranslation } from "@steward-web/i18n";
import { Badge, Card, cn, EmptyState } from "@steward-web/ui";
import { Check, Inbox } from "lucide-react";
import { type ReactNode, useId } from "react";
import { Link } from "react-router";

import { type InboxEntry, overdueDays } from "./inbox";

export interface ApprovalsInboxProps {
  /** Runs you've already decided that are still moving (gateway #68; empty until then). */
  inProgress: readonly InboxEntry[];
  /** "Now", for the overdue pills. */
  now: Date;
  pending: readonly InboxEntry[];
  upcoming: readonly InboxEntry[];
}

type Group = "inProgress" | "pending" | "upcoming";

/** The table's five columns (U24): policy, stage, the group's own column, due, action. */
const columns = "grid grid-cols-[2fr_1.3fr_1.4fr_1fr_110px] items-center gap-3 px-[18px]";

const actionLink = {
  primary:
    "inline-flex h-[34px] items-center justify-self-end rounded-md bg-primary px-3.5 text-[13px] font-semibold text-on-primary hover:bg-primary-hover",
  secondary:
    "inline-flex h-[34px] items-center justify-self-end rounded-md border border-border-strong bg-surface px-3.5 text-[13px] font-semibold text-ink hover:bg-sunken",
} as const;

/** "POL-EXPENSES-000002 · v3". */
const meta = (entry: InboxEntry) => `${entry.number}${entry.version ? ` · v${entry.version}` : ""}`;

const OverduePill = ({ days }: { days: number }) => {
  const { t } = useTranslation("approvals");
  return <Badge tone="danger">{t("inbox.overdue", { count: days })}</Badge>;
};

const UpcomingBadge = () => {
  const { t } = useTranslation("approvals");
  return <Badge tone="info">{t("inbox.upcoming.badge")}</Badge>;
};

/** A row's Due cell: the overdue pill, the day it's due, or a quiet dot. */
const Due = ({ entry, now }: { entry: InboxEntry; now: Date }) => {
  const late = overdueDays(entry.dueAt, now);
  if (late !== null) return <OverduePill days={late} />;
  return entry.dueAt ? (
    <span>{formatDayMonth(entry.dueAt)}</span>
  ) : (
    <span className="text-muted">·</span>
  );
};

/** What the stage column says for each group. */
const StageCell = ({ entry, group }: { entry: InboxEntry; group: Group }) => {
  const { t } = useTranslation("approvals");
  if (group === "pending") {
    return (
      <span>
        {t("inbox.stageOf", {
          n: entry.stageNumber,
          stage: entry.stageName,
          total: entry.stageCount,
        })}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      {group === "upcoming" ? <UpcomingBadge /> : null}
      {t("inbox.stageN", { n: entry.stageNumber, total: entry.stageCount })}
    </span>
  );
};

/** What the group's own column says: who submitted, where the run is now, or your decision. */
const InfoCell = ({ entry, group }: { entry: InboxEntry; group: Group }) => {
  const { t } = useTranslation("approvals");
  if (group === "pending") {
    return entry.submittedBy ? (
      <span className="text-muted">
        {t("inbox.submittedBy", {
          date: formatDate(entry.submittedAt, { fallback: "" }),
          name: entry.submittedBy,
        })}
      </span>
    ) : null;
  }
  if (group === "upcoming") return <span className="text-muted">{entry.nowAt}</span>;
  return entry.decision ? (
    <span
      className={cn(
        "flex items-center gap-1.5",
        entry.decision === "approved" ? "text-ok" : "text-danger",
      )}
    >
      {entry.decision === "approved" ? <Check aria-hidden="true" className="size-4" /> : null}
      {t(`inbox.inProgress.${entry.decision}`, { date: formatDayMonth(entry.decidedAt) })}
    </span>
  ) : null;
};

const ACTION: Readonly<Record<Group, { label: string; tone: keyof typeof actionLink }>> = {
  inProgress: { label: "inbox.inProgress.view", tone: "secondary" },
  pending: { label: "inbox.review", tone: "primary" },
  upcoming: { label: "inbox.upcoming.preview", tone: "secondary" },
};

const INFO_COLUMN: Readonly<Record<Group, string>> = {
  inProgress: "inbox.columns.decision",
  pending: "inbox.columns.submitted",
  upcoming: "inbox.columns.nowAt",
};

/**
 * One group (U24): a card with its title (and what it means), the column header, then a row
 * per entry. On a phone (U24m) the table becomes a card per entry under "PENDING · 2".
 */
const InboxGroup = ({
  description,
  entries,
  group,
  now,
  title,
}: {
  description?: string;
  entries: readonly InboxEntry[];
  group: Group;
  now: Date;
  title: string;
}) => {
  const { t } = useTranslation("approvals");
  const titleId = useId();
  // Pending's own column shows who submitted; the gateway doesn't send that yet (gateway #52),
  // so the column waits for a row that has it.
  const info = group !== "pending" || entries.some((entry) => entry.submittedBy);
  const action = ACTION[group];
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3">
      <Card className="max-md:hidden">
        <div className="flex flex-col gap-0.5 border-b border-border-strong bg-sunken px-[18px] py-3">
          <h2 className="text-[15px] font-semibold" id={titleId}>
            {title}
          </h2>
          {description ? <p className="text-[13px] text-muted">{description}</p> : null}
        </div>
        <div aria-labelledby={titleId} role="table">
          <div role="rowgroup">
            <div
              className={cn(
                columns,
                "border-b border-border py-[9px] text-xs font-semibold text-muted",
              )}
              role="row"
            >
              <span role="columnheader">{t("inbox.columns.policy")}</span>
              <span role="columnheader">{t("inbox.columns.stage")}</span>
              {info ? <span role="columnheader">{t(INFO_COLUMN[group])}</span> : <span />}
              <span role="columnheader">{t("inbox.columns.due")}</span>
              <span />
            </div>
          </div>
          <div role="rowgroup">
            {entries.map((entry) => (
              <div
                aria-label={entry.title}
                className={cn(columns, "border-b border-border py-3 text-base last:border-b-0")}
                key={entry.key}
                role="row"
              >
                <span className="flex flex-col" role="cell">
                  <b className="font-semibold">{entry.title}</b>
                  <span className="font-mono text-xs text-muted">{meta(entry)}</span>
                </span>
                <span role="cell">
                  <StageCell entry={entry} group={group} />
                </span>
                <span role="cell">{info ? <InfoCell entry={entry} group={group} /> : null}</span>
                <span role="cell">
                  <Due entry={entry} now={now} />
                </span>
                <span className="flex justify-end" role="cell">
                  <Link className={actionLink[action.tone]} to={entry.href}>
                    {t(action.label)}
                  </Link>
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 md:hidden">
        <span className="mt-1.5 text-xs font-semibold tracking-[.06em] text-muted uppercase">
          {t("inbox.phoneGroup", { count: entries.length, title })}
        </span>
        <ul
          aria-label={t("inbox.phoneGroup", { count: entries.length, title })}
          className="flex flex-col gap-3"
        >
          {entries.map((entry) => {
            const late = overdueDays(entry.dueAt, now);
            return (
              <li
                className="flex flex-col gap-2 rounded-[10px] border border-border bg-surface p-3.5"
                key={entry.key}
              >
                <b className="text-md font-semibold">{entry.title}</b>
                <span className="font-mono text-xs text-muted">{meta(entry)}</span>
                {late === null ? (
                  <span className="text-sm text-muted">
                    {entry.dueAt
                      ? t("inbox.cardDue", {
                          date: formatDayMonth(entry.dueAt),
                          n: entry.stageNumber,
                          stage: entry.stageName,
                          total: entry.stageCount,
                        })
                      : t("inbox.stageOf", {
                          n: entry.stageNumber,
                          stage: entry.stageName,
                          total: entry.stageCount,
                        })}
                  </span>
                ) : (
                  <span className="flex">
                    <OverduePill days={late} />
                  </span>
                )}
                <Link
                  className={cn(
                    "flex h-11 items-center justify-center rounded-lg text-[15px] font-semibold",
                    action.tone === "primary"
                      ? "bg-primary text-on-primary"
                      : "border border-border-strong bg-surface text-ink",
                  )}
                  to={entry.href}
                >
                  {t(action.label)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

const Empty = ({ children }: { children?: ReactNode }) => {
  const { t } = useTranslation("approvals");
  return (
    <EmptyState
      action={children}
      description={t("inbox.empty.description")}
      framed
      icon={<Inbox className="size-6" />}
      title={t("inbox.empty.title")}
    />
  );
};

/**
 * The approvals inbox (U24, U24m): "Drafts awaiting your decision." then Pending (yours to
 * decide), Coming to you (a later stage of yours, to preview) and In progress (decided, still
 * moving). A group with nothing in it is left out; with nothing pending, the empty state takes
 * Pending's place. Full width (decision 2-layout-and-navigation.s9).
 */
export const ApprovalsInbox = ({ inProgress, now, pending, upcoming }: ApprovalsInboxProps) => {
  const { t } = useTranslation("approvals");
  return (
    <div className="flex flex-col gap-[22px] px-4 py-[18px] text-ink md:px-8 md:py-7">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted max-md:hidden">{t("inbox.eyebrow")}</span>
        <h1 className="text-[26px] font-semibold md:text-[30px] md:leading-[38px]">
          {t("inbox.title")}
        </h1>
        <p className="text-base text-muted md:text-[15px]">{t("inbox.subtitle")}</p>
      </div>
      {pending.length > 0 ? (
        <InboxGroup entries={pending} group="pending" now={now} title={t("inbox.pending.title")} />
      ) : (
        <Empty />
      )}
      {upcoming.length > 0 ? (
        <InboxGroup
          description={t("inbox.upcoming.description")}
          entries={upcoming}
          group="upcoming"
          now={now}
          title={t("inbox.upcoming.title")}
        />
      ) : null}
      {inProgress.length > 0 ? (
        <InboxGroup
          description={t("inbox.inProgress.description")}
          entries={inProgress}
          group="inProgress"
          now={now}
          title={t("inbox.inProgress.title")}
        />
      ) : null}
    </div>
  );
};
