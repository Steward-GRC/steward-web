// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A websocket stand-in and handshake helpers for the subscription tests. They drive the REAL
// graphql-ws client, so the assertions are about bytes actually sent on the wire.
import { vi } from "vitest";

const CONNECTING = 0;
const OPEN = 1;
const CLOSED = 3;

interface SentMessage {
  id?: string;
  payload?: unknown;
  type: string;
}

/** A websocket stand-in with exactly the surface graphql-ws's client touches. */
export class FakeSocket {
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

export const tick = async (ms = 0): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const stubSession = (body: unknown, ok = true): ReturnType<typeof vi.fn> => {
  const fetchSpy = vi.fn(() => Promise.resolve(Response.json(body, { status: ok ? 200 : 401 })));
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
};

/** Drives the handshake through to an open, acknowledged subscription and returns the
 *  socket's one subscribe message, so each test only has to react from there. */
export const handshake = async (): Promise<{ socket: FakeSocket; subscribeId: string }> => {
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
