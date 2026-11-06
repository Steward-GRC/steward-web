// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Steward's "Rework selected text with AI" (Authoring U27, D13): a button on the editor's
// selection toolbar, beside Bold, Italic, the headings, Quote and Link, that opens a card of AI
// actions (Rewrite and Clarify) for the selected text. The editor package draws the toolbar and
// the card's place; this file supplies the button, the card and the remembered selection, so
// the host can put the AI's text in place of what was selected (`replaceSelection`) after the
// answer arrives.
import { type KoenigToolbarAction, type KoenigToolbarSelection } from "node-koenig-editor";
import { type FC, type RefObject } from "react";

export type ReworkChoice = "clarify" | "rewrite";

export interface ReworkRequest {
  choice: ReworkChoice;
  text: string;
}

/** Puts text where the selection last sent to the host was; false when that text has gone. */
export type SavedReplace = RefObject<((text: string) => boolean) | null>;

/** Replace the saved selection with `text`, once. False when there's none, or it has gone. */
export const replaceSavedSelection = (saved: SavedReplace, text: string): boolean => {
  const replace = saved.current;
  saved.current = null;
  return replace ? replace(text) : false;
};

export interface AiToolbarActionOptions {
  /** Leave the button out: the AI is off, or the person may not use it. */
  hidden: boolean;
  /** The words on the button and in the card. */
  labels: { button: string } & Record<ReworkChoice, string>;
  onRework: (request: ReworkRequest) => void;
  saved: SavedReplace;
}

const SparkleIcon: FC<{ className?: string }> = ({ className }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

// Pressing a button would otherwise move focus and drop the selection it's about.
const keepSelection = (event: { preventDefault: () => void }) => event.preventDefault();

const CHOICES: readonly ReworkChoice[] = ["rewrite", "clarify"];

/** The AI card of the selection toolbar. */
export const createAiToolbarAction = ({
  hidden,
  labels,
  onRework,
  saved,
}: AiToolbarActionOptions): KoenigToolbarAction => {
  const Card: FC<KoenigToolbarSelection> = ({ close, replaceSelection, text }) => (
    <div
      aria-label={labels.button}
      className="flex min-w-40 flex-col rounded-[10px] border border-border bg-surface p-1.5 text-sm text-ink shadow-lg"
      role="menu"
    >
      {CHOICES.map((choice) => (
        <button
          className="rounded-md px-2.5 py-2 text-left hover:bg-sunken focus-visible:bg-sunken"
          key={choice}
          onClick={() => {
            saved.current = replaceSelection;
            onRework({ choice, text });
            close();
          }}
          onMouseDown={keepSelection}
          role="menuitem"
          type="button"
        >
          {labels[choice]}
        </button>
      ))}
    </div>
  );
  return { Card, hidden, Icon: SparkleIcon, id: "ai", label: labels.button };
};
