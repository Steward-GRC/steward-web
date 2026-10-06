// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Readiness follows the gateway: `/readyz` reports not-ready while the gateway can't be
 * reached, `/livez` never does (the process is alive regardless). The ping is cached for a
 * few seconds so a probe hitting `/readyz` every second doesn't load the gateway on every
 * call, and it recovers on its own once the gateway answers again.
 */

export interface ReadinessOptions {
  cacheMs?: number;
  now?: () => number;
  /** Resolves true when the dependency answers, false (never throws) otherwise. */
  ping: () => Promise<boolean>;
}

export interface ReadinessState {
  lastChecked: string;
  lastError?: string;
  state: "down" | "ok";
}

/** A cached readiness check for one required dependency. */
export const createReadinessChecker = ({
  cacheMs = 5000,
  now = Date.now,
  ping,
}: ReadinessOptions) => {
  let cached: { at: number; state: ReadinessState } | undefined;

  return async (): Promise<ReadinessState> => {
    if (cached && now() - cached.at < cacheMs) return cached.state;

    const checkedAt = now();
    let ok: boolean;
    let lastError: string | undefined;
    try {
      ok = await ping();
      if (!ok) lastError = "unreachable";
    } catch (error) {
      ok = false;
      lastError = error instanceof Error ? error.message : "unknown error";
    }

    const state: ReadinessState = {
      lastChecked: new Date(checkedAt).toISOString(),
      ...(lastError ? { lastError } : {}),
      state: ok ? "ok" : "down",
    };
    cached = { at: checkedAt, state };
    return state;
  };
};

/**
 * The `VERSION` and `COMMIT` build arguments, read from the environment at runtime (the
 * Dockerfile stamps them in). An unstamped or blank value falls back to `dev` and `unknown`,
 * the same convention the Go services use.
 */
export const resolveBuildInfo = (
  env: Record<string, string | undefined>,
): { commit: string; version: string } => ({
  commit: env.COMMIT?.trim() || "unknown",
  version: env.VERSION?.trim() || "dev",
});

export interface HealthRouteConfig {
  checkReady: () => Promise<ReadinessState>;
  commit: string;
  version: string;
}

/**
 * Answers `/livez` (process only, no dependency check) and `/readyz` (the gateway, the one
 * required dependency), both carrying the build headers. Returns `false` for any other path
 * so the caller falls through to its own routing. The gateway is always required here (it's
 * the only dependency this server has); its `version` is reported as `unknown` because a
 * cheap, unauthenticated reachability ping has no way to read it back — the full component
 * versions are available, once signed in, through Copy diagnostics instead.
 */
export const handleHealthRoute = (
  request: IncomingMessage,
  response: ServerResponse,
  { checkReady, commit, version }: HealthRouteConfig,
): boolean => {
  const headers = { "steward-commit": commit, "steward-version": version };
  const url = request.url ?? "/";

  if (url === "/livez") {
    response.writeHead(200, { ...headers, "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok" }));
    return true;
  }

  if (url === "/readyz") {
    void checkReady().then((gateway) => {
      response.writeHead(gateway.state === "ok" ? 200 : 503, {
        ...headers,
        "content-type": "application/json",
      });
      response.end(
        JSON.stringify({
          dependencies: { gateway: { ...gateway, required: true, version: "unknown" } },
          status: gateway.state,
        }),
      );
    });
    return true;
  }

  return false;
};
