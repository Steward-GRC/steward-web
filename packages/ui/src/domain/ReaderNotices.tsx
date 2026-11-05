// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Clock, History, Info, Undo2, XCircle } from "lucide-react";
import { type ReactNode, useState } from "react";

import { cn } from "#ui/lib/cn";

/** How much a notice weighs (U10): errors and blockers are danger, changes requested warn. */
export type NoticeTone = "danger" | "info" | "neutral" | "warn";

export interface ReaderNotice {
  action?: ReactNode;
  body: string;
  /** Stable key; also the order the notices stack in. */
  id: string;
  title: string;
  tone: NoticeTone;
}

const EDGE: Record<NoticeTone, string> = {
  danger: "shadow-[inset_3px_0_var(--danger),inset_0_0_0_1px_var(--border)]",
  info: "shadow-[inset_3px_0_var(--info),inset_0_0_0_1px_var(--border)]",
  neutral: "shadow-[inset_3px_0_var(--neutral),inset_0_0_0_1px_var(--border)]",
  warn: "shadow-[inset_3px_0_var(--warn),inset_0_0_0_1px_var(--border)]",
};

const ICON: Record<NoticeTone, ReactNode> = {
  danger: <XCircle aria-hidden="true" className="size-[18px] text-danger" />,
  info: <Clock aria-hidden="true" className="size-[18px] text-info" />,
  neutral: <History aria-hidden="true" className="size-[18px] text-neutral" />,
  warn: <Undo2 aria-hidden="true" className="size-[18px] text-warn" />,
};

/** No more than this many show at once; the rest fold into "+n more notices". */
const SHOWN = 3;

/**
 * The draft and revision notices (U10): one pattern above the body, a coloured left edge by
 * weight, an icon, a title, a line and an action, stacked in a fixed order with at most three
 * shown at once.
 */
export const ReaderNotices = ({ notices }: { notices: readonly ReaderNotice[] }) => {
  const { t } = useTranslation("policy");
  const [all, setAll] = useState(false);
  if (notices.length === 0) return null;
  const shown = all ? notices : notices.slice(0, SHOWN);
  const folded = notices.length - shown.length;
  return (
    <div className="flex flex-col gap-2.5 text-base leading-[1.45]">
      {shown.map((notice) => (
        <div
          className={cn(
            "flex items-center gap-3.5 rounded-lg px-4 py-3",
            notice.tone === "danger"
              ? "bg-danger-soft"
              : notice.id === "changesRequested"
                ? "bg-warn-soft"
                : "bg-surface",
            EDGE[notice.tone],
          )}
          key={notice.id}
          role="note"
        >
          {notice.tone === "info" &&
          notice.id !== "inReview" &&
          notice.id !== "inReviewRevision" ? (
            <Info aria-hidden="true" className="size-[18px] text-info" />
          ) : (
            ICON[notice.tone]
          )}
          <div className="flex flex-1 flex-col gap-px">
            <span className="font-semibold">{notice.title}</span>
            {notice.body ? <span className="text-muted">{notice.body}</span> : null}
          </div>
          {notice.action ? (
            <span className="font-semibold whitespace-nowrap text-primary">{notice.action}</span>
          ) : null}
        </div>
      ))}
      {folded > 0 ? (
        <button
          className="self-start text-sm font-semibold text-primary hover:text-primary-hover"
          onClick={() => setAll(true)}
          type="button"
        >
          {t("reader.notices.more", { count: folded })}
        </button>
      ) : null}
    </div>
  );
};
