// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/**
 * Whether to build the request URL and client address from `Forwarded`/`X-Forwarded-Proto`/
 * `X-Forwarded-Host` instead of the raw socket. Only turn this on when a reverse proxy that
 * terminates TLS (ingress-nginx) overwrites those headers on every hop; the chart and `kind`
 * set it. Off by default, so a request reaching the server's own socket directly is never
 * trusted to claim a protocol or host for itself.
 */
export const isTrustProxyEnabled = (env: NodeJS.ProcessEnv): boolean => env.TRUST_PROXY === "true";
