// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AccountMergePreview,
  AckExport,
  AckRoster,
  AckTrigger,
  AddOrganizationInput,
  AiHealth,
  AiJobResult,
  AiJobResultContent as AiJobResultContentSchema,
  AiJobStatus,
  Appendix,
  AssistOperation,
  AuditChainVerification,
  AuditQueryPage,
  AuthoringAssistResult,
  BreachDecision,
  CaseNote,
  CaseNotice,
  CaseOutcome,
  CaseQueue,
  CaseStatus,
  CompletionReport,
  ContactBlock,
  ContactBlockInput,
  CorrectiveActionInput,
  DefinitionEntry,
  DefinitionEntryInput,
  DeleteUserResult,
  Diagnostics,
  DomainVerification,
  EmailServiceConfigInput,
  EmailServiceConfigStatus,
  GlobalSettings,
  GlobalSettingsInput,
  GroupMapping,
  IssueCollabTokenInput,
  IssueCollabTokenPayload,
  KeyValueInput,
  LiveEvent,
  MergeAccountsResult,
  MfaFactor,
  NoticeRecipient,
  NoticeStatus,
  Organization,
  OverrideEffect,
  PendingTask,
  PlatformGroup,
  PolicyVersion,
  RaciDecision,
  RaciRule,
  RaciRuleInput,
  Reference,
  ReferenceInput,
  ReportCase,
  ReviewCadence,
  RiskAssessment,
  RiskFactorsInput,
  Sensitivity,
  Session,
  SignalType,
  SpCertificate,
  ThreadMessage,
  UpcomingApproval,
  UserDeletionPreview,
  WorkflowStatus,
} from "./generated/schema";
import type {
  AckStatus,
  AckSummary,
  AskAnswer,
  BreakGlassGrant,
  Category,
  Group,
  ImpersonationStatus,
  Me,
  Obligation,
  Policy,
  PolicyDetail,
  PolicySectionDiff,
  SecondFactor,
  Template,
  TemplateVersion,
  User,
  UserLabel,
  UserPage,
  VersionDocument,
  Workflow,
  WorkflowDef,
} from "./views";

import { DocumentType } from "./generated/schema";

export type {
  AccountMergePreview,
  AckExport,
  AckRoster,
  AckRosterEntry,
  AddOrganizationInput,
  AiHealth,
  AiJobResult,
  AiJobStatus,
  Appendix,
  AuditChainVerification,
  AuditQueryPage,
  AuditRecord,
  AuthoringAssistResult,
  CaseNote,
  CaseNotice,
  CaseQueue,
  CaseStatusCount,
  CaseSummary,
  CompletionReport,
  ContactBlock,
  ContactBlockInput,
  CorrectiveAction,
  CorrectiveActionInput,
  DefinitionEntry,
  DefinitionEntryInput,
  DeleteUserResult,
  Diagnostics,
  DomainVerification,
  EmailServiceConfigInput,
  EmailServiceConfigStatus,
  GlobalSettings,
  GlobalSettingsInput,
  GroupMapping,
  IssueCollabTokenInput,
  IssueCollabTokenPayload,
  KeyValueInput,
  LiveEvent,
  MergeAccountsResult,
  MergeCounts,
  MergePreviewItem,
  MergeStepResult,
  MergeWarning,
  MfaFactor,
  Organization,
  OverdueEntry,
  PendingTask,
  PlatformGroup,
  PolicyVersion,
  RaciDecision,
  RaciRule,
  RaciRuleInput,
  Reference,
  ReferenceInput,
  RelatedPolicy,
  ReportAttachment,
  ReportCase,
  ReportDetails,
  RiskAssessment,
  RiskFactors,
  RiskFactorsInput,
  Session,
  SpCertificate,
  StageAssignee,
  StageUnitProgress,
  ThreadMessage,
  UpcomingApproval,
  UserDeletionPreview,
  WorkflowStatus,
} from "./generated/schema";
export {
  AckTrigger,
  AiJobPhase,
  ApprovalStatus,
  AssistOperation,
  BreachDecision,
  CaseOutcome,
  CaseStatus,
  DocumentType,
  InformationKind,
  MergeItemKind,
  MergeStatus,
  MergeStepStatus,
  MessageAuthor,
  NoticeRecipient,
  NoticeStatus,
  OverrideEffect,
  RaciGrant,
  RaciSubjectKind,
  ReferenceKind,
  ReportAnswer,
  ReportKind,
  ReviewCadence,
  RiskMitigation,
  RiskRecipient,
  RiskSuggestion,
  RiskViewed,
  Sensitivity,
  SignalType,
} from "./generated/schema";
export type { UserLabel } from "./views";
export type {
  AckStatus,
  AckSummary,
  AskAnswer,
  BreakGlassGrant,
  Category,
  DocumentBlock,
  Group,
  HistoryEntry,
  ImpersonationStatus,
  InlineRun,
  Me,
  Obligation,
  Policy,
  PolicyAppendix,
  PolicyContact,
  PolicyDefinition,
  PolicyDetail,
  PolicyReference,
  PolicySectionDiff,
  PolicyVersionOption,
  PolicyVersionSummary,
  SecondFactor,
  Template,
  TemplateVersion,
  User,
  UserPage,
  VersionDocument,
  Workflow,
  WorkflowDef,
  WorkflowStageDef,
} from "./views";
export { PolicyStatus } from "./views";

/** `AiJobResultContent` is renamed on export only to avoid colliding with the `Edge` method of the same name. */
export type AIJobResultContent = AiJobResultContentSchema;

