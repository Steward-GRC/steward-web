// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Failure } from "@steward-web/ui";

/** What the organization setup's action answers (A24). */
export type OrgActionResult =
  | { failure: Failure; intent: string; ok: false }
  | { intent: string; link?: { url: string }; ok: true }
  | { intent: string; ok: false; validationError: string };

export const CARD = "rounded-[10px] border border-border bg-surface p-4";

/** A settled fetcher's refusal, if its last answer was one. */
export const failureOf = (fetcher: { data?: OrgActionResult; state: string }) =>
  fetcher.state === "idle" && fetcher.data && !fetcher.data.ok && "failure" in fetcher.data
    ? fetcher.data.failure
    : undefined;

/** A settled fetcher's form-level problem ("Enter the client secret."), if any. */
export const problemOf = (fetcher: { data?: OrgActionResult; state: string }) =>
  fetcher.state === "idle" && fetcher.data && !fetcher.data.ok && "validationError" in fetcher.data
    ? fetcher.data.validationError
    : undefined;

export const succeeded = (fetcher: { data?: OrgActionResult; state: string }) =>
  fetcher.state === "idle" && fetcher.data?.ok === true;
