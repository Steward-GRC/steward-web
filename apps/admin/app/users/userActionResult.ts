// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Failure } from "@steward-web/ui";

/** What the user detail's action answers (A17 to A20). */
export type UserActionResult =
  | { failure: Failure; intent: string; ok: false }
  | { intent: string; ok: true; password?: string };

/** The frame's card: a white surface, a 1 px border, 10 px corners, 14 px in. */
export const CARD = "rounded-[10px] border border-border bg-surface p-3.5";

/** A settled fetcher's refusal, if its last answer was one. */
export const failureOf = (fetcher: { data?: UserActionResult; state: string }) =>
  fetcher.state === "idle" && fetcher.data && !fetcher.data.ok ? fetcher.data.failure : undefined;

/** A settled fetcher's last answer was a success. */
export const succeeded = (fetcher: { data?: UserActionResult; state: string }) =>
  fetcher.state === "idle" && fetcher.data?.ok === true;
