// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { AlertTriangle, CheckCircle2, Info, type LucideIcon, OctagonAlert, X } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "#ui/lib/cn";

import type { Failure } from "./failure";

import { DiagnosticsSlot } from "./DiagnosticsSlot";

export type BannerTone = "danger" | "info" | "ok" | "warn";

const tones: Record<BannerTone, { className: string; icon: LucideIcon }> = {
  danger: { className: "border-danger bg-danger-soft text-ink", icon: OctagonAlert },
  info: { className: "border-info bg-info-soft text-ink", icon: Info },
  ok: { className: "border-ok bg-ok-soft text-ink", icon: CheckCircle2 },
  warn: { className: "border-warn bg-warn-soft text-ink", icon: AlertTriangle },
};

const iconColour: Record<BannerTone, string> = {
  danger: "text-danger",
  info: "text-info",
  ok: "text-ok",
  warn: "text-warn",
};

export interface BannerProps {
  /** Buttons or links on the right. */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** The failure this banner reports, for the Copy diagnostics report. */
  failure?: Failure;
  /** Show a dismiss button; info banners only. */
  onDismiss?: () => void;
  title: ReactNode;
  tone?: BannerTone;
}

/**
 * An inline notice. Warning and danger banners always carry Copy diagnostics: it's part of
 * the variant, not something each screen adds.
 */
export const Banner = ({
  actions,
  children,
  className,
  failure,
  onDismiss,
  title,
  tone = "info",
}: BannerProps) => {
  const { t } = useTranslation("common");
  const { className: toneClass, icon: Icon } = tones[tone];
  const carriesDiagnostics = tone === "warn" || tone === "danger";
  return (
    <div
      className={cn("flex gap-3 rounded-lg border-l-4 px-4 py-3", toneClass, className)}
      data-tone={tone}
      role={tone === "danger" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", iconColour[tone])} />
      <div className="grid min-w-0 flex-1 gap-1">
        <p className="font-semibold">{title}</p>
        {children ? <div className="text-base text-ink">{children}</div> : null}
        {actions || carriesDiagnostics ? (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {actions}
            {carriesDiagnostics ? <DiagnosticsSlot failure={failure} /> : null}
          </div>
        ) : null}
      </div>
      {onDismiss && tone === "info" ? (
        <button
          aria-label={t("actions.dismiss")}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface"
          onClick={onDismiss}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  );
};
