import type WS from "ws";

// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Drives the REAL graphql-ws client against a fake websocket, so the assertions are about
// bytes actually sent on the wire (the forwarded cookie on the upgrade, the fetched CSRF
// token on connection_init) rather than about a mock of our own design — the same posture
// `authoring/collab/session.test.ts` takes for the collab provider.
import { afterEach, describe, expect, it, vi } from "vitest";

import { awaitAiJobResult } from "./aiJobResult.server";

const CONNECTING = 0;
const OPEN = 1;
const CLOSED = 3;

interface SentMessage {
  id?: string;
  payload?: unknown;
  type: string;
}

/** A websocket stand-in with exactly the surface graphql-ws's client touches. */
class FakeSocket {
  static readonly CLOSED = CLOSED;
  static readonly CLOSING = 2;
  static readonly CONNECTING = CONNECTING;
  static instances: FakeSocket[] = [];
  static readonly OPEN = OPEN;

  readonly address: string;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onopen: (() => void) | null = null;
  readonly options: unknown;
  readonly protocols: string | string[] | undefined;
  readyState = CONNECTING;
  sent: SentMessage[] = [];

  constructor(address: string, protocols?: string | string[], options?: unknown) {
    this.address = address;
    this.protocols = protocols;
    this.options = options;
    FakeSocket.instances.push(this);
  }

  static latest(): FakeSocket {
    const socket = FakeSocket.instances.at(-1);
    if (!socket) throw new Error("expected a socket to have been constructed");
    return socket;
  }

  static reset(): void {
    FakeSocket.instances = [];
  }

  close(code = 1000, reason = ""): void {
    this.readyState = CLOSED;
    this.onclose?.({ code, reason });
  }

  /** Deliver a server-to-client frame, as a real socket does: `event.data` is the raw text. */
  deliver(message: Record<string, unknown>): void {
    this.onmessage?.({ data: JSON.stringify(message) });
  }

  open(): void {
    this.readyState = OPEN;
    this.onopen?.();
  }

  send(data: string): void {
    if (this.readyState !== OPEN) throw new Error("socket not open");
    this.sent.push(JSON.parse(data) as SentMessage);
  }
}

const tick = async (ms = 0): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const stubSession = (body: unknown, ok = true): ReturnType<typeof vi.fn> => {
  const fetchSpy = vi.fn(() => Promise.resolve(Response.json(body, { status: ok ? 200 : 401 })));
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
};

/** Drives the handshake through to an open, acknowledged subscription and returns the
 *  socket's one subscribe message, so each test only has to react from there. */
const handshake = async (): Promise<{ socket: FakeSocket; subscribeId: string }> => {
  await tick();
  const socket = FakeSocket.latest();
  socket.open();
  await tick();
  socket.deliver({ type: "connection_ack" });
  await tick();
  const subscribe = socket.sent.find((m) => m.type === "subscribe");
  if (!subscribe?.id) throw new Error("expected a subscribe message");
  return { socket, subscribeId: subscribe.id };
};

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
