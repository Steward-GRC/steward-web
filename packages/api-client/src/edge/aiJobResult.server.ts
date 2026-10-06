// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The one subscription the live edge makes: waiting for a single async AI job's terminal
// push over the gateway's `aiJobResult(jobId)` (graphql/ai.graphqls), instead of polling
// `aiJob(jobId)` on an interval. This runs in the Node server only — the `ai-jobs` resource
// route relays the result on to the browser over SSE, so the browser never dials the
// gateway's websocket or holds its session's CSRF token itself.
import { print } from "graphql";
import { createClient } from "graphql-ws";
import WS from "ws";

import type { AiJobResult } from "../generated/schema";

import { GatewayError } from "../gatewayFetch";
import { AiJobResultDocument } from "../generated/graphql";

const defaultQueryUrl = (): string => process.env.GATEWAY_URL ?? "http://localhost:8080/query";

/** http(s) -> ws(s), the same swap the browser's own collab relay url gets
 *  (`authoring/collab/wsUrl.ts`) — here for the server's absolute `GATEWAY_URL`, which never
 *  needs resolving against a page. */
const wsUrlOf = (queryUrl: string): string => {
  const url = new URL(queryUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
};

const sessionUrlOf = (queryUrl: string): string => queryUrl.replace(/\/query$/, "/auth/session");

interface SessionCheck {
  authenticated: boolean;
  csrfToken?: string;
}

/**
 * The gateway's double-submit CSRF token for the forwarded cookie's session (`GET
 * /auth/session`). A subscription's `connection_init` payload must carry it: the upgrade
 * request's cookie alone is not enough, since a GET upgrade is a "simple" cross-site request
 * a browser can issue with no CORS preflight — steward-gateway's `websocketInit` refuses
 * without the matching token.
 */
const fetchCsrfToken = async (cookie: string | undefined, queryUrl: string): Promise<string> => {
  const response = await fetch(sessionUrlOf(queryUrl), { headers: cookie ? { cookie } : {} });
  if (!response.ok) {
    throw new GatewayError("AiJobResult", `session check returned ${response.status}`, {
      status: response.status,
    });
  }
  const session = (await response.json()) as SessionCheck;
  if (!session.authenticated || !session.csrfToken) {
    throw new GatewayError("AiJobResult", "no live session for the subscription", {
      code: "UNAUTHENTICATED",
      status: 401,
    });
  }
  return session.csrfToken;
};

/**
 * `ws`'s non-standard third constructor argument is the only way to put the forwarded
 * session cookie on the upgrade request: `graphql-ws` constructs its socket with just
 * `new WebSocketImpl(url, protocols)`, the same two arguments the browser's own `WebSocket`
 * takes (which has no header API at all). One subclass per call keeps the cookie local to
 * this one subscription rather than in any shared, swappable state.
 */
const cookieSocket = (cookie: string | undefined, base: typeof WS) =>
  class extends base {
    constructor(address: string, protocols?: string | string[]) {
      super(address, protocols, cookie ? { headers: { cookie } } : undefined);
    }
  };

/**
 * Waits for async AI job `jobId`'s single terminal push over the gateway's `aiJobResult`
 * subscription. The schema drains it immediately if the job was already terminal when the
 * subscription opened, so a late call still resolves promptly; either way there is exactly
 * one event, then the gateway closes the channel. `signal` cancels the wait — the `ai-jobs`
 * SSE route passes the request's own signal, so an abandoned browser stream tears this down
 * too.
 */
export const awaitAiJobResult = (
  jobId: string,
  cookie: string | undefined,
  signal?: AbortSignal,
  queryUrl: string = defaultQueryUrl(),
  socketBase: typeof WS = WS,
): Promise<AiJobResult> =>
  fetchCsrfToken(cookie, queryUrl).then(
    (csrfToken) =>
      new Promise<AiJobResult>((resolve, reject) => {
        const client = createClient({
          connectionParams: { csrfToken },
          retryAttempts: 0,
          url: wsUrlOf(queryUrl),
          webSocketImpl: cookieSocket(cookie, socketBase),
        });
        let settled = false;
        const finish = (run: () => void) => {
          if (settled) return;
          settled = true;
          run();
          client.dispose();
        };
        signal?.addEventListener(
          "abort",
          () => finish(() => reject(new GatewayError("AiJobResult", "aborted"))),
          { once: true },
        );
        client.subscribe<{ aiJobResult: AiJobResult }>(
          { query: print(AiJobResultDocument), variables: { jobId } },
          {
            complete: () =>
              finish(() =>
                reject(new GatewayError("AiJobResult", "subscription closed with no result")),
              ),
            error: (error) =>
              finish(() =>
                reject(
                  error instanceof Error
                    ? new GatewayError("AiJobResult", error.message)
                    : new GatewayError("AiJobResult", "subscription failed"),
                ),
              ),
            next: (message) => {
              const result = message.data?.aiJobResult;
              if (result) finish(() => resolve(result));
            },
          },
        );
      }),
  );
