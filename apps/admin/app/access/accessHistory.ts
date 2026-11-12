// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The access editor's undo history (A5): pure functions over the draft, so the page, and any
// other editor that keeps a list of rules, share one small piece of state logic.
import { type DraftRule, rulesInputOf } from "./accessModel";

/** The draft now, the drafts before it (oldest first) and the ones undone and still redoable. */
export interface DraftHistory {
  future: readonly (readonly DraftRule[])[];
  past: readonly (readonly DraftRule[])[];
  present: readonly DraftRule[];
}

export const startHistory = (draft: readonly DraftRule[]): DraftHistory => ({
  future: [],
  past: [],
  present: draft,
});

/** A new change: the draft before it becomes one undo step and the redo steps are dropped. */
export const record = (history: DraftHistory, next: readonly DraftRule[]): DraftHistory =>
  next === history.present
    ? history
    : { future: [], past: [...history.past, history.present], present: next };

export const undo = (history: DraftHistory): DraftHistory => {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    future: [history.present, ...history.future],
    past: history.past.slice(0, -1),
    present: previous,
  };
};

export const redo = (history: DraftHistory): DraftHistory => {
  const [next, ...rest] = history.future;
  if (!next) return history;
  return { future: rest, past: [...history.past, history.present], present: next };
};

/** Whether the draft's rules differ from the saved ones; keys and moved marks don't count. */
export const differs = (draft: readonly DraftRule[], saved: readonly DraftRule[]): boolean =>
  JSON.stringify(rulesInputOf(draft)) !== JSON.stringify(rulesInputOf(saved));
