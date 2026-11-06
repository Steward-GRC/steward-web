// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { DocumentBlock, InlineRun } from "@steward-web/api-client";

import { Sensitivity } from "@steward-web/api-client";
import { formatDate, formatDayMonth, formatTime, useTranslation } from "@steward-web/i18n";
import { Fragment, type ReactNode } from "react";

import type { PolicyDefinition, PolicyDetail } from "./policyReaderModel";

import { documentStatusOf } from "./policy";
import { numberHeadings } from "./PolicyDocument";
import { historyEventTitle, withV } from "./PolicyReaderHistory";
import { groupHistoryByVersion, redactionState } from "./policyReaderModel";
import { certificateOf } from "./printCertificate";

/** A CSS string literal: quotes, backslashes, line breaks and "<" escaped, so no text can end
 *  the string or the style element it sits in. */
const cssString = (text: string) =>
  `"${text.replaceAll(/["\\<\n]/g, (character) => `\\${character.codePointAt(0)!.toString(16).toUpperCase()} `)}"`;

/** The marks `t("print.page", …)` puts where the page counters go. */
export const PAGE = "\u0001";
export const PAGES = "\u0002";

export interface PageRulesInput {
  /** The footer's left side: "Printed 3 Oct 2026 09:30 by Erin · Check Steward…". */
  footer: string;
  /** The header's right side: "POL-FACILITIES-000001 · v1 · Published". */
  header: string;
  organisation: null | string;
  /** "Steward · Page {PAGE} of {PAGES}", with the counters marked by PAGE and PAGES. */
  pageCounter: string;
}

/**
 * The print layout's page box (R1): A4- and Letter-safe 20/18 mm margins, the running header
 * (organisation; number, version and status in Plex Mono) over a 0.5 pt rule, and the footer
 * (printed when and by whom; "Steward · Page n of N") under one. They sit in the page's margin
 * boxes, so every printed page carries them and the browser counts the pages.
 */
export const pageRules = ({ footer, header, organisation, pageCounter }: PageRulesInput) => {
  const counter = pageCounter
    .split(new RegExp(`(${PAGE}|${PAGES})`))
    .filter(Boolean)
    .map((part) =>
      part === PAGE ? "counter(page)" : part === PAGES ? "counter(pages)" : cssString(part),
    )
    .join(" ");
  const top = `font: 500 8.5pt "Public Sans", sans-serif; color: #5e525f; border-bottom: 0.5pt solid #261b25; vertical-align: bottom; padding-bottom: 6px;`;
  const bottom = `font: 8pt "Public Sans", sans-serif; color: #5e525f; border-top: 0.5pt solid #b9aab7; vertical-align: top; padding-top: 6px;`;
  return [
    "@page {",
    "  margin: 20mm 18mm;",
    organisation
      ? `  @top-left { content: ${cssString(organisation)}; ${top} }`
      : `  @top-left { content: ""; ${top} }`,
    `  @top-right { content: ${cssString(header)}; ${top} font-family: "IBM Plex Mono", monospace; }`,
    `  @bottom-left { content: ${cssString(footer)}; ${bottom} }`,
    `  @bottom-right { content: ${counter}; ${bottom} white-space: nowrap; }`,
    "}",
  ].join("\n");
};

const escape = (text: string) => text.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/** Where the end notes attach: the † after each defined term's first use, and each link's
 *  note number. Worked out over the whole body in reading order before anything is drawn, so
 *  drawing stays pure. */
interface Notes {
  /** For each run, the indexes of its split parts (see `splitTerms`) that carry a †. */
  readonly daggers: ReadonlyMap<InlineRun, ReadonlySet<number>>;
  readonly linkOf: ReadonlyMap<InlineRun, number>;
  readonly links: readonly string[];
  readonly pattern?: RegExp;
}

const runsOf = (block: DocumentBlock): readonly InlineRun[] => {
  if (block.kind === "paragraph" || block.kind === "quote") return block.runs;
  if (block.kind === "list") return block.items.flat();
  return [];
};

