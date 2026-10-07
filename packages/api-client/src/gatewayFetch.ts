// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

import { print } from "graphql";

import { sessionHeaders } from "./gatewaySession";

export interface GatewayRequest {
  /** The incoming request's `Cookie` header, forwarded as-is; the browser never sees this call. */
  cookie?: string;
  /** Aborts the call, e.g. the Copy diagnostics button's own 3-second budget. */
  signal?: AbortSignal;
  /** Overrides `process.env.GATEWAY_URL`. Callers from the browser (same-origin `/query`,
   *  proxied by `server/`) must always set this: there is no `process.env` to fall back to. */
  url?: string;
}

interface GraphQLErrorExtensions {
  code?: string;
  reason?: string;
  requestId?: string;
  traceId?: string;
}

interface GraphQLResponseBody<T> {
  data?: null | T;
  errors?: { extensions?: GraphQLErrorExtensions; message: string }[];
}

/**
 * The failure shape every call site (the shell's refusal helpers, in particular) reads.
 * Field names match `@steward-web/ui`'s `Failure` so a thrown `GatewayError` can be passed
 * straight to `toFailure` with no translation.
 */
export class GatewayError extends Error {
  code?: string;
  operation: string;
  reason?: string;
  requestId?: string;
  status?: number;
  traceId?: string;

  constructor(
    operation: string,
    message: string,
    fields: Pick<GatewayError, "code" | "reason" | "requestId" | "status" | "traceId"> = {},
  ) {
    super(message);
    this.name = "GatewayError";
    this.operation = operation;
    this.code = fields.code;
    this.reason = fields.reason;
    this.requestId = fields.requestId;
    this.status = fields.status;
    this.traceId = fields.traceId;
  }
}

const defaultUrl = () => process.env.GATEWAY_URL ?? "http://localhost:8080/query";

/**
 * POST one GraphQL operation to the gateway and return its data, or throw a `GatewayError`
 * built from the first error's extensions. Called from a loader or action, this carries the
 * incoming request's cookie over a server-to-server hop the browser never sees, with the
 * session's CSRF token in `X-CSRF-Token` (see `gatewaySession.ts`). The Copy
 * diagnostics button is the one caller that runs in the browser: it always passes
 * `url: "/query"` (same-origin, proxied by `server/`), so the session cookie travels as an
 * ordinary same-origin cookie, never as a value this code reads or holds.
 */
export const gatewayFetch = async <TResult, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
  operation: string,
  request: GatewayRequest = {},
): Promise<TResult> => {
  const url = request.url ?? defaultUrl();
  const response = await fetch(url, {
    body: JSON.stringify({ query: print(document), variables }),
    headers: {
      "content-type": "application/json",
      ...(await sessionHeaders(request.cookie, url)),
    },
    method: "POST",
    signal: request.signal,
  });

  if (!response.ok) {
    throw new GatewayError(operation, `gateway returned ${response.status}`, {
      status: response.status,
    });
  }

  const body = (await response.json()) as GraphQLResponseBody<TResult>;
  const [firstError] = body.errors ?? [];
  if (firstError) {
    throw new GatewayError(operation, firstError.message, {
      code: firstError.extensions?.code,
      reason: firstError.extensions?.reason,
      requestId: firstError.extensions?.requestId,
      status: response.status,
      traceId: firstError.extensions?.traceId,
    });
  }

  if (body.data == undefined) {
    throw new GatewayError(operation, "gateway returned no data", { status: response.status });
  }

  return body.data;
};
