// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// localStorage-backed resumable draft for the "new policy" create form, mirroring the
// original's drafts.ts: persist the in-progress form as it's filled in, restore it on
// return, and clear it on submit. Pure helpers here so the dedupe/emptiness logic is
// unit-tested directly; the debounced write loop lives in useResumableDraft.

const KEY = "steward-web:staff:new-policy-draft";

export const readLocalDraft = <T>(): null | T => {
  try {
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
