// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/** One failed API call, as every API client reports it. */
export interface ApiErrorReport {
  message: string;
  operation: string;
}

type ApiErrorListener = (report: ApiErrorReport) => void;

const listeners = new Set<ApiErrorListener>();

/** Subscribes to every API client's failures; returns the unsubscribe. */
export const onApiError = (listener: ApiErrorListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Tells every listener about one failed call. A listener that throws is skipped, so a
 * reporting bug can never replace the error the caller is about to see.
 */
export const reportApiError = (operation: string, message: string): void => {
  for (const listener of listeners) {
    try {
      listener({ message, operation });
    } catch {
      // A listener's own failure must not reach the API caller.
    }
  }
};

/** The message a thrown value reports. */
export const apiErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
