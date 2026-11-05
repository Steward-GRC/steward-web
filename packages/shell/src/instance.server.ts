// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { gatewayOrigin, reportApiError } from "@steward-web/api-client";

import type { InstanceState } from "./status";

/**
 * Whether this Steward is set up (steward-gateway `internal/setup`, `GET /setup/state`, public):
 * "needsSetup" until first-run setup makes the root administrator, "ready" after, and "unknown"
 * while the gateway can't say (unreachable, or answering an error). G1 shows while it is
 * unknown and G2 while it needs setup.
 */
export const instanceState = async (
  options: { queryUrl?: string } = {},
): Promise<InstanceState> => {
  try {
    const response = await fetch(`${gatewayOrigin(options.queryUrl)}/setup/state`, {
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      if (response.status >= 500) reportApiError("SetupState", `setup returned ${response.status}`);
      return "unknown";
    }
    const body = (await response.json()) as { needsSetup?: unknown };
    return body.needsSetup === true ? "needsSetup" : "ready";
  } catch {
    return "unknown";
  }
};
