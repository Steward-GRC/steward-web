// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// What Reset did, said in words (bug log 203): the headings it put back, the ones it found already
// there and left as written, and the ones it kept at the author's own heading level.
export interface ResetSummary {
  kept: readonly string[];
  otherLevel: readonly string[];
  restored: readonly string[];
}

export const resetSummaryText = (
  t: (key: string, options?: Record<string, unknown>) => string,
  summary: ResetSummary,
): string =>
  [
    summary.restored.length > 0
      ? t("editor.required.resetPutBack", { titles: summary.restored.join(", ") })
      : null,
    summary.kept.length > 0
      ? t("editor.required.resetKept", { titles: summary.kept.join(", ") })
      : null,
    summary.otherLevel.length > 0
      ? t("editor.required.resetLevel", { titles: summary.otherLevel.join(", ") })
      : null,
  ]
    .filter(Boolean)
    .join(" ");