/** The AI module's settings as the admin Settings page reads them (A28). */
export interface AiSettings {
  credentialLast4: string;
  credentialSet: boolean;
  enabled: boolean;
  model: string;
  provider: null | string;
  topK: number;
}

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
  /** The draft version being edited. */
  versionId: string;
}

/** A boilerplate content block within a template section, as Lexical state (validated by core). */
export interface BlockInput {
  contentJson?: null | string;
  type: string;
}

/** A category-level approver override within a workflow stage: that category uses
 *  `approverIds` for this stage instead of the stage's default `approvers`. */
export interface CategoryApproversInput {
  approverIds: readonly string[];
  categoryId: string;
}

/** What the welcome page (G10) sends; accepting the terms is implied by sending it. */
export interface CompleteOnboardingInput {
  /** Only when the sign-in sent no email address; otherwise it stays the sign-in's. */
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
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
  /** The acknowledgement roster for a published policy version: who has acked and who is
   *  still pending, optionally scoped to one group's subtree. */
  ackRoster(policyVersionId: string, groupId?: null | string, cookie?: string): Promise<AckRoster>;
  /** Enables an organisation's SSO connection for sign-in. Site-admin only. */
  activateOrganization(domain: string, cookie?: string): Promise<Organization>;
  /** Adds an appendix to a policy version, for the editor. */
  addAppendix(
    policyVersionId: string,
    title: string,
    contentJson: string,
    cookie?: string,
  ): Promise<Appendix>;
  /** Adds an internal case note. Officers only; never shown to the reporter. */
  addCaseNote(caseId: string, body: string, cookie?: string): Promise<CaseNote>;
  /** Adds a notification-tracker entry; its deadline is set from the discovery date server-side. Officers only. */
  addCaseNotice(
    caseId: string,
    recipient: NoticeRecipient,
    label?: string,
    method?: string,
    cookie?: string,
  ): Promise<CaseNotice>;
  /** Adds an IdP-group-claim-to-platform-group mapping for a connection. Site-admin only. */
  addGroupMapping(
    connectionId: string,
    idpGroupClaimValue: string,
    targetGroupId: string,
    cookie?: string,
  ): Promise<GroupMapping>;
  /** Registers a new organisation SSO connection, unverified and disabled. Site-admin only. */
  addOrganization(input: AddOrganizationInput, cookie?: string): Promise<Organization>;
  /** Adds a MANUAL membership to a platform group. Authorized for site-admins and for a LOCAL
   *  group-manager of groupId; refuses an IdP-synced membership. */
  addUserToGroup(userId: string, groupId: string, cookie?: string): Promise<User>;
  /** The AI module's settings for the admin Settings page (A28): on or off, the model, whether
   *  a provider token is stored (never the token) and the retrieval count. Site-admin only. */
  aiConfig(cookie?: string): Promise<AiSettings>;
  /** Whether AI is usable right now for the calling user. Never rejects; see `AiHealth.reason`. */
  aiHealth(cookie?: string): Promise<AiHealth>;
  /** Polls an async AI job's status by id. */
  aiJob(jobId: string, cookie?: string): Promise<AiJobStatus>;
  /**
   * Waits for async AI job `jobId`'s single terminal push over the gateway's `aiJobResult`
   * subscription — resolved immediately if the job was already terminal when the
   * subscription opened. `signal` cancels the wait.
   */
  aiJobResult(jobId: string, cookie?: string, signal?: AbortSignal): Promise<AiJobResult>;
  /** Fetches a completed async AI job's content by `AIJobStatus.resultRef`. */
  aiJobResultContent(resultRef: string, cookie?: string): Promise<AIJobResultContent>;
  /** Archives a workflow definition. Site-admin only. */
  archiveWorkflowDef(id: string, cookie?: string): Promise<boolean>;
  /** Sets or clears (null) a case's assignee. Officers only. */
  assignCase(caseId: string, assigneeUserId: null | string, cookie?: string): Promise<ReportCase>;
  /** A page of audit records, newest first. Site-admin only. */
  auditLog(filters: AuditLogFilters, cookie?: string): Promise<AuditQueryPage>;
  /** The categories the calling author may create a policy under, for the new-draft picker. `createPolicy` also refuses the ones the caller can't author in, so this is a UI convenience, not the real gate. */
  authorableGroups(cookie?: string): Promise<readonly Group[]>;
  /** The templates selectable when creating a policy, optionally owned by one category. */
  authorableTemplates(ownerGroupId: null | string, cookie?: string): Promise<readonly Template[]>;
  /** One inline authoring suggestion for a section currently being edited. Never auto-applied. */
  authoringAssist(input: AuthoringAssistInput, cookie?: string): Promise<AuthoringAssistResult>;
  /** A site admin's time-boxed, audited reveal of a sensitive policy's real content. Rejects with `GatewayError` when signed out or refused. */
  breakGlassReveal(policyId: string, reason: string, cookie?: string): Promise<BreakGlassGrant>;
  /** The library's category tree. Rejects with `GatewayError` when signed out. */
  categories(cookie?: string): Promise<readonly Category[]>;
  /** One category's own ordered access rules (A5); its ancestors' rules are read the same way.
   *  Group managers and template admins. */
  categoryRuleset(categoryId: string, cookie?: string): Promise<readonly RaciRule[]>;
  /** Changes an organisation's IdP protocol. Resets both gates and disables the connection.
   *  An OIDC target takes its client secret write-only (`clientSecret`) or as a pre-created
   *  key (`secretRef`). Site-admin only. */
  changeOrgProtocol(
    domain: string,
    protocol: string,
    config?: readonly KeyValueInput[],
    secret?: OrgClientSecret,
    cookie?: string,
  ): Promise<Organization>;
  /** The outcome, corrective actions and the optional closing message to the reporter. A closed case takes no more changes. Officers only. */
  closeCase(
    caseId: string,
    outcome: CaseOutcome,
    correctiveActions?: readonly CorrectiveActionInput[],
    closingMessage?: string,
    cookie?: string,
  ): Promise<ReportCase>;
  /**
   * Finishes the CALLING person's first-run onboarding (G10): accepts the Terms of Service and
   * sets the profile fields they confirmed. The actor is the session's own cookie.
   */
  completeOnboarding(input: CompleteOnboardingInput, cookie?: string): Promise<Me>;
  /** Acknowledgement coverage for a published policy version, optionally scoped to one
   *  group's subtree. */
  completionReport(
    policyVersionId: string,
    groupId?: null | string,
    cookie?: string,
  ): Promise<CompletionReport>;
  /** The reusable contact-block library (admin), active only unless includeArchived. */
  contactBlocks(includeArchived?: boolean, cookie?: string): Promise<readonly ContactBlock[]>;
  /** Adds a reusable contact block to the library. */
  createContactBlock(block: ContactBlockInput, cookie?: string): Promise<ContactBlock>;
  /** Adds a reusable, category-scoped definition entry to the library. */
  createDefinition(input: DefinitionEntryInput, cookie?: string): Promise<DefinitionEntry>;
  /** Creates a taxonomy group. Site-admin only. */
  createGroup(input: CreateGroupInput, cookie?: string): Promise<Group>;
  /** Issues a read-only share link for one policy version (D31); a sensitive one asks the reader
   *  for an email first. The link's path is `/s/{token}`. */
  createMagicLink(
    policyVersionId: string,
    sensitive: boolean,
    cookie?: string,
  ): Promise<{ expiresAt: string; token: string }>;
  /** Creates an identity platform group under parentId (a root group when null): the
   *  groups memberships, group managers, SSO mappings and reporting's officer setting name by
   *  id, not a category. Site-admin only. */
  createPlatformGroup(
    name: string,
    parentId: null | string,
    cookie?: string,
  ): Promise<PlatformGroup>;
  /** Creates a new policy/procedure with an empty working draft. The owner is the calling user. */
  createPolicy(input: CreatePolicyInput, cookie?: string): Promise<Policy>;
  /** Adds a reusable reference/standard entry to the library. */
  createReference(input: ReferenceInput, cookie?: string): Promise<Reference>;
  /** Creates a template, selectable as a group's default once it has a published version. Site-admin only. */
  createTemplate(name: string, ownerCategoryId?: null | string, cookie?: string): Promise<Template>;
  /** Starts a new draft version of a template, carrying the given sections forward. Site-admin only. */
  createTemplateVersion(
    templateId: string,
    sections: readonly SectionInput[],
    cookie?: string,
  ): Promise<TemplateVersion>;
  /** Creates a workflow definition. Site-admin only. */
  createWorkflowDef(
    name: string,
    description: null | string,
    stages: readonly WorkflowStageInput[],
    cookie?: string,
  ): Promise<WorkflowDef>;
  /** The reusable, category-scoped definitions library (admin). A null categoryId lists every
   *  category's entries; active only unless includeArchived. */
  definitions(
    categoryId: null | string,
    includeArchived?: boolean,
    cookie?: string,
  ): Promise<readonly DefinitionEntry[]>;
  /** Deletes a library appendix. */
  deleteAppendix(id: string, cookie?: string): Promise<boolean>;
  /** Hard-deletes a definition entry. The gateway refuses while anything attaches it (archive
   *  instead). */
  deleteDefinition(id: string, cookie?: string): Promise<boolean>;
  /** Deletes a group and its policy-free descendants. Site-admin only. */
  deleteGroup(id: string, cookie?: string): Promise<boolean>;
  /** Removes a group mapping by id. Site-admin only. */
  deleteGroupMapping(mappingId: string, cookie?: string): Promise<boolean>;
  /** Removes an organisation's SSO connection. Irreversible. Site-admin only. */
  deleteOrganization(domain: string, cookie?: string): Promise<boolean>;
  /** Deletes a never-published policy (D4). Published policies can't be deleted. */
  deletePolicy(id: string, cookie?: string): Promise<boolean>;
  /** Hard-deletes a reference/standard entry. The gateway refuses while anything attaches it
   *  (archive instead). */
  deleteReference(id: string, cookie?: string): Promise<boolean>;
  /** Hard-deletes an unreferenced template and its versions. Dev-only, server-gated; fails if any
   *  policy references it (retire it instead). Site-admin only. */
  deleteTemplate(id: string, cookie?: string): Promise<boolean>;
  /** Soft-deletes a user. Rejects with `GatewayError` while the preview reports `blocksDelete`. */
  deleteUser(userId: string, cookie?: string): Promise<DeleteUserResult>;
  /** The gateway's own diagnostics read. Rejects with `GatewayError` when signed out. */
  diagnostics(cookie?: string): Promise<Diagnostics>;
  /** Disables an organisation's SSO connection. Does not clear its gates. Site-admin only. */
  disableOrganization(domain: string, cookie?: string): Promise<Organization>;
  disableUser(userId: string, cookie?: string): Promise<User>;
  /** Discards a policy's working draft, leaving any published version untouched. */
  discardDraft(policyId: string, cookie?: string): Promise<boolean>;
  /** Discards (deletes) a draft template version. Published versions can't be discarded. Site-admin only. */
  discardTemplateVersion(id: string, cookie?: string): Promise<boolean>;
  /** The working draft version of a policy's content, for the editor. Null when there is no draft. */
  draftVersion(policyId: string, cookie?: string): Promise<null | PolicyVersion>;
  /** The platform email transport's non-secret configuration and whether a sending key is
   *  stored; never the key itself. Site-admin only. */
  emailServiceConfig(cookie?: string): Promise<EmailServiceConfigStatus>;

