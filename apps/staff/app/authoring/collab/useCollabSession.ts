// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createStewardCollaboration, type StewardCollaboration } from "@steward-web/editor-steward";
import { useEffect, useRef, useState } from "react";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";

import { CONTROL_DRAFT_PUBLISHED, CONTROL_SNAPSHOT_REJECTED, describeRejection } from "./protocol";
import { CollabSession, type CollabToken } from "./session";

/**
 * How the editor mounts for this draft, decided once per draft:
 *
 * - `pending`: still finding out; show the read-only view.
 * - `live`: the room answered; mount the editor in it. The room's document is the source of
 *   truth and the snapshot path carries persistence.
 * - `solo`: no room (no token, an unreachable relay, or no answer in time); mount the editor
 *   alone and save through the page's own save path.
 *
 * The choice never flips for a mounted editor: a room that drops mid-session keeps its
 * editor, and the page's manual save still works from the editor's current content.
 */
export type CollabMode = "live" | "pending" | "solo";

export interface CollabSessionResult {
  /** The room to hand the editor while `mode` is `live`, otherwise null. */
  collaboration: null | StewardCollaboration;
  mode: CollabMode;
  /** How many browsers (this one included) are in the draft's room. */
  presenceCount: number;
  /** The document changed: arm the checkpoint debounce. */
  touch: () => void;
}

/** How long to wait for the room before editing alone. */
export const COLLAB_DECIDE_WITHIN_MS = 4000;

interface CollabCallbacks {
  /** The draft's current content JSON: the authoritative half of every checkpoint. */
  getContentJSON: () => string;
  getToken: () => Promise<CollabToken>;
  onPublishedElsewhere?: (versionNumber: number) => void;
  onSnapshotRejected?: (message: string) => void;
}

/**
 * Runs (or declines to run) one draft's collaboration room and wires the editor onto it.
 *
 * Connects to steward-collab through the gateway's websocket proxy and checkpoints the
 * editor's content JSON, with the room's Yjs state, on the session's debounce. Every failure
 * degrades to `solo` without an error: collaboration never blocks authoring.
 */
export const useCollabSession = (
  draftId: null | string,
  callbacks: CollabCallbacks,
  decideWithinMs = COLLAB_DECIDE_WITHIN_MS,
): CollabSessionResult => {
  const [mode, setMode] = useState<CollabMode>(draftId ? "pending" : "solo");
  const [collaboration, setCollaboration] = useState<null | StewardCollaboration>(null);
  const [presenceCount, setPresenceCount] = useState(1);
  const sessionRef = useRef<CollabSession | null>(null);

  // Latest-value ref so the room is not rebuilt every time the caller re-renders with new
  // closures. Written in an effect, never during render.
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!draftId) return;

    const document = new Y.Doc();
    const awareness = new Awareness(document);
    const room = createStewardCollaboration(document, awareness);
    let decided: CollabMode = "pending";
    let stopped = false;

    const decide = (next: "live" | "solo") => {
      if (stopped || decided !== "pending") return;
      decided = next;
      if (next === "live") {
        setCollaboration(room);
      } else {
        // Editing alone: a session left running would checkpoint a document the room never
        // saw over the peers' work, so close it.
        sessionRef.current?.stop();
      }
      setMode(next);
    };

    const session = new CollabSession({
      awareness,
      doc: document,
      mintToken: () => callbacksRef.current.getToken(),
      onControl: (message) => {
        if (stopped) return;
        if (message.type === CONTROL_DRAFT_PUBLISHED) {
          callbacksRef.current.onPublishedElsewhere?.(message.version_number ?? 0);
          return;
        }
        if (message.type === CONTROL_SNAPSHOT_REJECTED) {
          callbacksRef.current.onSnapshotRejected?.(describeRejection(message));
        }
      },
      onOversize: (bytes) => {
        if (stopped) return;
        callbacksRef.current.onSnapshotRejected?.(
          `This draft is too large to save collaboratively (${Math.round(bytes / 1024)} KB).`,
        );
      },
      onStatus: (status) => {
        if (status === "live") decide("live");
        if (status === "unavailable") decide("solo");
      },
    });
    session.setSnapshotSource(() => ({
      contentJSON: callbacksRef.current.getContentJSON(),
      yjsState: Y.encodeStateAsUpdate(document),
    }));
    sessionRef.current = session;

    const giveUp = globalThis.setTimeout(() => decide("solo"), decideWithinMs);

    void session.start().then(() => {
      const provider = session.wsProvider;
      if (stopped || !provider) return;
      room.attach(provider);
      const onAwarenessChange = () => {
        if (!stopped) setPresenceCount(awareness.getStates().size);
      };
      awareness.on("change", onAwarenessChange);
      onAwarenessChange();
    });

    return () => {
      stopped = true;
      globalThis.clearTimeout(giveUp);
      // stop() flushes any pending checkpoint first: the navigate-away flush point.
      session.stop();
      room.dispose();
      awareness.destroy();
      document.destroy();
      sessionRef.current = null;
      setCollaboration(null);
      setPresenceCount(1);
      setMode("pending");
    };
  }, [draftId, decideWithinMs]);

  // Flush on tab close or reload: the effect cleanup above does not run on a hard unload.
  useEffect(() => {
    if (!draftId) return;
    const flushNow = () => sessionRef.current?.flush();
    globalThis.addEventListener("beforeunload", flushNow);
    globalThis.addEventListener("pagehide", flushNow);
    return () => {
      globalThis.removeEventListener("beforeunload", flushNow);
      globalThis.removeEventListener("pagehide", flushNow);
    };
  }, [draftId]);

  const touch = () => {
    if (mode === "live") sessionRef.current?.touch();
  };

  return { collaboration, mode, presenceCount, touch };
};

export { type CollabToken } from "./session";
