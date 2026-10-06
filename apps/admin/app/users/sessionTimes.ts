// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/** When a session was last used, in local time; a dash for a session never seen. */
export const lastSeenLabel = (session: { readonly lastSeenAt?: null | string }): string =>
  session.lastSeenAt ? new Date(session.lastSeenAt).toLocaleString() : "—";
