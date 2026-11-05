// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useSyncExternalStore } from "react";

/** Phone widths (below the medium breakpoint, 768 px): where the staff app's phone frames apply. */
export const PHONE = "(max-width: 47.98rem)";

/**
 * Whether a media query matches, following the screen as it changes. The server and the first
 * render answer false (the wide layout), so a phone switches over once it hydrates.
 */
export const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const list = globalThis.matchMedia?.(query);
      list?.addEventListener("change", onChange);
      return () => list?.removeEventListener("change", onChange);
    },
    () => globalThis.matchMedia?.(query).matches ?? false,
    () => false,
  );
