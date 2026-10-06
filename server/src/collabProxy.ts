// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { IncomingMessage, Server } from "node:http";
import type { Socket } from "node:net";

import { WebSocket, WebSocketServer } from "ws";

/**
 * The path prefix the browser's y-websocket provider dials, and steward-gateway's own
 * `internal/collabws` proxy serves: `GET /collab/ws/{draftID}`.
 */
const COLLAB_PATH_PREFIX = "/collab/ws/";

/**
 * Close codes 1005 (no status received), 1006 (abnormal closure) and 1015 (TLS handshake)
 * describe HOW a socket ended, not something a peer may put on the wire — `ws`'s own
 * `.close()` rejects them. Map them to 1001 (going away), the same substitution the
 * gateway's own collab proxy makes for the peer it forwards a close to.
 */
const RESERVED_CLOSE_CODES = new Set([1005, 1006, 1015]);
const wireCloseCode = (code: number): number => (RESERVED_CLOSE_CODES.has(code) ? 1001 : code);

/**
 * Turns the gateway's query url (e.g. `http://localhost:8080/query`) into its websocket
 * origin (`ws://localhost:8080`) — the same host `queryProxy` calls into for GraphQL.
 */
export const collabUpstreamOrigin = (gatewayUrl: string): string => {
  const url = new URL(gatewayUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "";
  url.search = "";
  return url.toString().replace(/\/$/, "");
};

/**
 * Proxies the browser's upgrade for `/collab/ws/<draftId>` straight through to the gateway's
 * own collab websocket proxy, same-origin with the rest of the app so the browser never needs
 * the gateway's own address — the same reason `queryProxy` exists for `/query`. The gateway
 * re-checks the session cookie and the collab token itself; this relay is a byte-for-byte
 * pass-through in both directions and never parses a frame.
 */
export const attachCollabProxy = (server: Server, gatewayUrl: string): void => {
  const wss = new WebSocketServer({ noServer: true });
  const upstreamOrigin = collabUpstreamOrigin(gatewayUrl);

  server.on("upgrade", (request: IncomingMessage, socket: Socket, head: Buffer) => {
    const url = new URL(request.url ?? "", "http://localhost");
    if (!url.pathname.startsWith(COLLAB_PATH_PREFIX)) {
      // This server has no other upgrade route; refuse cleanly rather than leaving the
      // socket open with nothing to answer it.
      socket.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }

    const upstream = new WebSocket(`${upstreamOrigin}${url.pathname}${url.search}`, {
      headers: request.headers.cookie ? { cookie: request.headers.cookie } : {},
    });

    upstream.once("open", () => {
      wss.handleUpgrade(request, socket, head, (client) => {
        upstream.on("message", (data, isBinary) => {
          if (client.readyState === WebSocket.OPEN) client.send(data, { binary: isBinary });
        });
        client.on("message", (data, isBinary) => {
          if (upstream.readyState === WebSocket.OPEN) upstream.send(data, { binary: isBinary });
        });
        upstream.on("close", (code, reason) => {
          if (client.readyState === WebSocket.OPEN) client.close(wireCloseCode(code), reason);
        });
        client.on("close", (code, reason) => {
          if (upstream.readyState === WebSocket.OPEN) upstream.close(wireCloseCode(code), reason);
        });
        // Either side erroring tears the other down; `close` above already covers an
        // orderly shutdown, this just stops a dangling half-open socket on a protocol
        // error.
        upstream.on("error", () => client.terminate());
        client.on("error", () => upstream.terminate());
      });
    });

    // The gateway refused the upgrade (missing session, missing token, origin check) with
    // its own status and challenge. Pass that through verbatim rather than translating it
    // to a generic failure, so the provider's `connection-error` carries the real reason in
    // the network log.
    upstream.once("unexpected-response", (_request, response) => {
      socket.write(
        `HTTP/1.1 ${response.statusCode} ${response.statusMessage}\r\nConnection: close\r\n\r\n`,
      );
      socket.destroy();
    });

    // The gateway is unreachable outright (network error, DNS, connection refused).
    upstream.once("error", () => {
      if (!socket.destroyed) socket.destroy();
    });
  });
};
