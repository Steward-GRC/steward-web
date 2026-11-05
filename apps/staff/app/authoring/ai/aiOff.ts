// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/** The authoring string that says why AI is off, from `aiHealth.reason` (U27). */
export const aiOffReason = (reason: null | string | undefined): string =>
  reason === "disabled_by_admin"
    ? "editor.aiMenu.offByAdmin"
    : reason === "limit_reached"
      ? "editor.aiMenu.limitReached"
      : "editor.aiMenu.unavailable";
