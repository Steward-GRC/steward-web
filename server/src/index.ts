// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createRequestListener } from "@react-router/node";
import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { type ServerBuild } from "react-router";

import { createReadinessChecker } from "./health.ts";
import { proxyQuery } from "./queryProxy.ts";
import { resolveStaticAsset } from "./static.ts";

const APP = process.env.APP; // scrub:allow=fqdn
if (APP !== "admin" && APP !== "staff") {
  throw new Error(`APP must be "staff" or "admin" (got ${JSON.stringify(APP)})`);
}

const PORT = Number(process.env.PORT ?? 3000);
const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://localhost:8080/query";
const VERSION = process.env.VERSION?.trim() || "dev";
const COMMIT = process.env.COMMIT?.trim() || "unknown";

const appDirectory = path.resolve(import.meta.dirname, "../../apps", APP, "build");
const clientDirectory = path.join(appDirectory, "client");
const serverBuildPath = path.join(appDirectory, "server", "index.js");

const healthHeaders = { "steward-commit": COMMIT, "steward-version": VERSION };

const pingGateway = async (): Promise<boolean> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1000);
  try {
    // Any completed response means the gateway is reachable; a 4xx from this throwaway
    // query still means it answered. Only a network failure or timeout counts as down.
    const response = await fetch(GATEWAY_URL, {
      body: JSON.stringify({ query: "{__typename}" }),
      headers: { "content-type": "application/json" },
      method: "POST",
      signal: controller.signal,
    });
    return response.status < 500;
  } finally {
    clearTimeout(timeout);
  }
};

const checkReady = createReadinessChecker({ ping: pingGateway });

const ssrListener = createRequestListener({
  build: () => import(serverBuildPath) as Promise<ServerBuild>,
});

const server = createServer((request, response) => {
  const url = request.url ?? "/";

  if (url === "/livez") {
    response.writeHead(200, { ...healthHeaders, "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (url === "/readyz") {
    void checkReady().then((gateway) => {
      response.writeHead(gateway.state === "ok" ? 200 : 503, {
        ...healthHeaders,
        "content-type": "application/json",
      });
      response.end(JSON.stringify({ dependencies: { gateway }, status: gateway.state }));
    });
    return;
  }

  if (url === "/query" && request.method === "POST") {
    void proxyQuery(request, response, GATEWAY_URL);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    const asset = resolveStaticAsset(clientDirectory, url);
    if (asset) {
      response.writeHead(200, {
        "cache-control": asset.immutable
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600",
        "content-type": asset.type,
      });
      createReadStream(asset.path).pipe(response);
      return;
    }
  }

  ssrListener(request, response);
});

server.listen(PORT, () => {
  // One structured line: entry and exit logging per the repo's rule, trace-level detail is
  // the request logging React Router/undici already emit.
  console.log(
    JSON.stringify({
      app: APP,
      commit: COMMIT,
      level: "info",
      msg: "server listening",
      port: PORT,
      version: VERSION,
    }),
  );
});
