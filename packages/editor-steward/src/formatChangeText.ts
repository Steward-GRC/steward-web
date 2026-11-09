// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The words for a format change in the diff (bug log 261), shared by the editor's live diff and the
// Published tab: "Heading 1 → Paragraph", or "Formatting: none → bold".
import type { BlockFormat } from "./document/liveDiff";

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** A block kind as a translation key part: "heading:h1" is "heading_h1" (a colon splits a key). */
const kindKey = (kind: string) => kind.replaceAll(":", "_");

const kindName = (t: Translate, kind: string) => t(`editor.liveDiff.kinds.${kindKey(kind)}`);

const marksName = (t: Translate, names: readonly string[]) =>
  names.length === 0
    ? t("editor.liveDiff.noMarks")
    : names.map((name) => t(`editor.liveDiff.marks.${name}`)).join(", ");

/** What changed in a block's format, in words. */
export const formatChangeText = (
  t: Translate,
  change: { from: BlockFormat; to: BlockFormat },
): string =>
  change.from.kind === change.to.kind
    ? t("editor.liveDiff.marksChanged", {
        from: marksName(t, change.from.names),
        to: marksName(t, change.to.names),
      })
    : t("editor.liveDiff.formatChanged", {
        from: kindName(t, change.from.kind),
        to: kindName(t, change.to.kind),
      });
