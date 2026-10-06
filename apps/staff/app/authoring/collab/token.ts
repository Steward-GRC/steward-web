// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Collab token lifetime arithmetic.
//
// The collab JWT lives a few minutes (steward-collab's token TTL). A policy is authored for
// far longer than that, so a session MUST re-mint before expiry or the next reconnect 401s at
// the gateway and the room silently dies — taking any unsnapshotted edits with it.
//
// The token is only ever checked at the UPGRADE: steward-collab verifies `exp` when the
// socket is established and never re-checks it afterwards. So an expired token does not kill
// a live socket — it only makes the NEXT connect fail. That is what makes proactive
// re-minting cheap: refresh the credential in the background, hold it, and the reconnect path
// (whenever it happens) already has a valid one.
//
// This module is pure arithmetic so the timing rules can be tested without clocks or sockets.

/** Refresh this far ahead of `exp`, so a slow mint still lands in time. */
export const REFRESH_LEAD_MS = 60_000;

/** Never schedule a refresh tighter than this, to avoid a mint hot-loop. */
export const MIN_REFRESH_DELAY_MS = 5000;

/**
 * Milliseconds to wait before re-minting a token that expires at `expiresAt` (RFC3339, as
 * `IssueCollabTokenPayload.expiresAt` is rendered).
 *
 * Returns `MIN_REFRESH_DELAY_MS` for a token that is already expired, expiring within the
 * lead window, or carrying an unparseable timestamp — "refresh almost immediately" is the
 * safe reading of all three. A malformed date must not become `NaN` and silently cancel the
 * refresh timer, which would leave the session on a credential it can never renew.
 */
export const refreshDelayMs = (expiresAt: string, now: number): number => {
  const expiry = Date.parse(expiresAt);
  if (Number.isNaN(expiry)) return MIN_REFRESH_DELAY_MS;
  return Math.max(MIN_REFRESH_DELAY_MS, expiry - now - REFRESH_LEAD_MS);
};

/**
 * Whether a token is too close to expiry to be worth dialling with. Used before a reconnect:
 * if the held token is stale, mint a fresh one first rather than spending a connect attempt
 * on a guaranteed 401.
 */
export const isStale = (expiresAt: string, now: number): boolean => {
  const expiry = Date.parse(expiresAt);
  if (Number.isNaN(expiry)) return true;
  return expiry - now <= REFRESH_LEAD_MS;
};
