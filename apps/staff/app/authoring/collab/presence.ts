// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Presence model for the collab room.
//
// steward-collab SERVER-BINDS identity: whatever `user` block a client puts in its awareness
// state is overwritten with `{uid, name, color, colorIndex}` (see steward-collab's
// docs/api.md). So the browser must NEVER pick its own colour or label: it reads both out of
// the fan-out. Two further server behaviours shape this module:
//
//   - The room rebroadcasts awareness to EVERY client including the sender, so this must
//     filter by our own Yjs clientID.
//   - One user can hold several awareness entries (two tabs, or a reconnect before the old
//     entry expires), so entries must be de-duplicated by uid.
//
// Framework-free: an awareness state is just the plain object y-protocols' `Awareness` hands
// back from `getStates()`, so this is testable without a socket or a document.

/** One raw awareness state, as `Awareness.getStates()` returns it. */
export type AwarenessState = Record<string, unknown>;

/** A collaborator in the room, as the SERVER describes them. */
export interface Collaborator {
  /** Server-assigned cursor colour. */
  color: string;
  /** Server-resolved display name; equals uid when identity had no name. */
  name: string;
  /** The authenticated user id from the collab JWT's `uid` claim. */
  uid: string;
}

/** The server-bound identity block the relay writes into every awareness state. */
interface BoundUser {
  color?: unknown;
  name?: unknown;
  uid?: unknown;
}

/**
 * Pull the server-bound `user` block out of one awareness state, or undefined when it is
 * absent or malformed. A state with no usable `user` is skipped rather than rendered with a
 * placeholder: showing an unnamed grey avatar for what is probably our own not-yet-echoed
 * state is worse than showing nothing.
 */
export const boundUserOf = (
  // OPTIONAL, not `AwarenessState | undefined`: callers pass `states.get(id)`, which is
  // absent for a clientID that has left, and "no state" is a legitimate argument rather than
  // one that has to be spelled out at every call site.
  state?: AwarenessState,
): Collaborator | undefined => {
  if (!state) return undefined;
  const raw = state.user as BoundUser | undefined;
  if (!raw || typeof raw !== "object") return undefined;
  const { color, name, uid } = raw;
  if (typeof uid !== "string" || uid === "") return undefined;
  return {
    color: typeof color === "string" && color !== "" ? color : "#6B7280",
    name: typeof name === "string" && name !== "" ? name : uid,
    uid,
  };
};

/**
 * Reduce raw awareness states to the collaborator list for a presence display.
 *
 * `selfClientID` is our own Yjs clientID (`doc.clientID`) and is dropped: the room echoes our
 * own awareness back, and a presence list that includes ourselves is confusing.
 * De-duplication is by uid and keeps the FIRST entry seen in clientID order, which the server
 * already sorts ascending, so the list is stable across frames instead of reshuffling on
 * every keystroke.
 */
export const collaboratorsFrom = (
  states: ReadonlyMap<number, AwarenessState>,
  selfClientID: number,
): Collaborator[] => {
  const byUid = new Map<string, Collaborator>();
  const clientIDs = [...states.keys()].toSorted((a, b) => a - b);
  for (const clientID of clientIDs) {
    if (clientID === selfClientID) continue;
    const who = boundUserOf(states.get(clientID));
    if (!who) continue;
    if (!byUid.has(who.uid)) byUid.set(who.uid, who);
  }
  return [...byUid.values()];
};

/**
 * Our OWN server-bound identity, read back out of the echo of our awareness state. It is the
 * only way to learn the colour and display name the server assigned us.
 */
export const selfIdentityFrom = (
  states: ReadonlyMap<number, AwarenessState>,
  selfClientID: number,
): Collaborator | undefined => boundUserOf(states.get(selfClientID));
