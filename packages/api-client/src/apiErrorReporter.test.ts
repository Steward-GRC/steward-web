// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

import { parse } from "graphql";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type ApiErrorReport, onApiError, reportApiError } from "./apiErrorReporter";
import { GatewayError, gatewayFetch } from "./gatewayFetch";
import { gatewayRestFetch } from "./gatewayRestFetch";
import { csrfTokenFor } from "./gatewaySession";

const PingDocument = parse("query Ping { ping }") as TypedDocumentNode<
  { ping: string },
  Record<string, never>
>;

const stops: (() => void)[] = [];
const listen = (listener: (report: ApiErrorReport) => void) => {
  stops.push(onApiError(listener));
};

afterEach(() => {
  for (const stop of stops.splice(0)) stop();
  vi.unstubAllGlobals();
});

describe("reportApiError", () => {
  it("still reaches every other listener when one throws", () => {
    const seen = vi.fn();
    listen(() => {
      throw new Error("listener bug");
    });
    listen(seen);

    expect(() => reportApiError("Ping", "gateway returned 502")).not.toThrow();
    expect(seen).toHaveBeenCalledWith({ message: "gateway returned 502", operation: "Ping" });
  });

  it("stops calling a listener once it unsubscribes", () => {
    const seen = vi.fn();
    onApiError(seen)();
    reportApiError("Ping", "gateway returned 502");
    expect(seen).not.toHaveBeenCalled();
  });
});

describe("every API client reports its failures", () => {
  it("gatewayFetch reports, and a throwing listener never replaces the caller's error", async () => {
    const seen = vi.fn();
    listen(() => {
      throw new Error("listener bug");
    });
    listen(seen);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({}, { status: 503 })));

    const call = gatewayFetch(PingDocument, {}, "Ping", { url: "https://gateway.example/query" });

    await expect(call).rejects.toBeInstanceOf(GatewayError);
    await expect(call).rejects.toThrow("gateway returned 503");
    expect(seen).toHaveBeenCalledWith({ message: "gateway returned 503", operation: "Ping" });
  });

  it("gatewayFetch reports a network failure and rethrows it unchanged", async () => {
    const seen = vi.fn();
    listen(seen);
    const failure = new TypeError("fetch failed");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(failure));

    await expect(
      gatewayFetch(PingDocument, {}, "Ping", { url: "https://gateway.example/query" }),
    ).rejects.toBe(failure);
    expect(seen).toHaveBeenCalledWith({ message: "fetch failed", operation: "Ping" });
  });

  it("gatewayRestFetch reports", async () => {
    const seen = vi.fn();
    listen(seen);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ error: "bad metadata" }, { status: 400 })),
    );

    await expect(gatewayRestFetch("/admin/idp-import", {}, "ImportIdp")).rejects.toThrow(
      "bad metadata",
    );
    expect(seen).toHaveBeenCalledWith({ message: "bad metadata", operation: "ImportIdp" });
  });

  it("the session bootstrap lookup reports", async () => {
    const seen = vi.fn();
    listen(seen);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({}, { status: 500 })));

    await expect(csrfTokenFor("steward_sid=report-test")).resolves.toBeUndefined();
    expect(seen).toHaveBeenCalledWith({ message: "session returned 500", operation: "Session" });
  });
});
