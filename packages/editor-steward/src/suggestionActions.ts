// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Who may do what with a suggestion on a review thread, and when. The author is whoever may edit
// the policy; a reviewer holds a seat on its run. The two take turns. These are the service's rules
// (steward-mock-server review-suggestions.test.ts is the reference), so the screen offers only
// what the service will accept.

/** The buttons a person can be offered: take it, drop it, answer, end it, or take it back. */
export type SuggestionAction =
  | "accept"
  | "change"
  | "counter"
  | "notAgreed"
  | "remove"
  | "withdraw";

export type SuggestionOutcome = "AGREED" | "CHANGED" | "NOT_AGREED" | "REMOVED" | "WITHDRAWN";

export type SuggestionSide = "AUTHOR" | "REVIEWER";

export interface SuggestionState {
  /** True once the suggestion has ended. */
  closed: boolean;
  /** Which side proposed first. */
  firstBy: SuggestionSide;
  /** Which side the person acts on. */
  side: SuggestionSide;
  /** Whose turn it is to answer. */
  turn: SuggestionSide;
}

/** The actions open to the person now, in the order the screen shows them. */
export const suggestionActions = ({
  closed,
  firstBy,
  side,
  turn,
}: SuggestionState): SuggestionAction[] => {
  if (closed) return [];
  if (turn === side) {
    return side === "AUTHOR"
      ? ["change", "remove", "counter", "notAgreed"]
      : ["accept", "counter", "notAgreed"];
  }
  return firstBy === side ? ["withdraw"] : [];
};

/** The outcome an action records when it ends the suggestion; a counter does not end it. */
export const outcomeOf = (action: SuggestionAction): null | SuggestionOutcome =>
  (
    {
      accept: "AGREED",
      change: "CHANGED",
      counter: null,
      notAgreed: "NOT_AGREED",
      remove: "REMOVED",
      withdraw: "WITHDRAWN",
    } as const
  )[action];
