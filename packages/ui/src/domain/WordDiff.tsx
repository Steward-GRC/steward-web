// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Ellipsis } from "lucide-react";
import { Fragment, type ReactNode, useId, useState } from "react";

import { cn } from "#ui/lib/cn";

export interface DiffRun {
  kind: DiffRunKind;
  text: string;
}

export type DiffRunKind = "added" | "removed" | "same";

const ENTITIES: Readonly<Record<string, string>> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

const decode = (text: string): string =>
  text.replaceAll(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => {
    if (name.startsWith("#x") || name.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(name.slice(2), 16));
    }
    if (name.startsWith("#")) return String.fromCodePoint(Number.parseInt(name.slice(1), 10));
    return ENTITIES[name.toLowerCase()] ?? whole;
  });

/**
 * Reads the gateway's word-level diff (`PolicySectionDiff.wordDiffHtml`) into runs of same,
 * added (`<ins>`) and removed (`<del>`) text. Every other tag is dropped and entities are
 * decoded, so the diff is rendered as text and its markup never reaches the page.
 */
export const parseWordDiff = (html: string): DiffRun[] => {
  const runs: DiffRun[] = [];
  const stack: DiffRunKind[] = [];
  const push = (raw: string) => {
    if (!raw) return;
    const text = decode(raw);
    const kind = stack.at(-1) ?? "same";
    const last = runs.at(-1);
    if (last?.kind === kind) last.text += text;
    else runs.push({ kind, text });
  };
  const tag = /<(\/?)([a-z][\w-]*)[^>]*>/gi;
  let at = 0;
  for (const match of html.matchAll(tag)) {
    push(html.slice(at, match.index));
    at = match.index + match[0].length;
    const name = match[2]!.toLowerCase();
    if (name !== "ins" && name !== "del") continue;
    if (match[1]) stack.pop();
    else stack.push(name === "ins" ? "added" : "removed");
  }
  push(html.slice(at));
  return runs;
};

const insClass =
  "rounded-[2px] bg-[var(--diff-added-soft)] px-0.5 text-[var(--diff-added)] underline decoration-[1.5px] underline-offset-4";
const delClass =
  "rounded-[2px] bg-[var(--diff-removed-soft)] px-0.5 text-[var(--diff-removed)] line-through decoration-[1.5px]";

/** One run of the diff: `<ins>` underlined green, `<del>` struck red, each labelled. */
const Run = ({ run }: { run: DiffRun }) => {
  const { t } = useTranslation("policy");
  if (run.kind === "added") {
    return (
      <ins aria-label={t("reader.changes.added", { text: run.text })} className={insClass}>
        {run.text}
      </ins>
    );
  }
  if (run.kind === "removed") {
    return (
      <del aria-label={t("reader.changes.removed", { text: run.text })} className={delClass}>
        {run.text}
      </del>
    );
  }
  return <>{run.text}</>;
};

export interface WordDiffProps {
  html: string;
  /** Unified shows both; the older side drops the added runs and the newer the removed. */
  side?: "newer" | "older" | "unified";
}

/** The word-level diff of one passage, rendered as text with `<ins>` and `<del>`. */
export const WordDiff = ({ html, side = "unified" }: WordDiffProps) => (
  <>
    {parseWordDiff(html)
      .filter(
        (run) =>
          side === "unified" || (side === "older" ? run.kind !== "added" : run.kind !== "removed"),
      )
      .map((run, index) => (
        <Run key={index} run={run} />
      ))}
  </>
);

/** "+3 −2" in mono, green then red, read as "3 added, 2 removed". */
export const DiffCounts = ({ added, removed }: { added: number; removed: number }) => {
  const { t } = useTranslation("policy");
  return (
    <span
      aria-label={t("reader.changes.counts", { added, removed })}
      className="flex-none font-mono text-sm font-semibold whitespace-nowrap text-ink"
      role="img"
    >
      <span className="text-[var(--diff-added)]">+{added}</span>{" "}
      <span className="text-[var(--diff-removed)]">−{removed}</span>
    </span>
  );
};

/** The legend: "new" added in the newer version, "old" removed from the older version. */
export const DiffLegend = () => {
  const { t } = useTranslation("policy");
  return (
    <>
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="rounded-[3px] bg-[var(--diff-added-soft)] px-[5px] font-semibold text-[var(--diff-added)] underline underline-offset-[3px]"
        >
          {t("reader.changes.legendNew")}
        </span>
        {t("reader.changes.legendAdded")}
      </span>
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="rounded-[3px] bg-[var(--diff-removed-soft)] px-[5px] font-semibold text-[var(--diff-removed)] line-through"
        >
          {t("reader.changes.legendOld")}
        </span>
        {t("reader.changes.legendRemoved")}
      </span>
    </>
  );
};

