// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

const MAX_LENGTH = 200;

/**
 * One short line for the log and the dev strip report about an error the editor caught: the
 * error's name and first message line, cut short. Never the stack, the editor state or the
 * document, which can hold a policy's text (or, in a report, something that identifies a person).
 */
export const describeEditorError = (error: unknown): string => {
  const name = error instanceof Error ? error.name : "Error";
  const message = error instanceof Error ? error.message : String(error ?? "");
  const line = `${name}: ${message.split("\n", 1)[0] ?? ""}`.trim();
  return line.length > MAX_LENGTH ? `${line.slice(0, MAX_LENGTH)}…` : line;
};
