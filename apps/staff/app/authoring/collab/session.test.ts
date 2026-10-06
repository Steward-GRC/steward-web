// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// CollabSession behaviour tests.
//
// These drive the REAL y-websocket provider and the REAL Yjs document against a fake
// WebSocket, so the assertions are about bytes actually queued for the wire rather than about
// a mock of our own design. What is being pinned:
//
//   - every degradation path ends in `unavailable`, because that is the signal the caller
//     uses to fall back to its own save path;
//   - a MSG_SNAPSHOT frame carries BOTH payloads and is decodable by the Go rules;
//   - flush points really flush, and a published room really stops sending;
//   - the token is re-minted and handed to the provider before it expires.
import { describe, expect, it } from "vitest";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";

import { decodeSnapshotFrame, MSG_SNAPSHOT } from "./protocol";
import {
  CollabSession,
  type CollabStatus,
  type CollabToken,
  MAX_SNAPSHOT_BYTES,
  type SnapshotPayload,
} from "./session";

const CONNECTING = 0;
const OPEN = 1;
const CLOSED = 3;

/**
 * A WebSocket stand-in with exactly the surface y-websocket touches. It never opens by
 * itself — the test calls `open()` — so connection timing is explicit.
 */
class FakeSocket {
  static instances: FakeSocket[] = [];

  binaryType = "arraybuffer";
  onclose: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onmessage: ((event: { data: ArrayBuffer }) => void) | null = null;
  onopen: (() => void) | null = null;
  readyState: number = CONNECTING;
  sent: Uint8Array[] = [];

  url: string;

