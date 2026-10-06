// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * The one string every mock-mode artifact carries: the persistent banner's `data-` attribute
 * (`MockBanner.tsx`) and every mock id (`mockId`, below). `scripts/check-no-mock-leak.mjs`
 * (repo root) greps a LIVE build's output for this string and fails the build if it finds it.
 * A live build never imports this package in the first place (`@steward-web/vite-config`'s
 * `chooseEdge` only aliases it in for `--mode mock`), so the check is a regression guard, not
 * the primary defence.
 */
export const MOCK_MARKER = "steward-mock-data";

/** An id namespaced so it can never collide with (or be mistaken for) a real one. */
export const mockId = (kind: string, n: number): string => `${MOCK_MARKER}-${kind}-${n}`;
