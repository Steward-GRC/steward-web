// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * The live build's half of the mock-banner swap: nothing. `@steward-web/vite-config`'s
 * `chooseEdge` aliases `@steward-web/mock-banner` to this file on every build but `--mode
 * mock`, where it points at `@steward-web/mock-gateway`'s real `MockBanner` instead — so the
 * mock banner's code (and its marker string) is never even bundled into a live build, the
 * same way the mock edge isn't.
 */
export const MockBanner = () => null;
