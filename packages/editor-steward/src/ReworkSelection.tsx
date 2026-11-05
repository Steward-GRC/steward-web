// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Steward's "Rework selected text with AI" (Authoring U27, D13): a saffron button drawn over the
// editor under a text selection, with Rewrite and Clarify. It runs inside the Koenig composer
// as a Lexical plugin, so it reads the selection itself, and it remembers the selection it was
// asked about so the host can put the AI's text in its place later (`replaceSelection`).
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useTranslation } from "@steward-web/i18n";
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  type LexicalEditor,
  type RangeSelection,
} from "lexical";
import { type RefObject, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ReworkChoice = "clarify" | "rewrite";

export interface ReworkRequest {
  choice: ReworkChoice;
  text: string;
}

interface Placed {
  left: number;
  text: string;
  top: number;
}

/** Where the button goes: just under the selection, relative to the editor's box. */
const placeUnder = (container: HTMLElement | null): { left: number; top: number } => {
  const range = globalThis.getSelection?.()?.rangeCount
    ? globalThis.getSelection()!.getRangeAt(0)
    : null;
  if (!container || !range) return { left: 0, top: 0 };
  const box = container.getBoundingClientRect();
  const rect = range.getBoundingClientRect();
  return { left: Math.max(0, rect.left - box.left), top: rect.bottom - box.top + 8 };
};

// Pressing a button would otherwise move focus and drop the selection it's about.
const keepSelection = (event: { preventDefault: () => void }) => event.preventDefault();

/** The selection the host was last asked about, kept for `replaceSelection`. */
export type SavedSelection = RefObject<null | RangeSelection>;

/**
 * Puts `text` in place of the saved selection. False when there's none, or when its text has
 * gone since (another author edited it, say), so the host can say it couldn't apply.
 */
export const replaceSavedSelection = (
  editor: LexicalEditor,
  saved: SavedSelection,
  text: string,
): boolean => {
  const selection = saved.current;
  if (!selection) return false;
  let replaced = false;
  editor.update(
    () => {
      const stillThere =
        $getNodeByKey(selection.anchor.key) !== null && $getNodeByKey(selection.focus.key) !== null;
      if (!stillThere) return;
      const restored = selection.clone();
      $setSelection(restored);
      restored.insertText(text);
      replaced = true;
    },
    { discrete: true },
  );
  saved.current = null;
  return replaced;
};

export interface ReworkSelectionPluginProps {
  containerRef: RefObject<HTMLDivElement | null>;
  onRework: (request: ReworkRequest) => void;
  saved: SavedSelection;
}

export const ReworkSelectionPlugin = ({
  containerRef,
  onRework,
  saved,
}: ReworkSelectionPluginProps) => {
  const [editor] = useLexicalComposerContext();
  const { t } = useTranslation("authoring");
  const [placed, setPlaced] = useState<null | Placed>(null);
  const [open, setOpen] = useState(false);

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        const text = editorState.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || selection.isCollapsed()) return "";
          return selection.getTextContent();
        });
        if (!editor.isEditable() || !text.trim()) {
          setPlaced(null);
          setOpen(false);
          return;
        }
        setPlaced({ text, ...placeUnder(containerRef.current) });
      }),
    [containerRef, editor],
  );

  const container = containerRef.current;
  if (!placed || !container) return null;

  const choose = (choice: ReworkChoice) => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      saved.current = $isRangeSelection(selection) ? selection.clone() : null;
    });
    setOpen(false);
    onRework({ choice, text: placed.text });
  };

  return createPortal(
    <div
      className="absolute z-10 flex flex-col items-start gap-1"
      style={{ left: placed.left, top: placed.top }}
    >
      <div className="flex items-center rounded-lg bg-ink p-1 shadow-lg">
        <button
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex h-[30px] items-center gap-1.5 rounded-[5px] bg-accent px-2.5 text-[13px] font-semibold text-[#261B25]"
          onClick={() => setOpen((was) => !was)}
          onMouseDown={keepSelection}
          type="button"
        >
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          {t("editor.rework.button")}
        </button>
      </div>
      {open ? (
        <div
          aria-label={t("editor.rework.button")}
          className="flex min-w-[160px] flex-col rounded-[10px] border border-border bg-surface p-1.5 text-sm text-ink shadow-lg"
          role="menu"
        >
          {(["rewrite", "clarify"] as const).map((choice) => (
            <button
              className="rounded-md px-2.5 py-2 text-left hover:bg-sunken focus-visible:bg-sunken"
              key={choice}
              onClick={() => choose(choice)}
              onMouseDown={keepSelection}
              role="menuitem"
              type="button"
            >
              {t(`editor.rework.${choice}`)}
            </button>
          ))}
        </div>
      ) : null}
    </div>,
    container,
  );
};
