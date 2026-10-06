// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * The one client-side call into the gateway: the Copy diagnostics button's `fetch("/query",
 * ...)` (`@steward-web/shell`). Everything else (every loader and action) calls the gateway
 * directly from the server; this proxy exists only so that one browser call can reuse the
 * same same-origin session cookie instead of needing CORS or a direct connection to the
 * gateway's own address.
 */
export const proxyQuery = async (
  request: IncomingMessage,
  response: ServerResponse,
  gatewayUrl: string,
): Promise<void> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);

  let upstream: Response;
  try {
    upstream = await fetch(gatewayUrl, {
      body: Buffer.concat(chunks),
      headers: {
        "content-type": request.headers["content-type"] ?? "application/json",
        ...(request.headers.cookie ? { cookie: request.headers.cookie } : {}),
      },
      method: "POST",
    });
  } catch {
    response.writeHead(502, { "content-type": "application/json" });
    response.end(JSON.stringify({ errors: [{ message: "gateway unreachable" }] }));
    return;
  }

  response.writeHead(upstream.status, {
    "content-type": upstream.headers.get("content-type") ?? "application/json",
  });
  response.end(Buffer.from(await upstream.arrayBuffer()));
};
