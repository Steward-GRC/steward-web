// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Sparkles } from "lucide-react";
import { type ReactNode, useId } from "react";

import { cn } from "#ui/lib/cn";

/** Lines that read as a list ("• …", "- …", "* …"), so a bulleted summary keeps its bullets. */
const BULLET = /^\s*[•\-*]\s+/;

/** The summary's text as bullets when every line is one, else as paragraphs. */
const SummaryText = ({ text }: { text: string }) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length > 0 && lines.every((line) => BULLET.test(line))) {
    return (
      <ul className="list-disc pl-5 text-[15px] leading-[1.6]">
        {lines.map((line, index) => (
          <li key={index}>{line.replace(BULLET, "")}</li>
        ))}
      </ul>
    );
  }
  return <p className="text-[15px] leading-[1.6] whitespace-pre-line">{text}</p>;
};

export interface AiSummaryCardProps {
  /** "Generated 12 Aug 2026", "Cached" or "Just generated". */
  badge?: string;
  /** Anything after the header in place of the summary, such as the empty or unavailable line. */
  children?: ReactNode;
  className?: string;
  /** The summary itself; without it the card shows `children` and no disclaimer. */
  text?: null | string;
  title: string;
}

/**
 * The AI summary panel (U29), as the reader's summary and U12's "Summarise changes" use it:
 * the sparkle and title with the badge, the summary as bullets or text, then "AI-generated
 * summary — always check it against the policy text before relying on it." It's a labelled
 * region, so the summary can be found by name.
 */
export const AiSummaryCard = ({ badge, children, className, text, title }: AiSummaryCardProps) => {
  const { t } = useTranslation("policy");
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex flex-col gap-2 rounded-[10px] border border-border bg-surface px-5 py-4 text-ink",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <Sparkles aria-hidden="true" className="size-4 flex-none text-primary" />
        <h2 className="text-[15px] font-semibold" id={titleId}>
          {title}
        </h2>
        {badge ? (
          <span className="rounded-[4px] bg-sunken px-2 py-0.5 text-xs font-medium text-muted">
            {badge}
          </span>
        ) : null}
      </div>
      {text ? (
        <>
          <SummaryText text={text} />
          <span className="text-xs text-muted">{t("reader.summary.disclaimer")}</span>
        </>
      ) : (
        <p className="text-sm leading-[1.5] text-muted">{children}</p>
      )}
    </section>
  );
};
