// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef, useState } from "react";

import { reconnectDelayMs } from "./backoff";
import { decodeServerMessage, encodeJoin, encodeUpdate } from "./protocol";

export interface CollabSession {
  /** How many browsers (this one included) are currently in the draft's co-editing room. */
  presenceCount: number;
  sendUpdate: (sectionKey: string, text: string) => void;
}

export interface CollabToken {
  token: string;
  wsUrl: string;
}

/**
 * Connects to the co-editing relay for one draft (`server/src/collabServer.ts`),
 * reconnecting with backoff on an unexpected close and re-requesting a fresh token (tokens
 * are short-lived) before every attempt, including the first. `getToken` and `onRemoteUpdate`
 * don't need to be stable across renders — only `draftId` restarts the connection.
 */
export const useCollabSession = (
  draftId: null | string,
  getToken: () => Promise<CollabToken>,
  onRemoteUpdate: (sectionKey: string, text: string) => void,
): CollabSession => {
  const [presenceCount, setPresenceCount] = useState(1);
  const wsRef = useRef<null | WebSocket>(null);
  const getTokenRef = useRef(getToken);
  const onRemoteUpdateRef = useRef(onRemoteUpdate);

  useEffect(() => {
    getTokenRef.current = getToken;
    onRemoteUpdateRef.current = onRemoteUpdate;
  }, [getToken, onRemoteUpdate]);

  useEffect(() => {
    if (!draftId) return;
    let attempt = 0;
    let stopped = false;
    let retryTimer: ReturnType<typeof globalThis.setTimeout> | undefined;

    const connect = () => {
      void getTokenRef
        .current()
        .then((collabToken) => {
          if (stopped) return;
          const url = new URL(collabToken.wsUrl, globalThis.location.origin);
          url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
          url.searchParams.set("draftId", draftId);
          const ws = new WebSocket(url);
          wsRef.current = ws;

          ws.addEventListener("open", () => {
            attempt = 0;
            ws.send(encodeJoin(collabToken.token));
          });
          ws.addEventListener("message", (event) => {
            const message = decodeServerMessage(String(event.data));
            if (!message) return;
            if (message.type === "presence") setPresenceCount(message.count);
            else onRemoteUpdateRef.current(message.sectionKey, message.text);
          });
          ws.addEventListener("close", () => {
            wsRef.current = null;
            if (stopped) return;
            attempt += 1;
            retryTimer = globalThis.setTimeout(connect, reconnectDelayMs(attempt));
          });
        })
        .catch(() => {
          if (stopped) return;
          attempt += 1;
          retryTimer = globalThis.setTimeout(connect, reconnectDelayMs(attempt));
        });
    };

    connect();

    return () => {
      stopped = true;
      globalThis.clearTimeout(retryTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [draftId]);

  const sendUpdate = (sectionKey: string, text: string) => {
    wsRef.current?.send(encodeUpdate(sectionKey, text));
  };

  return { presenceCount, sendUpdate };
};
