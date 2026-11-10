// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { ServerBuild } from "react-router";

/**
 * The hosts React Router accepts as the `Origin` of a form POST besides the request's own host
 * (`ALLOWED_ACTION_ORIGINS`, comma-separated, hosts only: `steward.example.org`, or a wildcard
 * such as `*.example.org`). The fallback for a deployment whose proxy chain cannot forward the
 * original scheme and host, so `TRUST_PROXY` alone does not make them match. Empty by default:
 * only a request whose `Origin` equals its own URL's origin is accepted.
 */
export const parseAllowedActionOrigins = (env: NodeJS.ProcessEnv): string[] =>
  (env.ALLOWED_ACTION_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin !== "");

/** The build with React Router's `allowedActionOrigins` set; the build is otherwise untouched. */
export const withAllowedActionOrigins = (build: ServerBuild, origins: string[]): ServerBuild =>
  origins.length === 0 ? build : { ...build, allowedActionOrigins: origins };