/** A folded run of unchanged paragraphs: "⋯ 4 unchanged paragraphs · Show". */
export const FoldedRun = ({
  children,
  count,
  unit = "paragraphs",
}: {
  children?: ReactNode;
  count: number;
  /** What was folded: paragraphs of a section, or whole sections the diff left unchanged. */
  unit?: "paragraphs" | "sections";
}) => {
  const { t } = useTranslation("policy");
  const [open, setOpen] = useState(false);
  if (open) return <>{children}</>;
  return (
    <div className="my-1.5 flex items-center gap-1.5 rounded-md bg-sunken px-3 py-1.5 font-sans text-sm font-medium text-muted">
      <Ellipsis aria-hidden="true" className="size-4" />
      <span>
        {t(unit === "sections" ? "reader.changes.unchangedSections" : "reader.changes.unchanged", {
          count,
        })}
      </span>
      {children ? (
        <button
          aria-label={t("reader.changes.showUnchanged", { count })}
          className="ml-auto font-semibold text-primary hover:underline"
          onClick={() => setOpen(true)}
          type="button"
        >
          {t("reader.changes.show")}
        </button>
      ) : null}
    </div>
  );
};

export interface DiffSection {
  changeType: string;
  sectionKey: string;
  sectionTitle: string;
  wordDiffHtml?: null | string;
}

export interface DiffViewProps {
  className?: string;
  sections: readonly DiffSection[];
  /** Unchanged paragraphs that sit before a section, by its key, folded into one run. */
  unchangedBefore?: Readonly<Record<string, number>>;
}

/** The gateway's word for a section both versions share word for word. */
const UNCHANGED = "unchanged";

/** The changed sections, with how many unchanged ones sit before each and after the last. */
const foldUnchanged = (sections: readonly DiffSection[]) => {
  const shown: DiffSection[] = [];
  const before: Record<string, number> = {};
  let run = 0;
  for (const section of sections) {
    if (section.changeType.toLowerCase() === UNCHANGED) {
      run += 1;
      continue;
    }
    if (run > 0) before[section.sectionKey] = run;
    run = 0;
    shown.push(section);
  }
  return { after: run, before, shown };
};

const countRuns = (sections: readonly DiffSection[]) => {
  let added = 0;
  let removed = 0;
  for (const section of sections) {
    for (const run of parseWordDiff(section.wordDiffHtml ?? "")) {
      if (run.kind === "added") added += 1;
      if (run.kind === "removed") removed += 1;
    }
  }
  return { added, removed };
};

const Article = ({
  foldedAfter = 0,
  foldedBefore = {},
  label,
  sections,
  side,
  unchangedBefore,
}: {
  /** Unchanged sections after the last changed one. */
  foldedAfter?: number;
  /** Unchanged sections before a changed one, by its key. */
  foldedBefore?: Readonly<Record<string, number>>;
  label?: string;
  sections: readonly DiffSection[];
  side: WordDiffProps["side"];
  unchangedBefore?: DiffViewProps["unchangedBefore"];
}) => (
  <article
    aria-label={label}
    className="min-w-0 rounded-lg border border-border bg-surface px-5 py-5 font-serif text-[17px] leading-[30px] text-ink sm:px-10 sm:py-7"
  >
    {sections.map((section, index) => (
      <Fragment key={section.sectionKey}>
        {foldedBefore[section.sectionKey] ? (
          <FoldedRun count={foldedBefore[section.sectionKey]!} unit="sections" />
        ) : null}
        {unchangedBefore?.[section.sectionKey] ? (
          <FoldedRun count={unchangedBefore[section.sectionKey]!} />
        ) : null}
        <h3
          className={cn(
            "mb-1.5 font-serif text-[21px] leading-normal font-semibold",
            index > 0 && "mt-3.5",
          )}
        >
          {section.sectionTitle}
        </h3>
        <p className="max-w-[72ch]">
          <WordDiff html={section.wordDiffHtml ?? ""} side={side} />
        </p>
      </Fragment>
    ))}
    {foldedAfter > 0 ? <FoldedRun count={foldedAfter} unit="sections" /> : null}
  </article>
);

/**
 * The changes view (U12, U25): "+n −m", the legend, a Unified / Side by side switch, and each
 * changed section in the reading face with its word-level diff and any folded unchanged runs.
 */
export const DiffView = ({ className, sections, unchangedBefore }: DiffViewProps) => {
  const { t } = useTranslation("policy");
  const [layout, setLayout] = useState<"side" | "unified">("unified");
  const name = useId();
  const folded = foldUnchanged(sections);
  const { added, removed } = countRuns(folded.shown);
  const articleProps = {
    foldedAfter: folded.after,
    foldedBefore: folded.before,
    sections: folded.shown,
    unchangedBefore,
  };
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
        <DiffCounts added={added} removed={removed} />
        <DiffLegend />
        <div
          aria-label={t("reader.changes.view.label")}
          className="ml-auto flex gap-0.5 rounded-md bg-sunken p-[3px]"
          role="radiogroup"
        >
          {(["unified", "side"] as const).map((value) => (
            <label
              className={cn(
                "cursor-pointer rounded-sm px-2.5 py-[3px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                layout === value && "bg-surface font-semibold text-ink",
              )}
              key={value}
            >
              <input
                checked={layout === value}
                className="sr-only"
                name={name}
                onChange={() => setLayout(value)}
                type="radio"
                value={value}
              />
              {t(
                value === "unified"
                  ? "reader.changes.view.unified"
                  : "reader.changes.view.sideBySide",
              )}
            </label>
          ))}
        </div>
      </div>
      {layout === "unified" ? (
        <Article {...articleProps} side="unified" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <section aria-label={t("reader.changes.older")}>
            <Article {...articleProps} side="older" />
          </section>
          <section aria-label={t("reader.changes.newer")}>
            <Article {...articleProps} side="newer" />
          </section>
        </div>
      )}
    </div>
  );
};
