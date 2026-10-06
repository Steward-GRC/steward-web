// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCollabSession } from "./useCollabSession";

/** A minimal fake of the browser `WebSocket` the hook talks to: no real socket, just enough
 *  of the event-target surface to drive the hook's behaviour from the test. */
class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  sent: string[] = [];
  url: string;
  private listeners = new Map<string, ((event: unknown) => void)[]>();

  constructor(url: string | URL) {
    this.url = String(url);
    FakeWebSocket.instances.push(this);
  }

  addEventListener(type: string, listener: (event: unknown) => void) {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  close() {
    this.emit("close", {});
  }

  emit(type: string, event: unknown) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }

  send(data: string) {
    this.sent.push(data);
  }
}

beforeEach(() => {
  FakeWebSocket.instances = [];
  vi.stubGlobal("WebSocket", FakeWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCollabSession", () => {
  it("requests a token, connects and joins once the socket opens", async () => {
    const getToken = vi.fn().mockResolvedValue({ token: "tok-1", wsUrl: "/collab" });
    renderHook(() => useCollabSession("draft-1", getToken, vi.fn()));

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));
    const ws = FakeWebSocket.instances[0]!;
    expect(ws.url).toContain("draftId=draft-1");

    ws.emit("open", {});
    expect(ws.sent).toEqual([JSON.stringify({ token: "tok-1", type: "join" })]);
  });

  it("updates presenceCount from a presence frame", async () => {
    const getToken = vi.fn().mockResolvedValue({ token: "tok-1", wsUrl: "/collab" });
    const { result } = renderHook(() => useCollabSession("draft-1", getToken, vi.fn()));
    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    FakeWebSocket.instances[0]!.emit("message", {
      data: JSON.stringify({ count: 3, type: "presence" }),
    });
    await waitFor(() => expect(result.current.presenceCount).toBe(3));
  });

  it("calls onRemoteUpdate for an update frame, not for presence", async () => {
    const getToken = vi.fn().mockResolvedValue({ token: "tok-1", wsUrl: "/collab" });
    const onRemoteUpdate = vi.fn();
    renderHook(() => useCollabSession("draft-1", getToken, onRemoteUpdate));
    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    FakeWebSocket.instances[0]!.emit("message", {
      data: JSON.stringify({ count: 1, type: "presence" }),
    });
    FakeWebSocket.instances[0]!.emit("message", {
      data: JSON.stringify({ sectionKey: "purpose", text: "hi", type: "update" }),
    });

    expect(onRemoteUpdate).toHaveBeenCalledExactlyOnceWith("purpose", "hi");
  });

  it("reconnects, requesting a fresh token, after an unexpected close", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const getToken = vi
        .fn()
        .mockResolvedValueOnce({ token: "tok-1", wsUrl: "/collab" })
        .mockResolvedValueOnce({ token: "tok-2", wsUrl: "/collab" });
      renderHook(() => useCollabSession("draft-1", getToken, vi.fn()));
      await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

      FakeWebSocket.instances[0]!.close();
      await vi.advanceTimersByTimeAsync(1000);

      await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(2));
      expect(getToken).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("sendUpdate writes an update frame to the open socket", async () => {
    const getToken = vi.fn().mockResolvedValue({ token: "tok-1", wsUrl: "/collab" });
    const { result } = renderHook(() => useCollabSession("draft-1", getToken, vi.fn()));
    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    result.current.sendUpdate("scope", "new text");
    expect(FakeWebSocket.instances[0]!.sent).toContainEqual(
      JSON.stringify({ sectionKey: "scope", text: "new text", type: "update" }),
    );
  });

  it("never connects while draftId is null", () => {
    renderHook(() => useCollabSession(null, vi.fn(), vi.fn()));
    expect(FakeWebSocket.instances).toHaveLength(0);
  });
});
