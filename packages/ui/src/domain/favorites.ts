// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "steward:library.favorites";

const read = (): string[] => {
  try {
    const raw = JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
};

const write = (favorites: readonly string[]) => {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Storage can be blocked; the star still applies to this page.
  }
};

export interface FavoritesStore {
  favorites: readonly string[];
  isFavorite: (number: string) => boolean;
  toggle: (number: string) => void;
}

/**
 * Per-browser starred policies/procedures, keyed by number. A local preference, not server
 * data (the original kept it local "for the test"; a real per-user preference would be a
 * follow-up gateway mutation). The server render has no storage, so it starts empty; the
 * effect below catches the state up after hydration, the same pattern as `ThemeProvider`.
 */
export const useFavorites = (): FavoritesStore => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after hydration
    setFavorites(read());
  }, []);

  const toggle = useCallback((number: string) => {
    setFavorites((current) => {
      const next = current.includes(number)
        ? current.filter((n) => n !== number)
        : [...current, number];
      write(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((number: string) => favorites.includes(number), [favorites]);

  return { favorites, isFavorite, toggle };
};
