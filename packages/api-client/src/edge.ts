// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AckStatus,
  AddOrganizationInput,
  AiHealth,
  AiJobResultContent as AiJobResultContentSchema,
  AiJobStatus,
  Appendix,
  AssistOperation,
  AuditChainVerification,
  AuditQueryPage,
  AuthoringAssistResult,
  BreakGlassGrant,
  Category,
  DeleteUserResult,
  Diagnostics,
  DomainVerification,
  Group,
  GroupMapping,
  IssueCollabTokenInput,
  IssueCollabTokenPayload,
  KeyValueInput,
  Me,
  Organization,
  PendingTask,
  Policy,
  PolicyDetail,
  PolicyVersion,
  ReviewCadence,
  Sensitivity,
  Session,
  SignalType,
  SpCertificate,
  Template,
  TemplateVersion,
  UpcomingApproval,
  User,
  UserDeletionPreview,
  UserPage,
  Workflow,
  WorkflowStatus,
} from "./generated/schema";

import { DocumentType } from "./generated/schema";

export type {
  AckStatus,
  AddOrganizationInput,
  AiHealth,
  AiJobStatus,
  Appendix,
  AuditChainVerification,
  AuditQueryPage,
  AuditRecord,
  AuthoringAssistResult,
  BreakGlassGrant,
  Category,
  DeleteUserResult,
  Diagnostics,
  DomainVerification,
  Group,
  GroupMapping,
  HistoryEntry,
  IssueCollabTokenInput,
  IssueCollabTokenPayload,
  KeyValueInput,
  Me,
  Organization,
  PendingTask,
  Policy,
  PolicyAppendix,
  PolicyContact,
  PolicyDefinition,
  PolicyDetail,
  PolicyReference,
  PolicySectionDiff,
  PolicyVersion,
  PolicyVersionSummary,
  RelatedPolicy,
  Session,
  SpCertificate,
  StageAssignee,
  StageUnitProgress,
  Template,
  TemplateVersion,
  UpcomingApproval,
  User,
  UserDeletionPreview,
  UserPage,
  Workflow,
  WorkflowStatus,
} from "./generated/schema";
export {
  AiJobPhase,
  ApprovalStatus,
  AssistOperation,
  DocumentType,
  PolicyStatus,
  ReferenceKind,
  ReviewCadence,
  Sensitivity,
  SignalType,
} from "./generated/schema";

/** `AiJobResultContent` is renamed on export only to avoid colliding with the `Edge` method of the same name. */
export type AIJobResultContent = AiJobResultContentSchema;

export interface AuditLogFilters {
  actorUserId?: string;
  groupId?: string;
  pageSize?: number;
  pageToken?: string;
  subject?: string;
  tier?: string;
}

export interface AuthoringAssistInput {
  editableContent: string;
  instruction?: null | string;
  operation: AssistOperation;
  policyId: string;
  sectionKey: string;
}

export interface CreateGroupInput {
  name: string;
  parentId: null | string;
  slug: string;
}

export interface CreatePolicyInput {
  documentType?: DocumentType;
  homeGroupId: string;
  sensitivity: Sensitivity;
  templateId?: null | string;
  title: string;
}

export interface Edge {
  /** Records the CALLING user's acknowledgement of a published policy version. Rejects with `GatewayError` when signed out or not in the ack audience. */
  acknowledgePolicy(policyVersionId: string, cookie?: string): Promise<AckStatus>;
  /** Enables an organisation's SSO connection for sign-in. Site-admin only. */
  activateOrganization(domain: string, cookie?: string): Promise<Organization>;
  /** Adds an appendix to a policy version, for the editor. */
  addAppendix(
    policyVersionId: string,
    title: string,
    contentJson: string,
    cookie?: string,
  ): Promise<Appendix>;
  /** Adds an IdP-group-claim-to-platform-group mapping for a connection. Site-admin only. */
  addGroupMapping(
    connectionId: string,
    idpGroupClaimValue: string,
    targetGroupId: string,
    cookie?: string,
  ): Promise<GroupMapping>;
  /** Registers a new organisation SSO connection, unverified and disabled. Site-admin only. */
  addOrganization(input: AddOrganizationInput, cookie?: string): Promise<Organization>;
  /** Whether AI is usable right now for the calling user. Never rejects; see `AiHealth.reason`. */
  aiHealth(cookie?: string): Promise<AiHealth>;
  /** Polls an async AI job's status by id. */
  aiJob(jobId: string, cookie?: string): Promise<AiJobStatus>;
  /** Fetches a completed async AI job's content by `AIJobStatus.resultRef`. */
  aiJobResultContent(resultRef: string, cookie?: string): Promise<AIJobResultContent>;
  /** A page of audit records, newest first. Site-admin only. */
  auditLog(filters: AuditLogFilters, cookie?: string): Promise<AuditQueryPage>;
  /** The groups any signed-in author may create a policy under (not site-admin-gated). */
  authorableGroups(cookie?: string): Promise<readonly Group[]>;
  /** The templates selectable when creating a policy (not site-admin-gated). */
  authorableTemplates(ownerGroupId: null | string, cookie?: string): Promise<readonly Template[]>;
  /** One inline authoring suggestion for a section currently being edited. Never auto-applied. */
  authoringAssist(input: AuthoringAssistInput, cookie?: string): Promise<AuthoringAssistResult>;
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
  /** Creates a new policy/procedure with an empty working draft. The owner is the calling user. */
  createPolicy(input: CreatePolicyInput, cookie?: string): Promise<Policy>;
  /** Deletes a library appendix. */
  deleteAppendix(id: string, cookie?: string): Promise<boolean>;
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
  /** Discards a policy's working draft, leaving any published version untouched. */
  discardDraft(policyId: string, cookie?: string): Promise<boolean>;
  /** The working draft version of a policy's content, for the editor. Null when there is no draft. */
  draftVersion(policyId: string, cookie?: string): Promise<null | PolicyVersion>;

