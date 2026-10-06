// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Pure reconnect-delay schedule for the collab session: doubles each attempt, capped, so a
// relay restart doesn't get hammered with reconnect attempts.

const BASE_MS = 500;
const MAX_MS = 10_000;

/** The delay before reconnect attempt `attempt` (1-based: the first retry is `attempt` 1). */
export const reconnectDelayMs = (attempt: number): number =>
  Math.min(BASE_MS * 2 ** Math.max(0, attempt - 1), MAX_MS);
