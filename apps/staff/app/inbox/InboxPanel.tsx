// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDayMonth, formatTime, useTranslation } from "@steward-web/i18n";
import { cn, EmptyState } from "@steward-web/ui";
import { Bell } from "lucide-react";
import { useId, useState } from "react";
import { Link } from "react-router";

/** One in-app notice, as the inbox shows it (steward-gateway#74 will send these). */
export interface InboxNotice {
  at: string;
  body: string;
  /** Where it leads: the approval, the policy, the case. */
  href?: string;
  id: string;
  needsAction: boolean;
  read: boolean;
  title: string;
}

type Filter = "action" | "all" | "updates";

const FILTERS: readonly Filter[] = ["all", "action", "updates"];

/** "09:02" today, else "2 Oct". */
const when = (at: string, now: Date) => {
  const date = new Date(at);
  return date.toDateString() === now.toDateString() ? formatTime(date) : formatDayMonth(date);
};

export interface InboxPanelProps {
  notices: readonly InboxNotice[];
  now?: Date;
  onMarkAllRead: () => void;
}

/**
 * The in-app inbox (U36): "Notifications" with the unread count and Mark all read; All, Needs
 * action and Updates; each notice with an unread dot and bold title, its line and when it
 * came, leading to its subject; then the notification settings. Empty: "No notifications".
 */
export const InboxPanel = ({ notices, now = new Date(), onMarkAllRead }: InboxPanelProps) => {
  const { t } = useTranslation("shell");
  const [filter, setFilter] = useState<Filter>("all");
  const titleId = useId();
  const unread = notices.filter((notice) => !notice.read).length;
  const shown = notices.filter((notice) =>
    filter === "all" ? true : filter === "action" ? notice.needsAction : !notice.needsAction,
  );

  return (
    <section
      aria-labelledby={titleId}
      className="overflow-hidden rounded-xl border border-border bg-surface text-base text-ink shadow-[var(--shadow-3)]"
    >
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
        <h2 className="text-md font-bold" id={titleId}>
          {t("inbox.title")}
        </h2>
        {unread > 0 ? (
          <>
            <span
              aria-label={t("inbox.unreadCount", { count: unread })}
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-on-primary"
              role="img"
            >
              {unread}
            </span>
            <button
              className="ml-auto text-[13px] font-semibold text-primary hover:underline"
              onClick={onMarkAllRead}
              type="button"
            >
              {t("inbox.markAllRead")}
            </button>
          </>
        ) : null}
      </div>
      <div
        aria-label={t("inbox.filters")}
        className="flex gap-1 border-b border-border px-2.5 py-1 text-[13px]"
        role="tablist"
      >
        {FILTERS.map((value) => (
          <button
            aria-selected={filter === value}
            className={cn(
              "rounded-md px-2.5 py-1.5",
              filter === value && "bg-sunken font-semibold",
            )}
            key={value}
            onClick={() => setFilter(value)}
            role="tab"
            type="button"
          >
            {t(`inbox.filter.${value}`)}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState
          description={t("inbox.empty.body")}
          icon={<Bell className="size-[22px]" />}
          title={t("inbox.empty.title")}
        />
      ) : (
        <ul>
          {shown.map((notice) => (
            <li className="border-b border-border" key={notice.id}>
              <Link
                className={cn(
                  "grid grid-cols-[10px_1fr_auto] gap-2.5 px-4 py-3 hover:bg-sunken",
                  !notice.read && "bg-primary-soft",
                )}
                to={notice.href ?? "/inbox"}
              >
                <span
                  aria-hidden="true"
                  className={cn("mt-1.5 size-2 rounded-full", !notice.read && "bg-primary")}
                />
                <span className="flex flex-col gap-0.5">
                  <span className={notice.read ? "font-normal" : "font-bold"}>{notice.title}</span>
                  {notice.read ? null : <span className="sr-only">{t("inbox.unread")}</span>}
                  <span className="text-[13px] text-muted">{notice.body}</span>
                </span>
                <span className="font-mono text-xs text-muted">{when(notice.at, now)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-end px-4 py-3 text-[13px]">
        <Link className="text-muted hover:text-ink" to="/profile/notifications">
          {t("inbox.settings")}
        </Link>
      </div>
    </section>
  );
};