  enableUser(userId: string, cookie?: string): Promise<User>;
  /** The acknowledgement roster for a policy version, as a downloadable export (CSV today;
   *  `format` is forwarded to the gateway as-is). */
  exportAcks(policyVersionId: string, format: string, cookie?: string): Promise<AckExport>;
  /** Reads an uploaded reference document (PDF, Word, RTF, Markdown or text) as plain text
   *  for AI drafting. Refused with the gateway's reason ("Unsupported file type: …"). */
  extractDocument(
    file: { name?: string } & Blob,
    cookie?: string,
  ): Promise<{ content: string; title: string }>;
  /** Fetches an IdP signing certificate by URL (SSRF-guarded) and returns it as PEM. Site-admin only. */
  fetchIdpCert(url: string, cookie?: string): Promise<string>;
  /** Mints a new SP signing certificate and activates it, superseding the previous one. Site-admin only. */
  forceRotateSpCertificate(cookie?: string): Promise<SpCertificate>;
  /** The cross-app announcement and maintenance banners. Readable by any signed-in user. */
  globalSettings(cookie?: string): Promise<GlobalSettings>;
  /** Grants a GLOBAL role (no category). Site-admin only. */
  grantRole(userId: string, role: string, cookie?: string): Promise<User>;
  /** Makes another user the root site-admin, demoting the current root (D22). Only the current
   *  root, with the emailed step-up code from `requestStepUpOtp`. */
  grantRoot(userId: string, otp: string, cookie?: string): Promise<User>;
  /** A group's direct children. A null parentId lists the root groups. Site-admin only. */
  groupChildren(parentId: null | string, cookie?: string): Promise<readonly Group[]>;
  /** An organisation's IdP-group-claim-to-platform-group mappings. Site-admin only. */
  groupMappings(connectionId: string, cookie?: string): Promise<readonly GroupMapping[]>;
  /** The caller's active "act as" session (H9), or null. Drives the acting-as banner. */
  impersonationStatus(cookie?: string): Promise<ImpersonationStatus>;
  /** Fetches a SAML IdP's metadata document by URL (SSRF-guarded) and extracts the fields
   *  needed to prefill a connection form. Site-admin only. */
  importIdpMetadata(url: string, cookie?: string): Promise<ImportedIdpMetadata>;
  /** Issues a short-lived websocket token for the co-editing session. Refused unless the caller holds edit access to the draft. */
  issueCollabToken(input: IssueCollabTokenInput, cookie?: string): Promise<IssueCollabTokenPayload>;
  /** A template's current (newest) version, with its section outline. Null for a template with no version yet. */
  latestTemplateVersion(templateId: string, cookie?: string): Promise<null | TemplateVersion>;
  /** A user's sessions, site-admin only. */
  listUserSessions(userId: string, cookie?: string): Promise<readonly Session[]>;
  /**
   * Hands every live event whose type starts with one of `topics` to `onEvent` until `signal`
   * aborts or the gateway ends the stream. Needs `audit.read`; a refusal rejects with the
   * gateway's code.
   */
  liveEvents(
    topics: readonly string[],
    cookie: string | undefined,
    onEvent: (event: LiveEvent) => void,
    signal: AbortSignal,
  ): Promise<void>;
  /** The DIRECT members of a platform group, for the group-manager "My groups" editor.
   *  Authorized for site-admins AND for a LOCAL group-manager of groupId (unlike the
   *  site-admin-only `users` query). Each `User` carries `memberships` so the caller can mark
   *  IdP-synced memberships read-only. */
  managedGroupMembers(groupId: string, cookie?: string): Promise<readonly User[]>;
  /** The signed-in user, or `null` when the session cookie is missing or expired. */
  me(cookie?: string): Promise<Me | null>;
  /**
   * Merges sourceUserId INTO targetUserId: owned policies re-pointed, RACI grants rewritten,
   * acknowledgments moved/deduped, workflow items reassigned, preferences moved, in one
   * auditable admin op. `confirmPrivileged` must be true when the preview's
   * `requiresPrivilegedConfirm` is set; `idempotencyKey` makes the call safe to retry.
   * Site-admin only.
   */
  mergeAccounts(
    sourceUserId: string,
    targetUserId: string,
    confirmPrivileged?: boolean,
    idempotencyKey?: string,
    cookie?: string,
  ): Promise<MergeAccountsResult>;
  /** Mints a scoped, time-bound Test-IdP link someone else can open to test a connection
   *  (e.g. a user at the organisation being onboarded, who the admin isn't a user of the
   *  IdP of). The result records back under the connection as the minting admin's test.
   *  Site-admin only. */
  mintSsoTestLink(input: MintSsoTestLinkInput, cookie?: string): Promise<MintedSsoTestLink>;
  /** Re-parents a group (and its subtree). A null newParentId promotes it to a root. */
  moveGroup(groupId: string, newParentId: null | string, cookie?: string): Promise<Group>;
  /** Moves a policy to another category, which renumbers it (D6). */
  movePolicy(
    policyId: string,
    homeCategoryId: string,
    cookie?: string,
  ): Promise<{ id: string; number: string }>;
  /** The caller's mandatory reads and how many are done (My work's compliance card). */
  myAckSummary(cookie?: string): Promise<AckSummary>;
  /** The CALLING user's own policies with a working draft. */
  myDraftPolicies(cookie?: string): Promise<readonly Policy[]>;
  /** The caller's enrolled second factors ("totp", "email", "passkey"). */
  myFactors(cookie?: string): Promise<readonly SecondFactor[]>;
  /** The platform groups the signed-in caller is a LOCAL group-manager of, sorted by name, for
   *  the "My groups" editor. Any signed-in caller; only their own grants are read. */
  myManagedGroups(cookie?: string): Promise<readonly PlatformGroup[]>;
  /** The published versions the caller still has to acknowledge (To acknowledge, U2). */
  myObligations(cookie?: string): Promise<readonly Obligation[]>;
  /** Every configured organisation SSO connection. Site-admin only. */
  organizations(cookie?: string): Promise<readonly Organization[]>;
  /** Parses a SAML IdP metadata XML document — e.g. a file downloaded from the IdP — into
   *  the same fields `importIdpMetadata` extracts. No network fetch, so no SSRF surface.
   *  Site-admin only. */
  parseIdpMetadata(metadata: string, cookie?: string): Promise<ImportedIdpMetadata>;
  /** The signed download link for a finished PDF export (D16). */
  pdfDownloadLink(
    jobId: string,
    cookie?: string,
  ): Promise<{ expiresAt: string; signedUrl: string }>;
  /** Pending approval tasks awaiting the calling user. The approver id is bound server-side. */
  pendingTasks(cookie?: string): Promise<readonly PendingTask[]>;
  /** The identity platform groups directly under parentId (the roots when null). Site-admin
   *  only. */
  platformGroups(parentId: null | string, cookie?: string): Promise<readonly PlatformGroup[]>;
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
  /** Posts a message the reporter can see in the two-way thread. Officers only. */
  postCaseMessage(caseId: string, body: string, cookie?: string): Promise<ThreadMessage>;
  /**
   * A read-only, side-effect-free projection of what merging sourceUserId INTO targetUserId
   * would move/dedupe, plus any warnings and whether the merge requires a privileged
   * confirmation. Surfaced before `mergeAccounts` so the operation can be reviewed. Site-admin
   * only.
   */
  previewAccountMerge(
    sourceUserId: string,
    targetUserId: string,
    cookie?: string,
  ): Promise<AccountMergePreview>;
  /** A read-only dry run of `deleteUser`. Site-admin only. */
  previewUserDeletion(userId: string, cookie?: string): Promise<UserDeletionPreview>;
  /** Cuts the working draft as a new published version. Refused unless the caller holds edit access and every required section has content. */
  publishDraft(policyId: string, cookie?: string): Promise<PolicyVersion>;
  /** Publishes a draft template version; it becomes the template's active version for new policies. Site-admin only. */
  publishTemplateVersion(id: string, cookie?: string): Promise<TemplateVersion>;
  /** Moves every policy a user owns, and their author grants, to another user (D20). */
  reassignUserPolicies(
    fromUserId: string,
    toUserId: string,
    cookie?: string,
  ): Promise<{ reassignedAuthorGrants: number; reassignedOwnerCount: number }>;
  /** Records the guided risk assessment and its reportable/not-reportable decision. Officers only. */
  recordRiskAssessment(
    caseId: string,
    factors: RiskFactorsInput,
    decision: BreachDecision,
    reason: string,
    cookie?: string,
  ): Promise<RiskAssessment>;
  /** The reusable references/standards library (admin), active only unless includeArchived. */
  references(includeArchived?: boolean, cookie?: string): Promise<readonly Reference[]>;
  /** Removes a MANUAL membership from a platform group. Authorized for site-admins and for a
   *  LOCAL group-manager of groupId; refuses an IdP-synced membership (it is read-only here). */
  removeUserFromGroup(userId: string, groupId: string, cookie?: string): Promise<User>;
  /** Resets (removes) one of a user's second factors so they set it up again. Site-admin only. */
  removeUserMfaFactor(userId: string, methodId: string, cookie?: string): Promise<boolean>;
  /** Renames a group (name and slug). Site-admin only. */
  renameGroup(id: string, name: string, slug: string, cookie?: string): Promise<Group>;
  /** Renames a template. Template-level, non-versioned: does not create a new template version. Site-admin only. */
  renameTemplate(id: string, name: string, cookie?: string): Promise<Template>;
  /** Relabels one of a user's second factors; an empty label goes back to the default. */
  renameUserMfaFactor(
    userId: string,
    methodId: string,
    label: string,
    cookie?: string,
  ): Promise<boolean>;
  /** Reorders a policy version's appendices. */
  reorderAppendices(
    policyVersionId: string,
    orderedIds: readonly string[],
    cookie?: string,
  ): Promise<readonly Appendix[]>;
  /** One case's full detail. Officers only. */
  reportCase(caseId: string, cookie?: string): Promise<ReportCase>;
  /** The case queue, optionally filtered by status and/or assignee. Officers only. */
  reportCases(
    statuses?: readonly CaseStatus[],
    assigneeUserId?: string,
    cookie?: string,
  ): Promise<CaseQueue>;
  /** Starts rendering a policy version to PDF (D16); poll `pdfDownloadLink` with the job id. */
  requestPdfExport(policyVersionId: string, cookie?: string): Promise<{ jobId: string }>;
  /** Emails the signed-in admin a step-up code (D18) for a high-risk action. */
  requestStepUpOtp(cookie?: string): Promise<boolean>;
  /** Sends a user's welcome (onboarding) email again. Site-admin only. */
  resendWelcomeEmail(userId: string, cookie?: string): Promise<boolean>;
  /** Sets a local account's password to `newPassword`. Site-admin only. */
  resetUserPassword(userId: string, newPassword: string, cookie?: string): Promise<boolean>;
  /** Display names (and emails) for user ids, with no directory permission needed. */
  resolveUserLabels(ids: readonly string[], cookie?: string): Promise<readonly UserLabel[]>;
  /** Retires a policy: hidden from the catalog, outstanding acknowledgements cancelled (D10). */
  retirePolicy(id: string, cookie?: string): Promise<{ id: string }>;
  /** Retires (soft-deletes) a template: hidden from listings and pickers, but its versions keep
   *  working for policies that already pinned them. Site-admin only. */
  retireTemplate(id: string, cookie?: string): Promise<Template>;
  /** Revokes a magic link: anyone holding its URL can no longer reach the policy (D31). */
  revokeMagicLink(token: string, cookie?: string): Promise<boolean>;
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
  /** Ask (U6): a grounded answer from the policies the caller can read, with its citations. The
   *  read scope is the gateway's own. Fails while AI is unavailable (see `aiHealth`). */
  searchAndAnswer(question: string, cookie?: string): Promise<AskAnswer>;
  /** A lightweight typeahead: any authenticated caller, id+name(+email) pairs for users whose
   *  email contains `query`. Never enumerates the full directory. */
  searchUsers(query: string, limit?: number, cookie?: string): Promise<readonly UserLabel[]>;
  /** Turns AI features on or off for everyone (A28). Site-admin only. */
  setAiEnabled(enabled: boolean, cookie?: string): Promise<boolean>;
  /** Stores the AI provider's token, write-only; an empty value clears it (A28). */
  setAiProviderCredential(
    credential: string,
    cookie?: string,
  ): Promise<{ credentialLast4: string; credentialSet: boolean }>;
  /** Sets how many results AI retrieves per question (top-k); 0 goes back to the default. */
  setAiRetrievalConfig(topK: number, cookie?: string): Promise<number>;
  /** Sets the discovery date every notification deadline counts from. Officers only. */
  setCaseDiscoveryDate(caseId: string, discoveredOn: string, cookie?: string): Promise<ReportCase>;
  /** Any status but CLOSED; closing goes through `closeCase`. Officers only. */
  setCaseStatus(caseId: string, status: CaseStatus, cookie?: string): Promise<ReportCase>;
  /** Replaces a category's own ordered access rules (A5). Group managers only. */
  setCategoryRuleset(
    categoryId: string,
    rules: readonly RaciRuleInput[],
    cookie?: string,
  ): Promise<readonly RaciRule[]>;
  /** Archive (true) or restore (false) a contact-block library entry. */
  setContactBlockArchived(id: string, archived: boolean, cookie?: string): Promise<ContactBlock>;
  /** Archive (true) or restore (false) a definitions-library entry. */
  setDefinitionArchived(id: string, archived: boolean, cookie?: string): Promise<DefinitionEntry>;
  /** Stores the platform email transport's sending key (write-only) and its non-secret
   *  configuration. Site-admin only. */
  setEmailServiceConfig(
    input: EmailServiceConfigInput,
    cookie?: string,
  ): Promise<EmailServiceConfigStatus>;
  /** Sets the cross-app announcement and maintenance banners. Site-admin only. */
  setGlobalSettings(input: GlobalSettingsInput, cookie?: string): Promise<GlobalSettings>;
  /** Makes another user a policy's author (D5). Site-admin only. */
  setPolicyOwner(policyId: string, ownerUserId: string, cookie?: string): Promise<{ id: string }>;
  /** Archive (true) or restore (false) a references-library entry. */
  setReferenceArchived(id: string, archived: boolean, cookie?: string): Promise<Reference>;
  /** Sets (ALLOW or DENY) or clears (null) one per-policy exception for a user (A19). */
  setUserPolicyOverride(
    userId: string,
    policyNumber: string,
    effect: null | OverrideEffect,
    cookie?: string,
  ): Promise<User>;
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
  /**
   * What one person (or, with an empty `userId`, everyone as a baseline) may do in a category,
   * and why, with `draftRules` standing in for the category's own unsaved rules (the A5
   * simulator). Group managers and template admins.
   */
  simulateCategory(
    categoryId: string,
    userId: string,
    draftRules: null | readonly RaciRuleInput[],
    cookie?: string,
  ): Promise<RaciDecision>;
  /** The platform's active SP signing certificate. Site-admin only. */
  spCertificate(cookie?: string): Promise<SpCertificate>;
  /** Mints a DNS TXT domain-verification challenge. rotate revokes the prior verified proof. Site-admin only. */
  startDomainVerification(
    domain: string,
    rotate?: boolean,
    cookie?: string,
  ): Promise<DomainVerification>;
  /** Starts acting as a user for up to 30 minutes, with a reason (D19). Site-admin only. */
  startImpersonation(
    userId: string,
    reason: string,
    cookie?: string,
  ): Promise<{ expiresAt: string; targetName: string; targetUserId: string }>;
  /** Stops the caller's "act as" session. */
  stopImpersonation(cookie?: string): Promise<boolean>;
  /** Submit whole-draft generation as an async job; poll `aiJob(jobId)` for the result. */
  submitDraftGeneration(
    input: SubmitDraftGenerationInput,
    cookie?: string,
  ): Promise<{ jobId: string }>;
  /** Submit review & gap-analysis of an existing draft as an async job; the result is a findings list, never an edit applied to the policy. */
  submitPolicyReview(input: SubmitPolicyReviewInput, cookie?: string): Promise<{ jobId: string }>;
  /** Submit a targeted revision of the whole draft as an async job; the result is a change
   *  set for the author to review, never applied by itself. */
  submitPolicyRevision(
    input: SubmitPolicyRevisionInput,
    cookie?: string,
  ): Promise<{ jobId: string }>;
  /**
   * Sends a policy's working draft for review: starts the approval run of the workflow
   * attached to (or inherited by) the policy's category. The submitter is bound server-side,
   * and the gateway walks the category lineage itself from `categoryId`. Refused with
   * `GatewayError` when no workflow applies, a stage has no approver, or the caller isn't an
   * author of the policy.
   */
  submitWorkflow(
    policyVersionId: string,
    policyId: string,
    categoryId: string,
    cookie?: string,
  ): Promise<{ runId: string }>;
  /** The templates selectable as a group's default. Site-admin only. */
  templates(cookie?: string): Promise<readonly Template[]>;
  /** All of a template's versions, newest first, drafts included. Site-admin only. */
  templateVersions(templateId: string, cookie?: string): Promise<readonly TemplateVersion[]>;
  /**
   * Approvals where the calling user is an approver on a future (not-yet-reached) stage —
   * visibility/heads-up, not yet actionable. The approver id is bound server-side.
   */
  /** Ask's "Try asking": the questions asked most, most-frequent first (default 6). Empty
   *  when AI is unavailable. */
  topPolicyQuestions(limit?: number, cookie?: string): Promise<readonly string[]>;
  upcomingApprovals(cookie?: string): Promise<readonly UpcomingApproval[]>;
  /** Edits a library appendix. */
  updateAppendix(
    id: string,
    title: string,
    contentJson: string,
    cookie?: string,
  ): Promise<Appendix>;
  /** Updates a notification-tracker entry's status; sentOn (YYYY-MM-DD) is required with SENT. Officers only. */
  updateCaseNotice(
    caseId: string,
    noticeId: string,
    status: NoticeStatus,
    sentOn?: string,
    cookie?: string,
  ): Promise<CaseNotice>;
  /** Edits a reusable contact-block library entry. */
  updateContactBlock(id: string, block: ContactBlockInput, cookie?: string): Promise<ContactBlock>;
  /** Edits a reusable, category-scoped definitions-library entry. The category is immutable. */
  updateDefinition(
    id: string,
    input: DefinitionEntryInput,
    cookie?: string,
  ): Promise<DefinitionEntry>;
  /** Sets a group's inherited defaults and governance. Site-admin only. */
  updateGroupSettings(input: UpdateGroupSettingsInput, cookie?: string): Promise<Group>;
  /** Updates an organisation's per-connection login toggles, or replaces an OIDC connection's
   *  client secret (write-only `clientSecret`, or a pre-created `secretRef`). Site-admin only. */
  updateIdPConnection(
    domain: string,
    toggles: { allowLocal?: boolean; jitEnabled?: boolean } & OrgClientSecret,
    cookie?: string,
  ): Promise<Organization>;
  /** Edits the CALLING user's own name. Rejects with `GatewayError` when signed out. */
  updateMyProfile(input: UpdateMyProfileInput, cookie?: string): Promise<Me>;
  /** Edits a reusable references/standards library entry. */
  updateReference(id: string, input: ReferenceInput, cookie?: string): Promise<Reference>;
  /** Saves a draft template version's section outline (the authoring "Save"). Published versions
   *  are immutable. Site-admin only. */
  updateTemplateVersionSections(
    id: string,
    sections: readonly SectionInput[],
    cookie?: string,
  ): Promise<TemplateVersion>;
  /** Edits another user's name and email. Local accounts only, site-admin only. */
  updateUserProfile(userId: string, name: string, email: string, cookie?: string): Promise<User>;
  /** Replaces a workflow definition's name, description and stages. Site-admin only. */
  updateWorkflowDef(
    id: string,
    name: string,
    description: null | string,
    stages: readonly WorkflowStageInput[],
    cookie?: string,
  ): Promise<WorkflowDef>;
  /** A user's second factors, for the admin Security tab (A18). Site-admin only. */
  userFactors(userId: string, cookie?: string): Promise<readonly MfaFactor[]>;
  /** The platform's users, site-admin only. */
  users(input: ListUsersInput, cookie?: string): Promise<UserPage>;
  /** Checks that a reference URL for AI drafting can be read (SSRF-guarded at the gateway). */
  validateReferenceUrl(url: string, cookie?: string): Promise<ReferenceUrlCheck>;
  /** Recomputes the hash chain across a record range and reports whether it still holds. Site-admin only. */
  verifyAuditChain(
    fromRecordId: string,
    toRecordId: string,
    cookie?: string,
  ): Promise<AuditChainVerification>;
  /** Checks the domain's DNS TXT record against its verification token. Site-admin only. */
  verifyDomain(domain: string, cookie?: string): Promise<Organization>;
  /** The word-level diff between any two versions of one document (U19), section by section. */
  versionDiff(
    fromVersionId: string,
    toVersionId: string,
    cookie?: string,
  ): Promise<readonly PolicySectionDiff[]>;
  /** One version's body and appendices as the reader draws them, for the review page's
   *  "Upcoming version" (U25). Null when the caller can't read it. */
  versionDocument(versionId: string, cookie?: string): Promise<null | VersionDocument>;
  /** One workflow definition's full detail (its approval stages), for admin management. Null
   *  when it doesn't exist (or was archived). Site-admin only. */
  workflowDef(id: string, cookie?: string): Promise<null | WorkflowDef>;
  /** Every workflow definition's full detail, for the admin directory. Site-admin only. */
  workflowDefs(cookie?: string): Promise<readonly WorkflowDef[]>;
  /** The workflows selectable as a group's default. Site-admin only. */
  workflows(cookie?: string): Promise<readonly Workflow[]>;
  /**
   * Status of the approval saga for a policy version. Resolves to an unspecified status when
   * the workflow service has no record (the policy was published without an approval flow).
   */
  workflowStatus(policyVersionId: string, cookie?: string): Promise<WorkflowStatus>;
}

