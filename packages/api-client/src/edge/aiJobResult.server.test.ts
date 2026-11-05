import type WS from "ws";

// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Drives the REAL graphql-ws client against a fake websocket, so the assertions are about
// bytes actually sent on the wire (the forwarded cookie on the upgrade, the fetched CSRF
// token on connection_init) rather than about a mock of our own design — the same posture
// `authoring/collab/session.test.ts` takes for the collab provider.
import { afterEach, describe, expect, it, vi } from "vitest";

import { FakeSocket, handshake, stubSession, tick } from "./__fixtures__/fakeSocket";
import { awaitAiJobResult } from "./aiJobResult.server";

afterEach(() => {
  vi.unstubAllGlobals();
  FakeSocket.reset();
});

describe("awaitAiJobResult", () => {
  it("forwards the cookie on the upgrade, the fetched csrf token on connection_init, and resolves on the terminal push", async () => {
    stubSession({ authenticated: true, csrfToken: "csrf-1" });
    const promise = awaitAiJobResult(
      "job-1",
      "steward_sid=abc",
      undefined,
      "https://gateway.example/query",
      FakeSocket as unknown as typeof WS,
    );

    await tick();
    const socket = FakeSocket.latest();
    expect(socket.address).toBe("wss://gateway.example/query");
    expect(socket.options).toMatchObject({ headers: { cookie: "steward_sid=abc" } });

    socket.open();
    await tick();
    expect(socket.sent[0]).toMatchObject({
      payload: { csrfToken: "csrf-1" },
      type: "connection_init",
    });

    socket.deliver({ type: "connection_ack" });
    await tick();
    const subscribe = socket.sent.find((m) => m.type === "subscribe");
    expect(subscribe).toMatchObject({
      payload: {
        query: expect.stringContaining("aiJobResult") as unknown as string,
        variables: { jobId: "job-1" },
      },
    });

    socket.deliver({
      id: subscribe!.id,
      payload: {
        data: {
          aiJobResult: {
            error: null,
            finishedAt: "2026-01-01T00:00:00Z",
            jobId: "job-1",
            phase: "AI_JOB_PHASE_SUCCEEDED",
            resultRef: "job-1",
          },
        },
      },
      type: "next",
    });

    await expect(promise).resolves.toMatchObject({
      jobId: "job-1",
      phase: "AI_JOB_PHASE_SUCCEEDED",
      resultRef: "job-1",
    });
  });

  it("rejects without opening a socket when the forwarded cookie has no live session", async () => {
    stubSession({ authenticated: false }, false);
    const promise = awaitAiJobResult(
      "job-1",
      undefined,
      undefined,
      "https://gateway.example/query",
      FakeSocket as unknown as typeof WS,
    );

    await expect(promise).rejects.toMatchObject({ name: "GatewayError" });
    expect(FakeSocket.instances).toHaveLength(0);
  });

  it("rejects when the channel closes with no result", async () => {
    stubSession({ authenticated: true, csrfToken: "csrf-1" });
    const promise = awaitAiJobResult(
      "job-1",
      undefined,
      undefined,
      "https://gateway.example/query",
      FakeSocket as unknown as typeof WS,
    );

    const { socket, subscribeId } = await handshake();
    socket.deliver({ id: subscribeId, type: "complete" });

    await expect(promise).rejects.toMatchObject({ name: "GatewayError" });
  });

  it("rejects and closes the socket when the signal aborts before the terminal event", async () => {
    stubSession({ authenticated: true, csrfToken: "csrf-1" });
    const controller = new AbortController();
    const promise = awaitAiJobResult(
      "job-1",
      undefined,
      controller.signal,
      "https://gateway.example/query",
      FakeSocket as unknown as typeof WS,
    );

    const { socket } = await handshake();
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "GatewayError" });
    await tick();
    expect(socket.readyState).toBe(FakeSocket.CLOSED);
  });
});