  enableUser(userId: string, cookie?: string): Promise<User>;
  /** Fetches an IdP signing certificate by URL (SSRF-guarded) and returns it as PEM. Site-admin only. */
  fetchIdpCert(url: string, cookie?: string): Promise<string>;
  /** Mints a new SP signing certificate and activates it, superseding the previous one. Site-admin only. */
  forceRotateSpCertificate(cookie?: string): Promise<SpCertificate>;
  /** Grants a GLOBAL role (no category). Site-admin only. */
  grantRole(userId: string, role: string, cookie?: string): Promise<User>;
  /** A group's direct children. A null parentId lists the root groups. Site-admin only. */
  groupChildren(parentId: null | string, cookie?: string): Promise<readonly Group[]>;
  /** An organisation's IdP-group-claim-to-platform-group mappings. Site-admin only. */
  groupMappings(connectionId: string, cookie?: string): Promise<readonly GroupMapping[]>;
  /** Fetches a SAML IdP's metadata document by URL (SSRF-guarded) and extracts the fields
   *  needed to prefill a connection form. Site-admin only. */
  importIdpMetadata(url: string, cookie?: string): Promise<ImportedIdpMetadata>;
  /** Issues a short-lived websocket token for the co-editing session. Refused unless the caller holds edit access to the draft. */
  issueCollabToken(input: IssueCollabTokenInput, cookie?: string): Promise<IssueCollabTokenPayload>;
  /** A template's current (newest) version, with its section outline. Null for a template with no version yet. */
  latestTemplateVersion(templateId: string, cookie?: string): Promise<null | TemplateVersion>;
  /** A user's sessions, site-admin only. */
  listUserSessions(userId: string, cookie?: string): Promise<readonly Session[]>;
  /** The signed-in user, or `null` when the session cookie is missing or expired. */
  me(cookie?: string): Promise<Me | null>;
  /** Mints a scoped, time-bound Test-IdP link someone else can open to test a connection
   *  (e.g. a user at the organisation being onboarded, who the admin isn't a user of the
   *  IdP of). The result records back under the connection as the minting admin's test.
   *  Site-admin only. */
  mintSsoTestLink(input: MintSsoTestLinkInput, cookie?: string): Promise<MintedSsoTestLink>;
  /** Re-parents a group (and its subtree). A null newParentId promotes it to a root. */
  moveGroup(groupId: string, newParentId: null | string, cookie?: string): Promise<Group>;
  /** The CALLING user's own policies with a working draft, most-recently-updated first. */
  myDraftPolicies(cookie?: string): Promise<readonly Policy[]>;
  /** Every configured organisation SSO connection. Site-admin only. */
  organizations(cookie?: string): Promise<readonly Organization[]>;
  /** Parses a SAML IdP metadata XML document — e.g. a file downloaded from the IdP — into
   *  the same fields `importIdpMetadata` extracts. No network fetch, so no SSRF surface.
   *  Site-admin only. */
  parseIdpMetadata(metadata: string, cookie?: string): Promise<ImportedIdpMetadata>;
  /** Pending approval tasks awaiting the calling user. The approver id is bound server-side. */
  pendingTasks(cookie?: string): Promise<readonly PendingTask[]>;
  /** The library catalog for one document type. Rejects with `GatewayError` when signed out. */
  policies(documentType: DocumentType, cookie?: string): Promise<readonly Policy[]>;
  /** One policy by backend id, for the editor. Null when it doesn't exist or the caller can't see it. */
  policy(id: string, cookie?: string): Promise<null | Policy>;
  /** The reader's full detail for one policy/procedure, by number. Null when there is no such document, or the caller can't see it. Rejects with `GatewayError` when signed out. */
  policyDetail(
    documentType: DocumentType,
    number: string,
    cookie?: string,
  ): Promise<null | PolicyDetail>;
  /** A read-only dry run of `deleteUser`. Site-admin only. */
  previewUserDeletion(userId: string, cookie?: string): Promise<UserDeletionPreview>;
  /** Cuts the working draft as a new published version. Refused unless the caller holds edit access and every required section has content. */
  publishDraft(policyId: string, cookie?: string): Promise<PolicyVersion>;
  /** Renames a group (name and slug). Site-admin only. */
  renameGroup(id: string, name: string, slug: string, cookie?: string): Promise<Group>;
  /** Reorders a policy version's appendices. */
  reorderAppendices(
    policyVersionId: string,
    orderedIds: readonly string[],
    cookie?: string,
  ): Promise<readonly Appendix[]>;
  /** Revokes a GLOBAL role (no category). Site-admin only. */
  revokeRole(userId: string, role: string, cookie?: string): Promise<User>;
  /** Revokes every active session for a user. Returns how many were revoked. */
  revokeUserSessions(userId: string, reason: string, cookie?: string): Promise<number>;
  /** Saves the author's edits to a policy's working draft. */
  saveDraft(
    policyId: string,
    contentJson: string,
    templateVersionId: null | string,
    cookie?: string,
  ): Promise<PolicyVersion>;
  /**
   * Delivers the calling user's approve/reject decision to an active approval run. The actor
   * is bound server-side; runId/taskId are advisory (a stale cached inbox row refuses with
   * `GatewayError`, never a raw not-found).
   */
  signalWorkflow(
    policyVersionId: string,
    runId: string,
    taskId: string,
    signal: SignalType,
    comment: string,
    cookie?: string,
  ): Promise<boolean>;
  /** The platform's active SP signing certificate. Site-admin only. */
  spCertificate(cookie?: string): Promise<SpCertificate>;
  /** Mints a DNS TXT domain-verification challenge. rotate revokes the prior verified proof. Site-admin only. */
  startDomainVerification(
    domain: string,
    rotate?: boolean,
    cookie?: string,
  ): Promise<DomainVerification>;
  /** Submit whole-draft generation as an async job; poll `aiJob(jobId)` for the result. */
  submitDraftGeneration(
    input: SubmitDraftGenerationInput,
    cookie?: string,
  ): Promise<{ jobId: string }>;
  /** Submit review & gap-analysis of an existing draft as an async job; the result is a findings list, never an edit applied to the policy. */
  submitPolicyReview(input: SubmitPolicyReviewInput, cookie?: string): Promise<{ jobId: string }>;
  /** The templates selectable as a group's default. Site-admin only. */
  templates(cookie?: string): Promise<readonly Template[]>;
  /**
   * Approvals where the calling user is an approver on a future (not-yet-reached) stage —
   * visibility/heads-up, not yet actionable. The approver id is bound server-side.
   */
  upcomingApprovals(cookie?: string): Promise<readonly UpcomingApproval[]>;
  /** Edits a library appendix. */
  updateAppendix(
    id: string,
    title: string,
    contentJson: string,
    cookie?: string,
  ): Promise<Appendix>;
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
  /** Recomputes the hash chain across a record range and reports whether it still holds. Site-admin only. */
  verifyAuditChain(
    fromRecordId: string,
    toRecordId: string,
    cookie?: string,
  ): Promise<AuditChainVerification>;
  /** Checks the domain's DNS TXT record against its verification token. Site-admin only. */
  verifyDomain(domain: string, cookie?: string): Promise<Organization>;
  /** The workflows selectable as a group's default. Site-admin only. */
  workflows(cookie?: string): Promise<readonly Workflow[]>;
  /**
   * Status of the approval saga for a policy version. Resolves to an unspecified status when
   * the workflow service has no record (the policy was published without an approval flow).
   */
  workflowStatus(policyVersionId: string, cookie?: string): Promise<WorkflowStatus>;
}

