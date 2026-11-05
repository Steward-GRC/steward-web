// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Check, Circle, CircleX } from "lucide-react";

import { Button } from "#ui/components/Button";
import { Progress } from "#ui/components/Display";
import { cn } from "#ui/lib/cn";

export type AiJobStage = "done" | "failed" | "finalizing" | "generating" | "queued" | "retrieving";

const STEPS = ["queued", "retrieving", "generating", "finalizing"] as const;

const PERCENT: Record<AiJobStage, number> = {
  done: 100,
  failed: 100,
  finalizing: 90,
  generating: 70,
  queued: 10,
  retrieving: 35,
};

export interface AiJobProgressProps {
  className?: string;
  /** The one-line form, for a menu or a chat turn. */
  compact?: boolean;
  /** Why it failed, shown after "Failed ·". */
  error?: null | string;
  /** Shows "Try again" on a failure. */
  onRetry?: () => void;
  stage: AiJobStage;
}

/**
 * Every AI task's progress (U28): the stage and "step n of 4", a bar, and the four steps
 * (Queued, Retrieving context, Generating, Finalizing), or one line in the compact form. A
 * failure says why and offers Try again. It's a polite live region, so each stage is read out.
 */
export const AiJobProgress = ({
  className,
  compact = false,
  error,
  onRetry,
  stage,
}: AiJobProgressProps) => {
  const { t } = useTranslation("ai");
  const index = STEPS.indexOf(stage as (typeof STEPS)[number]);
  const step = stage === "done" || stage === "failed" ? STEPS.length : index + 1;
  const label = t(`generate.stage.${stage}`);
  const stepLabel = t("progress.step", { step, total: STEPS.length });

  if (compact) {
    return (
      <p
        aria-live="polite"
        className={cn("flex items-center gap-2 text-[13px] text-muted", className)}
        role="status"
      >
        <span className="font-semibold text-ink">{label}</span>
        {stage === "failed" ? null : <span>{` · ${stepLabel}`}</span>}
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3 text-[13px] text-ink", className)}>
      <p
        aria-live="polite"
        className="flex items-center justify-between text-sm font-semibold"
        role="status"
      >
        <span>{label}</span>
        {stage === "failed" ? null : (
          <span className="font-mono text-xs font-medium text-muted">{stepLabel}</span>
        )}
      </p>
      <Progress aria-label={label} className="rounded-[4px]" value={PERCENT[stage]} />
      <ol className="grid grid-cols-4 gap-1.5 text-xs">
        {STEPS.map((name, position) => {
          const state =
            stage === "done" || position < index
              ? "done"
              : position === index
                ? "current"
                : "pending";
          return (
            <li
              className={cn(
                "flex items-center gap-1",
                state === "done" && "text-ok",
                state === "current" && "font-bold text-primary",
                state === "pending" && "text-muted",
              )}
              data-state={state}
              key={name}
            >
              {state === "done" ? (
                <Check aria-hidden="true" className="size-3 flex-none" />
              ) : (
                <Circle
                  aria-hidden="true"
                  className={cn("size-2.5 flex-none", state === "current" && "fill-current")}
                />
              )}
              {t(`generate.stage.${name}`)}
            </li>
          );
        })}
      </ol>
      {stage === "failed" ? (
        <div
          className="flex items-center gap-2.5 rounded-md bg-danger-soft px-2.5 py-2 text-danger"
          role="alert"
        >
          <CircleX aria-hidden="true" className="size-4 flex-none" />
          <span>
            <b>{t("generate.stage.failed")}</b>
            {error ? ` · ${error}` : null}
          </span>
          {onRetry ? (
            <Button className="ml-auto h-auto p-0 text-danger" onClick={onRetry} variant="link">
              {t("progress.retry")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
