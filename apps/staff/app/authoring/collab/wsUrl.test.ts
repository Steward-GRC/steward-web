// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// URL-resolution tests.
//
// The failure this guards is nasty: a relative wsUrl resolved against an http dev server
// works, and the same code silently produces a blocked ws:// socket on an https production
// page. So the scheme mapping gets its own test.
import { describe, expect, it } from "vitest";

import { absoluteWsUrl, providerTarget, resolveProviderTarget } from "./wsUrl";

describe("wsUrl", () => {
  it("resolves a relative wsUrl against an https page as wss", () => {
    expect(absoluteWsUrl("/collab/ws/draft-1", "https://policy.steward.example/policies/42")).toBe(
      "wss://policy.steward.example/collab/ws/draft-1",
    );
  });

  it("resolves a relative wsUrl against an http dev page as ws", () => {
    expect(absoluteWsUrl("/collab/ws/draft-1", "http://localhost:5173/policies/42")).toBe(
      "ws://localhost:5173/collab/ws/draft-1",
    );
  });

  it("preserves a non-default port", () => {
    expect(absoluteWsUrl("/collab/ws/d", "https://qa.steward.example:8443/x")).toBe(
      "wss://qa.steward.example:8443/collab/ws/d",
    );
  });

  it("passes an absolute ws url through untouched", () => {
    // An absolute wsUrl escape hatch, for a deployment not served from the gateway's own
    // origin. The resolver must not rewrite what the deployment explicitly configured.
    expect(absoluteWsUrl("ws://localhost:8080/collab/ws/d", "http://localhost:5173/")).toBe(
      "ws://localhost:8080/collab/ws/d",
    );
    expect(absoluteWsUrl("wss://collab.steward.example/collab/ws/d", "https://app/x")).toBe(
      "wss://collab.steward.example/collab/ws/d",
    );
  });

  it("splits the room off the server url", () => {
    // WebsocketProvider rebuilds its url as serverUrl + "/" + room + params on EVERY
    // connect, which is the hook that makes a re-minted token take effect.
    expect(providerTarget("wss://app.steward.example/collab/ws/draft-1")).toEqual({
      room: "draft-1",
      serverUrl: "wss://app.steward.example/collab/ws",
    });
  });

  it("drops any query string", () => {
    // The token is supplied through `params`, never baked into the url — else it would be
    // frozen at the value held when the provider was constructed.
    expect(providerTarget("wss://app.steward.example/collab/ws/d?token=secret")).toEqual({
      room: "d",
      serverUrl: "wss://app.steward.example/collab/ws",
    });
  });

  it("handles a url-escaped draft id", () => {
    // steward-collab builds wsUrl with url.PathEscape(draftID).
    expect(providerTarget("wss://app.steward.example/collab/ws/a%2Fb")).toEqual({
      room: "a%2Fb",
      serverUrl: "wss://app.steward.example/collab/ws",
    });
  });

  it("rejects a url with no room segment", () => {
    expect(() => providerTarget("wss://app.steward.example/")).toThrow(/no room segment/);
  });

  it("does both steps at once in resolveProviderTarget", () => {
    expect(
      resolveProviderTarget("/collab/ws/draft-9", "https://policy.steward.example/policies/7"),
    ).toEqual({
      room: "draft-9",
      serverUrl: "wss://policy.steward.example/collab/ws",
    });
  });
});
