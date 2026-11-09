// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The live diff drawn on the document (bug log 228). New words are painted with the browser's
// CSS highlights, which colour a range of text without adding a node, so the document, its
// history and any collaboration room never see them: the view is the viewer's own. Words that
// were published and are gone cannot be painted (they are not in the document), so each is
// marked where it stood, with what it said.
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useTranslation } from "@steward-web/i18n";
import {
  $getRoot,
  $isElementNode,
  $isLineBreakNode,
  $isTabNode,
  $isTextNode,
  type ElementNode,
  type LexicalEditor,
} from "lexical";
import { type FC, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type { SerializedDocument } from "./document/tree";

import { blockFormatsOf, diffBlocks, textBlocksOf } from "./document/liveDiff";
import { formatChangeText } from "./formatChangeText";

/** The editor-owned element the markers are placed against. */
export const EDITOR_HOST_ATTRIBUTE = "data-steward-editor";
const EDITOR_HOST_SELECTOR = "[data-steward-editor]";

const ADDED = "steward-diff-added";

/** The stylesheet for the painted words; `::highlight()` can only be written in CSS. */
const PAINT = `::highlight(${ADDED}) { background-color: var(--diff-added-soft); color: var(--diff-added); text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; }`;

interface BlockRef {
  element: HTMLElement | null;
  text: string;
}

/** The editor's text blocks by the rule `textBlocksOf` uses for a stored document. */
const $blocks = (editor: LexicalEditor): BlockRef[] => {
  const out: BlockRef[] = [];
  const visit = (node: ElementNode, isRoot: boolean) => {
    let text = "";
    for (const child of node.getChildren()) {
      if ($isElementNode(child) && !child.isInline()) continue;
      if ($isLineBreakNode(child)) text += "\n";
      else if ($isTabNode(child)) text += "\t";
      else if ($isTextNode(child) || $isElementNode(child)) text += child.getTextContent();
    }
    if (!isRoot && text !== "") out.push({ element: editor.getElementByKey(node.getKey()), text });
    for (const child of node.getChildren())
      if ($isElementNode(child) && !child.isInline()) visit(child, false);
  };
  visit($getRoot(), true);
  return out;
};

/** The range for [from, to) characters of a block, counting a line break as one character. */
const rangeIn = (
  block: HTMLElement,
  from: number,
  to: number,
  nested: readonly HTMLElement[],
): null | Range => {
  const walker = globalThis.document.createTreeWalker(
    block,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
  );
  const range = globalThis.document.createRange();
  let at = 0;
  let started = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if ((node as Element).tagName === "BR") at += 1;
      continue;
    }
    // text of a block inside this one (a sub-list) belongs to that block, not this one
    if (nested.some((inner) => inner !== block && block.contains(inner) && inner.contains(node)))
      continue;
    const length = node.textContent?.length ?? 0;
    if (!started && from < at + length) {
      range.setStart(node, from - at);
      started = true;
    }
    if (started && to <= at + length) {
      range.setEnd(node, to - at);
      return range;
    }
    at += length;
  }
  return null;
};

interface Marker {
  height: number;
  id: string;
  kind: "format" | "removed";
  left: number;
  text: string;
  top: number;
}

const supportsHighlights = () =>
  globalThis.CSS !== undefined &&
  "highlights" in globalThis.CSS &&
  typeof (globalThis as { Highlight?: unknown }).Highlight === "function";

/** Re-reads the document a moment after the last change, so typing is never held up by it. */
const REFRESH_MS = 120;

