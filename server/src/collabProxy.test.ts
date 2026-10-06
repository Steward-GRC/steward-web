// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { WebSocket, WebSocketServer } from "ws";

import { attachCollabProxy, collabUpstreamOrigin } from "./collabProxy";

const listen = (server: Server): Promise<{ port: number; url: string }> =>
  new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address == null || typeof address === "string") throw new Error("no port");
      resolve({ port: address.port, url: `ws://127.0.0.1:${address.port}` });
    });
  });

const close = (server: Server): Promise<void> =>
  new Promise((resolve) => server.close(() => resolve()));

const opened = (ws: WebSocket): Promise<void> =>
  new Promise((resolve, reject) => {
    ws.once("open", () => resolve());
    ws.once("error", reject);
  });

const nextMessage = (ws: WebSocket): Promise<{ data: unknown; isBinary: boolean }> =>
  new Promise((resolve) => ws.once("message", (data, isBinary) => resolve({ data, isBinary })));

const closed = (ws: WebSocket): Promise<{ code: number }> =>
  new Promise((resolve) => ws.once("close", (code) => resolve({ code })));

let upstream: Server | undefined;
let proxy: Server | undefined;
const sockets: WebSocket[] = [];

afterEach(async () => {
  for (const ws of sockets) ws.close();
  sockets.length = 0;
  if (upstream) await close(upstream);
  if (proxy) await close(proxy);
  upstream = undefined;
  proxy = undefined;
});

describe("collabUpstreamOrigin", () => {
  it("maps http to ws and drops the path", () => {
    expect(collabUpstreamOrigin("http://localhost:8080/query")).toBe("ws://localhost:8080");
  });

  it("maps https to wss", () => {
    expect(collabUpstreamOrigin("https://gateway.example.org/query")).toBe(
      "wss://gateway.example.org",
    );
  });
});

describe("attachCollabProxy", () => {
  it("relays binary frames in both directions and forwards the cookie upstream", async () => {
    let receivedCookie: string | undefined;
    upstream = createServer();
    const upstreamWss = new WebSocketServer({ server: upstream });
    upstreamWss.on("connection", (ws, request) => {
      receivedCookie = request.headers.cookie;
      ws.on("message", (data, isBinary) => ws.send(data, { binary: isBinary }));
    });
    const { url: upstreamUrl } = await listen(upstream);

    proxy = createServer();
    attachCollabProxy(proxy, `http://${new URL(upstreamUrl).host}/query`);
    const { url: proxyUrl } = await listen(proxy);

    const client = new WebSocket(`${proxyUrl}/collab/ws/draft-1?token=t`, {
      headers: { cookie: "steward_session=abc" },
    });
    sockets.push(client);
    await opened(client);

    const echoed = nextMessage(client);
    client.send(new Uint8Array([1, 2, 3]));
    const result = await echoed;
    expect(result.isBinary).toBe(true);
    expect(new Uint8Array(result.data as ArrayBuffer)).toEqual(new Uint8Array([1, 2, 3]));
    expect(receivedCookie).toBe("steward_session=abc");
  });

  it("refuses an upgrade for a path outside the collab prefix", async () => {
    proxy = createServer((_request, response) => {
      response.writeHead(404);
      response.end();
    });
    attachCollabProxy(proxy, "http://127.0.0.1:1/query");
    const { url: proxyUrl } = await listen(proxy);

    const client = new WebSocket(`${proxyUrl}/not-collab`);
    sockets.push(client);
    await expect(opened(client)).rejects.toBeDefined();
  });

  it("closes the client when the gateway is unreachable", async () => {
    proxy = createServer();
    attachCollabProxy(proxy, "http://127.0.0.1:1/query");
    const { url: proxyUrl } = await listen(proxy);

    const client = new WebSocket(`${proxyUrl}/collab/ws/draft-1?token=t`);
    sockets.push(client);
    await expect(opened(client)).rejects.toBeDefined();
  });

  it("passes the gateway's refusal status through on an unexpected response", async () => {
    upstream = createServer((_request, response) => {
      response.writeHead(401, { "www-authenticate": 'Bearer realm="steward.collab"' });
      response.end();
    });
    const { url: upstreamUrl } = await listen(upstream);

    proxy = createServer();
    attachCollabProxy(proxy, `http://${new URL(upstreamUrl).host}/query`);
    const { url: proxyUrl } = await listen(proxy);

    const client = new WebSocket(`${proxyUrl}/collab/ws/draft-1?token=bad`);
    sockets.push(client);
    await expect(opened(client)).rejects.toBeDefined();
  });

  it("closes both legs when one side closes", async () => {
    upstream = createServer();
    const upstreamWss = new WebSocketServer({ server: upstream });
    upstreamWss.on("connection", (ws) => {
      setTimeout(() => ws.close(1000, "done"), 10);
    });
    const { url: upstreamUrl } = await listen(upstream);

    proxy = createServer();
    attachCollabProxy(proxy, `http://${new URL(upstreamUrl).host}/query`);
    const { url: proxyUrl } = await listen(proxy);

    const client = new WebSocket(`${proxyUrl}/collab/ws/draft-1?token=t`);
    sockets.push(client);
    await opened(client);
    const result = await closed(client);
    expect(result.code).toBe(1000);
  });
});
