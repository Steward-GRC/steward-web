// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AckActivityDay } from "@steward-web/api-client";

import { formatDate, formatNumber, formatPercent, useTranslation } from "@steward-web/i18n";
import { cn } from "@steward-web/ui";
import { useId, useRef } from "react";

/** A calendar day ("2026-10-02") read at midday, so no time zone moves it to the day before. */
const dayOf = (date: string) => (/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00` : date);

const CARD = "flex flex-col gap-2.5 rounded-[10px] border border-border bg-surface p-4";

/**
 * "Acknowledged vs not yet" (A14): a 150 px ring, plum for acknowledged over the redaction
 * grey, with the percentage and "167 of 214" in its middle, and the legend under it.
 */
export const CompletionDonut = ({
  acked,
  audience,
  completionPct,
}: {
  acked: number;
  audience: number;
  /** The gateway's own completion percentage (0 to 100), the same as the stat card's. */
  completionPct: number;
}) => {
  const { t } = useTranslation("admin");
  const titleId = useId();
  const ratio = completionPct / 100;
  const percent = formatPercent(ratio);
  const of = t("completion.detail.donut.of", {
    acked: formatNumber(acked),
    audience: formatNumber(audience),
  });
  return (
    <section aria-labelledby={titleId} className={cn(CARD, "items-center")}>
      <h2 className="self-start font-bold" id={titleId}>
        {t("completion.detail.donut.title")}
      </h2>
      <div
        aria-label={`${percent}, ${of}`}
        className="flex size-[150px] items-center justify-center rounded-full"
        role="img"
        style={{
          background: `conic-gradient(var(--primary) 0 ${ratio * 100}%, var(--redact) ${ratio * 100}% 100%)`,
        }}
      >
        <div
          aria-hidden="true"
          className="flex size-[106px] flex-col items-center justify-center rounded-full bg-surface"
        >
          <b className="text-2xl">{percent}</b>
          <span className="text-[11px] text-muted">{of}</span>
        </div>
      </div>
      <div className="flex gap-3 text-xs">
        <span className="flex items-center gap-[5px]">
          <span aria-hidden="true" className="size-2.5 rounded-[2px] bg-primary" />
          {t("completion.detail.donut.acknowledged")}
        </span>
        <span className="flex items-center gap-[5px]">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[2px]"
            style={{ background: "var(--redact)" }}
          />
          {t("completion.detail.donut.notYet")}
        </span>
      </div>
    </section>
  );
};

export const ACTIVITY_DAYS = [30, 90] as const;

/**
 * "Activity over time" (A14): acknowledgements per day as plum bars on a 130 px baseline, each
 * labelled "{date}: {n}" for screen readers, with the 30 / 90 days switch.
 */
export const ActivityBars = ({
  activity,
  days,
  onDaysChange,
}: {
  activity: null | readonly AckActivityDay[];
  days: number;
  onDaysChange: (days: number) => void;
}) => {
  const { t } = useTranslation("admin");
  const titleId = useId();
  const most = Math.max(1, ...(activity ?? []).map((day) => day.acks));
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <section aria-labelledby={titleId} className={CARD}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold" id={titleId}>
          {t("completion.detail.activity.title")}
        </h2>
        <div
          aria-label={t("completion.detail.activity.period")}
          className="flex rounded-[5px] bg-sunken p-0.5 text-xs"
          role="radiogroup"
        >
          {ACTIVITY_DAYS.map((option, index) => (
            <button
              aria-checked={days === option}
              className={cn(
                "rounded px-2 py-[3px]",
                days === option && "bg-surface font-semibold shadow-[var(--shadow-1)]",
              )}
              key={option}
              onClick={() => onDaysChange(option)}
              onKeyDown={(event) => {
                // A radio group is one tab stop; the arrow keys move and choose (APG radio).
                const step = { ArrowDown: 1, ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1 }[event.key];
                if (!step) return;
                event.preventDefault();
                const next = (index + step + ACTIVITY_DAYS.length) % ACTIVITY_DAYS.length;
                radios.current[next]?.focus();
                onDaysChange(ACTIVITY_DAYS[next]!);
              }}
              ref={(element) => {
                radios.current[index] = element;
              }}
              role="radio"
              tabIndex={days === option ? 0 : -1}
              type="button"
            >
              {t("completion.detail.activity.days", { count: option })}
            </button>
          ))}
        </div>
      </div>
      {activity ? (
        <>
          <div
            aria-label={t("completion.detail.activity.label")}
            className="flex h-[130px] items-end gap-[5px] border-b border-border-strong"
            role="group"
          >
            {activity.map((day) => (
              <span
                aria-label={t("completion.detail.activity.bar", {
                  count: day.acks,
                  date: formatDate(dayOf(day.date)),
                })}
                className="flex-1 rounded-t-[2px] bg-primary"
                key={day.date}
                role="img"
                style={{ height: `${(day.acks / most) * 100}%` }}
              />
            ))}
          </div>
          {activity.every((day) => day.acks === 0) ? (
            <span className="text-xs text-muted">{t("completion.detail.activity.empty")}</span>
          ) : (
            <span className="text-xs text-muted">{t("completion.detail.activity.label")}</span>
          )}
        </>
      ) : (
        <p className="text-sm text-muted">{t("completion.detail.activity.unavailable")}</p>
      )}
    </section>
  );
};
