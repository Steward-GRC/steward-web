// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";

import { CONTROL_DRAFT_PUBLISHED, CONTROL_SNAPSHOT_REJECTED, describeRejection } from "./protocol";
import { CollabSession, type CollabToken } from "./session";

export interface CollabSessionResult {
  /** How many browsers (this one included) are currently in the draft's co-editing room. */
  presenceCount: number;
  /** Write a section's new text into the shared document and arm the checkpoint debounce. */
  sendUpdate: (sectionKey: string, text: string) => void;
}

interface DraftSectionLike {
  sectionKey: string;
  text: string;
}

/** The shared document's one map: section key to its current text. Coarse-grained (whole
 *  section, not per-character) on purpose — it matches what the editor's plain textareas can
 *  actually produce, and keeps concurrent edits to DIFFERENT sections merging independently
 *  without needing a rich per-character CRDT type. */
const SECTIONS_MAP = "sections";

/** Tags a Y.Map transaction this hook made itself, so the observer can tell a remote peer's
 *  edit (which must update local state) from an echo of our own write (which must not, or
 *  in-progress typing would be clobbered by its own round trip). */
const LOCAL_ORIGIN = Symbol("steward-web:collab-local-edit");

/**
 * Seeds the shared map from already-loaded content the first time the room is found empty (a
 * brand-new room with no prior rehydrated state). Every peer loads the SAME persisted content
 * independently, so a race to seed converges on identical values — unlike a rich-text CRDT, a
 * plain key/value map has no duplication hazard from more than one peer doing this.
 */
const seedSectionsIfEmpty = (
  sectionsMap: Y.Map<string>,
  sharedDocument: Y.Doc,
  contentJSON: string,
): void => {
  if (sectionsMap.size > 0) return;
  let sections: DraftSectionLike[];
  try {
    const parsed = JSON.parse(contentJSON) as unknown;
    sections = Array.isArray(parsed) ? (parsed as DraftSectionLike[]) : [];
  } catch {
    sections = [];
  }
  if (sections.length === 0) return;
  sharedDocument.transact(() => {
    for (const section of sections) sectionsMap.set(section.sectionKey, section.text);
  }, LOCAL_ORIGIN);
};

/**
 * Runs (or declines to run) one draft's collaboration room.
 *
 * Connects to steward-collab through the gateway's websocket proxy with `y-websocket`,
 * mirrors the shared `sections` map into the caller's own section state, and checkpoints the
 * caller's authoritative content JSON on the session's debounce. Every failure — no token, an
 * unreachable relay, a refused upgrade — degrades silently: the caller's own manual save path
 * is never blocked by collaboration being unavailable.
 */
export const useCollabSession = (
  draftId: null | string,
  getToken: () => Promise<CollabToken>,
  onRemoteUpdate: (sectionKey: string, text: string) => void,
  getContentJSON: () => string,
  onSnapshotRejected?: (message: string) => void,
  onPublishedElsewhere?: (versionNumber: number) => void,
): CollabSessionResult => {
  const [presenceCount, setPresenceCount] = useState(1);
  const sectionsMapRef = useRef<null | Y.Map<string>>(null);
  const sessionRef = useRef<CollabSession | null>(null);

  // Latest-value refs so the room is not torn down and rebuilt every time the caller
  // re-renders with new closures. Written in an effect, never during render.
  const getTokenRef = useRef(getToken);
  const onRemoteUpdateRef = useRef(onRemoteUpdate);
  const getContentJSONRef = useRef(getContentJSON);
  const onSnapshotRejectedRef = useRef(onSnapshotRejected);
  const onPublishedElsewhereRef = useRef(onPublishedElsewhere);
  useEffect(() => {
    getTokenRef.current = getToken;
    onRemoteUpdateRef.current = onRemoteUpdate;
    getContentJSONRef.current = getContentJSON;
    onSnapshotRejectedRef.current = onSnapshotRejected;
    onPublishedElsewhereRef.current = onPublishedElsewhere;
  }, [getToken, onRemoteUpdate, getContentJSON, onSnapshotRejected, onPublishedElsewhere]);

  useEffect(() => {
    if (!draftId) return;

    const sharedDocument = new Y.Doc();
    const sectionsMap = sharedDocument.getMap<string>(SECTIONS_MAP);
    sectionsMapRef.current = sectionsMap;
    let stopped = false;

    // Remote edits (and the echo of our own, which is a no-op for the caller's state since
    // it already holds that text) land here. Only a REMOTE-origin change is forwarded, so an
    // in-flight local edit is never overwritten by its own round trip.
    const onSectionsChange = (event: Y.YMapEvent<string>) => {
      if (event.transaction.origin === LOCAL_ORIGIN) return;
      for (const key of event.keysChanged) {
        const value = sectionsMap.get(key);
        if (value !== undefined) onRemoteUpdateRef.current(key, value);
      }
    };
    sectionsMap.observe(onSectionsChange);

    const session = new CollabSession({
      doc: sharedDocument,
      mintToken: () => getTokenRef.current(),
      onControl: (message) => {
        if (stopped) return;
        if (message.type === CONTROL_DRAFT_PUBLISHED) {
          onPublishedElsewhereRef.current?.(message.version_number ?? 0);
          return;
        }
        if (message.type === CONTROL_SNAPSHOT_REJECTED) {
          onSnapshotRejectedRef.current?.(describeRejection(message));
        }
      },
      onOversize: (bytes) => {
        if (stopped) return;
        onSnapshotRejectedRef.current?.(
          `This draft is too large to save collaboratively (${Math.round(bytes / 1024)} KB).`,
        );
      },
      onStatus: () => {
        // Status (connecting/live/unavailable) drives no UI here today — presenceCount
        // already reads 1 while solo, which is the correct display either way.
      },
    });
    session.setSnapshotSource(() => ({
      contentJSON: getContentJSONRef.current(),
      yjsState: Y.encodeStateAsUpdate(sharedDocument),
    }));
    sessionRef.current = session;

    void session.start().then(() => {
      if (stopped) return;
      const provider = session.wsProvider;
      if (!provider) return;

      provider.on("sync", (synced: boolean) => {
        if (!stopped && synced) {
          seedSectionsIfEmpty(sectionsMap, sharedDocument, getContentJSONRef.current());
        }
      });

      // Every connected peer must broadcast SOME awareness state to be counted at all — the
      // server overwrites the `user` field regardless of what is sent here.
      provider.awareness.setLocalStateField("present", true);
      const onAwarenessChange = () => {
        if (!stopped) setPresenceCount(provider.awareness.getStates().size);
      };
      provider.awareness.on("change", onAwarenessChange);
      onAwarenessChange();
    });

    return () => {
      stopped = true;
      sectionsMap.unobserve(onSectionsChange);
      // stop() flushes any pending checkpoint first — the navigate-away flush point, without
      // which the last few seconds of edits would be silently lost.
      session.stop();
      sharedDocument.destroy();
      sectionsMapRef.current = null;
      sessionRef.current = null;
      setPresenceCount(1);
    };
  }, [draftId]);

  // Flush on tab close / reload. `stop()` in the effect cleanup above does not run on a hard
  // unload, so this is a separate belt.
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

  const sendUpdate = (sectionKey: string, text: string) => {
    const sectionsMap = sectionsMapRef.current;
    const session = sessionRef.current;
    if (!sectionsMap || !session) return;
    sectionsMap.doc?.transact(() => sectionsMap.set(sectionKey, text), LOCAL_ORIGIN);
    session.touch();
  };

  return { presenceCount, sendUpdate };
};

export { type CollabToken } from "./session";
