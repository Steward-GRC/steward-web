// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from "vitest";
import { Awareness } from "y-protocols/awareness";
import { Doc, XmlText } from "yjs";

import { createStewardCollaboration, type ProviderEventSource } from "./stewardCollaboration";

/** A stand-in for the session's WebsocketProvider: just an event emitter with `synced`. */
const fakeSource = (synced = false) => {
  const listeners = new Map<string, Set<(...arguments_: unknown[]) => void>>();
  const source = {
    emit: (type: string, ...arguments_: unknown[]) => {
      for (const listener of listeners.get(type) ?? []) listener(...arguments_);
    },
    off: (type: string, listener: (...arguments_: unknown[]) => void) => {
      listeners.get(type)?.delete(listener);
    },
    on: (type: string, listener: (...arguments_: unknown[]) => void) => {
      listeners.set(type, (listeners.get(type) ?? new Set()).add(listener));
    },
    synced,
  };
  return source as ProviderEventSource & typeof source;
};

const setup = () => {
  const document = new Doc();
  const awareness = new Awareness(document);
  const collaboration = createStewardCollaboration(document, awareness);
  return { awareness, collaboration, doc: document };
};

describe("createStewardCollaboration", () => {
  it("binds the main editor and every nested editor to the room's one document", () => {
    const { collaboration, doc } = setup();
    const documentMap = new Map<string, Doc>();
    collaboration.koenig.providerFactory("main", documentMap);
    collaboration.koenig.providerFactory("caption-1", documentMap);
    expect(documentMap.get("main")).toBe(doc);
    expect(documentMap.get("caption-1")).toBe(doc);
    collaboration.dispose();
  });

  it("keeps a nested editor's content in a named root of that document", () => {
    const { collaboration, doc } = setup();
    const root = collaboration.koenig.getNestedXmlText!(new Doc(), "caption-1");
    expect(root).toBeInstanceOf(XmlText);
    expect(doc.get("nested:caption-1", XmlText)).toBe(root);
    collaboration.dispose();
  });

  it("forwards the socket's events to listeners registered before and after it attaches", () => {
    const { collaboration } = setup();
    const provider = collaboration.koenig.providerFactory("main", new Map());
    const early = vi.fn();
    provider.on("status", early);
    const source = fakeSource();
    collaboration.attach(source);
    const late = vi.fn();
    provider.on("status", late);
    source.emit("status", { status: "connected" });
    expect(early).toHaveBeenCalledWith({ status: "connected" });
    expect(late).toHaveBeenCalledWith({ status: "connected" });
    collaboration.dispose();
  });

  it("replays a sync that happened before the editor listened", async () => {
    const { collaboration } = setup();
    collaboration.attach(fakeSource(true));
    const provider = collaboration.koenig.providerFactory("caption-1", new Map());
    const onSync = vi.fn();
    provider.on("sync", onSync);
    await Promise.resolve();
    expect(onSync).toHaveBeenCalledWith(true);
    collaboration.dispose();
  });

  it("never opens or closes the session's socket itself", () => {
    const { collaboration } = setup();
    const provider = collaboration.koenig.providerFactory("main", new Map());
    expect(() => {
      void provider.connect();
      provider.disconnect();
    }).not.toThrow();
    collaboration.dispose();
  });

  it("draws carets with the name and colour the relay bound, not what a client claims", () => {
    const { awareness, collaboration } = setup();
    const provider = collaboration.koenig.providerFactory("main", new Map());
    awareness.setLocalState({
      color: "#000000",
      name: "made up",
      user: { color: "#2563EB", name: "Sam Rivera", uid: "u-1" },
    });
    const state = provider.awareness.getStates().get(awareness.clientID);
    expect(state).toMatchObject({ color: "#2563EB", name: "Sam Rivera" });
    collaboration.dispose();
  });

  it("stops forwarding once disposed", () => {
    const { collaboration } = setup();
    const provider = collaboration.koenig.providerFactory("main", new Map());
    const listener = vi.fn();
    provider.on("status", listener);
    const source = fakeSource();
    collaboration.attach(source);
    collaboration.dispose();
    source.emit("status", { status: "disconnected" });
    expect(listener).not.toHaveBeenCalled();
  });
});
