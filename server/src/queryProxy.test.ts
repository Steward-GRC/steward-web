// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";

import { proxyQuery } from "./queryProxy";

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
});

describe("proxyQuery", () => {
  it("forwards the body, content-type and cookie, and relays the upstream response", async () => {
    let received: { body: string; cookie: string | undefined } | undefined;
    upstream = createServer(async (request, response_) => {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(chunk as Buffer);
      received = { body: Buffer.concat(chunks).toString(), cookie: request.headers.cookie };
      response_.writeHead(200, { "content-type": "application/json" });
      response_.end(JSON.stringify({ data: { diagnostics: { traceId: "t-1" } } }));
    });
    const upstreamUrl = await listen(upstream);

    proxy = createServer((request, response_) => {
      void proxyQuery(request, response_, upstreamUrl);
    });
    const proxyUrl = await listen(proxy);

    const response = await fetch(proxyUrl, {
      body: JSON.stringify({ query: "query Diagnostics { diagnostics { traceId } }" }),
      headers: { "content-type": "application/json", cookie: "steward_session=abc" },
      method: "POST",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { diagnostics: { traceId: "t-1" } } });
    expect(received?.cookie).toBe("steward_session=abc");
    expect(received?.body).toContain("Diagnostics");
  });

  it("adds the session's CSRF token from the gateway's own session check", async () => {
    let csrf: string | undefined;
    upstream = createServer((request, response_) => {
      response_.writeHead(200, { "content-type": "application/json" });
      if (request.method === "GET" && request.url === "/auth/session") {
        const live = request.headers.cookie === "steward_sid=sid-1";
        response_.end(JSON.stringify({ authenticated: live, csrfToken: live ? "csrf-1" : "" }));
        return;
      }
      csrf = request.headers["x-csrf-token"] as string | undefined;
      response_.end(JSON.stringify({ data: { diagnostics: { traceId: "t-2" } } }));
    });
    const upstreamUrl = await listen(upstream);

    proxy = createServer((request, response_) => {
      void proxyQuery(request, response_, `${upstreamUrl}/query`);
    });
    const proxyUrl = await listen(proxy);

    const response = await fetch(proxyUrl, {
      body: JSON.stringify({ query: "query Diagnostics { diagnostics { traceId } }" }),
      headers: { "content-type": "application/json", cookie: "steward_sid=sid-1" },
      method: "POST",
    });

    expect(response.status).toBe(200);
    expect(csrf).toBe("csrf-1");
  });

  it("answers 502 rather than hanging or crashing when the gateway is unreachable", async () => {
    proxy = createServer((request, response_) => {
      void proxyQuery(request, response_, "http://127.0.0.1:1");
    });
    const proxyUrl = await listen(proxy);

    const response = await fetch(proxyUrl, { body: "{}", method: "POST" });
    expect(response.status).toBe(502);
  });
});
