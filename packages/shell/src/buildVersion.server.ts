// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { gatewayOrigin } from "@steward-web/api-client";

declare const __STEWARD_COMMIT__: string;
declare const __STEWARD_VERSION__: string;

/** What `GET /resources/version` answers, so a person or a script can compare what runs with main. */
export interface BuildVersion {
  app: "admin" | "staff";
  commit: string;
  /** The mock server's commit, when the gateway is the mock and answers; null otherwise. */
  mock: { commit: string } | null;
  version: string;
}

const MOCK_TIMEOUT_MS = 1500;

/**
 * The app's own build (stamped into the bundle at start from git, or the image's COMMIT) and, when
 * the gateway is steward-mock-server, the commit it started from (`GET /_mock/version`). A real
 * gateway has no such route, so the mock reads as null.
 */
export const buildVersion = async (
  app: BuildVersion["app"],
  options: { queryUrl?: string } = {},
): Promise<BuildVersion> => {
  const commit = typeof __STEWARD_COMMIT__ === "string" ? __STEWARD_COMMIT__ : "unknown";
  const version = typeof __STEWARD_VERSION__ === "string" ? __STEWARD_VERSION__ : "dev";
  let mock: BuildVersion["mock"] = null;
  try {
    const response = await fetch(`${gatewayOrigin(options.queryUrl)}/_mock/version`, {
      signal: AbortSignal.timeout(MOCK_TIMEOUT_MS),
    });
    if (response.ok) {
      const body = (await response.json()) as { commit?: unknown };
      if (typeof body.commit === "string") mock = { commit: body.commit };
    }
  } catch {
    mock = null;
  }
  return { app, commit, mock, version };
};