export const LiveDiff: FC<{ published: SerializedDocument }> = ({ published }) => {
  const { t } = useTranslation("authoring");
  const [editor] = useLexicalComposerContext();
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const publishedBlocks = useMemo(() => textBlocksOf(published), [published]);
  const publishedFormats = useMemo(() => blockFormatsOf(published), [published]);

  useEffect(() => {
    const root = editor.getRootElement();
    const found = root?.closest<HTMLElement>(EDITOR_HOST_SELECTOR) ?? null;
    setHost(found);
    if (!found) return;
    const hostBox = () => found.getBoundingClientRect();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      const blocks = editor.getEditorState().read(() => $blocks(editor));
      // the editor lists its blocks by the rule the stored document does, so the two line up
      const currentFormats = blockFormatsOf(editor.getEditorState().toJSON() as SerializedDocument);
      const diff = diffBlocks(
        publishedBlocks,
        blocks.map((block) => block.text),
        currentFormats.length === blocks.length
          ? { current: currentFormats, published: publishedFormats }
          : undefined,
      );
      const elements = blocks.flatMap((block) => (block.element ? [block.element] : []));
      const ranges: Range[] = [];
      const next: Marker[] = [];
      const origin = hostBox();
      const place = (id: string, range: Range, text: string, kind: Marker["kind"] = "removed") => {
        // an environment without layout (a test DOM) has no box to measure
        const box =
          typeof range.getBoundingClientRect === "function"
            ? range.getBoundingClientRect()
            : { height: 0, left: origin.left, top: origin.top };
        next.push({
          height: box.height,
          id,
          kind,
          left: box.left - origin.left,
          text,
          top: box.top - origin.top,
        });
      };
      for (const [index, block] of blocks.entries()) {
        if (!block.element) continue;
        for (const [from, to] of diff.blocks[index]!.added) {
          const range = rangeIn(block.element, from, to, elements);
          if (range) ranges.push(range);
        }
        const changed = diff.blocks[index]!.format;
        if (changed) {
          const spot = rangeIn(block.element, 0, Math.min(1, block.text.length), elements);
          if (spot) place(`format-${index}`, spot, formatChangeText(t, changed), "format");
        }
        for (const [n, gone] of diff.blocks[index]!.removed.entries()) {
          // the marker sits on the character the old words stood in front of, or the last one
          const at = Math.max(0, Math.min(gone.at, block.text.length - 1));
          const spot = rangeIn(block.element, at, at + 1, elements);
          if (spot) place(`${index}-${n}`, spot, gone.text);
        }
      }
      for (const [n, gone] of diff.removedBlocks.entries()) {
        const target = blocks[Math.min(gone.before, blocks.length - 1)];
        const spot = target?.element ? rangeIn(target.element, 0, 1, elements) : null;
        if (spot) place(`block-${n}`, spot, gone.text);
      }
      if (supportsHighlights()) {
        const Paint = (globalThis as unknown as { Highlight: new (...r: Range[]) => unknown })
          .Highlight;
        (globalThis.CSS as unknown as { highlights: Map<string, unknown> }).highlights.set(
          ADDED,
          new Paint(...ranges),
        );
      }
      setMarkers(next);
    };
    refresh();
    const stop = editor.registerUpdateListener(() => {
      clearTimeout(timer);
      timer = setTimeout(refresh, REFRESH_MS);
    });
    return () => {
      stop();
      clearTimeout(timer);
      if (supportsHighlights())
        (globalThis.CSS as unknown as { highlights: Map<string, unknown> }).highlights.delete(
          ADDED,
        );
      setMarkers([]);
    };
  }, [editor, publishedBlocks, publishedFormats, t]);

  return (
    <>
      <style>{PAINT}</style>
      {host
        ? createPortal(
            <div
              aria-hidden={markers.length === 0}
              className="pointer-events-none absolute inset-0"
            >
              {markers.map((marker) => (
                <span
                  aria-label={
                    marker.kind === "format"
                      ? marker.text
                      : t("editor.liveDiff.removed", { text: marker.text })
                  }
                  className={`group pointer-events-auto absolute w-1.5 cursor-help border-l-2 ${
                    marker.kind === "format"
                      ? "border-[var(--info)]"
                      : "border-[var(--diff-removed)]"
                  }`}
                  {...(marker.kind === "format"
                    ? { "data-diff-format": "" }
                    : { "data-diff-removed": "" })}
                  key={marker.id}
                  role="img"
                  style={{ height: marker.height, left: marker.left - 3, top: marker.top }}
                  title={
                    marker.kind === "format"
                      ? marker.text
                      : t("editor.liveDiff.removed", { text: marker.text })
                  }
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-full left-0 z-10 hidden w-max max-w-xs rounded-[2px] px-1 text-sm group-hover:block ${
                      marker.kind === "format"
                        ? "bg-[var(--info-soft)] text-[var(--info)]"
                        : "bg-[var(--diff-removed-soft)] text-[var(--diff-removed)] line-through"
                    }`}
                  >
                    {marker.text}
                  </span>
                </span>
              ))}
            </div>,
            host,
          )
        : null}
    </>
  );
};
