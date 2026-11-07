// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// What an upload refusal says (bug log 195). The server's texts are for logs: "asset: files of this
// kind are not allowed (...)". The person gets one clear sentence, from the editor's own strings,
// and the same few kinds of sentence whichever card the file was sent from.

export interface UploadRefusal {
  /** The i18n key of the sentence. */
  key: string;
  values: Record<string, string>;
}

/** The sentence for a refusal, from what the server said (nothing, for a failure with no text). */
export const uploadRefusal = (text = ""): UploadRefusal => {
  const tooLarge = /too large/i.test(text);
  if (tooLarge) {
    const limit = /max upload size is ([\d.]+\s?[KMG]B)/i.exec(text)?.[1];
    return limit
      ? { key: "editor.upload.tooLarge", values: { limit } }
      : { key: "editor.upload.tooLargeAny", values: {} };
  }
  const mismatch = /the contents of "(.+)" do not match/i.exec(text);
  if (mismatch) return { key: "editor.upload.mismatch", values: { name: mismatch[1] ?? "" } };
  if (/not allowed|unsupported content type/i.test(text)) {
    return { key: "editor.upload.notAllowed", values: {} };
  }
  if (/empty upload/i.test(text)) return { key: "editor.upload.empty", values: {} };
  return { key: "editor.upload.failed", values: {} };
};
