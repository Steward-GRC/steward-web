// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// What every gateway subscription the Node server makes needs: the websocket url, the
// session's CSRF token for connection_init, and a socket that carries the forwarded cookie.
import type WS from "ws";

import { GatewayError } from "../gatewayFetch";

export const defaultQueryUrl = (): string =>
  process.env.GATEWAY_URL ?? "http://localhost:8080/query";

/** http(s) -> ws(s), the same swap the browser's own collab relay url gets
 *  (`authoring/collab/wsUrl.ts`), here for the server's absolute `GATEWAY_URL`, which never
 *  needs resolving against a page. */
export const wsUrlOf = (queryUrl: string): string => {
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
export const fetchCsrfToken = async (
  operation: string,
  cookie: string | undefined,
  queryUrl: string,
): Promise<string> => {
  const response = await fetch(sessionUrlOf(queryUrl), { headers: cookie ? { cookie } : {} });
  if (!response.ok) {
    throw new GatewayError(operation, `session check returned ${response.status}`, {
      status: response.status,
    });
  }
  const session = (await response.json()) as SessionCheck;
  if (!session.authenticated || !session.csrfToken) {
    throw new GatewayError(operation, "no live session for the subscription", {
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
export const cookieSocket = (cookie: string | undefined, base: typeof WS) =>
  class extends base {
    constructor(address: string, protocols?: string | string[]) {
      super(address, protocols, cookie ? { headers: { cookie } } : undefined);
    }
  };
