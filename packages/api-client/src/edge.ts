// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Diagnostics, Me } from "./generated/schema";

export type { Diagnostics, Me } from "./generated/schema";

export interface Edge {
  /** The gateway's own diagnostics read. Rejects with `GatewayError` when signed out. */
  diagnostics(cookie?: string): Promise<Diagnostics>;
  /** The signed-in user, or `null` when the session cookie is missing or expired. */
  me(cookie?: string): Promise<Me | null>;
  /** Edits the CALLING user's own name. Rejects with `GatewayError` when signed out. */
  updateMyProfile(input: UpdateMyProfileInput, cookie?: string): Promise<Me>;
}

/**
 * The network edge every loader and action calls through `@steward-web/edge.server`
 * (aliased by `@steward-web/vite-config`'s `chooseEdge` to either `edge/live.server.ts`
 * here or `packages/mock-gateway`'s `edge.server.ts`). Both implement this same shape, so
 * swapping the edge is the only thing `--mode mock` changes.
 */
export interface UpdateMyProfileInput {
  firstName: string;
  lastName: string;
}