/** A group that approves a workflow stage as a whole: its members hold seats, the group is
 *  satisfied once `internalQuorum` of them approve, and it counts as one vote in the stage's
 *  own quorum. */
export interface GroupUnitInput {
  groupId: string;
  internalQuorum: string;
  memberUserIds: readonly string[];
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

/** An OIDC client secret for an organisation: the secret itself, write-only (never stored by
 *  the gateway or identity's database, never returned), or the name of a key an operator
 *  created in identity's Polis secrets Secret. Send one or the other. */
export interface OrgClientSecret {
  clientSecret?: string;
  secretRef?: string;
}

/** `POST /documents/validate-url`: whether a reference URL can be read. */
export interface ReferenceUrlCheck {
  finalUrl?: string;
  readable: boolean;
  reason?: string;
  title?: string;
}

/** One section of a template version's outline: `key` is the stable identifier the authoring
 *  side matches a document's headings against; `level` is the heading depth (H1-H5), `order`
 *  its position, and `blocks` its boilerplate content (optional, empty when the section has
 *  none). */
export interface SectionInput {
  blocks: readonly BlockInput[];
  key: string;
  level?: number;
  order: number;
  required?: boolean;
  title: string;
}

export interface SubmitDraftGenerationInput {
  brief: string;
  homeGroupId?: null | string;
  /** Uploaded reference documents, as text (`extractDocument`). */
  referenceDocuments?: readonly { content: string; title: string }[];
  /** Reference URLs and titles of policies to model on. */
  referenceHints?: readonly string[];
  sections: readonly { key: string; order: number; title: string }[];
  title?: null | string;
}

export interface SubmitPolicyReviewInput {
  policyId: string;
  sections: readonly { content: string; key: string; title: string }[];
  /** The draft version under review. */
  versionId: string;
}

export interface SubmitPolicyRevisionInput {
  /** The change, in the author's own words. */
  instruction: string;
  policyId: string;
  /** Every section's current content, in order, so the model sees the whole policy. */
  sections: readonly { content: string; key: string; order: number; title: string }[];
  versionId: string;
}

export interface UpdateGroupSettingsInput {
  /** Unset leaves it unchanged; set carries a new explicit value (there is no way to go back
   *  to "inherited" through this input — the gateway has no separate unset operation for it). */
  ackEveryone?: boolean;
  ackTriggers?: AckTrigger;
  defaultTemplateId?: null | string;
  defaultTemplateNone?: boolean;
  defaultWorkflowId?: null | string;
  /** Unset leaves it unchanged; null or an array both carry an explicit override (null means
   *  "no exclusions", not "inherit" — there is no way to go back to inherited here either). */
  exclusionGroupIds?: null | readonly string[];
  id: string;
  idpGroupIds?: null | readonly string[];
  owners?: readonly string[];
  reviewCadence?: ReviewCadence;
  reviewDate?: null | string;
}

/**
 * The network edge every loader and action calls through `@steward-web/edge.server`, which
 * `@steward-web/vite-config` aliases to `edge/live.server.ts` here. Mock data comes from
 * steward-mock-server, reached through `GATEWAY_URL` like any gateway.
 */
export interface UpdateMyProfileInput {
  firstName: string;
  lastName: string;
}

/** One stage of a workflow definition's approval chain. `approversByCategory` and
 *  `groupUnits` are advanced per-category/group-vote overrides this port doesn't build an
 *  editor for; a caller that isn't changing them should resend the stage's current values
 *  unchanged rather than drop them. */
export interface WorkflowStageInput {
  approvers: readonly string[];
  approversByCategory?: readonly CategoryApproversInput[];
  groupUnits?: readonly GroupUnitInput[];
  id?: string;
  name: string;
  /** Nullable (not just optional) so a `WorkflowStageDef` read straight off the gateway can be
   *  resent unchanged as input — the query side allows null, this carries that through. */
  pinnedLast?: boolean | null;
  quorum: string;
  rejectOnSlaBreach?: boolean | null;
  slaDays?: null | number;
}
