// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import { type ControlMessage, decodeControlPayload, encodeSnapshot, MSG_CONTROL } from "./protocol";
import { isStale, refreshDelayMs } from "./token";
import { resolveProviderTarget } from "./wsUrl";

// The collab room session: transport, persistence cadence, credential renewal and the
// degradation rules.
//
// This is the piece that owns the websocket. It deliberately knows nothing about React or how
// the editor renders a draft — the caller injects a `snapshotSource` callback and consumes
// status/control callbacks — so the awkward parts (snapshot framing, token renewal, giving up
// gracefully) can be tested against a fake socket.
//
// Three things here are load-bearing and easy to get wrong:
//
//  1. PERSISTENCE IS THE CLIENT'S JOB. steward-collab's relay runs no Y.Doc and never persists
//     the update stream on its own. Durability happens ONLY when this sends MsgSnapshot,
//     which the server forwards to core's UpdateDraftContent. A room that never snapshots
//     loses every edit. Hence the debounce AND the explicit flush points — last collaborator
//     leaving, navigating away, before publishing.
//
//  2. COLLABORATION IS OPTIONAL, AUTHORING IS NOT. Every failure path — no token, a refused
//     upgrade, a dead socket — must end in `status: "unavailable"` so the caller can fall
//     back to its own save path. Collaboration must never block authoring a policy.
//
//  3. A failed mint or an unreachable relay degrades silently rather than throwing: a
//     collaboration outage is not the author's problem to see as an error.

/** Matches steward-collab's own trailing debounce (its internal/ws room flush interval), so
 *  a burst of typing produces one checkpoint rather than one per keystroke. */
export const SNAPSHOT_DEBOUNCE_MS = 5000;

/**
 * The gateway proxy caps both legs at 1 MiB (steward-gateway's
 * `collabws.DefaultMaxMessageBytes` is twice collab's own 2 MiB read limit split across
 * directions) and kills the socket on a bigger frame rather than truncating it. Refuse to
 * send an oversize frame rather than trade the whole session for a snapshot that cannot land
 * anyway.
 */
export const MAX_SNAPSHOT_BYTES = 1 << 20;

export interface CollabSessionOptions {
  /** The Yjs document the room syncs. */
  doc: Y.Doc;
  /**
   * Mint a fresh collab token. Resolving to `undefined` means "collaboration is not
   * available here" and puts the session straight into `unavailable` — it is NOT an error
   * path.
   */
  mintToken: () => Promise<CollabToken | undefined>;
  /** Overridable for tests. */
  now?: () => number;
  /** A server-to-client control frame arrived (snapshot verdict, publish). */
  onControl: (message: ControlMessage) => void;
  /** A snapshot was refused locally because the frame exceeded the proxy's cap. */
  onOversize?: (bytes: number) => void;
  /** Status transitions. */
  onStatus: (status: CollabStatus) => void;
  /** Page url the relative `wsUrl` resolves against. Defaults to `location`. */
  pageUrl?: string;
  /** Overridable for tests; defaults to `SNAPSHOT_DEBOUNCE_MS`. */
  snapshotDebounceMs?: number;
  /** Injected in tests so no real socket is opened. */
  webSocketPolyfill?: typeof WebSocket;
}

/**
 * Session status, as the caller needs to reason about it.
 *
 * - `connecting` — token minted, socket dialling. Editing is already safe.
 * - `live` — synced with the relay; the snapshot path owns persistence.
 * - `unavailable` — terminal for this attempt. Reached on a failed mint, no token, a refused
 *   upgrade, or a permanent close.
 */
export type CollabStatus = "connecting" | "live" | "unavailable";

/** The credential `issueCollabToken` mints. */
export interface CollabToken {
  /** RFC3339. Drives the proactive refresh schedule (see token.ts). */
  expiresAt: string;
  token: string;
  wsUrl: string;
}

/** What the caller must hand over to build a durable checkpoint. */
export interface SnapshotPayload {
  /** The draft's section content — the AUTHORITATIVE value core validates and persists. */
  contentJSON: string;
  /** `Y.encodeStateAsUpdate(doc)` — stored verbatim for room rehydration. */
  yjsState: Uint8Array;
}

/**
 * A live (or gracefully-dead) collaboration room.
 *
 * Lifecycle: `new` -> `start()` -> ...editing... -> `stop()`. `stop()` flushes a pending
 * snapshot first, so the last edits are not lost on navigate-away.
 */
export class CollabSession {
  get currentStatus(): CollabStatus {
    return this.status ?? "connecting";
  }

  /** The provider, for binding presence and awareness UI to. */
  get wsProvider(): undefined | WebsocketProvider {
    return this.provider;
  }

  private readonly debounceMs: number;

