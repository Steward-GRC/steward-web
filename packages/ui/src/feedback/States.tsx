// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { FileQuestion } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router";

import { Button } from "#ui/components/Button";
import { Loader } from "#ui/brand/Mark";
import { Skeleton } from "#ui/components/Display";
import { cn } from "#ui/lib/cn";

import type { Failure } from "./failure";

import { DiagnosticsSlot } from "./DiagnosticsSlot";

/**
 * The one empty state: an optional icon, a title, one line and an optional action. `framed` puts
 * it on its own card for a spot that isn't inside one.
 */
export const EmptyState = ({
  action,
  className,
  compact,
  description,
  framed,
  icon,
  title,
}: {
  action?: ReactNode;
  className?: string;
  /** One muted line, for an empty list inside a card. */
  compact?: boolean;
  description?: ReactNode;
  framed?: boolean;
  icon?: ReactNode;
  title?: ReactNode;
}) => (
  <div
    className={cn(
      "grid justify-items-center gap-2 px-6 py-10 text-center",
      compact && "py-4",
      framed && "rounded-lg border border-border bg-surface",
      className,
    )}
    data-testid="empty-state"
  >
    {icon ? (
      <span aria-hidden="true" className="flex text-muted">
        {icon}
      </span>
    ) : null}
    {title ? (
      <p className={compact ? "text-sm text-muted" : "text-md font-semibold text-ink"}>{title}</p>
    ) : null}
    {description ? <p className="max-w-md text-base text-muted">{description}</p> : null}
    {action ? <div className="mt-2">{action}</div> : null}
  </div>
);

export interface ReachErrorProps {
  /** What couldn't be done, as in "Couldn't {action}": "load your work". */
  action: ReactNode;
  className?: string;
  failure?: Failure;
  onRetry?: () => void;
  /** True while the retry runs. */
  retrying?: boolean;
}

/**
 * The retryable "couldn't reach" block, with its reference number and Copy diagnostics.
 * A business error shows the server's own message inline instead.
 */
export const ReachError = ({ action, className, failure, onRetry, retrying }: ReachErrorProps) => {
  const { t } = useTranslation("errors");
  const reference = failure?.requestId ?? failure?.traceId;
  return (
    <div
      className={cn("grid gap-2 rounded-lg border border-border bg-surface px-5 py-4", className)}
      role="alert"
    >
      <p className="font-semibold text-ink">{t("reach.title", { action })}</p>
      <p className="text-base text-muted">{t("reach.description")}</p>
      {reference ? (
        <p className="font-mono text-sm text-muted">{t("reach.reference", { reference })}</p>
      ) : null}
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {onRetry ? (
          <Button busy={retrying} onClick={onRetry} size="sm" variant="secondary">
            {retrying ? t("reach.retrying") : t("reach.retry")}
          </Button>
        ) : null}
        <DiagnosticsSlot failure={failure} />
      </div>
    </div>
  );
};

/**
 * Not found (U7s; decision 6-states.s3): a file icon, "Policy not found", "No policy matches
 * {number}." and the way back, "← Back to policies", on a surface card.
 */
export const NotFound = ({
  action,
  back,
  className,
  description,
  title,
}: {
  action?: ReactNode;
  back?: { label: string; to: string };
  className?: string;
  description?: ReactNode;
  title: ReactNode;
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-2.5 rounded-lg border border-border bg-surface px-5 py-7 text-center text-ink",
      className,
    )}
  >
    <FileQuestion aria-hidden="true" className="size-[26px] text-muted" />
    <h1 className="text-md font-semibold">{title}</h1>
    {description ? <p className="text-base text-muted">{description}</p> : null}
    {back ? (
      <Link
        className="flex h-9 items-center rounded-md px-3.5 text-sm font-semibold text-ink no-underline shadow-[inset_0_0_0_1px_var(--border-strong)] hover:bg-sunken hover:text-ink"
        to={back.to}
      >
        ← {back.label}
      </Link>
    ) : null}
    {action}
  </div>
);

/**
 * Skeleton loading (U7s; decision 6-states.s1): sunken bars in the shape of a page, busy, with
 * the screen-reader text ("Loading policy…"). The shimmer stops with reduced motion.
 */
export const PageSkeleton = ({ className, label }: { className?: string; label: string }) => (
  <div
    aria-busy="true"
    className={cn(
      "flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-5",
      className,
    )}
    role="status"
  >
    <span className="sr-only">{label}</span>
    <Loader className="mb-1 self-center" decorative size={44} />
    <Skeleton className="h-3 w-2/5 rounded-sm" />
    <Skeleton className="h-[26px] w-4/5 rounded-sm" />
    <Skeleton className="h-3 w-1/2 rounded-sm" />
    <Skeleton className="mt-1.5 h-[60px] rounded-[8px]" />
    <Skeleton className="h-2.5 w-[95%] rounded-sm" />
    <Skeleton className="h-2.5 w-[90%] rounded-sm" />
    <Skeleton className="h-2.5 w-[70%] rounded-sm" />
  </div>
);

/**
 * The loading state for a table or a list (bug log item 21): the animated book mark over rows
 * the shape of the real ones, busy, with the screen-reader text. It waits `delay` ms first, so
 * a load that comes back quickly never flashes it. The shimmer and the mark stop with reduced
 * motion.
 */
export const ListSkeleton = ({
  className,
  delay = 300,
  label,
  rows = 5,
}: {
  className?: string;
  delay?: number;
  label: string;
  rows?: number;
}) => {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  if (!shown) return null;
  return (
    <div
      aria-busy="true"
      className={cn("flex flex-col gap-3 rounded-lg border border-border bg-surface p-5", className)}
      role="status"
    >
      <span className="sr-only">{label}</span>
      <Loader className="self-center" decorative size={44} />
      {Array.from({ length: rows }, (_, index) => (
        <div className="flex items-center gap-3" data-skeleton-row="" key={index}>
          <Skeleton className="h-3.5 w-1/3 rounded-sm" />
          <Skeleton className="h-3 w-1/4 rounded-sm" />
          <Skeleton className="ml-auto h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
};
