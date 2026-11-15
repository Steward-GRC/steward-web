// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/** The authoring string that says why AI is off, from `aiHealth.reason` (U27). */
export const aiOffReason = (reason: null | string | undefined): string =>
  reason === "disabled_by_admin"
    ? "editor.aiMenu.offByAdmin"
    : reason === "limit_reached"
      ? "editor.aiMenu.limitReached"
      : reason === "provider_auth_failed"
        ? "editor.aiMenu.providerAuthFailed"
        : reason === "provider_provider_error"
          ? "editor.aiMenu.providerError"
          : reason === "provider_not_configured"
            ? "editor.aiMenu.providerNotConfigured"
            : "editor.aiMenu.unavailable";

/**
 * The ai string for a refused start. A fault on the gateway's side (its ai service not
 * answering) says AI isn't available; anything else keeps the generic line.
 */
export const aiRefusalKey = (failure?: { code?: string; status?: number } | null) =>
  failure?.code === "INTERNAL" || (failure?.status !== undefined && failure.status >= 500)
    ? "refusedUnavailable"
    : "refused";
