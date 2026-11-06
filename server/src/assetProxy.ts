// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { IncomingMessage, ServerResponse } from "node:http";

import { csrfTokenFor } from "./queryProxy.ts";

const ASSET_READ = /^\/api\/assets\/[^/?#]+(?:\?.*)?$/;

/** The editor image routes: the upload and a read by id (what an `<img src>` loads). */
export const isAssetRoute = (url: string, method: string | undefined): boolean => {
  if (method === "POST") return url === "/api/assets";
  if (method === "GET" || method === "HEAD") return ASSET_READ.test(url);
  return false;
};

const RELAYED = [
  "cache-control",
  "content-disposition",
  "content-length",
  "content-type",
  "cross-origin-resource-policy",
  "x-content-type-options",
];

/**
 * The editor's image upload and read, same-origin: the browser calls `/api/assets` on this
 * server and the call goes to the gateway's own `/api/assets` with the session cookie. A write
 * gets the session's CSRF token added (the browser never holds it, as for `/query`); a read goes
 * without one, as the gateway's safe-read route allows, so an `<img src>` loads. The gateway's
 * status, type and refusal text come back as they are.
 */
export const proxyAssets = async (
  request: IncomingMessage,
  response: ServerResponse,
  gatewayUrl: string,
): Promise<void> => {
  const url = request.url ?? "/api/assets";
  const write = request.method === "POST";
  const chunks: Buffer[] = [];
  if (write) for await (const chunk of request) chunks.push(chunk as Buffer);

  const cookie = request.headers.cookie;
  const csrf = write ? await csrfTokenFor(cookie, gatewayUrl) : "";
  let upstream: Response;
  try {
    upstream = await fetch(`${gatewayUrl.replace(/\/query$/, "")}${url}`, {
      ...(write ? { body: Buffer.concat(chunks) } : {}),
      headers: {
        ...(write && request.headers["content-type"]
          ? { "content-type": request.headers["content-type"] }
          : {}),
        ...(cookie ? { cookie } : {}),
        ...(csrf ? { "x-csrf-token": csrf } : {}),
      },
      method: request.method ?? "GET",
    });
  } catch {
    response.writeHead(502, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "gateway unreachable" }));
    return;
  }

  const headers: Record<string, string> = {};
  for (const name of RELAYED) {
    const value = upstream.headers.get(name);
    if (value !== null) headers[name] = value;
  }
  // The body is read whole, so its length is the one we send.
  const body = Buffer.from(await upstream.arrayBuffer());
  headers["content-length"] = String(body.length);
  response.writeHead(upstream.status, headers);
  response.end(request.method === "HEAD" ? undefined : body);
};
