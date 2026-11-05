// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type WS from "ws";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { LiveEvent } from "../generated/schema";

import { FakeSocket, handshake, stubSession, tick } from "./__fixtures__/fakeSocket";
import { watchLiveEvents } from "./liveEvents.server";

const QUERY_URL = "https://gateway.example/query";

afterEach(() => {
  vi.unstubAllGlobals();
  FakeSocket.reset();
});

const watch = (onEvent: (event: LiveEvent) => void, signal: AbortSignal, cookie?: string) =>
  watchLiveEvents(
    ["group.member_", "role."],
    cookie,
    onEvent,
    signal,
    QUERY_URL,
    FakeSocket as unknown as typeof WS,
  );

describe("watchLiveEvents", () => {
  it("subscribes with the topics, the cookie and the csrf token, and hands over every event", async () => {
    stubSession({ authenticated: true, csrfToken: "csrf-1" });
    const events: LiveEvent[] = [];
    const controller = new AbortController();
    const watching = watch((event) => events.push(event), controller.signal, "steward_sid=abc");

    const { socket, subscribeId } = await handshake();
    expect(socket.options).toMatchObject({ headers: { cookie: "steward_sid=abc" } });
    expect(socket.sent[0]).toMatchObject({ payload: { csrfToken: "csrf-1" } });
    expect(socket.sent.find((m) => m.type === "subscribe")).toMatchObject({
      payload: {
        query: expect.stringContaining("liveEvents") as unknown as string,
        variables: { topics: ["group.member_", "role."] },
      },
    });

    const event = {
      at: "2026-11-05T10:00:00Z",
      entityId: "user:u-1",
      groupId: "g-1",
      type: "group.member_added",
    };
    socket.deliver({ id: subscribeId, payload: { data: { liveEvents: event } }, type: "next" });
    socket.deliver({
      id: subscribeId,
      payload: { data: { liveEvents: { ...event, type: "role.granted" } } },
      type: "next",
    });
    await tick();
    expect(events.map((delivered) => delivered.type)).toEqual([
      "group.member_added",
      "role.granted",
    ]);

    controller.abort();
    await expect(watching).resolves.toBeUndefined();
    await tick();
    expect(socket.readyState).toBe(FakeSocket.CLOSED);
  });

  it("rejects with the gateway's code when the subscription is refused", async () => {
    stubSession({ authenticated: true, csrfToken: "csrf-1" });
    const watching = watch(() => {}, new AbortController().signal);

    const { socket, subscribeId } = await handshake();
    socket.deliver({
      id: subscribeId,
      payload: [{ extensions: { code: "PERMISSION_DENIED" }, message: "audit.read required" }],
      type: "error",
    });

    await expect(watching).rejects.toMatchObject({
      code: "PERMISSION_DENIED",
      name: "GatewayError",
    });
  });

  it("rejects without opening a socket when there's no live session", async () => {
    stubSession({ authenticated: false }, false);
    const watching = watch(() => {}, new AbortController().signal);

    await expect(watching).rejects.toMatchObject({ name: "GatewayError" });
    expect(FakeSocket.instances).toHaveLength(0);
  });

  it("resolves when the gateway ends the stream", async () => {
    stubSession({ authenticated: true, csrfToken: "csrf-1" });
    const watching = watch(() => {}, new AbortController().signal);

    const { socket, subscribeId } = await handshake();
    socket.deliver({ id: subscribeId, type: "complete" });

    await expect(watching).resolves.toBeUndefined();
  });
});
