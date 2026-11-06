// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The one way a page offers actions to the command bar (bug log 26). A page or record calls
// `useRegisterCommandActions` with what the person may do there; the bar lists them first and
// the registry's shortcut keys run them. Nothing registers a thing the person may not do:
// an action with `allowed: false` is dropped here, in one place.
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { matchesShortcut, type ShortcutId, SHORTCUTS } from "./shortcuts";

export interface CommandAction {
  /** False when the person may not take it; the registry drops it. Default true. */
  allowed?: boolean;
  /** Folder, clock and the like are for results; an action shows the bolt. */
  id: string;
  /** `admin` marks an admin-level task (#103): the Admin actions button and the bar's Admin
   *  group show it, after the everyday ones. */
  kind?: "admin";
  /** Already worded for the person. */
  label: string;
  run: () => void;
  shortcut?: ShortcutId;
}

interface Registry {
  remove: (owner: string) => void;
  set: (owner: string, actions: readonly CommandAction[]) => void;
}

const ActionsContext = createContext<readonly CommandAction[]>([]);
const RegistryContext = createContext<null | Registry>(null);

/** True while the person is typing in a field, where a letter shortcut must not fire. */
const typingIn = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));

const dialogOpen = () =>
  document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"]') !== null;

export const CommandActionsProvider = ({ children }: { children: ReactNode }) => {
  const [byOwner, setByOwner] = useState<ReadonlyMap<string, readonly CommandAction[]>>(new Map());
  const registry = useMemo<Registry>(
    () => ({
      remove: (owner) =>
        setByOwner((current) => {
          if (!current.has(owner)) return current;
          const next = new Map(current);
          next.delete(owner);
          return next;
        }),
      set: (owner, actions) => setByOwner((current) => new Map(current).set(owner, actions)),
    }),
    [],
  );
  const actions = useMemo(() => {
    // The later registration of an id wins (a record page over its section).
    const byId = new Map<string, CommandAction>();
    for (const list of byOwner.values()) {
      for (const action of list) if (action.allowed !== false) byId.set(action.id, action);
    }
    // The everyday actions first, the admin ones after, each in the order they registered.
    const all = [...byId.values()];
    return [
      ...all.filter((action) => action.kind !== "admin"),
      ...all.filter((action) => action.kind === "admin"),
    ];
  }, [byOwner]);

  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || typingIn(event.target) || dialogOpen()) return;
      const hit = actionsRef.current.find(
        (action) => action.shortcut && matchesShortcut(event, SHORTCUTS[action.shortcut].keys),
      );
      if (!hit) return;
      event.preventDefault();
      hit.run();
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, []);

  return (
    <RegistryContext.Provider value={registry}>
      <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
    </RegistryContext.Provider>
  );
};

/** What the page in view offers now, for the command bar. */
export const useCommandActions = (): readonly CommandAction[] => useContext(ActionsContext);

/**
 * Registers a page's actions while it is mounted. Pass a fresh array every render if you like:
 * the registry re-registers only when an id, label, shortcut or permission changes, and always
 * calls the latest `run`. Without a provider (a test, a gate) it does nothing.
 */
export const useRegisterCommandActions = (actions: readonly CommandAction[]) => {
  const registry = useContext(RegistryContext);
  const owner = useId();
  const latest = useRef(actions);
  useEffect(() => {
    latest.current = actions;
  });
  const signature = JSON.stringify(
    actions.map((a) => [a.id, a.label, a.shortcut ?? null, a.allowed !== false]),
  );
  const stable = useCallback(
    (id: string) => () => latest.current.find((a) => a.id === id)?.run(),
    [],
  );
  useEffect(() => {
    if (!registry) return;
    registry.set(
      owner,
      latest.current.map((a) => ({ ...a, run: stable(a.id) })),
    );
    return () => registry.remove(owner);
    // The signature stands for the list's identity-free content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, registry, signature, stable]);
};
