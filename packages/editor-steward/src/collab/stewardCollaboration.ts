// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Provider, ProviderAwareness, UserState } from "@lexical/yjs";
import type { KoenigCollaboration } from "@steward-web/editor";

import { Awareness } from "y-protocols/awareness";
import { type Doc, XmlText } from "yjs";

// The editor's collaboration over Steward's one websocket room per draft.
//
// The editor asks for a Yjs provider per document: one for the main editor and one per nested
// editor (image captions, callout and toggle text). Steward's relay has a single room per draft
// and the session that owns it is created outside the editor, after a token is minted. So:
//
//  - every provider handed to the editor is a stand-in that forwards the real socket's events
//    once the session attaches it, and never opens or closes the socket itself;
//  - every editor binds to the room's one Y.Doc; a nested editor's content lives in a named
//    top-level XmlText of that doc instead of a subdocument the relay could not carry. Two
//    peers that create the same top-level type merge into one, so they converge;
//  - collaborator names and colours come from the `user` block the relay writes into each
//    awareness state, never from what a browser claims about itself.

/** The parts of y-websocket's WebsocketProvider the stand-ins forward. */
export interface ProviderEventSource {
  // Method syntax on purpose: y-websocket types its event names and listeners narrowly, and
  // method parameters compare bivariantly, so its provider fits without a cast.
  off(type: string, listener: (...arguments_: never[]) => unknown): void;
  on(type: string, listener: (...arguments_: never[]) => unknown): void;
  readonly synced: boolean;
}

type Listener = (...arguments_: never[]) => void;

const FORWARDED_EVENTS = ["reload", "status", "sync", "update"] as const;

const NESTED_ROOT_PREFIX = "nested:";

/** The relay's identity block on an awareness state. */
interface BoundUser {
  color?: unknown;
  name?: unknown;
}

/** A state with the relay-bound name and colour in the fields Lexical draws carets from. */
const withBoundIdentity = (state: UserState): UserState => {
  const user = (state as { user?: BoundUser }).user;
  if (!user || typeof user.name !== "string" || user.name === "") return state;
  return {
    ...state,
    color: typeof user.color === "string" && user.color !== "" ? user.color : state.color,
    name: user.name,
  };
};

const boundAwareness = (awareness: Awareness): ProviderAwareness => ({
  getLocalState: () => awareness.getLocalState() as null | UserState,
  getStates: () =>
    new Map(
      [...awareness.getStates()].map(([clientID, state]) => [
        clientID,
        withBoundIdentity(state as UserState),
      ]),
    ),
  off: (type, listener) => awareness.off(type, listener),
  on: (type, listener) => awareness.on(type, listener),
  setLocalState: (state) => awareness.setLocalState(state),
  setLocalStateField: (field, value) => awareness.setLocalStateField(field, value),
});

export interface StewardCollaboration {
  /** Forward the session's socket to every editor provider. */
  attach: (source: ProviderEventSource) => void;
  /** Stop forwarding and release the nested editors' local presence. */
  dispose: () => void;
  /** What the editor's composer takes. */
  koenig: KoenigCollaboration;
}

/** A provider the editor can hold before the socket exists. */
export class DeferredProvider implements Provider {
  readonly awareness: ProviderAwareness;
  private readonly listeners = new Map<string, Set<Listener>>();
  private source: ProviderEventSource | undefined;
  private synced = false;
  constructor(awareness: ProviderAwareness) {
    this.awareness = awareness;
  }

  /** Start forwarding the real socket's events. A source that already synced replays it. */
  attach(source: ProviderEventSource): void {
    this.detach();
    this.source = source;
    source.on("sync", this.trackSync as Listener);
    for (const [type, listeners] of this.listeners) {
      for (const listener of listeners) source.on(type, listener);
    }
    if (source.synced) {
      this.synced = true;
      this.replaySync();
    }
  }

  // The session owns the socket: the editor connecting or disconnecting a provider must not
  // open a second socket or close the shared one.
  connect(): void {}

  detach(): void {
    const { source } = this;
    if (!source) return;
    source.off("sync", this.trackSync as Listener);
    for (const [type, listeners] of this.listeners) {
      for (const listener of listeners) source.off(type, listener);
    }
    this.source = undefined;
  }

  disconnect(): void {}

  off(type: string, listener: Listener): void {
    this.listeners.get(type)?.delete(listener);
    this.source?.off(type, listener);
  }

  on(type: string, listener: Listener): void {
    if (!FORWARDED_EVENTS.includes(type as (typeof FORWARDED_EVENTS)[number])) return;
    const set = this.listeners.get(type) ?? new Set<Listener>();
    set.add(listener);
    this.listeners.set(type, set);
    this.source?.on(type, listener);
    if (type === "sync" && this.synced) {
      queueMicrotask(() => (listener as (isSynced: boolean) => void)(true));
    }
  }

  private replaySync(): void {
    for (const listener of this.listeners.get("sync") ?? []) {
      queueMicrotask(() => (listener as (isSynced: boolean) => void)(true));
    }
  }

  private readonly trackSync = (isSynced: boolean) => {
    this.synced = isSynced;
  };
}

/**
 * Wire the editor onto one collab room. `document` and `awareness` are the room's: the session
 * syncs them over the relay. Call `attach` with the session's provider once it exists.
 */
export const createStewardCollaboration = (
  document: Doc,
  awareness: Awareness,
): StewardCollaboration => {
  const main = new DeferredProvider(boundAwareness(awareness));
  // Nested editors keep their caret state to themselves: sharing the room's awareness would
  // let a caption's caret overwrite the main editor's.
  const nested = new Map<string, { awareness: Awareness; provider: DeferredProvider }>();
  let source: ProviderEventSource | undefined;

  const nestedProvider = (id: string): DeferredProvider => {
    const existing = nested.get(id);
    if (existing) return existing.provider;
    const local = new Awareness(document);
    const provider = new DeferredProvider(boundAwareness(local));
    if (source) provider.attach(source);
    nested.set(id, { awareness: local, provider });
    return provider;
  };

  return {
    attach: (next) => {
      source = next;
      main.attach(next);
      for (const { provider } of nested.values()) provider.attach(next);
    },
    dispose: () => {
      main.detach();
      for (const { awareness: local, provider } of nested.values()) {
        provider.detach();
        local.destroy();
      }
      nested.clear();
      source = undefined;
    },
    koenig: {
      getNestedXmlText: (_document, id) => document.get(`${NESTED_ROOT_PREFIX}${id}`, XmlText),
      providerFactory: (id, yjsDocumentMap) => {
        yjsDocumentMap.set(id, document);
        return id === "main" ? main : nestedProvider(id);
      },
      shouldBootstrap: true,
    },
  };
};
