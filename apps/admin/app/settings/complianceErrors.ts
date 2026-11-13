// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/**
 * The refusals reporting gives for the Compliance module switch and the hard reset (8113 to
 * 8118), by their symbol. Each has its own sentence in `settings.complianceErrors`; the
 * server's text is never shown.
 */
export const COMPLIANCE_ERROR_CODES = [
  "HARD_RESET_CONFIRMATION",
  "HARD_RESET_LEGAL_HOLD",
  "HARD_RESET_MODULE_ON",
  "HARD_RESET_NOT_APPROVED",
  "HARD_RESET_ROOT_REQUIRED",
  "MODULE_OFF",
] as const;

export type ComplianceErrorCode = (typeof COMPLIANCE_ERROR_CODES)[number];

/** The known code in a gateway failure, or undefined for anything else. */
export const complianceErrorCode = (code: string | undefined): ComplianceErrorCode | undefined =>
  COMPLIANCE_ERROR_CODES.find((known) => known === code);

/** The phrase the root admin types to run a hard reset; reporting compares it exactly. */
export const HARD_RESET_PHRASE = "RESET COMPLIANCE DATA";

/** The module name identity keys a Compliance hard reset request by. */
export const HARD_RESET_MODULE = "compliance";
