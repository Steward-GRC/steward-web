// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  diffBlocks,
  LexicalDocumentView,
  type SerializedDocument,
  textBlocksOf,
} from "@steward-web/editor-steward";
import { useTranslation } from "@steward-web/i18n";
import { Fragment, type ReactNode, useMemo } from "react";

import type { EditorView } from "./EditorViewToggle";

const ADDED =
  "bg-[var(--diff-added-soft)] text-[var(--diff-added)] underline decoration-[1.5px] underline-offset-4";
const REMOVED = "bg-[var(--diff-removed-soft)] text-[var(--diff-removed)] line-through";

/**
 * One published appendix version, read as clean text (Unified) or with what it changed against
 * the published version before it marked on the words (Diff), as the draft's own Diff does.
 */
export const PublishedVersionView = ({
  document,
  earlier,
  view,
}: {
  document: SerializedDocument;
  /** The published version before this one; none for the first. */
  earlier?: SerializedDocument;
  view: EditorView;
}) => {
  const { t } = useTranslation("authoring");
  const diff = useMemo(
    () => (earlier ? diffBlocks(textBlocksOf(earlier), textBlocksOf(document)) : undefined),
    [document, earlier],
  );
  const blocks = useMemo(() => textBlocksOf(document), [document]);
  if (view === "unified") return <LexicalDocumentView document={document} />;
  if (!diff) {
    return (
      <>
        <p className="mb-3 text-sm text-muted">{t("editor.appendix.version.first")}</p>
        <LexicalDocumentView document={document} />
      </>
    );
  }
  const gone = (before: number): ReactNode =>
    diff.removedBlocks
      .filter((removed) => removed.before === before)
      .map((removed, n) => (
        <p className={REMOVED} key={`gone-${before}-${n}`}>
          <span className="sr-only">{t("editor.liveDiff.removed", { text: removed.text })}</span>
          <span aria-hidden="true">{removed.text}</span>
        </p>
      ));
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((text, index) => {
        const block = diff.blocks[index]!;
        const marks = [
          ...block.added.map(([from, to]) => ({ at: from, end: to, kind: "added" as const })),
          ...block.removed.map((r) => ({
            at: r.at,
            end: r.at,
            kind: "removed" as const,
            text: r.text,
          })),
        ].toSorted((a, b) => a.at - b.at);
        const parts: ReactNode[] = [];
        let cursor = 0;
        for (const [n, mark] of marks.entries()) {
          if (mark.at > cursor) parts.push(text.slice(cursor, mark.at));
          if (mark.kind === "added") {
            parts.push(
              <ins className={ADDED} key={n}>
                {text.slice(mark.at, mark.end)}
              </ins>,
            );
            cursor = mark.end;
          } else {
            parts.push(
              <del className={REMOVED} key={n}>
                {mark.text}
              </del>,
            );
            cursor = Math.max(cursor, mark.at);
          }
        }
        parts.push(text.slice(cursor));
        return (
          <Fragment key={index}>
            {gone(index)}
            <p>{parts}</p>
          </Fragment>
        );
      })}
      {gone(blocks.length)}
    </div>
  );
};
