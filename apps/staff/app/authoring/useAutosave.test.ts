// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// bug log 192: a draft saves itself after the person stops typing, once per change, and never when
// nothing changed.
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { draftCanSave, useAutosave } from "./useAutosave";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

interface Props {
  content: string;
  enabled?: boolean;
  saved: boolean;
  saving?: boolean;
}

const setup = (initial: Props, delayMs = 1000) => {
  const save = vi.fn();
  const { rerender } = renderHook(
    (props: Props) => useAutosave({ delayMs, enabled: true, saving: false, ...props, save }),
    { initialProps: initial },
  );
  return { rerender, save };
};

describe("useAutosave", () => {
  it("saves once, a moment after the content stops changing", () => {
    const { rerender, save } = setup({ content: "a", saved: false });
    vi.advanceTimersByTime(900);
    expect(save).not.toHaveBeenCalled();
    rerender({ content: "ab", saved: false });
    vi.advanceTimersByTime(900);
    expect(save).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("does nothing when nothing changed", () => {
    const { save } = setup({ content: "a", saved: true });
    vi.advanceTimersByTime(60_000);
    expect(save).not.toHaveBeenCalled();
  });

  it("does not save again once the save landed, and saves the next change", () => {
    const { rerender, save } = setup({ content: "a", saved: false });
    vi.advanceTimersByTime(1000);
    expect(save).toHaveBeenCalledTimes(1);
    rerender({ content: "a", saved: false, saving: true });
    rerender({ content: "a", saved: true });
    vi.advanceTimersByTime(60_000);
    expect(save).toHaveBeenCalledTimes(1);
    rerender({ content: "ab", saved: false });
    vi.advanceTimersByTime(1000);
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("waits while a save is running", () => {
    const { rerender, save } = setup({ content: "a", saved: false, saving: true });
    vi.advanceTimersByTime(5000);
    expect(save).not.toHaveBeenCalled();
    rerender({ content: "ab", saved: false, saving: false });
    vi.advanceTimersByTime(1000);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("does not save when it is switched off", () => {
    const { save } = setup({ content: "a", enabled: false, saved: false });
    vi.advanceTimersByTime(60_000);
    expect(save).not.toHaveBeenCalled();
  });

  it("does not retry the same content in a loop after a save fails", () => {
    const { rerender, save } = setup({ content: "a", saved: false });
    vi.advanceTimersByTime(1000);
    expect(save).toHaveBeenCalledTimes(1);
    // the save ended without landing: still unsaved, same content
    rerender({ content: "a", saved: false, saving: true });
    rerender({ content: "a", saved: false, saving: false });
    vi.advanceTimersByTime(60_000);
    expect(save).toHaveBeenCalledTimes(1);
    // a further edit tries again
    rerender({ content: "ab", saved: false });
    vi.advanceTimersByTime(1000);
    expect(save).toHaveBeenCalledTimes(2);
  });
});

describe("draftCanSave", () => {
  const base = { collabReadOnly: false, editorReady: true, hasDraft: true };

  it("lets a draft in review keep saving: the author edits while the approvers review", () => {
    expect(draftCanSave({ ...base })).toBe(true);
  });

  it("waits for the draft and the editor, and stops when the room is read-only", () => {
    expect(draftCanSave({ ...base, hasDraft: false })).toBe(false);
    expect(draftCanSave({ ...base, editorReady: false })).toBe(false);
    expect(draftCanSave({ ...base, collabReadOnly: true })).toBe(false);
  });
});
