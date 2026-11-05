// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatNumber, formatPercent, useTranslation } from "@steward-web/i18n";
import { ChevronRight } from "lucide-react";
import { useId } from "react";
import { Link } from "react-router";

import { cn } from "#ui/lib/cn";

/**
 * An admin stat card (A1; decision 4-components.s9): a link with its label and a chevron over
 * the number, to the list it counts.
 */
export const StatCard = ({
  className,
  label,
  to,
  value,
}: {
  className?: string;
  label: string;
  to: string;
  value: number;
}) => (
  <Link
    className={cn(
      "flex flex-col gap-1 rounded-lg border border-border bg-surface px-3.5 py-3 text-ink no-underline transition-shadow hover:text-ink hover:shadow-[var(--shadow-2)]",
      className,
    )}
    to={to}
  >
    <span className="flex justify-between text-xs text-muted">
      {label}
      <ChevronRight aria-hidden="true" className="size-[1.15em]" />
    </span>
    <b className="text-2xl font-semibold">{formatNumber(value)}</b>
  </Link>
);

/** The acknowledgement snapshot (A1): "184 of 214", a 10 px plum bar, and the percentage. */
export const AckSnapshot = ({
  acknowledged,
  audience,
  className,
}: {
  acknowledged: number;
  audience: number;
  className?: string;
}) => {
  const { t } = useTranslation("common");
  const titleId = useId();
  const ratio = audience > 0 ? acknowledged / audience : 0;
  const counts = { acknowledged: formatNumber(acknowledged), audience: formatNumber(audience) };
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-3.5 text-base text-ink",
        className,
      )}
    >
      <h2 className="font-bold" id={titleId}>
        {t("ackSnapshot.title")}
      </h2>
      <span className="text-[26px] leading-tight font-semibold">{t("ackSnapshot.of", counts)}</span>
      <div
        aria-label={t("ackSnapshot.title")}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(ratio * 100)}
        className="h-2.5 overflow-hidden rounded-[5px] bg-sunken"
        role="progressbar"
      >
        <div className="h-full bg-primary" style={{ width: `${ratio * 100}%` }} />
      </div>
      <span className="text-muted">
        {t("ackSnapshot.caption", { ...counts, percent: formatPercent(ratio) })}
      </span>
    </section>
  );
};