  /** Latched on `draft.published`: the room is immutable, stop snapshotting. */
  private frozen = false;
  private readonly nowFn: () => number;
  private readonly options: CollabSessionOptions;
  private provider: undefined | WebsocketProvider;
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;
  private snapshotSource: (() => SnapshotPayload | undefined) | undefined;
  private snapshotTimer: ReturnType<typeof setTimeout> | undefined;
  // Undefined until the first transition, so the opening `connecting` really is emitted.
  // Seeding this with "connecting" would make `emit` treat the first transition as a no-op.
  private status: CollabStatus | undefined;

  private stopped = false;

  private token: CollabToken | undefined;

  constructor(options: CollabSessionOptions) {
    this.options = options;
    this.debounceMs = options.snapshotDebounceMs ?? SNAPSHOT_DEBOUNCE_MS;
    this.nowFn = options.now ?? (() => Date.now());
  }

  /**
   * Send any pending checkpoint NOW. Called on last-collaborator-leave, navigate-away and
   * before publish — the points after which a debounced snapshot would never fire and the
   * edits would be lost.
   */
  flush(): void {
    if (this.snapshotTimer !== undefined) {
      clearTimeout(this.snapshotTimer);
      this.snapshotTimer = undefined;
    }
    this.sendSnapshot();
  }

  /**
   * Force a reconnect with a guaranteed-fresh credential. Used when the socket is down and
   * the held token is too close to expiry to be worth dialling with — otherwise the
   * reconnect just burns an attempt on a 401.
   */
  async reconnect(): Promise<void> {
    if (this.stopped || !this.provider) return;
    if (!this.token || isStale(this.token.expiresAt, this.nowFn())) {
      await this.refreshToken();
    }
    if (this.stopped || !this.provider) return;
    this.provider.disconnect();
    this.provider.connect();
  }

  /**
   * Register the callback that serialises the current document for a checkpoint. Until this
   * is set, snapshots are skipped rather than sending an empty or half-built document.
   */
  setSnapshotSource(source: () => SnapshotPayload | undefined): void {
    this.snapshotSource = source;
  }

  /**
   * Mint a token and dial the relay. Resolves once the socket has been *started* (not
   * synced) or the session has degraded; it never rejects — failure is reported as
   * `unavailable` through `onStatus`.
   */
  async start(): Promise<void> {
    this.emit("connecting");
    let minted: CollabToken | undefined;
    try {
      minted = await this.options.mintToken();
    } catch {
      // A failed mint is indistinguishable, from the author's point of view, from
      // collaboration being switched off: degrade, don't surface an error.
      this.emit("unavailable");
      return;
    }
    if (this.stopped) return;
    if (!minted || minted.token === "" || minted.wsUrl === "") {
      this.emit("unavailable");
      return;
    }
    this.token = minted;

    let target;
    try {
      target = resolveProviderTarget(
        minted.wsUrl,
        this.options.pageUrl ?? globalThis.location.href,
      );
    } catch {
      // A wsUrl that cannot be parsed is a deployment fault, not an author's problem.
      // Degrade rather than throwing inside a render effect.
      this.emit("unavailable");
      return;
    }

    const provider = new WebsocketProvider(target.serverUrl, target.room, this.options.doc, {
      connect: false,
      // Cross-tab BroadcastChannel is disabled on purpose: it would let two of the author's
      // own tabs converge WITHOUT the relay, which is the one component that binds
      // awareness identity and forwards snapshots to core. Everything must go through the
      // server.
      disableBc: true,
      params: { token: minted.token },
      // Ask the relay to re-advertise periodically. The room re-solicits on every peer
      // join, but a client that missed a fan-out has no other way back to convergence.
      resyncInterval: 30_000,
      ...(this.options.webSocketPolyfill
        ? { WebSocketPolyfill: this.options.webSocketPolyfill }
        : {}),
    });

    // MSG_CONTROL (101) is steward-collab's own, not y-websocket's. `messageHandlers` is a
    // per-instance copy of the module's array, so registering here is supported rather than
    // a monkey-patch. The decoder arrives positioned just past the message type.
    provider.messageHandlers[MSG_CONTROL] = (_encoder, decoder) => {
      const message = decodeControlPayload(decoder);
      if (message) this.handleControl(message);
    };

    provider.on("status", ({ status }: { status: "connected" | "connecting" | "disconnected" }) => {
      if (this.stopped) return;
      if (status === "connected") this.emit("live");
    });
    provider.on("sync", (synced: boolean) => {
      if (!this.stopped && synced) this.emit("live");
    });
    // `closed` is y-websocket's terminal event: it decided the close code is permanent
    // (4400-4499) and stopped retrying. There is nothing left to wait for.
    provider.on("closed", () => {
      if (!this.stopped) this.emit("unavailable");
    });
    // A refused upgrade (401 from a stale token, 403 from the origin check) surfaces here
    // rather than as a close code, because the socket never opened. Re-mint once and let
    // the provider's own backoff retry; if the token was fine, this is a real outage and
    // the retry loop is harmless.
    provider.on("connection-error", () => {
      if (!this.stopped) void this.refreshToken();
    });

    this.provider = provider;
    provider.connect();
    this.scheduleRefresh();
  }

