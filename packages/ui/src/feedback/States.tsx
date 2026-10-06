import { useTranslation } from "@steward-web/i18n";
import { type ReactNode } from "react";

import { Button } from "#ui/components/Button";
import { cn } from "#ui/lib/cn";

import type { Failure } from "./failure";

import { DiagnosticsSlot } from "./DiagnosticsSlot";

/** The one empty state: a title, one line and an optional action. */
export const EmptyState = ({
  action,
  className,
  description,
  title,
}: {
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  title: ReactNode;
}) => (
  <div className={cn("grid justify-items-center gap-2 px-6 py-10 text-center", className)}>
    <p className="text-md font-semibold text-ink">{title}</p>
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

/** "Policy not found" and the like, with a way back. */
export const NotFound = ({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}) => <EmptyState action={action} description={description} title={title} />;
