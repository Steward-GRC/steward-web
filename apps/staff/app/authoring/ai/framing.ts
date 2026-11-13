// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The framing an author picks for an AI draft or revision (#399): how the text should read.
// The gateway takes the DraftFraming and, for Custom, the author's own wording (required then,
// at most 500 characters, ignored otherwise). The same rules run in the browser, so a bad
// request never leaves the page, and in the action, so one that gets past it never reaches
// the gateway.
import { DraftFraming } from "@steward-web/api-client";

/** The longest custom wording, in characters. */
export const CUSTOM_FRAMING_MAX = 500;

/** The choices in the picker, in order. The empty one sends no framing: the default tone. */
export const FRAMING_CHOICES = [
  "",
  DraftFraming.Plain,
  DraftFraming.Professional,
  DraftFraming.Formal,
  DraftFraming.Custom,
] as const;

export type FramingChoice = (typeof FRAMING_CHOICES)[number];

export type FramingProblem = "missing" | "tooLong" | "unknown";

/** The wording's length in characters (not UTF-16 units), the way the gateway counts it. */
export const wordingLength = (wording: string): number => [...wording.trim()].length;

/** What is wrong with a framing and its wording, or null when it can be sent. */
export const framingProblem = (framing: string, wording: string): FramingProblem | null => {
  if (!(FRAMING_CHOICES as readonly string[]).includes(framing)) return "unknown";
  if (framing !== DraftFraming.Custom) return null;
  const length = wordingLength(wording);
  if (length === 0) return "missing";
  return length > CUSTOM_FRAMING_MAX ? "tooLong" : null;
};

/** The framing fields of a posted form, ready for the gateway, or the problem with them. */
export const framingOf = (
  form: FormData,
): { customFraming?: string; framing?: DraftFraming } | { problem: FramingProblem } => {
  const framing = String(form.get("framing") ?? "");
  const wording = String(form.get("customFraming") ?? "");
  const problem = framingProblem(framing, wording);
  if (problem) return { problem };
  if (framing === "") return {};
  if (framing === DraftFraming.Custom) {
    return { customFraming: wording.trim(), framing };
  }
  return { framing: framing as DraftFraming };
};
