import type { DocumentBlock, InlineRun } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { Fragment, type ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router";

// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Card } from "#ui/components/Display";

import type { OutlineItem } from "./OutlineCard";
import type { PolicyAppendix, PolicyDefinition } from "./policyReaderModel";

/** A numbered heading or appendix of the body, as the outline and the document both read it. */
interface Numbered {
  depth: 1 | 2 | 3;
  id: string;
  /** "1.", "1.1", or "" for a heading deeper than a sub-section. */
  number: string;
  text: string;
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replaceAll(/[^a-z\d]+/g, "-")
    .replaceAll(/^-|-$/g, "");

/** A heading the author already numbered ("3. Scope", "3.1 …") keeps its own number. */
const ALREADY_NUMBERED = /^\d+(?:\.\d+)*\.?\s/;

/** The body's headings, numbered "1.", "2." and their sub-sections "1.1", each with the id a
 *  link to it uses: its section key when it has one, else one made from its place and text. */
export const numberHeadings = (blocks: readonly DocumentBlock[]): Map<number, Numbered> => {
  const numbered = new Map<number, Numbered>();
  let section = 0;
  let sub = 0;
  for (const [index, block] of blocks.entries()) {
    if (block.kind !== "heading") continue;
    let number = "";
    if (block.depth === 1) {
      section += 1;
      sub = 0;
      number = `${section}.`;
    } else if (block.depth === 2) {
      sub += 1;
      number = `${Math.max(section, 1)}.${sub}`;
    }
    const own = ALREADY_NUMBERED.test(block.text);
    numbered.set(index, {
      depth: block.depth,
      // The key steward-core gives the section, so an AI citation's "#<sectionKey>" lands here.
      id: block.sectionKey ?? `section-${index}-${slug(block.text)}`,
      number: own ? "" : number,
      text: block.text,
    });
  }
  return numbered;
};

const appendixId = (appendix: PolicyAppendix) => `appendix-${appendix.letter.toLowerCase()}`;

/** The "On this page" items (U7): numbered sections, their sub-sections, then the appendices. */
export const outlineItems = (
  blocks: readonly DocumentBlock[],
  appendices: readonly PolicyAppendix[],
  appendixLabel: (appendix: PolicyAppendix) => string,
): OutlineItem[] => [
  ...[...numberHeadings(blocks).values()]
    .filter((heading) => heading.depth <= 2)
    .map((heading): OutlineItem =>
      heading.depth === 1
        ? {
            id: heading.id,
            label: heading.text,
            level: 1,
            number: heading.number.replace(/\.$/, ""),
          }
        : {
            id: heading.id,
            label: heading.number ? `${heading.number} ${heading.text}` : heading.text,
            level: 2,
          },
    ),
  ...appendices.map((appendix): OutlineItem => ({
    id: appendixId(appendix),
    label: appendixLabel(appendix),
    level: 1,
    number: appendix.letter,
  })),
];

const escape = (text: string) => text.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/** One run's text, with each defined term made a link to its definition (U7, U13). */
const withTerms = (
  text: string,
  definitions: readonly PolicyDefinition[],
  onTerm?: (definition: PolicyDefinition) => void,
): ReactNode => {
  if (!onTerm || definitions.length === 0) return text;
  const terms = definitions.filter((d) => d.term.trim() !== "");
  if (terms.length === 0) return text;
  const pattern = new RegExp(
    String.raw`\b(${terms.map((d) => escape(d.term.trim())).join("|")})\b`,
    "gi",
  );
  const parts = text.split(pattern);
  return parts.map((part, index) => {
    const definition = terms.find((d) => d.term.trim().toLowerCase() === part.toLowerCase());
    if (index % 2 === 1 && definition) {
      return (
        <button
          className="cursor-pointer text-primary underline decoration-dotted decoration-[1.5px] underline-offset-4 hover:text-primary-hover"
          key={index}
          onClick={() => onTerm(definition)}
          type="button"
        >
          {part}
        </button>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
};

const Runs = ({
  definitions,
  onTerm,
  runs,
}: {
  definitions: readonly PolicyDefinition[];
  onTerm?: (definition: PolicyDefinition) => void;
  runs: readonly InlineRun[];
}) => (
  <>
    {runs.map((run, index) => {
      let node: ReactNode = run.href ? run.text : withTerms(run.text, definitions, onTerm);
      if (run.code) node = <code className="font-mono text-[0.85em]">{node}</code>;
      if (run.bold) node = <strong className="font-semibold">{node}</strong>;
      if (run.italic) node = <em>{node}</em>;
      if (run.underline) node = <u>{node}</u>;
      if (run.strike) node = <s>{node}</s>;
      if (run.href) {
        node = (
          <a href={run.href} rel="noreferrer" target="_blank">
            {node}
          </a>
        );
      }
      return <Fragment key={index}>{node}</Fragment>;
    })}
  </>
);

/**
 * A list of blocks in the reading style. The body numbers its headings; an appendix does not.
 */
const BlockList = ({
  blocks,
  definitions,
  numbered,
  onTerm,
}: {
  blocks: readonly DocumentBlock[];
  definitions: readonly PolicyDefinition[];
  numbered: Map<number, Numbered> | null;
  onTerm?: (definition: PolicyDefinition) => void;
}) => (
  <>
    {blocks.map((block, index) => {
      switch (block.kind) {
        case "heading": {
          const heading = numbered?.get(index) ?? {
            id: `appendix-heading-${index}`,
            number: "",
            text: block.text,
          };
          const label = heading.number ? `${heading.number} ${block.text}` : block.text;
          if (block.depth === 1) {
            return (
              <h2
                className="mt-7 mb-2 scroll-mt-4 text-[22px] leading-[30px] font-semibold first:mt-0 sm:text-[26px] sm:leading-[34px]"
                id={heading.id}
                key={index}
              >
                {label}
              </h2>
            );
          }
          return (
            <h3
              className="mt-5 mb-1.5 scroll-mt-4 text-[19px] leading-[28px] font-semibold sm:text-[21px] sm:leading-[30px]"
              id={heading.id}
              key={index}
            >
              {label}
            </h3>
          );
        }
        case "list": {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List
              className={`mb-5 max-w-[68ch] pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}
              key={index}
            >
              {block.items.map((runs, item) => (
                <li key={item}>
                  <Runs definitions={definitions} onTerm={onTerm} runs={runs} />
                </li>
              ))}
            </List>
          );
        }
        case "paragraph": {
          return (
            <p className="mb-5 max-w-[68ch] whitespace-pre-line text-pretty" key={index}>
              <Runs definitions={definitions} onTerm={onTerm} runs={block.runs} />
            </p>
          );
        }
        case "quote": {
          return (
            <blockquote
              className="mb-5 max-w-[68ch] border-l-[3px] border-border-strong pl-4 text-muted"
              key={index}
            >
              <Runs definitions={definitions} onTerm={onTerm} runs={block.runs} />
            </blockquote>
          );
        }
        case "table": {
          const [head, ...rest] = block.rows[0]?.header ? block.rows : [undefined, ...block.rows];
          return (
            <div className="mb-6 overflow-x-auto" key={index}>
              <table className="w-full border-collapse font-sans text-[15px] leading-[22px]">
                {head ? (
                  <thead>
                    <tr>
                      {head.cells.map((cell, column) => (
                        <th
                          className="border-b-[1.5px] border-border-strong bg-sunken px-3 py-[9px] text-left font-semibold"
                          key={column}
                        >
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                ) : null}
                <tbody>
                  {rest.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row!.cells.map((cell, column) => (
                        <td className="border-b border-border px-3 py-[9px] align-top" key={column}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }
    })}
  </>
);

/**
 * An appendix: supporting material, so it starts folded and opens when asked for (by its
 * heading, the outline or an address pointing at it), and always begins with a note that it is
 * not policy.
 */
const AppendixSection = ({
  appendix,
  definitions,
  label,
  onTerm,
}: {
  appendix: PolicyAppendix;
  definitions: readonly PolicyDefinition[];
  label: string;
  onTerm?: (definition: PolicyDefinition) => void;
}) => {
  const { t } = useTranslation("policy");
  const id = appendixId(appendix);
  const [open, setOpen] = useState(false);
  const { hash } = useLocation();
  // An address, or the outline, pointing at the appendix opens it.
  useEffect(() => {
    const opens = () => {
      if (hash.slice(1) === id || globalThis.location.hash.slice(1) === id) {
        setOpen(true);
        document.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView();
      }
    };
    opens();
    globalThis.addEventListener("hashchange", opens);
    return () => globalThis.removeEventListener("hashchange", opens);
  }, [hash, id]);
  return (
    <details className="pt-6" onToggle={(event) => setOpen(event.currentTarget.open)} open={open}>
      <summary
        className="mb-2 scroll-mt-4 cursor-pointer text-[20px] leading-[28px] font-semibold sm:text-[22px] sm:leading-[30px]"
        id={id}
      >
        {label}
      </summary>
      <aside
        aria-label={t("reader.appendices.notPolicy.label")}
        className="mb-4 max-w-[68ch] rounded-md bg-sunken px-3 py-2 font-sans text-sm text-muted"
      >
        {t("reader.appendices.notPolicy.text")}
      </aside>
      {appendix.blocks && appendix.blocks.length > 0 ? (
        <BlockList
          blocks={appendix.blocks}
          definitions={definitions}
          numbered={null}
          onTerm={onTerm}
        />
      ) : (
        <p className="max-w-[68ch] whitespace-pre-line">{appendix.text}</p>
      )}
    </details>
  );
};

/**
 * The appendices after one line that separates them from the sections above. The line is drawn
 * only when there is an appendix to follow it, in the reader and on the approval page alike.
 */
export const PolicyAppendices = ({
  appendices,
  appendixLabel,
  definitions,
  lastUpdated,
  onTerm,
}: {
  appendices: readonly PolicyAppendix[];
  appendixLabel: (appendix: PolicyAppendix) => string;
  definitions: readonly PolicyDefinition[];
  /** When the published version was last updated, already in the person's format. */
  lastUpdated?: string;
  onTerm?: (definition: PolicyDefinition) => void;
}) => {
  const { t } = useTranslation("policy");
  if (appendices.length === 0 && !lastUpdated) return null;
  return (
    <>
      {appendices.length > 0 ? (
        <hr className="mt-6 border-0 border-t border-border-strong" />
      ) : null}
      {appendices.map((appendix) => (
        <AppendixSection
          appendix={appendix}
          definitions={definitions}
          key={appendix.id}
          label={appendixLabel(appendix)}
          onTerm={onTerm}
        />
      ))}
      {lastUpdated ? (
        <p className="mt-6 font-sans text-sm text-muted">
          {t("reader.appendices.lastUpdated", { when: lastUpdated })}
        </p>
      ) : null}
    </>
  );
};

export interface PolicyDocumentProps {
  appendices: readonly PolicyAppendix[];
  appendixLabel: (appendix: PolicyAppendix) => string;
  blocks: readonly DocumentBlock[];
  definitions: readonly PolicyDefinition[];
  /** When the published version was last updated, in the person's format; shown under the appendices. */
  lastUpdated?: string;
  /** Opens a defined term's definition; without it, terms read as plain text. */
  onTerm?: (definition: PolicyDefinition) => void;
}

/**
 * The body in the reading style (U7): Source Serif 18/30 on the surface card, numbered section
 * headings (26/34) and sub-sections (21/30), paragraphs at 68ch, tables in the UI face, and the
 * appendices after a rule as sections of their own ("Appendix A: {title}").
 */
export const PolicyDocument = ({
  appendices,
  appendixLabel,
  blocks,
  definitions,
  lastUpdated,
  onTerm,
}: PolicyDocumentProps) => {
  const numbered = numberHeadings(blocks);
  return (
    // "body" is core's key for text before the first heading, so a citation to it opens here.
    <article
      className="relative scroll-mt-4 rounded-[10px] border border-border bg-surface px-5 pt-8 pb-10 font-serif text-[17px] leading-[28px] text-ink sm:px-14 sm:pt-10 sm:pb-12 sm:text-[18px] sm:leading-[30px]"
      data-read-aloud=""
      id="body"
    >
      <BlockList blocks={blocks} definitions={definitions} numbered={numbered} onTerm={onTerm} />
      <PolicyAppendices
        appendices={appendices}
        appendixLabel={appendixLabel}
        definitions={definitions}
        lastUpdated={lastUpdated}
        onTerm={onTerm}
      />
    </article>
  );
};

/** A run of redaction blocks standing in for a word: "▇▇▇▇", as long as the word, up to 10. */
const blockedWords = (text: string) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => "▇".repeat(Math.min(10, Math.max(2, word.length))))
    .join(" ");

/** The word widths a full redacted line cycles through, in pixels, so lines don't look ruled. */
const WORD_WIDTHS = [60, 44, 52];

/** About how many characters fill one line of the reading measure. */
const LINE = 90;

/** The bars standing in for a paragraph: one per line its text would take, the last one shorter. */
const paragraphBars = (length: number): number[] => {
  const lines = Math.max(1, Math.ceil(length / LINE));
  const widths = [96, 92, 88, 94, 90];
  return Array.from({ length: Math.min(lines, 6) }, (_, line) =>
    line === lines - 1
      ? Math.max(30, Math.round(((length % LINE || LINE) / LINE) * 90))
      : widths[line % widths.length]!,
  );
};

const runsLength = (runs: readonly InlineRun[]) =>
  runs.reduce((sum, run) => sum + run.text.length, 0);

/** One redacted line, `width` per cent of the measure. */
// Full lines read as words (a run of blocks, then a gap); a paragraph's last line is solid.
const redactedLine = (width: number, key: number | string, stripes = true) => {
  const word = WORD_WIDTHS[(typeof key === "number" ? key : 0) % WORD_WIDTHS.length]!;
  return (
    <span
      className="block h-3 rounded-[3px]"
      key={key}
      style={{
        background: stripes
          ? `repeating-linear-gradient(90deg, var(--redact) 0 ${word}px, transparent ${word}px ${word + 6}px)`
          : "var(--redact)",
        width: `${width}%`,
      }}
    />
  );
};

/**
 * The redacted body (U9): the document's shape without its words. Section numbers stay
 * readable, the words of headings are blocked, each paragraph becomes bars as long as its lines
 * and each table a grid of its cells, so a reader can see how long the document is. A screen
 * reader hears only "Redacted policy content: {n} sections, {m} tables".
 */
export const RedactedDocument = ({
  appendices,
  blocks,
  label,
}: {
  appendices: readonly PolicyAppendix[];
  blocks: readonly DocumentBlock[];
  /** The accessible summary: "Redacted policy content: 2 sections, 1 table". */
  label: string;
}) => {
  const numbered = numberHeadings(blocks);
  return (
    <Card
      aria-label={label}
      className="flex flex-col gap-2.5 px-5 py-7 font-serif text-ink select-none sm:px-9"
      role="img"
    >
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "heading": {
            const heading = numbered.get(index)!;
            return (
              <span
                className={`font-semibold first:mt-0 ${block.depth === 1 ? "mt-2.5 text-xl" : "text-[17px]"}`}
                key={index}
              >
                {heading.number ? `${heading.number} ` : ""}
                {blockedWords(block.text)}
              </span>
            );
          }
          case "list": {
            return (
              <div className="flex flex-col gap-2.5 pl-5" key={index}>
                {block.items.map((runs, item) =>
                  redactedLine(Math.min(90, Math.max(30, runsLength(runs))), item, false),
                )}
              </div>
            );
          }
          case "paragraph":
          case "quote": {
            return (
              <div className="flex flex-col gap-2.5" key={index}>
                {paragraphBars(runsLength(block.runs)).map((width, line, all) =>
                  redactedLine(width, line, line < all.length - 1),
                )}
              </div>
            );
          }
          case "table": {
            const columns = Math.max(1, block.rows[0]?.cells.length ?? 1);
            return (
              <div
                className="mt-1.5 grid gap-1.5"
                key={index}
                // The first column is the narrow one (a label), as in most policy tables.
                style={{
                  gridTemplateColumns:
                    columns === 1 ? "1fr" : `1fr repeat(${columns - 1}, minmax(0, 2fr))`,
                }}
              >
                {block.rows.flatMap((row, rowIndex) =>
                  row.cells.map((_, column) => (
                    <span
                      className="h-[26px] rounded-[3px]"
                      key={`${rowIndex}-${column}`}
                      style={{ background: "var(--redact)", opacity: row.header ? 1 : 0.6 }}
                    />
                  )),
                )}
              </div>
            );
          }
        }
      })}
      {appendices.map((appendix) => (
        <div
          className="mt-2.5 flex flex-col gap-2.5 border-t border-border-strong pt-4"
          key={appendix.id}
        >
          <span className="text-xl font-semibold">
            {appendix.letter}. {blockedWords(appendix.title)}
          </span>
          {paragraphBars(appendix.text.length).map((width, line, all) =>
            redactedLine(width, line, line < all.length - 1),
          )}
        </div>
      ))}
    </Card>
  );
};

/** How many numbered sections and tables a body has, for the redaction's spoken summary. */
export const bodyShape = (blocks: readonly DocumentBlock[]) => ({
  sections: blocks.filter((block) => block.kind === "heading" && block.depth === 1).length,
  tables: blocks.filter((block) => block.kind === "table").length,
});
