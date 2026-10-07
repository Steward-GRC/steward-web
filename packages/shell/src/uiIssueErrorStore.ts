// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { onApiError } from "@steward-web/api-client";

import type { UiIssueErrorInput, UiIssueErrorSource } from "./uiIssueBundle";

const MAX_ERRORS = 5;
let errors: UiIssueErrorInput[] = [];

/** Records one error at the front (newest first), keeping at most `MAX_ERRORS`. */
export const recordUiIssueError = (
  source: UiIssueErrorSource,
  message: string,
  at: Date = new Date(),
): void => {
  errors = [{ at, m: message, src: source }, ...errors].slice(0, MAX_ERRORS);
};

export const getLastUiIssueError = (): UiIssueErrorInput | undefined => errors[0];

export const getRecentUiIssueErrors = (): readonly UiIssueErrorInput[] => errors;

/** Test-only reset; production code never needs to clear the ring buffer. */
export const resetUiIssueErrorsForTests = (): void => {
  errors = [];
};

const onWindowError = (event: Event): void => {
  const message = (event as { message?: unknown }).message;
  recordUiIssueError("window", typeof message === "string" ? message : "window error");
};

const onUnhandledRejection = (event: Event): void => {
  const reason = (event as { reason?: unknown }).reason;
  recordUiIssueError(
    "promise",
    reason instanceof Error ? reason.message : String(reason ?? "unhandled rejection"),
  );
};

/**
 * Captures window errors, unhandled promise rejections and every API client's failures
 * (`fetch`, through `@steward-web/api-client`'s `onApiError`) automatically. `render` entries
 * come from `recordUiIssueError` called where those are caught.
 */
export const installUiIssueErrorListeners = (target: EventTarget = globalThis): (() => void) => {
  target.addEventListener("error", onWindowError);
  target.addEventListener("unhandledrejection", onUnhandledRejection);
  const stopApiErrors = onApiError(({ message, operation }) =>
    recordUiIssueError("fetch", `${operation}: ${message}`),
  );
  return () => {
    target.removeEventListener("error", onWindowError);
    target.removeEventListener("unhandledrejection", onUnhandledRejection);
    stopApiErrors();
  };
};
