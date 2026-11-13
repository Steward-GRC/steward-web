// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Card, cn } from "@steward-web/ui";
import { type ReactNode, useId } from "react";

export type Tone = "neutral" | "ok" | "warn";

const PILL: Record<Tone, string> = {
  neutral: "bg-neutral-soft text-neutral",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
};

/** One settings card: a heading with its status pill, a line about it, then its controls. */
export const SettingsCard = ({
  children,
  description,
  pill,
  title,
  tone,
}: {
  children?: ReactNode;
  description: ReactNode;
  pill: string;
  title: string;
  tone: Tone;
}) => {
  const titleId = useId();
  return (
    <Card aria-labelledby={titleId} className="flex flex-col gap-2 px-4 py-3.5">
      <div className="flex items-center gap-2.5">
        <b className="flex-1" id={titleId}>
          {title}
        </b>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-2xs leading-[15px] font-semibold",
            PILL[tone],
          )}
          data-testid="status-pill"
        >
          {pill}
        </span>
      </div>
      <p className="text-sm leading-normal text-muted">{description}</p>
      {children}
    </Card>
  );
};