const notesFor = (
  blocks: readonly DocumentBlock[],
  definitions: readonly PolicyDefinition[],
): Notes => {
  const terms = definitions.map((d) => d.term.trim()).filter(Boolean);
  const pattern =
    terms.length > 0
      ? new RegExp(String.raw`\b(${terms.map((term) => escape(term)).join("|")})\b`, "gi")
      : undefined;
  const daggers = new Map<InlineRun, Set<number>>();
  const linkOf = new Map<InlineRun, number>();
  const links: string[] = [];
  const seen = new Set<string>();
  for (const run of blocks.flatMap((block) => runsOf(block))) {
    if (run.href) {
      links.push(run.href);
      linkOf.set(run, links.length);
      continue;
    }
    if (!pattern) continue;
    for (const [index, part] of run.text.split(pattern).entries()) {
      if (index % 2 === 0 || seen.has(part.toLowerCase())) continue;
      seen.add(part.toLowerCase());
      daggers.set(run, (daggers.get(run) ?? new Set()).add(index));
    }
  }
  return { daggers, linkOf, links, pattern };
};

/** A run's text with a † after each part `notes` marks. */
const withDaggers = (run: InlineRun, notes: Notes): ReactNode => {
  const marked = notes.daggers.get(run);
  if (!marked || !notes.pattern) return run.text;
  return run.text.split(notes.pattern).map((part, index) => (
    <Fragment key={index}>
      {part}
      {marked.has(index) ? <sup className="font-sans text-[7pt]">†</sup> : null}
    </Fragment>
  ));
};

const Runs = ({ notes, runs }: { notes: Notes; runs: readonly InlineRun[] }) => (
  <>
    {runs.map((run, index) => {
      let node: ReactNode = run.href ? run.text : withDaggers(run, notes);
      if (run.code) node = <code className="font-mono text-[0.85em]">{node}</code>;
      if (run.bold) node = <strong className="font-semibold">{node}</strong>;
      if (run.italic) node = <em>{node}</em>;
      if (run.underline) node = <u>{node}</u>;
      if (run.strike) node = <s>{node}</s>;
      if (run.href) {
        node = (
          <>
            {node}
            <sup className="font-sans text-[7pt]">{notes.linkOf.get(run)}</sup>
          </>
        );
      }
      return <Fragment key={index}>{node}</Fragment>;
    })}
  </>
);

/** A heading whose number hangs, so a long one wraps under its words (R1's breaking rules). */
const Hanging = ({ number, text }: { number: string; text: string }) =>
  number ? (
    <>
      <span className="inline-block min-w-[1.5em] indent-0">{number}</span> {text}
    </>
  ) : (
    <>{text}</>
  );

