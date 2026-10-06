// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The co-editing wire protocol: plain JSON frames over the websocket `issueCollabToken`
// points at. The relay (`server/src/collabServer.ts`) only reads `join` itself and
// re-broadcasts everything else verbatim, so this is the one place either side's frame
// shapes are defined. Pure and framework-free, so it's unit-tested without a real socket.

export type CollabServerMessage = PresenceMessage | UpdateMessage;

export interface JoinMessage {
  token: string;
  type: "join";
}

export interface PresenceMessage {
  count: number;
  type: "presence";
}

export interface UpdateMessage {
  sectionKey: string;
  text: string;
  type: "update";
}

export const encodeJoin = (token: string): string =>
  JSON.stringify({ token, type: "join" } satisfies JoinMessage);

export const encodeUpdate = (sectionKey: string, text: string): string =>
  JSON.stringify({ sectionKey, text, type: "update" } satisfies UpdateMessage);

/** Decodes a frame from the relay; an unrecognized or malformed one decodes to `null` rather
 *  than throwing, so one bad frame never takes the whole session down. */
export const decodeServerMessage = (data: string): CollabServerMessage | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const { count, sectionKey, text, type } = parsed as Record<string, unknown>;

  if (type === "presence" && typeof count === "number") {
    return { count, type: "presence" };
  }
  if (type === "update" && typeof sectionKey === "string" && typeof text === "string") {
    return { sectionKey, text, type: "update" };
  }
  return null;
};
