// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Check, Copy } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { cn } from "#ui/lib/cn";

export interface CopyIdProps {
  /** What to show in place of the bare ID (the ID with its version, for example). */
  children?: ReactNode;
  className?: string;
  /** The record ID: shown, and the only thing the button copies. */
  id: string;
}

/** A record ID in mono with a copy-to-clipboard button beside it. Every record ID uses this. */
export const CopyId = ({ children, className, id }: CopyIdProps) => {
  const { t } = useTranslation("common");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const Icon = copied ? Check : Copy;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 font-mono text-[13px] text-muted", className)}
    >
      <span className="font-mono">{children ?? id}</span>
      <button
        aria-label={copied ? t("copyId.copied", { id }) : t("copyId.copy", { id })}
        className="inline-flex size-6 items-center justify-center rounded text-muted hover:bg-sunken hover:text-ink"
        onClick={() => {
          void navigator.clipboard?.writeText(id).then(() => {
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
          });
        }}
        type="button"
      >
        <Icon aria-hidden="true" className="size-3.5" />
      </button>
    </span>
  );
};
