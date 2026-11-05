// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { DocumentBlock, InlineRun } from "@steward-web/api-client";

import { Fragment, type ReactNode } from "react";

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

/** The body's headings, numbered "1.", "2." and their sub-sections "1.1", with stable ids. */
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
      id: `section-${index}-${slug(block.text)}`,
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

export interface PolicyDocumentProps {
  appendices: readonly PolicyAppendix[];
  appendixLabel: (appendix: PolicyAppendix) => string;
  blocks: readonly DocumentBlock[];
  definitions: readonly PolicyDefinition[];
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
  onTerm,
}: PolicyDocumentProps) => {
  const numbered = numberHeadings(blocks);
  return (
    <article className="relative rounded-[10px] border border-border bg-surface px-5 pt-8 pb-10 font-serif text-[17px] leading-[28px] text-ink sm:px-14 sm:pt-10 sm:pb-12 sm:text-[18px] sm:leading-[30px]">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "heading": {
            const heading = numbered.get(index)!;
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
                          <td
                            className="border-b border-border px-3 py-[9px] align-top"
                            key={column}
                          >
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
      {appendices.map((appendix, index) => (
        <section
          className={index === 0 ? "border-t border-border-strong pt-6" : "pt-6"}
          key={appendix.id}
        >
          <h2
            className="mb-2 scroll-mt-4 text-[20px] leading-[28px] font-semibold sm:text-[22px] sm:leading-[30px]"
            id={appendixId(appendix)}
          >
            {appendixLabel(appendix)}
          </h2>
          <p className="max-w-[68ch] whitespace-pre-line">{appendix.text}</p>
        </section>
      ))}
    </article>
  );
};
