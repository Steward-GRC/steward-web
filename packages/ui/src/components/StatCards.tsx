// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatNumber, formatPercent, useTranslation } from "@steward-web/i18n";
import { ChevronRight } from "lucide-react";
import { type ReactNode, useId } from "react";
import { Link } from "react-router";

import { cn } from "#ui/lib/cn";

import { Tally } from "./Badges";

/**
 * An admin stat card (A1; decision 4-components.s9): a link with its label and a chevron over
 * the number, to the list it counts.
 */
export const StatCard = ({
  className,
  icon,
  label,
  size = "md",
  to,
  value,
}: {
  className?: string;
  /** An icon before the label, as My work's role cards have (U1). */
  icon?: ReactNode;
  label: string;
  /** "md" is the admin Overview's card (A1); "lg" is My work's role card (U1). */
  size?: "lg" | "md";
  to: string;
  value: number;
}) => (
  <Link
    aria-label={`${label} ${formatNumber(value)}`}
    className={cn(
      "flex flex-col rounded-lg border border-border bg-surface text-ink no-underline transition-shadow hover:text-ink hover:shadow-[var(--shadow-2)]",
      size === "lg" ? "gap-1.5 px-[18px] py-4 shadow-[var(--shadow-1)]" : "gap-1 px-3.5 py-3",
      className,
    )}
    data-stat-card={size}
    to={to}
  >
    <span
      className={cn(
        "flex items-center justify-between text-muted",
        size === "lg" ? "text-sm font-medium" : "text-xs",
      )}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ChevronRight aria-hidden="true" className="size-[1.15em]" />
    </span>
    <Tally className="self-start" size="lg">
      {formatNumber(value)}
    </Tally>
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
      <Tally className="self-start" size="lg">
        {t("ackSnapshot.of", counts)}
      </Tally>
      <div
        aria-label={t("ackSnapshot.title")}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(ratio * 100)}
        className="h-2.5 overflow-hidden rounded-[5px] bg-sunken"
        role="progressbar"
      >
        <div
          className="h-full bg-accent"
          data-testid="progress-fill"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="text-muted">
        {t("ackSnapshot.caption", { ...counts, percent: formatPercent(ratio) })}
      </span>
    </section>
  );
};
