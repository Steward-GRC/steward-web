// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

import { parse } from "graphql";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GatewayError, gatewayFetch } from "./gatewayFetch";

const PingDocument = parse("query Ping { ping }") as TypedDocumentNode<
  { ping: string },
  Record<string, never>
>;

const jsonResponse = (status: number, body: unknown) => Response.json(body, { status });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("gatewayFetch", () => {
  it("forwards the cookie and returns the data on success", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse(200, { data: { ping: "pong" } }));
    vi.stubGlobal("fetch", fetchSpy);

    const data = await gatewayFetch(PingDocument, {}, "Ping", {
      cookie: "steward_session=abc",
      url: "https://gateway.example/query",
    });

    expect(data).toEqual({ ping: "pong" });
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://gateway.example/query");
    expect((init.headers as Record<string, string>).cookie).toBe("steward_session=abc");
  });

  it("omits the cookie header when none is given", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse(200, { data: { ping: "pong" } }));
    vi.stubGlobal("fetch", fetchSpy);

    await gatewayFetch(PingDocument, {}, "Ping", { url: "https://gateway.example/query" });

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect("cookie" in (init.headers as Record<string, string>)).toBe(false);
  });

  it("throws GatewayError with the HTTP status on a non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(503, {})));

    await expect(gatewayFetch(PingDocument, {}, "Ping", { url: "x" })).rejects.toMatchObject({
      operation: "Ping",
      status: 503,
    });
  });

  it("throws GatewayError built from the first GraphQL error's extensions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(200, {
          errors: [
            {
              extensions: { code: "UNAUTHENTICATED", reason: "NO_SESSION", traceId: "t-1" },
              message: "not signed in",
            },
          ],
        }),
      ),
    );

    let error: unknown;
    try {
      await gatewayFetch(PingDocument, {}, "Ping", { url: "x" });
    } catch (error_) {
      error = error_;
    }

    expect(error).toBeInstanceOf(GatewayError);
    expect(error).toMatchObject({
      code: "UNAUTHENTICATED",
      message: "not signed in",
      operation: "Ping",
      reason: "NO_SESSION",
      traceId: "t-1",
    });
  });

  it("throws GatewayError when the response carries no data and no error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, {})));

    await expect(gatewayFetch(PingDocument, {}, "Ping", { url: "x" })).rejects.toThrow(/no data/);
  });
});
