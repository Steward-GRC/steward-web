// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { IncomingMessage, ServerResponse } from "node:http";

const SESSION_COOKIE = "steward_sid";

/**
 * The gateway's CSRF token for the session in `cookie` (`GET /auth/session`), which its
 * authenticated `/query` requires in `X-CSRF-Token`. The browser never holds the token, so the
 * proxy asks for it here. Empty when there is no live session; the gateway then answers 401.
 */
const csrfTokenFor = async (cookie: string | undefined, gatewayUrl: string): Promise<string> => {
  const hasSession = cookie
    ?.split(";")
    .some((part) => part.trim().startsWith(`${SESSION_COOKIE}=`));
  if (!cookie || !hasSession) return "";
  try {
    const response = await fetch(`${gatewayUrl.replace(/\/query$/, "")}/auth/session`, {
      headers: { accept: "application/json", cookie },
    });
    if (!response.ok) return "";
    const session = (await response.json()) as { authenticated?: boolean; csrfToken?: string };
    return session.authenticated ? (session.csrfToken ?? "") : "";
  } catch {
    return "";
  }
};

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

  const cookie = request.headers.cookie;
  const csrf = await csrfTokenFor(cookie, gatewayUrl);
  let upstream: Response;
  try {
    upstream = await fetch(gatewayUrl, {
      body: Buffer.concat(chunks),
      headers: {
        "content-type": request.headers["content-type"] ?? "application/json",
        ...(cookie ? { cookie } : {}),
        ...(csrf ? { "x-csrf-token": csrf } : {}),
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
