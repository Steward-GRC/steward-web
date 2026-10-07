// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { GatewayError, type GatewayRequest } from "./gatewayFetch";
import { sessionHeaders } from "./gatewaySession";

const defaultUrl = () => process.env.GATEWAY_URL ?? "http://localhost:8080/query";

/** The gateway's admin IdP-import / SSO-test-link REST endpoints sit beside the GraphQL
 *  endpoint on the same host, as a sibling path rather than a query. */
const restUrl = (path: string): string => defaultUrl().replace(/\/query$/, path);

/**
 * POST one REST (non-GraphQL) call to the gateway's admin IdP-import / SSO-test-link
 * endpoints and return its JSON body, or throw a `GatewayError` built from the body's
 * `error` field. These endpoints are plain `{field: value}` in, `{field: value}` out or
 * `{"error": "..."}` on failure (the gateway's own REST contract — see
 * `internal/bff/idpimport.go` and `ssotestlink.go` — not GraphQL), so unlike
 * `gatewayFetch` there is no `data`/`errors` envelope to unwrap.
 */
export const gatewayRestFetch = async <TResult>(
  path: string,
  body: Record<string, unknown>,
  operation: string,
  request: GatewayRequest = {},
): Promise<TResult> => {
  const response = await fetch(request.url ?? restUrl(path), {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...(await sessionHeaders(request.cookie, defaultUrl())),
    },
    method: "POST",
    signal: request.signal,
  });

  const json: Record<string, unknown> = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new GatewayError(
      operation,
      typeof json.error === "string" ? json.error : `gateway returned ${response.status}`,
      { status: response.status },
    );
  }
  return json as TResult;
};
