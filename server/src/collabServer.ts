// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { IncomingMessage, Server } from "node:http";
import type { Socket } from "node:net";

import { WebSocketServer } from "ws";

import { type CollabRooms, createCollabRooms } from "./collabRoom.ts";

const JOIN_TIMEOUT_MS = 5000;

let nextMemberSeq = 1;

/** The only frame this relay parses itself; everything after a valid join is opaque JSON it
 *  just re-broadcasts (see `@steward-web/staff`'s `authoring/collab/protocol.ts`). */
const parseJoin = (data: unknown): { token: string } | null => {
  if (typeof data !== "string") return null;
  try {
    const parsed = JSON.parse(data) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as { type?: unknown }).type === "join" &&
      typeof (parsed as { token?: unknown }).token === "string" &&
      (parsed as { token: string }).token !== ""
    ) {
      return { token: (parsed as { token: string }).token };
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Attaches the co-editing relay to `server`'s own `upgrade` event at `path` (default
 * `/collab`), same-origin with the rest of the app. The room is named by the connection's
 * `draftId` query parameter (not sensitive, so it's fine in the URL); the token
 * `issueCollabToken` minted is NEVER put in the URL (it would land in an access log) —
 * the client's first message after connecting must be `{"type":"join","token":"..."}`, and
 * a connection that doesn't send one within `JOIN_TIMEOUT_MS` is closed.
 *
 * This relay trusts that a well-formed token was minted; it doesn't re-derive edit access
 * itself — `issueCollabToken`'s OWN check is the real gate, the same posture `/query`'s proxy
 * takes with the session cookie it forwards without re-checking. Everything after the join
 * is opaque to this relay: it re-broadcasts each message verbatim to the room's other
 * members and never parses it.
 */
export const attachCollabServer = (server: Server, path = "/collab"): CollabRooms => {
  const rooms = createCollabRooms();
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request: IncomingMessage, socket: Socket, head: Buffer) => {
    const url = new URL(request.url ?? "", "http://localhost");
    if (url.pathname !== path) return;

    const draftId = url.searchParams.get("draftId");
    if (!draftId) {
      socket.destroy();
      return;
    }

    const announcePresence = () => {
      rooms.broadcastAll(
        draftId,
        JSON.stringify({ count: rooms.presenceCount(draftId), type: "presence" }),
      );
    };

    wss.handleUpgrade(request, socket, head, (ws) => {
      const joinTimer = setTimeout(() => ws.close(4001, "join timeout"), JOIN_TIMEOUT_MS);
      let memberId: null | string = null;

      ws.once("message", (data, isBinary) => {
        clearTimeout(joinTimer);
        const join = isBinary ? null : parseJoin(data.toString());
        if (!join) {
          ws.close(4000, "a join frame with a token is required first");
          return;
        }

        memberId = `member-${nextMemberSeq++}`;
        rooms.enter(draftId, { id: memberId, send: (payload) => ws.send(payload) });
        announcePresence();

        ws.on("message", (nextData, nextIsBinary) => {
          if (nextIsBinary || !memberId) return;
          rooms.broadcast(draftId, memberId, nextData.toString());
        });
      });

      ws.on("close", () => {
        clearTimeout(joinTimer);
        if (memberId) {
          rooms.leave(draftId, memberId);
          announcePresence();
        }
      });
    });
  });

  return rooms;
};