  constructor(url: string) {
    this.url = url;
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

  close(): void {
    this.readyState = CLOSED;
    this.onclose?.({ code: 1000, reason: "" });
  }

  /**
   * Deliver a server-to-client frame, as a real socket does: `event.data` is an ArrayBuffer
   * (binaryType is "arraybuffer"), which y-websocket wraps in a Uint8Array. Copy into a
   * fresh, exactly-sized buffer so the frame the provider decodes is independent of the
   * caller's array.
   */
  deliver(frame: Uint8Array): void {
    const copy = new Uint8Array(frame.byteLength);
    copy.set(frame);
    this.onmessage?.({ data: copy.buffer });
  }

  open(): void {
    this.readyState = OPEN;
    this.onopen?.();
  }

  send(data: Uint8Array): void {
    if (this.readyState !== OPEN) throw new Error("socket not open");
    this.sent.push(new Uint8Array(data));
  }

  /** The MSG_SNAPSHOT frames this socket was asked to send. */
  snapshots(): { contentJSON: string; yjsState: Uint8Array }[] {
    return this.sent
      .filter((f) => f[0] === MSG_SNAPSHOT)
      .map((f) => decodeSnapshotFrame(f))
      .filter((s): s is { contentJSON: string; yjsState: Uint8Array } => !!s);
  }
}

/** Build a MSG_CONTROL frame the way the Go server does. */
const controlFrame = (message: Record<string, unknown>): Uint8Array => {
  const body = new TextEncoder().encode(JSON.stringify(message));
  if (body.byteLength >= 128) throw new Error("test payload must fit a 1-byte varUint");
  return new Uint8Array([101, body.byteLength, ...body]);
};

const tick = async (ms = 0): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const tokenExpiring = (inMs: number): CollabToken => ({
  expiresAt: new Date(Date.now() + inMs).toISOString(),
  token: "jwt-1",
  wsUrl: "/collab/ws/draft-1",
});

interface Harness {
  controls: unknown[];
  oversized: number[];
  session: CollabSession;
  statuses: CollabStatus[];
}

const harness = (
  overrides: {
    awareness?: Awareness;
    doc?: Y.Doc;
    mintToken?: () => Promise<CollabToken | undefined>;
    snapshot?: () => SnapshotPayload | undefined;
  } = {},
): Harness => {
  FakeSocket.reset();
  const statuses: CollabStatus[] = [];
  const controls: unknown[] = [];
  const oversized: number[] = [];
  const session = new CollabSession({
    awareness: overrides.awareness,
    doc: overrides.doc ?? new Y.Doc(),
    mintToken: overrides.mintToken ?? (async () => tokenExpiring(300_000)),
    onControl: (message) => controls.push(message),
    onOversize: (bytes) => oversized.push(bytes),
    onStatus: (status) => statuses.push(status),
    pageUrl: "https://policy.example.org/policies/7",
    snapshotDebounceMs: 20,
    webSocketPolyfill: FakeSocket as unknown as typeof WebSocket,
  });
  session.setSnapshotSource(
    overrides.snapshot ??
      (() => ({
        contentJSON: '[{"sectionKey":"purpose","text":"hello","title":"Purpose"}]',
        yjsState: new Uint8Array([1, 2, 3]),
      })),
  );
  return { controls, oversized, session, statuses };
};

describe("CollabSession", () => {
  describe("degradation", () => {
    it("degrades to unavailable when mintToken resolves undefined", async () => {
      // The missing-permission case, and any deployment with no collab relay reachable.
      // This is NOT an error: the caller must fall back to its own save path silently.
      const h = harness({ mintToken: async () => {} });
      await h.session.start();
      expect(h.statuses).toEqual(["connecting", "unavailable"]);
      expect(FakeSocket.instances.length).toBe(0);
      h.session.stop();
    });

    it("degrades to unavailable when mintToken throws", async () => {
      const h = harness({
        mintToken: async () => {
          throw new Error("gateway down");
        },
      });
      await h.session.start();
      expect(h.statuses).toEqual(["connecting", "unavailable"]);
      h.session.stop();
    });

    it("degrades instead of throwing on a token with an unusable wsUrl", async () => {
      const h = harness({
        mintToken: async () => ({
          expiresAt: new Date(Date.now() + 300_000).toISOString(),
          token: "jwt",
          wsUrl: "/",
        }),
      });
      await h.session.start();
      expect(h.statuses).toEqual(["connecting", "unavailable"]);
      h.session.stop();
    });

    it("degrades to unavailable on an empty token string", async () => {
      const h = harness({
        mintToken: async () => ({ expiresAt: "", token: "", wsUrl: "/collab/ws/d" }),
      });
      await h.session.start();
      expect(h.statuses).toEqual(["connecting", "unavailable"]);
      h.session.stop();
    });
  });

  describe("connecting", () => {
    it("dials the resolved wss url with the token as a query param", async () => {
      // ?token= is the only credential channel a browser has on an upgrade.
      const h = harness();
      await h.session.start();
      const socket = FakeSocket.latest();
      const url = new URL(socket.url);
      expect(url.protocol).toBe("wss:");
      expect(url.host).toBe("policy.example.org");
      expect(url.pathname).toBe("/collab/ws/draft-1");
      expect(url.searchParams.get("token")).toBe("jwt-1");
      h.session.stop();
    });

    it("syncs presence on the awareness the editor was given", async () => {
      // The editor binds its carets to an awareness before the socket exists; the provider
      // must carry that same one, or remote carets never show.
      const document = new Y.Doc();
      const awareness = new Awareness(document);
      const h = harness({ awareness, doc: document });
      await h.session.start();
      expect(h.session.wsProvider?.awareness).toBe(awareness);
      h.session.stop();
    });

    it("reports live once the socket opens", async () => {
      const h = harness();
      await h.session.start();
      FakeSocket.latest().open();
      await tick();
      expect(h.statuses).toContain("live");
      h.session.stop();
    });
  });

  describe("snapshots", () => {
    it("carries both the content JSON and the Yjs state in a debounced snapshot", async () => {
      // The single most important behaviour here: the relay persists nothing on its own, so
      // if this frame is wrong or absent, every edit is lost.
      const h = harness();
      await h.session.start();
      const socket = FakeSocket.latest();
      socket.open();
      await tick();

      h.session.touch();
      expect(socket.snapshots().length).toBe(0);
      await tick(40);

      const frames = socket.snapshots();
      expect(frames.length).toBe(1);
      expect(frames[0]?.contentJSON).toBe(
        '[{"sectionKey":"purpose","text":"hello","title":"Purpose"}]',
      );
      expect([...(frames[0]?.yjsState ?? [])]).toEqual([1, 2, 3]);
      h.session.stop();
    });

    it("collapses a burst of edits into one snapshot", async () => {
      const h = harness();
      await h.session.start();
      const socket = FakeSocket.latest();
      socket.open();
      await tick();

      h.session.touch();
      await tick(5);
      h.session.touch();
      await tick(5);
      h.session.touch();
      await tick(40);

      expect(socket.snapshots().length).toBe(1);
      h.session.stop();
    });

    it("sends the pending snapshot immediately on flush", async () => {
      // The navigate-away / last-collaborator-leave / pre-publish path.
      const h = harness();
      await h.session.start();
      const socket = FakeSocket.latest();
      socket.open();
      await tick();

      h.session.touch();
      h.session.flush();
      expect(socket.snapshots().length).toBe(1);
      await tick(40);
      expect(socket.snapshots().length).toBe(1);
      h.session.stop();
    });

    it("flushes on stop so the last edits are not lost", async () => {
      const h = harness();
      await h.session.start();
      const socket = FakeSocket.latest();
      socket.open();
      await tick();

      h.session.touch();
      h.session.stop();
      expect(socket.snapshots().length).toBe(1);
    });

    it("sends no snapshot before the socket is open", async () => {
      const h = harness();
      await h.session.start();
      const socket = FakeSocket.latest();
      h.session.flush();
      expect(socket.sent.length).toBe(0);
      h.session.stop();
    });

    it("does not send an empty contentJSON", async () => {
      // The relay's flush early-returns on empty content, so the frame would produce no
      // verdict and no persistence.
      const h = harness({ snapshot: () => ({ contentJSON: "", yjsState: new Uint8Array([9]) }) });
      await h.session.start();
      const socket = FakeSocket.latest();
      socket.open();
      await tick();
      h.session.flush();
      expect(socket.snapshots().length).toBe(0);
      h.session.stop();
    });

    it("refuses an oversize snapshot rather than killing the session", async () => {
      // The gateway proxy caps both legs and closes rather than truncating. Sending it
      // would cost the whole session.
      const h = harness({
        snapshot: () => ({
          contentJSON: "x".repeat(MAX_SNAPSHOT_BYTES + 1),
          yjsState: new Uint8Array([1]),
        }),
      });
      await h.session.start();
      const socket = FakeSocket.latest();
      socket.open();
      await tick();
      h.session.flush();

      expect(socket.snapshots().length).toBe(0);
      expect(h.oversized.length).toBe(1);
      expect(h.oversized[0] ?? 0).toBeGreaterThan(MAX_SNAPSHOT_BYTES);
      h.session.stop();
    });
  });

  describe("control channel", () => {
    it("surfaces a rejected snapshot with core's detail", async () => {
      const h = harness();
      await h.session.start();
      const socket = FakeSocket.latest();
      socket.open();
      await tick();

      socket.deliver(
        controlFrame({
          detail: "content validation: boilerplate edited",
          draft_id: "draft-1",
          reason: "grpc_error",
          type: "snapshot.rejected",
        }),
      );

      expect(h.controls).toEqual([
        {
          detail: "content validation: boilerplate edited",
          draft_id: "draft-1",
          reason: "grpc_error",
          type: "snapshot.rejected",
        },
      ]);
      h.session.stop();
    });

    it("freezes the room on draft.published so nothing more is sent", async () => {
      // The relay drops updates and snapshots after a publish SILENTLY, so this control
      // frame is the only signal — and continuing to send is pointless.
      const h = harness();
      await h.session.start();
      const socket = FakeSocket.latest();
      socket.open();
      await tick();

      socket.deliver(
        controlFrame({ draft_id: "draft-1", type: "draft.published", version_number: 7 }),
      );
      expect((h.controls[0] as { type?: string } | undefined)?.type).toBe("draft.published");

      h.session.touch();
      await tick(40);
      h.session.flush();
      expect(socket.snapshots().length).toBe(0);
      h.session.stop();
    });

    it("ignores a malformed control frame rather than failing", async () => {
      const h = harness();
      await h.session.start();
      const socket = FakeSocket.latest();
      socket.open();
      await tick();

      socket.deliver(new Uint8Array([101, 40, 123 /* '{' */]));
      expect(h.controls).toEqual([]);

      // The session still works afterwards.
      h.session.flush();
      expect(socket.snapshots().length).toBe(1);
      h.session.stop();
    });
  });

  describe("token renewal", () => {
    it("re-mints the token before expiry and hands it to the provider", async () => {
      // A short TTL against an authoring session measured in hours: without this, the next
      // reconnect 401s and the room dies with unsaved edits.
      let minted = 0;
      const h = harness({
        mintToken: async () => {
          minted += 1;
          return {
            expiresAt: new Date(Date.now() + 300_000).toISOString(),
            token: `jwt-${minted}`,
            wsUrl: "/collab/ws/draft-1",
          };
        },
      });
      await h.session.start();
      const socket = FakeSocket.latest();
      socket.open();
      await tick();
      expect(minted).toBe(1);

      // A refused upgrade (a stale token, or the origin check) surfaces as an error rather
      // than a close code, and must trigger a re-mint.
      socket.onerror?.({});
      await tick(10);

      expect(minted).toBe(2);
      const provider = h.session.wsProvider;
      expect(provider).toBeDefined();
      expect((provider?.params as Record<string, string>).token).toBe("jwt-2");
      h.session.stop();
    });

    it("keeps the old token on a failed re-mint rather than degrading", async () => {
      // The held credential may still be valid; tearing down a working session because the
      // mint endpoint blipped would lose edits for no reason.
      let calls = 0;
      const h = harness({
        mintToken: async () => {
          calls += 1;
          if (calls === 1) return tokenExpiring(300_000);
          throw new Error("transient");
        },
      });
      await h.session.start();
      const socket = FakeSocket.latest();
      socket.open();
      await tick();

      socket.onerror?.({});
      await tick(10);

      expect(calls).toBeGreaterThanOrEqual(2);
      expect((h.session.wsProvider?.params as Record<string, string>).token).toBe("jwt-1");
      expect(h.statuses).not.toContain("unavailable");
      h.session.stop();
    });
  });

  it("is idempotent and safe to stop before start", () => {
    const h = harness();
    h.session.stop();
    h.session.stop();
    expect(h.session.currentStatus).toBe("connecting");
  });
});
