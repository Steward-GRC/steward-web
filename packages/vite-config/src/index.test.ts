// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

import { existsSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { WebSocket, WebSocketServer } from "ws";

import {
  brandPublicDirectory,
  buildInfo,
  buildInfoDefines,
  chooseDevelopmentQuickLogin,
  developmentAssetProxy,
  developmentCollabProxy,
  sharedAliases,
} from "./index";

describe("sharedAliases", () => {
  it("points every app at the live gateway client: mock data comes from the mock server", () => {
    const aliases = sharedAliases();
    expect(aliases["@steward-web/edge.server"]).toMatch(/api-client.*edge\/live\.server\.ts$/);
    expect(Object.keys(aliases).filter((name) => /mock/i.test(name))).toEqual([]);
  });
});

describe("buildInfo", () => {
  it("takes the version and commit from the VERSION and COMMIT build arguments", () => {
    expect(buildInfo({ COMMIT: "0123456789abcdef", VERSION: "v0.1.0" })).toEqual({
      commit: "0123456789abcdef",
      version: "v0.1.0",
    });
  });

  it("reports dev and unknown when the build isn't stamped", () => {
    expect(buildInfo({})).toEqual({ commit: "unknown", version: "dev" });
    expect(buildInfo({ COMMIT: " ", VERSION: "" })).toEqual({ commit: "unknown", version: "dev" });
  });

  it("defines both as string constants for the bundle", () => {
    expect(buildInfoDefines({ COMMIT: "abc", VERSION: "v1.2.3" })).toEqual({
      __STEWARD_COMMIT__: JSON.stringify("abc"),
      __STEWARD_VERSION__: JSON.stringify("v1.2.3"),
    });
  });
});

describe("chooseDevelopmentQuickLogin", () => {
  it("allows the quick login for the dev server", () => {
    const choice = chooseDevelopmentQuickLogin("serve", {});
    expect(choice.enabled).toBe(true);
    expect(choice.module).toMatch(/auth.*developmentQuickLogin\.server\.ts$/);
    expect(choice.component).toMatch(/auth.*QuickLogin\.tsx$/);
  });

  it("leaves it out of a production build unless the build asks for it", () => {
    const release = chooseDevelopmentQuickLogin("build", {});
    expect(release.enabled).toBe(false);
    expect(release.module).toMatch(/NoDevelopmentQuickLogin\.server\.ts$/);
    expect(release.component).toMatch(/NoQuickLogin\.tsx$/);
    expect(
      chooseDevelopmentQuickLogin("build", { STEWARD_DEV_QUICK_LOGIN_BUILD: "true" }).enabled,
    ).toBe(true);
    expect(
      chooseDevelopmentQuickLogin("build", { STEWARD_DEV_QUICK_LOGIN_BUILD: "1" }).enabled,
    ).toBe(false);
  });

  it("brings the dev gate preview in and out with the quick login", () => {
    expect(chooseDevelopmentQuickLogin("serve", {}).gatePreview).toMatch(
      /auth.*developmentGatePreview\.server\.ts$/,
    );
    expect(chooseDevelopmentQuickLogin("build", {}).gatePreview).toMatch(
      /NoDevelopmentGatePreview\.server\.ts$/,
    );
    const aliases = sharedAliases(undefined, chooseDevelopmentQuickLogin("build", {}));
    expect(aliases["@steward-web/dev-gate-preview.server"]).toMatch(
      /NoDevelopmentGatePreview\.server\.ts$/,
    );
  });
});

describe("buildInfo commit fallback", () => {
  it("falls back to GITHUB_SHA when the COMMIT build argument is unset", () => {
    expect(buildInfo({ GITHUB_SHA: "fedcba9876543210" }).commit).toBe("fedcba9876543210");
    expect(buildInfo({ COMMIT: "0123456789abcdef", GITHUB_SHA: "fedcba9876543210" }).commit).toBe(
      "0123456789abcdef",
    );
  });
});

describe("brandPublicDirectory", () => {
  it("is the UI kit's public folder, which holds the favicons and the web manifest", () => {
    expect(brandPublicDirectory()).toMatch(/packages[/\\]ui[/\\]public$/);
    expect(existsSync(path.join(brandPublicDirectory(), "favicon.ico"))).toBe(true);
    expect(existsSync(path.join(brandPublicDirectory(), "site.webmanifest"))).toBe(true);
  });
});

describe("developmentAssetProxy (bug log 182)", () => {
  const servers: Server[] = [];
  afterEach(() => {
    for (const server of servers.splice(0)) server.close();
  });
  const listen = async (
    handler: (request: IncomingMessage, response: ServerResponse) => void,
  ): Promise<string> => {
    const server = createServer(handler);
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, "localhost", resolve));
    return `http://localhost:${(server.address() as AddressInfo).port}`;
  };

  it("answers the editor's /api/assets upload from the dev server, through to the gateway", async () => {
    let upstream = "";
    const gateway = await listen((request, response) => {
      upstream = `${request.method} ${request.url}`;
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ id: "a1", url: "/api/assets/a1" }));
    });
    const plugin = developmentAssetProxy(`${gateway}/query`);
    let middleware: ((q: IncomingMessage, r: ServerResponse, next: () => void) => void) | undefined;
    (plugin.configureServer as (server: unknown) => void)({
      middlewares: { use: (handler: typeof middleware) => (middleware = handler) },
    });
    const development = await listen((request, response) =>
      middleware?.(request, response, () => {
        response.writeHead(404);
        response.end();
      }),
    );

    const uploaded = await fetch(`${development}/api/assets`, { body: "x", method: "POST" });
    expect(uploaded.status).toBe(200);
    expect(await uploaded.json()).toEqual({ id: "a1", url: "/api/assets/a1" });
    expect(upstream).toBe("POST /api/assets");

    const elsewhere = await fetch(`${development}/somewhere-else`);
    expect(elsewhere.status).toBe(404);
  });

  it("does nothing without a gateway address", () => {
    expect(developmentAssetProxy("").configureServer).toBeUndefined();
  });
});

