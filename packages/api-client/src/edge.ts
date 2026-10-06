// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AckStatus,
  BreakGlassGrant,
  Category,
  DeleteUserResult,
  Diagnostics,
  Group,
  Me,
  Policy,
  PolicyDetail,
  ReviewCadence,
  Session,
  Template,
  User,
  UserDeletionPreview,
  UserPage,
  Workflow,
} from "./generated/schema";

import { DocumentType } from "./generated/schema";

export type {
  AckStatus,
  BreakGlassGrant,
  Category,
  DeleteUserResult,
  Diagnostics,
  Group,
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
  Template,
  User,
  UserDeletionPreview,
  UserPage,
  Workflow,
} from "./generated/schema";
export {
  DocumentType,
  PolicyStatus,
  ReferenceKind,
  ReviewCadence,
  Sensitivity,
} from "./generated/schema";

export interface CreateGroupInput {
  name: string;
  parentId: null | string;
  slug: string;
}

export interface Edge {
  /** Records the CALLING user's acknowledgement of a published policy version. Rejects with `GatewayError` when signed out or not in the ack audience. */
  acknowledgePolicy(policyVersionId: string, cookie?: string): Promise<AckStatus>;
  /** A site admin's time-boxed, audited reveal of a sensitive policy's real content. Rejects with `GatewayError` when signed out or refused. */
  breakGlassReveal(policyId: string, reason: string, cookie?: string): Promise<BreakGlassGrant>;
  /** The library's category tree. Rejects with `GatewayError` when signed out. */
  categories(cookie?: string): Promise<readonly Category[]>;
  /** Creates a taxonomy group. Site-admin only. */
  createGroup(input: CreateGroupInput, cookie?: string): Promise<Group>;
  /** Deletes a group and its policy-free descendants. Site-admin only. */
  deleteGroup(id: string, cookie?: string): Promise<boolean>;
  /** Soft-deletes a user. Rejects with `GatewayError` while the preview reports `blocksDelete`. */
  deleteUser(userId: string, cookie?: string): Promise<DeleteUserResult>;
  /** The gateway's own diagnostics read. Rejects with `GatewayError` when signed out. */
  diagnostics(cookie?: string): Promise<Diagnostics>;
  disableUser(userId: string, cookie?: string): Promise<User>;

  enableUser(userId: string, cookie?: string): Promise<User>;
  /** Grants a GLOBAL role (no category). Site-admin only. */
  grantRole(userId: string, role: string, cookie?: string): Promise<User>;
  /** A group's direct children. A null parentId lists the root groups. Site-admin only. */
  groupChildren(parentId: null | string, cookie?: string): Promise<readonly Group[]>;
  /** A user's sessions, site-admin only. */
  listUserSessions(userId: string, cookie?: string): Promise<readonly Session[]>;
  /** The signed-in user, or `null` when the session cookie is missing or expired. */
  me(cookie?: string): Promise<Me | null>;
  /** Re-parents a group (and its subtree). A null newParentId promotes it to a root. */
  moveGroup(groupId: string, newParentId: null | string, cookie?: string): Promise<Group>;
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
  /** Renames a group (name and slug). Site-admin only. */
  renameGroup(id: string, name: string, slug: string, cookie?: string): Promise<Group>;
  /** Revokes a GLOBAL role (no category). Site-admin only. */
  revokeRole(userId: string, role: string, cookie?: string): Promise<User>;
  /** Revokes every active session for a user. Returns how many were revoked. */
  revokeUserSessions(userId: string, reason: string, cookie?: string): Promise<number>;
  /** The templates selectable as a group's default. Site-admin only. */
  templates(cookie?: string): Promise<readonly Template[]>;
  /** Sets a group's inherited defaults and governance. Site-admin only. */
  updateGroupSettings(input: UpdateGroupSettingsInput, cookie?: string): Promise<Group>;
  /** Edits the CALLING user's own name. Rejects with `GatewayError` when signed out. */
  updateMyProfile(input: UpdateMyProfileInput, cookie?: string): Promise<Me>;
  /** Edits another user's name and email. Local accounts only, site-admin only. */
  updateUserProfile(userId: string, name: string, email: string, cookie?: string): Promise<User>;
  /** The platform's users, site-admin only. */
  users(input: ListUsersInput, cookie?: string): Promise<UserPage>;
  /** The workflows selectable as a group's default. Site-admin only. */
  workflows(cookie?: string): Promise<readonly Workflow[]>;
}

export interface ListUsersInput {
  includeDeleted?: boolean;
  search?: string;
}

export interface UpdateGroupSettingsInput {
  defaultTemplateId?: null | string;
  defaultTemplateNone?: boolean;
  defaultWorkflowId?: null | string;
  id: string;
  owners?: readonly string[];
  reviewCadence?: ReviewCadence;
  reviewDate?: null | string;
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
