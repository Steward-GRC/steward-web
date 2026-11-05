// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The gateway's `liveEvents(topics)` subscription (graphql/live.graphqls), held open by the
// Node server for as long as the browser's own stream is. Like `aiJobResult`, the browser
// never dials the gateway's websocket itself: a resource route relays what it needs.
import { print } from "graphql";
import { createClient } from "graphql-ws";
import WS from "ws";

import type { LiveEvent } from "../generated/schema";

import { apiErrorMessage, reportApiError } from "../apiErrorReporter";
import { GatewayError } from "../gatewayFetch";
import { LiveEventsDocument } from "../generated/graphql";
import { cookieSocket, defaultQueryUrl, fetchCsrfToken, wsUrlOf } from "./gatewaySocket.server";

interface SubscriptionError {
  extensions?: { code?: string; reason?: string };
  message?: string;
}

const refusalOf = (error: unknown): GatewayError => {
  if (error instanceof GatewayError) return error;
  const first = Array.isArray(error) ? (error[0] as SubscriptionError | undefined) : undefined;
  if (first) {
    return new GatewayError("LiveEvents", first.message ?? "subscription refused", {
      code: first.extensions?.code,
      reason: first.extensions?.reason,
    });
  }
  return new GatewayError(
    "LiveEvents",
    error instanceof Error ? error.message : "subscription failed",
  );
};

/**
 * Hands every live event whose type starts with one of `topics` to `onEvent` until `signal`
 * aborts (resolves) or the gateway ends the stream (resolves). A refusal, such as a caller
 * without `audit.read`, rejects with the gateway's code.
 */
export const watchLiveEvents = (
  topics: readonly string[],
  cookie: string | undefined,
  onEvent: (event: LiveEvent) => void,
  signal: AbortSignal,
  queryUrl: string = defaultQueryUrl(),
  socketBase: typeof WS = WS,
): Promise<void> =>
  fetchCsrfToken("LiveEvents", cookie, queryUrl)
    .then(
      (csrfToken) =>
        new Promise<void>((resolve, reject) => {
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
          if (signal.aborted) {
            finish(resolve);
            return;
          }
          signal.addEventListener("abort", () => finish(resolve), { once: true });
          client.subscribe<{ liveEvents: LiveEvent }>(
            { query: print(LiveEventsDocument), variables: { topics: [...topics] } },
            {
              complete: () => finish(resolve),
              error: (error) => finish(() => reject(refusalOf(error))),
              next: (message) => {
                const event = message.data?.liveEvents;
                if (event && !settled) onEvent(event);
              },
            },
          );
        }),
    )
    .catch((error: unknown) => {
      reportApiError("LiveEvents", apiErrorMessage(error));
      throw error;
    });
