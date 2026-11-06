// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";

import { isAssetRoute, proxyAssets } from "./assetProxy";

const listen = (server: Server): Promise<string> =>
  new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address == null || typeof address === "string") throw new Error("no port");
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });

const close = (server: Server): Promise<void> =>
  new Promise((resolve) => server.close(() => resolve()));

let upstream: Server | undefined;
let proxy: Server | undefined;

afterEach(async () => {
  if (upstream) await close(upstream);
  if (proxy) await close(proxy);
  upstream = undefined;
  proxy = undefined;
});

const PNG = Buffer.from("89504e470d0a1a0a01020304", "hex");

const start = async (handler: Parameters<typeof createServer>[1]) => {
  upstream = createServer(handler);
  const upstreamUrl = await listen(upstream);
  proxy = createServer((request, response) => {
    void proxyAssets(request, response, `${upstreamUrl}/query`);
  });
  return listen(proxy);
};

describe("isAssetRoute", () => {
  it("is the editor image upload and read paths only", () => {
    expect(isAssetRoute("/api/assets", "POST")).toBe(true);
    expect(isAssetRoute("/api/assets/abc-123", "GET")).toBe(true);
    expect(isAssetRoute("/api/assets/abc-123", "HEAD")).toBe(true);
    expect(isAssetRoute("/api/assets", "GET")).toBe(false);
    expect(isAssetRoute("/api/assets/a/b", "GET")).toBe(false);
    expect(isAssetRoute("/api/assets/abc", "DELETE")).toBe(false);
    expect(isAssetRoute("/api/other", "POST")).toBe(false);
  });
});

describe("proxyAssets", () => {
  it("sends an upload to the gateway's /api/assets with the session's CSRF token, body intact", async () => {
    let seen: { body: Buffer; csrf?: string; type?: string; url?: string } | undefined;
    const proxyUrl = await start(async (request, response) => {
      if (request.url === "/auth/session") {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify({ authenticated: true, csrfToken: "csrf-1" }));
        return;
      }
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(chunk as Buffer);
      seen = {
        body: Buffer.concat(chunks),
        csrf: request.headers["x-csrf-token"] as string | undefined,
        type: request.headers["content-type"],
        url: request.url,
      };
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ id: "a1", url: "/api/assets/a1" }));
    });

    const form = new FormData();
    form.set("file", new Blob([PNG], { type: "image/png" }), "logo.png");
    const answer = await fetch(`${proxyUrl}/api/assets`, {
      body: form,
      headers: { cookie: "steward_sid=sid-1" },
      method: "POST",
    });

    expect(answer.status).toBe(200);
    expect(await answer.json()).toEqual({ id: "a1", url: "/api/assets/a1" });
    expect(seen?.url).toBe("/api/assets");
    expect(seen?.csrf).toBe("csrf-1");
    expect(seen?.type).toMatch(/^multipart\/form-data; boundary=/);
    expect(seen?.body.includes(PNG)).toBe(true);
  });

  it("relays the gateway's refusal text and status", async () => {
    const proxyUrl = await start((_request, response) => {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "File too large — max upload size is 10 MB" }));
    });
    const answer = await fetch(`${proxyUrl}/api/assets`, { body: new FormData(), method: "POST" });
    expect(answer.status).toBe(400);
    expect(await answer.json()).toEqual({ error: "File too large — max upload size is 10 MB" });
  });

  it("serves an image back with its type and the cookie, and no CSRF token", async () => {
    let seen: { cookie?: string; csrf?: string; url?: string } | undefined;
    const proxyUrl = await start((request, response) => {
      seen = {
        cookie: request.headers.cookie,
        csrf: request.headers["x-csrf-token"] as string | undefined,
        url: request.url,
      };
      response.writeHead(200, {
        "cache-control": "private, max-age=86400, immutable",
        "content-type": "image/png",
        "x-content-type-options": "nosniff",
      });
      response.end(PNG);
    });
    const answer = await fetch(`${proxyUrl}/api/assets/a1`, {
      headers: { cookie: "steward_sid=sid-1" },
    });
    expect(answer.status).toBe(200);
    expect(answer.headers.get("content-type")).toBe("image/png");
    expect(answer.headers.get("x-content-type-options")).toBe("nosniff");
    expect(answer.headers.get("cache-control")).toBe("private, max-age=86400, immutable");
    expect(Buffer.from(await answer.arrayBuffer())).toEqual(PNG);
    expect(seen).toEqual({ cookie: "steward_sid=sid-1", csrf: undefined, url: "/api/assets/a1" });
  });

  it("answers 502 JSON when the gateway is unreachable", async () => {
    proxy = createServer((request, response) => {
      void proxyAssets(request, response, "http://127.0.0.1:1/query");
    });
    const proxyUrl = await listen(proxy);
    const answer = await fetch(`${proxyUrl}/api/assets`, { body: new FormData(), method: "POST" });
    expect(answer.status).toBe(502);
    expect(await answer.json()).toEqual({ error: "gateway unreachable" });
  });
});
