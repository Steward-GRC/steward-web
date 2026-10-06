// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AckStatus,
  AddOrganizationInput,
  BreakGlassGrant,
  Category,
  DeleteUserResult,
  Diagnostics,
  DomainVerification,
  Group,
  GroupMapping,
  KeyValueInput,
  Me,
  Organization,
  Policy,
  PolicyDetail,
  ReviewCadence,
  Session,
  SpCertificate,
  Template,
  User,
  UserDeletionPreview,
  UserPage,
  Workflow,
} from "./generated/schema";

import { DocumentType } from "./generated/schema";

export type {
  AckStatus,
  AddOrganizationInput,
  BreakGlassGrant,
  Category,
  DeleteUserResult,
  Diagnostics,
  DomainVerification,
  Group,
  GroupMapping,
  HistoryEntry,
  KeyValueInput,
  Me,
  Organization,
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
  SpCertificate,
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
  /** Enables an organisation's SSO connection for sign-in. Site-admin only. */
  activateOrganization(domain: string, cookie?: string): Promise<Organization>;
  /** Adds an IdP-group-claim-to-platform-group mapping for a connection. Site-admin only. */
  addGroupMapping(
    connectionId: string,
    idpGroupClaimValue: string,
    targetGroupId: string,
    cookie?: string,
  ): Promise<GroupMapping>;
  /** Registers a new organisation SSO connection, unverified and disabled. Site-admin only. */
  addOrganization(input: AddOrganizationInput, cookie?: string): Promise<Organization>;
  /** A site admin's time-boxed, audited reveal of a sensitive policy's real content. Rejects with `GatewayError` when signed out or refused. */
  breakGlassReveal(policyId: string, reason: string, cookie?: string): Promise<BreakGlassGrant>;
  /** The library's category tree. Rejects with `GatewayError` when signed out. */
  categories(cookie?: string): Promise<readonly Category[]>;
  /** Changes an organisation's IdP protocol. Resets both gates and disables the connection. Site-admin only. */
  changeOrgProtocol(
    domain: string,
    protocol: string,
    config?: readonly KeyValueInput[],
    secretRef?: string,
    cookie?: string,
  ): Promise<Organization>;
  /** Creates a taxonomy group. Site-admin only. */
  createGroup(input: CreateGroupInput, cookie?: string): Promise<Group>;
  /** Deletes a group and its policy-free descendants. Site-admin only. */
  deleteGroup(id: string, cookie?: string): Promise<boolean>;
  /** Removes a group mapping by id. Site-admin only. */
  deleteGroupMapping(mappingId: string, cookie?: string): Promise<boolean>;
  /** Removes an organisation's SSO connection. Irreversible. Site-admin only. */
  deleteOrganization(domain: string, cookie?: string): Promise<boolean>;
  /** Soft-deletes a user. Rejects with `GatewayError` while the preview reports `blocksDelete`. */
  deleteUser(userId: string, cookie?: string): Promise<DeleteUserResult>;
  /** The gateway's own diagnostics read. Rejects with `GatewayError` when signed out. */
  diagnostics(cookie?: string): Promise<Diagnostics>;
  /** Disables an organisation's SSO connection. Does not clear its gates. Site-admin only. */
  disableOrganization(domain: string, cookie?: string): Promise<Organization>;
  disableUser(userId: string, cookie?: string): Promise<User>;

  enableUser(userId: string, cookie?: string): Promise<User>;
  /** Mints a new SP signing certificate and activates it, superseding the previous one. Site-admin only. */
  forceRotateSpCertificate(cookie?: string): Promise<SpCertificate>;
  /** Grants a GLOBAL role (no category). Site-admin only. */
  grantRole(userId: string, role: string, cookie?: string): Promise<User>;
  /** A group's direct children. A null parentId lists the root groups. Site-admin only. */
  groupChildren(parentId: null | string, cookie?: string): Promise<readonly Group[]>;
  /** An organisation's IdP-group-claim-to-platform-group mappings. Site-admin only. */
  groupMappings(connectionId: string, cookie?: string): Promise<readonly GroupMapping[]>;
  /** A user's sessions, site-admin only. */
  listUserSessions(userId: string, cookie?: string): Promise<readonly Session[]>;
  /** The signed-in user, or `null` when the session cookie is missing or expired. */
  me(cookie?: string): Promise<Me | null>;
  /** Re-parents a group (and its subtree). A null newParentId promotes it to a root. */
  moveGroup(groupId: string, newParentId: null | string, cookie?: string): Promise<Group>;
  /** Every configured organisation SSO connection. Site-admin only. */
  organizations(cookie?: string): Promise<readonly Organization[]>;
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
  /** The platform's active SP signing certificate. Site-admin only. */
  spCertificate(cookie?: string): Promise<SpCertificate>;
  /** Mints a DNS TXT domain-verification challenge. rotate revokes the prior verified proof. Site-admin only. */
  startDomainVerification(
    domain: string,
    rotate?: boolean,
    cookie?: string,
  ): Promise<DomainVerification>;
  /** The templates selectable as a group's default. Site-admin only. */
  templates(cookie?: string): Promise<readonly Template[]>;
  /** Sets a group's inherited defaults and governance. Site-admin only. */
  updateGroupSettings(input: UpdateGroupSettingsInput, cookie?: string): Promise<Group>;
  /** Updates an organisation's per-connection login toggles. Site-admin only. */
  updateIdPConnection(
    domain: string,
    toggles: { allowLocal?: boolean; jitEnabled?: boolean },
    cookie?: string,
  ): Promise<Organization>;
  /** Edits the CALLING user's own name. Rejects with `GatewayError` when signed out. */
  updateMyProfile(input: UpdateMyProfileInput, cookie?: string): Promise<Me>;
  /** Edits another user's name and email. Local accounts only, site-admin only. */
  updateUserProfile(userId: string, name: string, email: string, cookie?: string): Promise<User>;
  /** The platform's users, site-admin only. */
  users(input: ListUsersInput, cookie?: string): Promise<UserPage>;
  /** Checks the domain's DNS TXT record against its verification token. Site-admin only. */
  verifyDomain(domain: string, cookie?: string): Promise<Organization>;
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
