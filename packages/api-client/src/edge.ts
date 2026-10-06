// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AckStatus,
  BreakGlassGrant,
  Category,
  DeleteUserResult,
  Diagnostics,
  Me,
  Policy,
  PolicyDetail,
  Session,
  User,
  UserDeletionPreview,
  UserPage,
} from "./generated/schema";

import { DocumentType } from "./generated/schema";

export type {
  AckStatus,
  BreakGlassGrant,
  Category,
  DeleteUserResult,
  Diagnostics,
  HistoryEntry,
  Me,
  Policy,
  PolicyAppendix,
  PolicyContact,
  PolicyDefinition,
  PolicyDetail,
  PolicyReference,
  PolicySectionDiff,
  PolicyVersionSummary,
  RelatedPolicy,
  Session,
  User,
  UserDeletionPreview,
  UserPage,
} from "./generated/schema";
export { DocumentType, PolicyStatus, ReferenceKind, Sensitivity } from "./generated/schema";

export interface Edge {
  /** Records the CALLING user's acknowledgement of a published policy version. Rejects with `GatewayError` when signed out or not in the ack audience. */
  acknowledgePolicy(policyVersionId: string, cookie?: string): Promise<AckStatus>;
  /** A site admin's time-boxed, audited reveal of a sensitive policy's real content. Rejects with `GatewayError` when signed out or refused. */
  breakGlassReveal(policyId: string, reason: string, cookie?: string): Promise<BreakGlassGrant>;
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
  /** The reader's full detail for one policy/procedure, by number. Null when there is no such document, or the caller can't see it. Rejects with `GatewayError` when signed out. */
  policyDetail(
    documentType: DocumentType,
    number: string,
    cookie?: string,
  ): Promise<null | PolicyDetail>;
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
