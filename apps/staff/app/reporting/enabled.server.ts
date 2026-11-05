// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/**
 * Compliance reporting is an install setting, off unless `STEWARD_REPORTING=true`. It's off for
 * rc.1 (decision 5-screens.s14): the case pages wait for their v0.2.0 redesign, and on the
 * current pages an officer's internal note sits beside the reporter thread.
 */
export const reportingEnabled = (): boolean => process.env.STEWARD_REPORTING === "true";

/** Ends a case route with not found, before any gateway call, while reporting is off. */
export const requireReporting = (): void => {
  if (!reportingEnabled()) throw new Response("Not Found", { status: 404 });
};
