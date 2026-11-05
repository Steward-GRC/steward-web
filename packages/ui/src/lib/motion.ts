// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/**
 * Whether to move with motion: false when the system asks for less motion or the person
 * turned on Reduce motion in Accessibility options (H12). CSS already stills animations and
 * transitions; this is for motion started from script, such as a smooth scroll.
 */
const motionAllowed = (): boolean => {
  if (typeof document === "undefined") return false;
  if (Object.hasOwn(document.documentElement.dataset, "reduceMotion")) return false;
  return !globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
};

/** "smooth", or "auto" (a jump) when motion should be reduced. */
export const scrollBehavior = (): ScrollBehavior => (motionAllowed() ? "smooth" : "auto");
