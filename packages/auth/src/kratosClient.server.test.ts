// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import type { KratosLoginFlow } from "./kratos";

import { fetchLoginFlow, KratosError, submitLogin } from "./kratosClient.server";

const flow: KratosLoginFlow = {
  id: "flow-1",
  ui: {
    action: "https://kratos.example/self-service/login?flow=flow-1",
    method: "POST",
    nodes: [],
  },
};

const response = (status: number, body: unknown, setCookie: string[] = []) => {
  const headers = new Headers();
  for (const cookie of setCookie) headers.append("set-cookie", cookie);
  return Response.json(body, { headers, status });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchLoginFlow", () => {
  it("asks Kratos's browser login endpoint for JSON and forwards the cookie", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(response(200, flow));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await fetchLoginFlow("ory_kratos_session=abc", {
      publicUrl: "https://kratos.example",
    });

    expect(result.flow).toEqual(flow);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://kratos.example/self-service/login/browser");
    expect((init.headers as Record<string, string>).accept).toBe("application/json");
    expect((init.headers as Record<string, string>).cookie).toBe("ory_kratos_session=abc");
  });

  it("collects every Set-Cookie header Kratos sends back", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(response(200, flow, ["csrf_token_x=1; Path=/", "ory_kratos_session=y"])),
    );

    const result = await fetchLoginFlow(undefined, { publicUrl: "https://kratos.example" });
    expect(result.setCookie).toEqual(["csrf_token_x=1; Path=/", "ory_kratos_session=y"]);
  });

  it("throws KratosError on an unexpected status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(503, {})));

    await expect(
      fetchLoginFlow(undefined, { publicUrl: "https://kratos.example" }),
    ).rejects.toThrow(KratosError);
  });
});

describe("submitLogin", () => {
  it("posts to the flow's own action and reports success with the new cookies", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(response(200, { session: { id: "s-1" } }, ["ory_kratos_session=z"]));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await submitLogin(flow, { method: "password", password: "secret" }, "c=1");

    expect(result).toEqual({ setCookie: ["ory_kratos_session=z"], status: "succeeded" });
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(flow.ui.action);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ method: "password", password: "secret" });
  });

  it("reports failure with the updated flow on a 400", async () => {
    const failedFlow: KratosLoginFlow = { ...flow, ui: { ...flow.ui, messages: [] } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(400, failedFlow)));

    const result = await submitLogin(flow, { method: "password" });
    expect(result).toEqual({ flow: failedFlow, status: "failed" });
  });

  it("throws KratosError on anything else", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(500, {})));

    await expect(submitLogin(flow, {})).rejects.toThrow(KratosError);
  });
});
