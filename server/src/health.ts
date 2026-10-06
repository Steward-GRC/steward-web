// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * Readiness follows the gateway: `/readyz` reports not-ready while the gateway can't be
 * reached, `/livez` never does (the process is alive regardless). The ping is cached for a
 * few seconds so a probe hitting `/readyz` every second doesn't load the gateway on every
 * call, and it recovers on its own once the gateway answers again.
 */

export interface ReadinessOptions {
  cacheMs?: number;
  now?: () => number;
  /** Resolves true when the dependency answers, false (never throws) otherwise. */
  ping: () => Promise<boolean>;
}

export interface ReadinessState {
  lastChecked: string;
  lastError?: string;
  state: "down" | "ok";
}

/** A cached readiness check for one required dependency. */
export const createReadinessChecker = ({
  cacheMs = 5000,
  now = Date.now,
  ping,
}: ReadinessOptions) => {
  let cached: { at: number; state: ReadinessState } | undefined;

  return async (): Promise<ReadinessState> => {
    if (cached && now() - cached.at < cacheMs) return cached.state;

    const checkedAt = now();
    let ok: boolean;
    let lastError: string | undefined;
    try {
      ok = await ping();
      if (!ok) lastError = "unreachable";
    } catch (error) {
      ok = false;
      lastError = error instanceof Error ? error.message : "unknown error";
    }

    const state: ReadinessState = {
      lastChecked: new Date(checkedAt).toISOString(),
      ...(lastError ? { lastError } : {}),
      state: ok ? "ok" : "down",
    };
    cached = { at: checkedAt, state };
    return state;
  };
};