const Body = ({ blocks, notes }: { blocks: readonly DocumentBlock[]; notes: Notes }) => {
  const numbered = numberHeadings(blocks);
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "heading": {
            const heading = numbered.get(index)!;
            const Tag = block.depth === 1 ? "h2" : "h3";
            return (
              <Tag
                className={
                  block.depth === 1
                    ? "mt-3 mb-1 pl-[1.8em] -indent-[1.8em] font-serif text-[15pt] leading-[20pt] font-semibold break-after-avoid first:mt-2"
                    : "mt-2.5 mb-1 pl-[1.8em] -indent-[1.8em] font-serif text-[12.5pt] leading-[17pt] font-semibold break-after-avoid"
                }
                key={index}
              >
                <Hanging number={heading.number} text={block.text} />
              </Tag>
            );
          }
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List
                className={`mb-2 pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}
                key={index}
              >
                {block.items.map((runs, item) => (
                  <li className="break-inside-avoid" key={item}>
                    <Runs notes={notes} runs={runs} />
                  </li>
                ))}
              </List>
            );
          }
          case "paragraph": {
            return (
              <p className="mb-2 whitespace-pre-line [orphans:3] [widows:3]" key={index}>
                <Runs notes={notes} runs={block.runs} />
              </p>
            );
          }
          case "quote": {
            return (
              <blockquote
                className="mb-2 border-l-[1pt] border-[#b9aab7] pl-3 text-[#5e525f]"
                key={index}
              >
                <Runs notes={notes} runs={block.runs} />
              </blockquote>
            );
          }
          case "table": {
            const [head, ...rest] = block.rows[0]?.header ? block.rows : [undefined, ...block.rows];
            return (
              <table
                className="mb-2 w-full border-collapse font-sans text-[9.5pt] leading-[13pt]"
                key={index}
              >
                {head ? (
                  <thead>
                    <tr>
                      {head.cells.map((cell, column) => (
                        <th
                          className="border-b-[1pt] border-[#261b25] px-1.5 py-[5px] text-left font-semibold"
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
                    <tr className="break-inside-avoid" key={rowIndex}>
                      {row!.cells.map((cell, column) => (
                        <td
                          className="border-b-[0.5pt] border-[#dcd0c1] px-1.5 py-[5px] align-top"
                          key={column}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          }
        }
      })}
    </>
  );
};

const endHeading =
  "mt-2 border-t-[0.5pt] border-[#b9aab7] pt-2 font-sans text-[10pt] font-semibold break-after-avoid";

/** The watermark's tint. It has to stay visible on a photocopy, so it is red and darker than a
 *  screen watermark would be; the stored design's face, angle and 3 x 4 tiling are kept. */
export const WATERMARK_COLOUR = "rgba(180, 0, 0, 0.18)";
const WATERMARK_TILES = 12;

export interface PolicyPrintProps {
  detail: PolicyDetail;
  /** Adds the version-history page after the document (#30). */
  includeHistory?: boolean;
  organisation?: null | string;
  /** When the person printed, for the footer. */
  printedAt: Date;
  /** Who printed, for the footer. */
  viewerName?: string;
}

/**
 * The print layout (R1): no app chrome; the running header and footer in the page margins;
 * the "Category · Subcategory" kicker, the 22/28 pt serif title and the five-up strip
 * (Status, Owner, Published, Last updated, Next review); the body in 11/16 pt serif with numbered sections,
 * † on defined terms and numbered link notes; then each appendix on a new page, the defined
 * terms and links as end notes, and the full history, every version expanded. Always light.
 */
export const PolicyPrint = ({
  detail,
  includeHistory = false,
  organisation,
  printedAt,
  viewerName,
}: PolicyPrintProps) => {
  const { t } = useTranslation("policy");
  const redacted = redactionState(detail) !== "visible";
  const notes = notesFor(redacted ? [] : detail.body, detail.definitions);
  const pill = documentStatusOf(detail.status);
  const status = t(`status.${pill ?? detail.status.toLowerCase()}`);
  const printed = `${formatDate(printedAt)} ${formatTime(printedAt)}`;
  const css = pageRules({
    footer: viewerName
      ? t("print.printedBy", { name: viewerName, time: printed })
      : t("print.printed", { time: printed }),
    header: t("print.header", { number: detail.number, status, version: detail.version }),
    organisation: organisation ?? null,
    pageCounter: t("print.page", { page: PAGE, pages: PAGES }),
  });
  const body = redacted ? null : <Body blocks={detail.body} notes={notes} />;
  const appendices = redacted ? [] : detail.appendices;
  const groups = groupHistoryByVersion(detail.history);
  const none = t("reader.metadata.none");
  const certificate = includeHistory ? certificateOf(detail.history, detail.version) : [];
  const watermark = t("print.watermark", { name: viewerName ?? none, time: printed });

  return (
    <article
      aria-label={detail.title}
      className="steward-print bg-white font-sans text-[8.5pt] leading-[12pt] text-[#261b25]"
      role="document"
    >
      <style>{css}</style>
      {detail.sensitivity === Sensitivity.Sensitive ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 grid grid-cols-3 grid-rows-4 place-items-center [print-color-adjust:exact]"
          data-testid="print-watermark"
        >
          {Array.from({ length: WATERMARK_TILES }, (_, tile) => (
            <span
              className="-rotate-30 font-mono text-[28pt] whitespace-nowrap"
              key={tile}
              style={{ color: WATERMARK_COLOUR }}
            >
              {watermark}
            </span>
          ))}
        </div>
      ) : null}
      <header className="flex flex-col gap-1">
        <span className="text-[8.5pt] font-medium text-[#5e525f]">
          {detail.subcategory ? `${detail.category} · ${detail.subcategory}` : detail.category}
        </span>
        <h1 className="font-serif text-[22pt] leading-[28pt] font-semibold">{detail.title}</h1>
      </header>
      <ul
        aria-label={t("reader.metadata.label")}
        className="mt-3 grid grid-cols-5 border-y-[0.5pt] border-[#b9aab7] text-[8.5pt] leading-[12pt]"
      >
        {(
          [
            [t("reader.metadata.status"), status],
            [t("reader.metadata.owner"), detail.ownerName ?? none],
            [t("reader.metadata.published"), formatDate(detail.published, { fallback: none })],
            [t("reader.metadata.updated"), formatDate(detail.updated, { fallback: none })],
            [t("print.nextReview"), formatDate(detail.nextReview, { fallback: none })],
          ] as const
        ).map(([label, value]) => (
          <li className="flex flex-col py-1.5" key={label}>
            <span className="text-[#5e525f]">{label}</span>
            <span>{value}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 font-serif text-[11pt] leading-[16pt]">
        {redacted ? (
          <p className="flex flex-col">
            <strong className="font-semibold">{t("reader.redacted.title")}</strong>
            <span>{t("reader.redacted.body")}</span>
          </p>
        ) : (
          body
        )}
      </div>

      {appendices.map((appendix) => (
        <section className="flex flex-col gap-2" key={appendix.id}>
          <h2 className="break-before-page font-serif text-[12pt] font-semibold break-after-avoid">
            {t("reader.appendices.heading", { letter: appendix.letter, title: appendix.title })}
          </h2>
          <p className="font-serif text-[9pt] leading-[13pt] whitespace-pre-line">
            {appendix.text}
          </p>
        </section>
      ))}

      <section className={appendices.length === 0 ? "break-before-page" : undefined}>
        {!redacted && detail.definitions.length > 0 ? (
          <>
            <h2 className={endHeading} id="print-definitions">
              {t("print.definitions")}
            </h2>
            <ul aria-labelledby="print-definitions">
              {detail.definitions.map((definition) => (
                <li key={definition.id}>
                  † {definition.term} — {definition.definition}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {notes.links.length > 0 ? (
          <>
            <h2 className={endHeading} id="print-links">
              {t("print.links")}
            </h2>
            <ol aria-labelledby="print-links">
              {notes.links.map((href, index) => (
                <li className="break-all" key={index}>
                  {index + 1} {href}
                </li>
              ))}
            </ol>
          </>
        ) : null}
        {groups.map((group) => {
          const label = withV(group.version);
          const id = `print-history-${group.version}`;
          return (
            <Fragment key={group.version}>
              <h2 className={endHeading} id={id}>
                {t("print.history", { version: label })}
              </h2>
              <ol aria-labelledby={id} className="flex flex-col">
                {group.events.toReversed().map((event, index) => (
                  <li className="grid grid-cols-[72px_1fr] gap-2 break-inside-avoid" key={index}>
                    <span className="font-mono text-[7.5pt] text-[#5e525f]">
                      {formatDayMonth(event.at)} {formatTime(event.at)}
                    </span>
                    <span>
                      <b>{historyEventTitle(t, event, label)}</b>
                      {[event.actorName, event.comment ? `“${event.comment}”` : null]
                        .filter(Boolean)
                        .map((part) => ` · ${part}`)
                        .join("")}
                    </span>
                  </li>
                ))}
              </ol>
            </Fragment>
          );
        })}
      </section>
      {includeHistory ? (
        <section
          aria-labelledby="print-certificate"
          className="break-before-page"
          
        >
          <h2 className="font-serif text-[15pt] leading-[20pt] font-semibold" id="print-certificate">
            {t("print.certificate.heading", { version: withV(detail.version) })}
          </h2>
          <p className="mt-1 mb-3 text-[#5e525f]">{t("print.certificate.note", { time: printed })}</p>
          <table className="w-full border-collapse font-sans text-[9.5pt] leading-[13pt]">
            <thead>
              <tr>
                {(["step", "person", "when", "comment"] as const).map((column) => (
                  <th
                    className="border-b-[1pt] border-[#261b25] px-1.5 py-[5px] text-left font-semibold"
                    key={column}
                  >
                    {t(`print.certificate.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certificate.map((row, index) => (
                <tr className="break-inside-avoid" key={index}>
                  <td className="border-b-[0.5pt] border-[#dcd0c1] px-1.5 py-[5px] align-top font-semibold">
                    {t(`print.certificate.roles.${row.role}`)}
                    {row.stage ? <span className="font-normal"> · {row.stage}</span> : null}
                  </td>
                  <td className="border-b-[0.5pt] border-[#dcd0c1] px-1.5 py-[5px] align-top">
                    {row.actorName ?? t("print.certificate.system")}
                  </td>
                  <td className="border-b-[0.5pt] border-[#dcd0c1] px-1.5 py-[5px] align-top font-mono text-[8pt]">
                    {formatDate(row.at)} {formatTime(row.at)}
                  </td>
                  <td className="border-b-[0.5pt] border-[#dcd0c1] px-1.5 py-[5px] align-top">
                    {row.comment ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </article>
  );
};
