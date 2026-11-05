// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useEffect } from "react";
import { useRevalidator } from "react-router";

/**
 * Keeps a page's data live without reloading it (6-states.s5): its loaders run again when the
 * window comes back into focus and, given `every`, every `every` ms while it's open. The page's
 * own live-update cue then flashes whatever changed.
 */
export const useLiveRevalidation = (every?: number) => {
  const { revalidate } = useRevalidator();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "hidden") void revalidate();
    };
    globalThis.addEventListener("focus", refresh);
    const timer = every === undefined ? undefined : setInterval(refresh, every);
    return () => {
      globalThis.removeEventListener("focus", refresh);
      clearInterval(timer);
    };
  }, [every, revalidate]);
};
