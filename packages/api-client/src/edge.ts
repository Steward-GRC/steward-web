// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  Category,
  DeleteUserResult,
  Diagnostics,
  Me,
  Policy,
  Session,
  User,
  UserDeletionPreview,
  UserPage,
} from "./generated/schema";

import { DocumentType } from "./generated/schema";

export type {
  Category,
  DeleteUserResult,
  Diagnostics,
  Me,
  Policy,
  Session,
  User,
  UserDeletionPreview,
  UserPage,
} from "./generated/schema";
export { DocumentType, PolicyStatus, Sensitivity } from "./generated/schema";

export interface Edge {
  /** The library's category tree. Rejects with `GatewayError` when signed out. */
  categories(cookie?: string): Promise<readonly Category[]>;
  /** Soft-deletes a user. Rejects with `GatewayError` while the preview reports `blocksDelete`. */
  deleteUser(userId: string, cookie?: string): Promise<DeleteUserResult>;
  /** The gateway's own diagnostics read. Rejects with `GatewayError` when signed out. */
  diagnostics(cookie?: string): Promise<Diagnostics>;
  disableUser(userId: string, cookie?: string): Promise<User>;

  enableUser(userId: string, cookie?: string): Promise<User>;
  /** Grants a GLOBAL role (no category). Site-admin only. */
  grantRole(userId: string, role: string, cookie?: string): Promise<User>;
  /** A user's sessions, site-admin only. */
  listUserSessions(userId: string, cookie?: string): Promise<readonly Session[]>;
  /** The signed-in user, or `null` when the session cookie is missing or expired. */
  me(cookie?: string): Promise<Me | null>;
  /** The library catalog for one document type. Rejects with `GatewayError` when signed out. */
  policies(documentType: DocumentType, cookie?: string): Promise<readonly Policy[]>;
  /** A read-only dry run of `deleteUser`. Site-admin only. */
  previewUserDeletion(userId: string, cookie?: string): Promise<UserDeletionPreview>;
  /** Revokes a GLOBAL role (no category). Site-admin only. */
  revokeRole(userId: string, role: string, cookie?: string): Promise<User>;
  /** Revokes every active session for a user. Returns how many were revoked. */
  revokeUserSessions(userId: string, reason: string, cookie?: string): Promise<number>;
  /** Edits the CALLING user's own name. Rejects with `GatewayError` when signed out. */
  updateMyProfile(input: UpdateMyProfileInput, cookie?: string): Promise<Me>;
  /** Edits another user's name and email. Local accounts only, site-admin only. */
  updateUserProfile(userId: string, name: string, email: string, cookie?: string): Promise<User>;
  /** The platform's users, site-admin only. */
  users(input: ListUsersInput, cookie?: string): Promise<UserPage>;
}

export interface ListUsersInput {
  includeDeleted?: boolean;
  search?: string;
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