/** The fields a SAML IdP's metadata (fetched by URL or parsed from an uploaded file)
 *  prefills the connection form with. */
export interface ImportedIdpMetadata {
  displayName: string;
  entityId: string;
  signingCertificate: string;
  ssoUrl: string;
}

export interface ListUsersInput {
  includeDeleted?: boolean;
  search?: string;
}

/** A minted, single-use Test-IdP link: `url` is the absolute, gateway-origin address to
 *  open (in a popup or a full-tab redirect); `expiresAt` is an RFC3339 timestamp. */
export interface MintedSsoTestLink {
  expiresAt: string;
  url: string;
}

/** Input to mint a scoped, time-bound Test-IdP link: `alias` and `connectionId` key the
 *  connection being tested; `tenant` is the org's domain (SSOStart needs it to resolve the
 *  broker tenant when there's no signed-in user's email to derive it from); `returnPath`
 *  is where a full-tab fallback (no `window.opener`) redirects once the test completes. */
export interface MintSsoTestLinkInput {
  alias: string;
  connectionId: string;
  returnPath?: string;
  tenant?: string;
}

export interface SubmitDraftGenerationInput {
  brief: string;
  homeGroupId?: null | string;
  sections: readonly { key: string; order: number; title: string }[];
  title?: null | string;
}

export interface SubmitPolicyReviewInput {
  policyId: string;
  sections: readonly { content: string; key: string; title: string }[];
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
