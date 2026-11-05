// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { PHONE } from "@steward-web/ui";
import { onTestFinished } from "vitest";

/**
 * Makes this test's screen phone-width, as the browser's media query list would report it, so
 * `useMediaQuery(PHONE)` answers true; the wide screen comes back when the test finishes.
 */
export const asPhone = () => {
  const restore = globalThis.matchMedia;
  globalThis.matchMedia = ((query: string) => ({
    addEventListener: () => {},
    matches: query === PHONE,
    media: query,
    removeEventListener: () => {},
  })) as unknown as typeof globalThis.matchMedia;
  onTestFinished(() => {
    globalThis.matchMedia = restore;
  });
};
