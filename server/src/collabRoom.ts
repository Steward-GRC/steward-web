// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * The in-memory room registry the co-editing relay (`collabServer.ts`) joins members into,
 * one room per draft. Framework-free (no `ws`, no `http`) so it's unit-tested without a real
 * socket: a member is just an id and a `send` callback.
 *
 * This is a SINGLE-PROCESS relay: rooms live in this one server's memory and don't survive a
 * restart or scale past one instance. That's a known limit, not an oversight — the real
 * steward-collab service is the token authority and the eventual multi-instance broker; this
 * is this port's own stand-in until it exists.
 */

export interface CollabMember {
  id: string;
  send: (data: string) => void;
}

export interface CollabRooms {
  /** Sends `data` to every OTHER member of the room (never back to the sender). */
  broadcast: (roomId: string, senderId: string, data: string) => void;
  /** Sends `data` to every member of the room, the sender included. */
  broadcastAll: (roomId: string, data: string) => void;
  enter: (roomId: string, member: CollabMember) => void;
  leave: (roomId: string, memberId: string) => void;
  /** How many members are currently in the room (0 for a room that doesn't exist). */
  presenceCount: (roomId: string) => number;
}

export const createCollabRooms = (): CollabRooms => {
  const rooms = new Map<string, Map<string, CollabMember>>();

  const enter: CollabRooms["enter"] = (roomId, member) => {
    const room = rooms.get(roomId) ?? new Map<string, CollabMember>();
    room.set(member.id, member);
    rooms.set(roomId, room);
  };

  const leave: CollabRooms["leave"] = (roomId, memberId) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.delete(memberId);
    if (room.size === 0) rooms.delete(roomId);
  };

  const broadcast: CollabRooms["broadcast"] = (roomId, senderId, data) => {
    const room = rooms.get(roomId);
    if (!room) return;
    for (const member of room.values()) {
      if (member.id !== senderId) member.send(data);
    }
  };

  const broadcastAll: CollabRooms["broadcastAll"] = (roomId, data) => {
    const room = rooms.get(roomId);
    if (!room) return;
    for (const member of room.values()) member.send(data);
  };

  const presenceCount: CollabRooms["presenceCount"] = (roomId) => rooms.get(roomId)?.size ?? 0;

  return { broadcast, broadcastAll, enter, leave, presenceCount };
};
