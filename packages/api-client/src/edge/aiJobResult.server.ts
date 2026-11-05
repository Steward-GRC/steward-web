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

import { apiErrorMessage, reportApiError } from "../apiErrorReporter";
import { GatewayError } from "../gatewayFetch";
import { AiJobResultDocument } from "../generated/graphql";
import { cookieSocket, defaultQueryUrl, fetchCsrfToken, wsUrlOf } from "./gatewaySocket.server";

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
  fetchCsrfToken("AiJobResult", cookie, queryUrl)
    .then(
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
    )
    .catch((error: unknown) => {
      reportApiError("AiJobResult", apiErrorMessage(error));
      throw error;
    });
