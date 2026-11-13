// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { GatewayError } from "@steward-web/api-client";

/**
 * True when the gateway refused a report call because a site admin switched the Compliance
 * module off (MODULE_OFF, 8113). The data is kept; the screens say so in place of a failure.
 */
export const isModuleOff = (error: unknown): boolean =>
  error instanceof GatewayError && error.code === "MODULE_OFF";
