// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createRequestListener } from "@remix-run/node-fetch-server";
import { createServer, type Server } from "node:http";
import { createRequestHandler, redirect, type ServerBuild } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { parseAllowedActionOrigins, withAllowedActionOrigins } from "./allowedOrigins.ts";

describe("parseAllowedActionOrigins", () => {
  it("is empty when unset or blank, the safe default", () => {
    expect(parseAllowedActionOrigins({})).toEqual([]);
    expect(parseAllowedActionOrigins({ ALLOWED_ACTION_ORIGINS: " , " })).toEqual([]);
  });

  it("splits on commas and trims", () => {
    expect(
      parseAllowedActionOrigins({ ALLOWED_ACTION_ORIGINS: "a.example.org, *.example.net ,," }),
    ).toEqual(["a.example.org", "*.example.net"]);
  });
});

// A one-route build whose action redirects: enough for React Router to run its real
// same-origin check on a document POST and, when that passes, to answer 302.
const baseBuild = {
  assets: { entry: { imports: [], module: "" }, routes: {}, url: "", version: "t" },
  assetsBuildDirectory: "",
  basename: "/",
  entry: { module: { default: () => new Response("") } },
  future: {},
  isSpaMode: false,
  prerender: [],
  publicPath: "/",
  routeDiscovery: { manifestPath: "/__manifest", mode: "lazy" },
  routes: {
    root: {
      id: "root",
      index: undefined,
      module: { action: () => redirect("/done"), default: () => null },
      parentId: undefined,
      path: "",
    },
  },
  ssr: true,
} as unknown as ServerBuild;

describe("the same-origin check behind a TLS-terminating proxy", () => {
  let server: Server | undefined;

  afterEach(
    () =>
      new Promise<void>((resolve) => {
        if (!server) return resolve();
        server.close(() => resolve());
        server = undefined;
      }),
  );

  // The shape of server/src/index.ts: the raw socket is plain http, the proxy adds the forwarded
  // headers, and the browser's Origin is the public https one.
  const post = async (
    options: { origins?: string[]; trustProxy: boolean },
    origin: string,
  ): Promise<number> => {
    const handle = createRequestHandler(withAllowedActionOrigins(baseBuild, options.origins ?? []));
    server = createServer(
      createRequestListener((request: Request) => handle(request), {
        trustProxy: options.trustProxy,
      }),
    );
    await new Promise<void>((resolve) => server?.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (address == null || typeof address === "string") throw new Error("no port");
    const response = await fetch(`http://127.0.0.1:${address.port}/`, {
      body: new URLSearchParams({ a: "1" }),
      headers: {
        origin,
        "x-forwarded-host": "steward.example.org",
        "x-forwarded-proto": "https",
      },
      method: "POST",
      redirect: "manual",
    });
    return response.status;
  };

  it("rejects the https Origin when the proxy headers are not trusted (the bug)", async () => {
    expect(await post({ trustProxy: false }, "https://steward.example.org")).toBe(400);
  });

  it("accepts it once the forwarded headers are trusted", async () => {
    expect(await post({ trustProxy: true }, "https://steward.example.org")).toBe(302);
  });

  it("still rejects a different origin with the proxy trusted", async () => {
    expect(await post({ trustProxy: true }, "https://evil.example.net")).toBe(400);
  });

  it("accepts a listed host without trusting the proxy, and only that host", async () => {
    const options = { origins: ["steward.example.org"], trustProxy: false };
    expect(await post(options, "https://steward.example.org")).toBe(302);
    await new Promise<void>((resolve) => server?.close(() => resolve()));
    expect(await post(options, "https://evil.example.net")).toBe(400);
  });
});
