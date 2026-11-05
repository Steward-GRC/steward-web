// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// One section of an AI change (U30.4's preview, U31's change set): the serif title and a tag,
// a Diff / Final switch, and the text with its word diff, edged in the change's colour.
import { useTranslation } from "@steward-web/i18n";
import { cn } from "@steward-web/ui";
import { WordDiff, wordDiffRuns } from "@steward-web/ui/domain";
import { type ReactNode, useId, useState } from "react";

export type ChangeTone = "changed" | "locked" | "new" | "removed" | "unchanged";

const EDGE: Record<ChangeTone, string> = {
  changed: "shadow-[inset_3px_0_var(--color-info)]",
  locked: "shadow-[inset_3px_0_var(--color-border-strong)]",
  new: "shadow-[inset_3px_0_var(--diff-added)]",
  removed: "shadow-[inset_3px_0_var(--diff-removed)]",
  unchanged: "shadow-[inset_3px_0_var(--color-border-strong)]",
};

const TAG: Record<ChangeTone, string> = {
  changed: "bg-info-soft text-info",
  locked: "bg-sunken text-muted",
  new: "bg-[var(--diff-added-soft)] text-[var(--diff-added)]",
  removed: "bg-[var(--diff-removed-soft)] text-[var(--diff-removed)]",
  unchanged: "bg-sunken text-muted",
};

export const ChangeCard = ({
  actions,
  after,
  before,
  tag,
  title,
  tone,
}: {
  /** Anything after the switch, such as U30's lock. */
  actions?: ReactNode;
  after: string;
  before: string;
  tag: string;
  title: string;
  tone: ChangeTone;
}) => {
  const { t } = useTranslation("ai");
  const titleId = useId();
  const [view, setView] = useState<"diff" | "final">("diff");
  const diffable = tone === "changed" || tone === "removed";
  return (
    <article
      aria-labelledby={titleId}
      className={cn("overflow-hidden rounded-[10px] border border-border bg-surface", EDGE[tone])}
    >
      <header className="flex items-center gap-2.5 border-b border-border px-4 py-2.5">
        <h2 className="font-serif text-[15px] font-semibold" id={titleId}>
          {title}
        </h2>
        <span className={cn("rounded-[4px] px-[7px] py-0.5 text-[11px] font-semibold", TAG[tone])}>
          {tag}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {diffable ? (
            <div
              aria-label={t("change.view")}
              className="flex rounded-[5px] bg-sunken p-0.5 text-xs font-semibold"
              role="radiogroup"
            >
              {(["diff", "final"] as const).map((value) => (
                <label
                  className={cn(
                    "cursor-pointer rounded-[4px] px-2 py-[3px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                    view === value && "bg-surface",
                  )}
                  key={value}
                >
                  <input
                    checked={view === value}
                    className="sr-only"
                    name={`${titleId}-view`}
                    onChange={() => setView(value)}
                    type="radio"
                  />
                  {t(`change.${value}`)}
                </label>
              ))}
            </div>
          ) : null}
          {actions}
        </div>
      </header>
      <p className="px-4 py-3 font-serif text-base leading-[1.6] whitespace-pre-line">
        {diffable && view === "diff" ? <WordDiff runs={wordDiffRuns(before, after)} /> : after}
      </p>
    </article>
  );
};
