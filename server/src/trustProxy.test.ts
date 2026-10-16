// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createRequestListener } from "@remix-run/node-fetch-server";
import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";

import { isTrustProxyEnabled } from "./trustProxy.ts";

describe("isTrustProxyEnabled", () => {
  it("is off for an unset or non-'true' value, the safe default", () => {
    expect(isTrustProxyEnabled({})).toBe(false);
    expect(isTrustProxyEnabled({ TRUST_PROXY: "1" })).toBe(false);
    expect(isTrustProxyEnabled({ TRUST_PROXY: "false" })).toBe(false);
  });

  it("turns on only for exactly 'true'", () => {
    expect(isTrustProxyEnabled({ TRUST_PROXY: "true" })).toBe(true);
  });
});

// This exercises @remix-run/node-fetch-server's own createRequestListener (the library our
// server uses to build the Request from the raw socket) at the real HTTP boundary: no mock of
// third-party code, a real listening server and a real fetch(). It proves the exact mechanism
// the TRUST_PROXY fix relies on, matching the ingress-nginx behavior behind steward-local: the
// proxy terminates TLS and forwards plain HTTP, setting X-Forwarded-Proto/-Host on the hop.
describe("createRequestListener's trustProxy option", () => {
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

  let server: Server | undefined;

  afterEach(async () => {
    if (server) await close(server);
    server = undefined;
  });

  const serve = (trustProxy: boolean): Promise<string> => {
    server = createServer(
      createRequestListener((request: Request) => new Response(request.url), { trustProxy }),
    );
    return listen(server);
  };

  it("keeps the request URL socket-based when the proxy is not trusted", async () => {
    const url = await serve(false);

    const response = await fetch(`${url}/profile`, {
      headers: { "x-forwarded-host": "steward.example", "x-forwarded-proto": "https" },
    });

    expect(await response.text()).toBe(`${url}/profile`);
  });

  it("honours X-Forwarded-Proto/-Host once trusted, matching what ingress-nginx sends", async () => {
    const url = await serve(true);

    const response = await fetch(`${url}/profile`, {
      headers: { "x-forwarded-host": "steward.example", "x-forwarded-proto": "https" },
    });

    expect(await response.text()).toBe("https://steward.example/profile");
  });
});
