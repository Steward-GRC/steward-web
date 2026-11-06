// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDateTime } from "@steward-web/i18n";

/** When a session was last used, in the person's date style; a dash for a session never seen. */
export const lastSeenLabel = (session: { readonly lastSeenAt?: null | string }): string =>
  formatDateTime(session.lastSeenAt);