describe("developmentCollabProxy (bug log 171)", () => {
  const servers: Server[] = [];
  afterEach(() => {
    for (const server of servers.splice(0)) server.close();
  });

  it("does nothing without a gateway address", () => {
    expect(developmentCollabProxy("").configureServer).toBeUndefined();
  });

  it("relays /collab/ws/<draft> from the dev server to the gateway and leaves other upgrades", async () => {
    const gatewayServer = createServer();
    const gatewayWss = new WebSocketServer({ server: gatewayServer });
    gatewayWss.on("connection", (socket) => socket.on("message", (data) => socket.send(data)));
    await new Promise<void>((resolve) => gatewayServer.listen(0, "127.0.0.1", resolve));
    servers.push(gatewayServer);
    const gatewayPort = (gatewayServer.address() as AddressInfo).port;

    const developmentServer = createServer();
    servers.push(developmentServer);
    const plugin = developmentCollabProxy(`http://127.0.0.1:${gatewayPort}/query`);
    (plugin.configureServer as (server: unknown) => void)({ httpServer: developmentServer });
    await new Promise<void>((resolve) => developmentServer.listen(0, "127.0.0.1", resolve));
    const developmentPort = (developmentServer.address() as AddressInfo).port;

    const room = new WebSocket(`ws://127.0.0.1:${developmentPort}/collab/ws/draft-1`);
    await new Promise<void>((resolve, reject) => {
      room.once("open", () => resolve());
      room.once("error", reject);
    });
    const echoed = new Promise<Buffer>((resolve) =>
      room.once("message", (data) => resolve(data as Buffer)),
    );
    room.send(Buffer.from([7, 8]));
    expect([...(await echoed)]).toEqual([7, 8]);
    room.close();
  });
});
