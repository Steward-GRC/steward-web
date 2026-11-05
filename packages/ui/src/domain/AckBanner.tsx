// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate, useTranslation } from "@steward-web/i18n";
import { BookOpen, Check } from "lucide-react";
import { type ReactNode } from "react";

export interface AckBannerProps {
  ackedAt?: null | string;
  /** Pending only: the Acknowledge trigger (the D1 dialog). */
  action?: ReactNode;
  state: "done" | "pending";
}

/**
 * The acknowledgement banner (U8). Pending is soft plum, the colour of the action, not a
 * warning, and it carries no Copy diagnostics; on a phone it's pinned to the bottom (U7m).
 * Done shrinks to a quiet card with a green tick and the date. The live region says
 * "Acknowledged" when it changes.
 */
export const AckBanner = ({ ackedAt, action, state }: AckBannerProps) => {
  const { t } = useTranslation("policy");
  return (
    <>
      <span aria-live="polite" className="sr-only" role="status">
        {state === "done" ? t("reader.ack.doneTitle") : null}
      </span>
      {state === "pending" ? (
        <div
          className="flex items-center gap-[18px] rounded-lg bg-primary-soft px-5 py-4 text-on-primary-soft shadow-[inset_0_0_0_1px_var(--primary)] max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-[var(--z-sticky)] max-md:flex-col max-md:items-stretch max-md:gap-2 max-md:rounded-none max-md:border-t-[1.5px] max-md:border-primary max-md:px-4 max-md:pt-3 max-md:pb-5 max-md:shadow-none max-md:[&_button]:h-12 max-md:[&_button]:w-full max-md:[&_button]:rounded-[8px] max-md:[&_button]:text-[15px] md:[&_button]:h-10 md:[&_button]:px-[18px] md:[&_button]:text-base"
          data-state="pending"
          data-testid="ack-banner"
        >
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary max-md:hidden"
          >
            <BookOpen className="size-5" />
          </span>
          <div className="flex flex-1 flex-col gap-0.5 max-md:gap-2">
            <span className="text-md font-semibold max-md:text-[15px]">
              {t("reader.ack.pendingTitle")}
            </span>
            <span className="text-base leading-[1.45] max-md:text-sm max-md:leading-[1.4]">
              {t("reader.ack.pendingBody")}
            </span>
          </div>
          {action}
        </div>
      ) : (
        <div
          className="flex items-center gap-4 rounded-lg bg-surface px-5 py-3.5 shadow-[inset_0_0_0_1px_var(--border)]"
          data-state="done"
          data-testid="ack-banner"
        >
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok"
          >
            <Check className="size-5" />
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-md font-semibold">{t("reader.ack.doneTitle")}</span>
            <span className="text-base text-muted">
              {t("reader.ack.doneBody", { date: formatDate(ackedAt) })}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
