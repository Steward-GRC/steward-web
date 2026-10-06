// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// localStorage-backed resumable draft for the "new policy" create form, mirroring the
// original's drafts.ts: persist the in-progress form as it's filled in, restore it on
// return, and clear it on submit. Pure helpers here so the dedupe/emptiness logic is
// unit-tested directly; the debounced write loop lives in useResumableDraft.

// Versioned so a value written by an earlier release, from before drafts were Lexical
// documents, is never read back into the form or the editor.
const KEY = "steward-web:staff:new-policy-draft:v2";
const RETIRED_KEYS = ["steward-web:staff:new-policy-draft"];

const dropRetired = (): void => {
  for (const key of RETIRED_KEYS) localStorage.removeItem(key);
};

export const readLocalDraft = <T>(): null | T => {
  try {
    dropRetired();
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const writeLocalDraft = <T>(value: T): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* best-effort only (private browsing / storage full) */
  }
};

export const clearLocalDraft = (): void => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* best-effort only */
  }
};

export interface NewPolicyDraft {
  documentType: string;
  groupId: string;
  sensitivity: string;
  templateId: string;
  title: string;
}

export const emptyNewPolicyDraft = (): NewPolicyDraft => ({
  documentType: "POLICY",
  groupId: "",
  sensitivity: "STANDARD",
  templateId: "",
  title: "",
});

/** Worth persisting only once the author has typed a title — an untouched form has nothing
 *  worth resuming. */
export const newPolicyDraftHasContent = (draft: NewPolicyDraft): boolean =>
  draft.title.trim() !== "";
