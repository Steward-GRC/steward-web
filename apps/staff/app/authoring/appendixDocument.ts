// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { parseDocument, type SerializedDocument, wrapRoot } from "@steward-web/editor-steward";

/**
 * An appendix's content as the editor opens it: a document the editor wrote as it is; the older
 * plain-text shape (`{ text }`) as one paragraph per line; anything else as an empty document.
 */
export const appendixDocument = (contentJson?: null | string): SerializedDocument => {
  const document = parseDocument(contentJson);
  if (document) return document;
  try {
    const parsed = JSON.parse(contentJson || "{}") as { text?: unknown };
    if (typeof parsed.text === "string" && parsed.text !== "") {
      return wrapRoot(
        parsed.text.split("\n").map((line) => ({
          children: line === "" ? [] : [{ text: line, type: "text", version: 1 }],
          type: "paragraph",
          version: 1,
        })),
      );
    }
  } catch {
    // Not JSON: it starts empty.
  }
  return wrapRoot([]);
};
