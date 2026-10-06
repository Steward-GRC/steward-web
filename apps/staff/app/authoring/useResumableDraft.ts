// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef } from "react";

import { clearLocalDraft, writeLocalDraft } from "./localDraft";

/**
 * Debounced, deduped localStorage persistence for the new-policy create form. Restoring is
 * the caller's job (`readLocalDraft` in a `useState` initializer), so the first render
 * already shows the resumed values; this hook only handles the write side: debounced
 * (default 500ms) so typing doesn't spam localStorage, deduped (an unchanged value never
 * re-writes), and self-clearing once the form is empty again.
 */
export const useResumableDraft = <T>(
  value: T,
  options: { debounceMs?: number; isEmpty: boolean },
): void => {
  const { debounceMs = 500, isEmpty } = options;
  const serialized = JSON.stringify(value);
  const lastWritten = useRef<null | string>(null);
  const timer = useRef<ReturnType<typeof globalThis.setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (isEmpty) {
      clearLocalDraft();
      lastWritten.current = null;
      return;
    }
    if (serialized === lastWritten.current) return;
    globalThis.clearTimeout(timer.current);
    timer.current = globalThis.setTimeout(() => {
      writeLocalDraft(value);
      lastWritten.current = serialized;
    }, debounceMs);
    return () => globalThis.clearTimeout(timer.current);
  }, [isEmpty, serialized, debounceMs, value]);
};
