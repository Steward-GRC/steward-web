// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Shared AI-health store: every AI affordance on a page calls `useAiHealth()` and shares ONE
// poll against `resources/ai-health` rather than each polling independently, mirroring the
// original's own aiHealth.ts.
import { apiErrorMessage, reportApiError } from "@steward-web/api-client";
import { useEffect, useState } from "react";

export interface AiHealthState {
  available: boolean;
  reason: null | string;
}

const POLL_MS = 30_000;

let state: AiHealthState = { available: true, reason: null };
let started = false;
const listeners = new Set<(s: AiHealthState) => void>();

const notify = () => {
  for (const listener of listeners) listener(state);
};

const refresh = async (): Promise<void> => {
  try {
    const response = await fetch("/resources/ai-health");
    if (!response.ok) reportApiError("AiHealth", `ai-health returned ${response.status}`);
    state = response.ok
      ? ((await response.json()) as AiHealthState)
      : { available: false, reason: null };
  } catch (error) {
    reportApiError("AiHealth", apiErrorMessage(error));
    state = { available: false, reason: null };
  }
  notify();
};

const ensureStarted = () => {
  if (started) return;
  started = true;
  void refresh();
  globalThis.setInterval(() => void refresh(), POLL_MS);
};

/** The shared AI-health state, seeded from the route's own loader so the first render never
 *  flashes "unavailable" while the first client poll is in flight. */
export const useAiHealth = (initial: AiHealthState): AiHealthState => {
  const [health, setHealth] = useState(initial);
  useEffect(() => {
    state = initial;
    ensureStarted();
    listeners.add(setHealth);
    return () => {
      listeners.delete(setHealth);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once per mount, the shared poll owns updates after
  }, []);
  return health;
};
