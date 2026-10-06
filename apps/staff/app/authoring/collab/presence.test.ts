// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Presence-derivation tests.
import { describe, expect, it } from "vitest";

import { type AwarenessState, boundUserOf, collaboratorsFrom, selfIdentityFrom } from "./presence";

/** An awareness state as the relay emits it: the server-bound `user` block the relay
 *  overwrites, alongside whatever else a client's own awareness carried. */
const state = (uid: string, name: string, color: string): AwarenessState => ({
  clientAsserted: "ignored",
  user: { color, name, uid },
});

describe("presence", () => {
  it("reads the server's identity block in boundUserOf", () => {
    const who = boundUserOf(state("u1", "Ada Lovelace", "#0091FF"));
    expect(who).toEqual({ color: "#0091FF", name: "Ada Lovelace", uid: "u1" });
  });

  it("ignores states without a usable server identity in boundUserOf", () => {
    expect(boundUserOf()).toBeUndefined();
    expect(boundUserOf({})).toBeUndefined();
    // `user` present but not an object.
    expect(boundUserOf({ user: "nope" })).toBeUndefined();
    // No uid — the one field that cannot be invented.
    expect(boundUserOf({ user: { color: "#fff", name: "x" } })).toBeUndefined();
    expect(boundUserOf({ user: { uid: "" } })).toBeUndefined();
  });

  it("falls back to the uid when the name is empty in boundUserOf", () => {
    // The relay does this itself, but an older token has no `name` claim, so defend on both
    // sides.
    const who = boundUserOf(state("u9", "", "#30A46C"));
    expect(who?.name).toBe("u9");
    expect(who?.color).toBe("#30A46C");
  });

  it("excludes ourselves in collaboratorsFrom", () => {
    // The relay rebroadcasts awareness to EVERY client including the sender, so without
    // this filter the author sees their own presence entry.
    const states = new Map<number, AwarenessState>([
      [1, state("me", "Me", "#E5484D")],
      [2, state("u2", "Bea", "#0091FF")],
    ]);
    const others = collaboratorsFrom(states, 1);
    expect(others.map((c) => c.uid)).toEqual(["u2"]);
  });

  it("de-duplicates one user's multiple tabs in collaboratorsFrom", () => {
    // One uid can hold several awareness entries — two tabs, or a reconnect before the
    // stale entry expired.
    const states = new Map<number, AwarenessState>([
      [3, state("u2", "Bea", "#0091FF")],
      [5, state("u3", "Cy", "#30A46C")],
      [7, state("u2", "Bea", "#0091FF")],
    ]);
    const others = collaboratorsFrom(states, 99);
    expect(others.map((c) => c.uid)).toEqual(["u2", "u3"]);
  });

  it("is stable in clientID order in collaboratorsFrom", () => {
    // The relay sorts its fan-out by clientID ascending; matching that keeps the presence
    // list from reshuffling on every keystroke.
    const states = new Map<number, AwarenessState>([
      [10, state("a", "A", "#E5484D")],
      [20, state("b", "B", "#0091FF")],
      [30, state("c", "C", "#12A594")],
    ]);
    expect(collaboratorsFrom(states, 0).map((c) => c.uid)).toEqual(["a", "b", "c"]);
  });

  it("yields nothing when alone in collaboratorsFrom", () => {
    const states = new Map<number, AwarenessState>([[1, state("me", "Me", "#fff")]]);
    expect(collaboratorsFrom(states, 1)).toEqual([]);
  });

  it("recovers the server-assigned colour in selfIdentityFrom", () => {
    // The only way to learn our own server-assigned colour is to read our awareness state
    // back out of the relay's echo.
    const states = new Map<number, AwarenessState>([[4, state("me", "Ada Lovelace", "#F76B15")]]);
    expect(selfIdentityFrom(states, 4)).toEqual({
      color: "#F76B15",
      name: "Ada Lovelace",
      uid: "me",
    });
    expect(selfIdentityFrom(states, 5)).toBeUndefined();
  });
});
