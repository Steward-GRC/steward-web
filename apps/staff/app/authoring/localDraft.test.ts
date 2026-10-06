// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { beforeEach, describe, expect, it } from "vitest";

import {
  clearLocalDraft,
  emptyNewPolicyDraft,
  newPolicyDraftHasContent,
  readLocalDraft,
  writeLocalDraft,
} from "./localDraft";

beforeEach(() => {
  localStorage.clear();
});

describe("readLocalDraft / writeLocalDraft / clearLocalDraft", () => {
  it("round-trips a value", () => {
    const draft = { ...emptyNewPolicyDraft(), title: "Expense Claims" };
    writeLocalDraft(draft);
    expect(readLocalDraft()).toEqual(draft);
  });

  it("answers null when nothing is stored", () => {
    expect(readLocalDraft()).toBeNull();
  });

  it("clear removes the stored value", () => {
    writeLocalDraft(emptyNewPolicyDraft());
    clearLocalDraft();
    expect(readLocalDraft()).toBeNull();
  });
});

describe("the storage key change", () => {
  const legacyKey = "steward-web:staff:new-policy-draft";

  it("discards an entry left under the earlier key instead of resuming it", () => {
    localStorage.setItem(
      legacyKey,
      JSON.stringify([{ sectionKey: "purpose", text: "plain text", title: "Purpose" }]),
    );
    expect(readLocalDraft()).toBeNull();
    expect(localStorage.getItem(legacyKey)).toBeNull();
  });

  it("keeps a draft written under the current key", () => {
    localStorage.setItem(legacyKey, JSON.stringify({ title: "old" }));
    const draft = { ...emptyNewPolicyDraft(), title: "Current" };
    writeLocalDraft(draft);
    expect(readLocalDraft()).toEqual(draft);
    expect(localStorage.getItem(legacyKey)).toBeNull();
  });
});

describe("newPolicyDraftHasContent", () => {
  it("is false for an untouched form", () => {
    expect(newPolicyDraftHasContent(emptyNewPolicyDraft())).toBe(false);
  });

  it("is true once a title is entered", () => {
    expect(newPolicyDraftHasContent({ ...emptyNewPolicyDraft(), title: "Draft" })).toBe(true);
  });

  it("ignores whitespace-only text", () => {
    expect(newPolicyDraftHasContent({ ...emptyNewPolicyDraft(), title: " ".repeat(3) })).toBe(
      false,
    );
  });
});