  /** Flush, then tear down the socket and every timer. Idempotent. */
  stop(): void {
    if (this.stopped) return;
    this.flush();
    this.stopped = true;
    if (this.refreshTimer !== undefined) clearTimeout(this.refreshTimer);
    this.refreshTimer = undefined;
    // `provider.destroy()` deliberately does NOT destroy the Awareness. Ours was created by
    // the provider, so it is owned here, and it holds its own outdated-state interval:
    // leaving it running leaks a timer per room.
    const { awareness } = this.provider ?? {};
    this.provider?.destroy();
    awareness?.destroy();
    this.provider = undefined;
  }

  /**
   * Note that the document changed. Arms the trailing debounce; a burst of typing
   * collapses into one checkpoint.
   */
  touch(): void {
    if (this.stopped || this.frozen) return;
    if (this.snapshotTimer !== undefined) clearTimeout(this.snapshotTimer);
    this.snapshotTimer = setTimeout(() => {
      this.snapshotTimer = undefined;
      this.sendSnapshot();
    }, this.debounceMs);
  }

  private emit(status: CollabStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.options.onStatus(status);
  }

  private handleControl(message: ControlMessage): void {
    if (message.type === "draft.published") {
      // Latch before notifying: the relay has already stopped accepting updates and
      // snapshots, silently, so anything sent now would be dropped.
      this.frozen = true;
      if (this.snapshotTimer !== undefined) {
        clearTimeout(this.snapshotTimer);
        this.snapshotTimer = undefined;
      }
    }
    this.options.onControl(message);
  }

  /**
   * Re-mint and hand the new credential to the provider.
   *
   * Mutating `provider.params` is the documented way to change the connect url:
   * y-websocket recomputes `url` from `serverUrl`/`roomname`/`params` on every connect, so
   * the next reconnect carries the new token. The live socket is left alone — collab only
   * checks `exp` at the upgrade and never re-validates, so an in-flight session is not at
   * risk and this avoids an avoidable reconnect (which would cost a full resync).
   */
  private async refreshToken(): Promise<void> {
    if (this.stopped) return;
    let minted: CollabToken | undefined;
    try {
      minted = await this.options.mintToken();
    } catch {
      minted = undefined;
    }
    if (this.stopped) return;
    if (!minted || minted.token === "") {
      // Could not renew. Keep the old credential — it may still be valid — and try again
      // on the minimum interval rather than degrading a session that is currently working
      // fine.
      this.scheduleRefresh();
      return;
    }
    this.token = minted;
    if (this.provider) this.provider.params.token = minted.token;
    this.scheduleRefresh();
  }

  /** Arm the proactive re-mint, one lead-time ahead of `exp`. */
  private scheduleRefresh(): void {
    if (this.refreshTimer !== undefined) clearTimeout(this.refreshTimer);
    if (!this.token) return;
    const delay = refreshDelayMs(this.token.expiresAt, this.nowFn());
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = undefined;
      void this.refreshToken();
    }, delay);
  }

  /**
   * Serialise and send one MSG_SNAPSHOT. Skipped when the caller has not registered a
   * source yet, when the room is frozen by a publish, when the socket is not open, or when
   * the frame would exceed the proxy's cap.
   */
  private sendSnapshot(): void {
    if (this.frozen || !this.snapshotSource) return;
    const socket = this.provider?.ws;
    if (!socket || socket.readyState !== 1 /* OPEN */) return;
    const payload = this.snapshotSource();
    // An empty contentJSON gets no verdict from the relay, so there is nothing to gain by
    // sending one.
    if (!payload || payload.contentJSON === "") return;
    // Re-wrap into an ArrayBuffer-backed view: lib0 returns Uint8Array<ArrayBufferLike>,
    // which `send` will not accept (a SharedArrayBuffer is not transferable over a socket).
    const frame = new Uint8Array(encodeSnapshot(payload.contentJSON, payload.yjsState));
    if (frame.byteLength > MAX_SNAPSHOT_BYTES) {
      this.options.onOversize?.(frame.byteLength);
      return;
    }
    try {
      socket.send(frame);
    } catch {
      // The socket died between the readyState check and the send. The provider's
      // reconnect will re-arm; a later checkpoint carries the same content, since the
      // payload is always the WHOLE document.
    }
  }
}
