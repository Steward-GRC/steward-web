// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Edge } from "@steward-web/api-client";

import { mockDiagnostics, mockMe } from "./fixtures";

/**
 * The mock edge: every call answers from the fixtures, no network, no cookie check. Swapped
 * in for `edge/live.server.ts` only on a `--mode mock` build (`@steward-web/vite-config`'s
 * `chooseEdge`); a live build never imports this module.
 */
export const mockEdge: Edge = {
  diagnostics: () => Promise.resolve(mockDiagnostics),
  me: () => Promise.resolve(mockMe),
};

export default mockEdge;
