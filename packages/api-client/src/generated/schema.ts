export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /**
   * Vendored slice of the gateway schema. Steward's own gateway is not ported yet, so this
   * file is hand-pinned from the original gateway's v3.0.0 SDL (see ../schema-refs.env),
   * trimmed to the operations steward-web actually sends: the signed-in user, the
   * diagnostics report, editing one's own display name, the policy/procedure library browse
   * (categories and the catalog), the admin user directory, the admin group directory, the
   * admin organisation/SSO directory, the staff authoring area (the editor and its AI
   * drafting/review assist) and the admin audit log. It
   * gains more of the upstream schema as later ports add operations, and schema-generate.sh
   * switches from this vendored copy to a live fetch once steward-gateway publishes its own
   * schema on its main branch.
   *
   * Identity-provider-specific wording in the original schema's descriptions is dropped (Steward
   * signs in through Ory Kratos); nothing else about the shape of these operations has changed.
   *
   * `Category` and the `Policy` fields below are the library's own aggregated view, not a
   * 1:1 lift of the original `Group`/`Policy`/`PolicyVersion` split: the original computed a
   * policy's display category, status and version by walking its home group's ancestor chain
   * and its version history. steward-gateway is pinned to return that same aggregated shape
   * once it ports the query; `Sensitivity` and `DocumentType` are the original enums unchanged.
   *
   * `PolicyDetail` is the reader's own aggregated view, for the same reason: steward-gateway's
   * real schema answers a policy's content, appendices, related/reference/contact/definition
   * attachments, acknowledgement state and history through several separate reads (`policy`,
   * `policyVersion`, `relatedPolicies`, `policyReferences`, `policyContactBlocks`,
   * `policyDefinitionEntries`, `ackStatus`, `assignmentHistory`, `workflowStatus`) keyed by
   * backend id, with no "find by number" lookup yet. `policyDetail` is this port's own
   * BFF-shaped aggregation (found by the number the library already links to), pending a
   * steward-gateway query that does the same. Document body and appendix content are plain
   * text here, not the original's rich Lexical JSON: no shared document renderer exists yet
   * (it lands with the authoring/editor area), so the reader shows a plain-text rendering
   * until one does.
   */
  DateTime: { input: string; output: string };
};

/** Best-effort: never errors on a downstream failure, so AI affordances can disable themselves without taking an unrelated flow down with them. */
export type AiHealth = {
  readonly __typename?: "AIHealth";
  readonly available: Scalars["Boolean"]["output"];
  readonly reason?: Maybe<Scalars["String"]["output"]>;
};

/** Returned by both async AI job submissions below; simplified from the original's two identically-shaped result types into one. */
export type AiJobHandle = {
  readonly __typename?: "AIJobHandle";
  readonly jobId: Scalars["ID"]["output"];
};

export enum AiJobPhase {
  AiJobPhaseFailed = "AI_JOB_PHASE_FAILED",
  AiJobPhasePending = "AI_JOB_PHASE_PENDING",
  AiJobPhaseRunning = "AI_JOB_PHASE_RUNNING",
  AiJobPhaseSucceeded = "AI_JOB_PHASE_SUCCEEDED",
}

export type AiJobResultContent = {
  readonly __typename?: "AIJobResultContent";
  readonly operation: Scalars["String"]["output"];
  readonly resultJson: Scalars["String"]["output"];
};

/** Poll aiJob(jobId) until phase reaches a terminal value; once SUCCEEDED, fetch the content by resultRef via aiJobResultContent. */
export type AiJobStatus = {
  readonly __typename?: "AIJobStatus";
  readonly error?: Maybe<Scalars["String"]["output"]>;
  readonly jobId: Scalars["ID"]["output"];
  readonly phase: AiJobPhase;
  readonly resultRef?: Maybe<Scalars["String"]["output"]>;
};

/** This caller's acknowledgement of one policy version. */
export type AckStatus = {
  readonly __typename?: "AckStatus";
  readonly ackedAt?: Maybe<Scalars["DateTime"]["output"]>;
  readonly acknowledged: Scalars["Boolean"]["output"];
  /** True when this caller is in the ack audience at all; false means no banner is shown. */
  readonly required: Scalars["Boolean"]["output"];
};

/** A new organisation SSO connection. secretRef names the stored client secret (OIDC). */
export type AddOrganizationInput = {
  readonly config?: InputMaybe<ReadonlyArray<KeyValueInput>>;
  readonly displayName?: InputMaybe<Scalars["String"]["input"]>;
  readonly domain: Scalars["String"]["input"];
  readonly orgName: Scalars["String"]["input"];
  readonly protocol: Scalars["String"]["input"];
  readonly secretRef?: InputMaybe<Scalars["String"]["input"]>;
};

export type Appendix = {
  readonly __typename?: "Appendix";
  readonly contentJson: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly letter: Scalars["String"]["output"];
  readonly orderIndex: Scalars["Int"]["output"];
  readonly policyVersionId: Scalars["ID"]["output"];
  readonly title: Scalars["String"]["output"];
};

export enum AssistOperation {
  AssistOperationClarify = "ASSIST_OPERATION_CLARIFY",
  AssistOperationDraft = "ASSIST_OPERATION_DRAFT",
  AssistOperationExpand = "ASSIST_OPERATION_EXPAND",
  AssistOperationRewrite = "ASSIST_OPERATION_REWRITE",
  AssistOperationSummarize = "ASSIST_OPERATION_SUMMARIZE",
  AssistOperationUnspecified = "ASSIST_OPERATION_UNSPECIFIED",
}

/**
 * The result of recomputing a hash-chain segment. valid is false the moment one record's
 * recordHash fails to match the hash of its own fields plus the prior record's recordHash.
 */
export type AuditChainVerification = {
  readonly __typename?: "AuditChainVerification";
  readonly errors: ReadonlyArray<Scalars["String"]["output"]>;
  readonly recordsChecked: Scalars["Int"]["output"];
  readonly valid: Scalars["Boolean"]["output"];
};

export type AuditQueryPage = {
  readonly __typename?: "AuditQueryPage";
  readonly nextPageToken: Scalars["String"]["output"];
  readonly records: ReadonlyArray<AuditRecord>;
};

/** One tamper-evident audit record: the hash chain links recordHash to the prior record's own. */
export type AuditRecord = {
  readonly __typename?: "AuditRecord";
  readonly action: Scalars["String"]["output"];
  /**
   * Human-readable labels resolved server-side at read time from the actor/group/subject ids
   * above, so the UI never has to fan out its own lookups. Null on a resolution miss, in which
   * case the caller falls back to the raw id.
   */
  readonly actorName?: Maybe<Scalars["String"]["output"]>;
  readonly actorUserId: Scalars["ID"]["output"];
  readonly groupId: Scalars["ID"]["output"];
  readonly groupName?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["String"]["output"];
  readonly legalBasisExempt: Scalars["Boolean"]["output"];
  /** ISO-8601. */
  readonly occurredAt: Scalars["String"]["output"];
  readonly prevHash: Scalars["String"]["output"];
  readonly recordHash: Scalars["String"]["output"];
  readonly recordUuid: Scalars["ID"]["output"];
  readonly subject: Scalars["String"]["output"];
  readonly subjectLabel?: Maybe<Scalars["String"]["output"]>;
  readonly tier: Scalars["String"]["output"];
};

export type AuthoringAssistInput = {
  readonly editableContent: Scalars["String"]["input"];
  readonly instruction?: InputMaybe<Scalars["String"]["input"]>;
  readonly operation: AssistOperation;
  readonly policyId: Scalars["ID"]["input"];
  readonly sectionKey: Scalars["String"]["input"];
};

export type AuthoringAssistResult = {
  readonly __typename?: "AuthoringAssistResult";
  readonly operationId: Scalars["String"]["output"];
  readonly suggestion: Scalars["String"]["output"];
};

export type BreakGlassGrant = {
  readonly __typename?: "BreakGlassGrant";
  readonly grantedUntil: Scalars["DateTime"]["output"];
};

/** A category (and its subcategories) in the policy/procedure taxonomy. */
export type Category = {
  readonly __typename?: "Category";
  readonly id: Scalars["ID"]["output"];
  readonly name: Scalars["String"]["output"];
  readonly slug: Scalars["String"]["output"];
  readonly subcategories: ReadonlyArray<Scalars["String"]["output"]>;
};

export enum ComponentStatus {
  Ok = "OK",
  Unavailable = "UNAVAILABLE",
}

export type ComponentVersion = {
  readonly __typename?: "ComponentVersion";
  readonly commit?: Maybe<Scalars["String"]["output"]>;
  readonly name: Scalars["String"]["output"];
  readonly status: ComponentStatus;
  /** "unavailable" or "unknown" when it can't be read. */
  readonly version: Scalars["String"]["output"];
};

/** Result of deleteUser: the deleted user's id and how many active sessions were revoked. */
export type DeleteUserResult = {
  readonly __typename?: "DeleteUserResult";
  readonly revokedSessions: Scalars["Int"]["output"];
  readonly userId: Scalars["ID"]["output"];
};

/**
 * What a deletion preview line represents. A delete has no target account, so nothing moves:
 * each kind is blocked, orphaned or removed.
 */
export enum DeletionItemKind {
  AccessRow = "ACCESS_ROW",
  Credential = "CREDENTIAL",
  OwnedPolicy = "OWNED_POLICY",
  PendingApproval = "PENDING_APPROVAL",
  RaciGrant = "RACI_GRANT",
}

export type Diagnostics = {
  readonly __typename?: "Diagnostics";
  readonly actor: DiagnosticsActor;
  /** The appliance version, read from an optional mount. Null when not on the appliance. */
  readonly appliance?: Maybe<Scalars["String"]["output"]>;
  readonly gateway: ComponentVersion;
  readonly generatedAt: Scalars["DateTime"]["output"];
  /** The pinned release version. Null when unknown. */
  readonly release?: Maybe<Scalars["String"]["output"]>;
  readonly services: ReadonlyArray<ComponentVersion>;
  readonly thirdParty: ReadonlyArray<ComponentVersion>;
  /** This read's own trace id. */
  readonly traceId: Scalars["String"]["output"];
};

export type DiagnosticsActingAs = {
  readonly __typename?: "DiagnosticsActingAs";
  readonly id: Scalars["ID"]["output"];
  readonly roles: ReadonlyArray<Scalars["String"]["output"]>;
  readonly username: Scalars["String"]["output"];
};

export type DiagnosticsActor = {
  readonly __typename?: "DiagnosticsActor";
  /** Set during act-as: the user the real admin is acting as. */
  readonly actingAs?: Maybe<DiagnosticsActingAs>;
  readonly id: Scalars["ID"]["output"];
  readonly roles: ReadonlyArray<Scalars["String"]["output"]>;
  readonly username: Scalars["String"]["output"];
};

/** Policy vs procedure (core#26 in the original). Procedures carry no acknowledgement. */
export enum DocumentType {
  Policy = "POLICY",
  Procedure = "PROCEDURE",
}

/** DNS TXT domain-verification challenge. Publish dnsRecordValue at dnsRecordName, then verify. */
export type DomainVerification = {
  readonly __typename?: "DomainVerification";
  readonly dnsRecordName: Scalars["String"]["output"];
  readonly dnsRecordValue: Scalars["String"]["output"];
  readonly instructions: Scalars["String"]["output"];
  readonly token: Scalars["String"]["output"];
};

/** A taxonomy group: the policy/procedure library's org hierarchy. */
export type Group = {
  readonly __typename?: "Group";
  /**
   * Template tri-state: defaultTemplateNone=true means explicit none (freeform); a set
   * defaultTemplateId means that template; both unset means inherit from the ancestor chain.
   */
  readonly defaultTemplateId?: Maybe<Scalars["ID"]["output"]>;
  readonly defaultTemplateNone: Scalars["Boolean"]["output"];
  /** Never inherited: null means no default workflow (publish without approval). */
  readonly defaultWorkflowId?: Maybe<Scalars["ID"]["output"]>;
  readonly id: Scalars["ID"]["output"];
  readonly name: Scalars["String"]["output"];
  /** Reviews this group's policies on reviewCadence. Inherited by sub-groups below a department. */
  readonly owners: ReadonlyArray<Scalars["ID"]["output"]>;
  /** Null for a root (top-level) group. */
  readonly parentId?: Maybe<Scalars["ID"]["output"]>;
  readonly reviewCadence: ReviewCadence;
  /** Set only when reviewCadence is ON_DATE. */
  readonly reviewDate?: Maybe<Scalars["String"]["output"]>;
  readonly slug: Scalars["String"]["output"];
};

/**
 * Maps one asserted IdP group-claim value to a platform group by id. The target is a group
 * id, not a name, so JIT provisioning never grants the wrong same-named group.
 */
export type GroupMapping = {
  readonly __typename?: "GroupMapping";
  readonly connectionId: Scalars["ID"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly idpGroupClaimValue: Scalars["String"]["output"];
  readonly targetGroupId: Scalars["ID"]["output"];
};

/** One append-only event in a policy's combined publish-and-approval history (U18): submitted, a stage decision, published, changes requested, or withdrawn. */
export type HistoryEntry = {
  readonly __typename?: "HistoryEntry";
  readonly actorName?: Maybe<Scalars["String"]["output"]>;
  readonly at: Scalars["DateTime"]["output"];
  readonly comment?: Maybe<Scalars["String"]["output"]>;
  readonly kind: Scalars["String"]["output"];
  readonly stage?: Maybe<Scalars["String"]["output"]>;
  readonly versionLabel: Scalars["String"]["output"];
};

export type IssueCollabTokenInput = {
  readonly draftId: Scalars["ID"]["input"];
  readonly policyId: Scalars["ID"]["input"];
  /** The draft's pinned template version; null for a freeform draft. */
  readonly templateVersionId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type IssueCollabTokenPayload = {
  readonly __typename?: "IssueCollabTokenPayload";
  /** ISO-8601; the client reconnects (issuing a fresh token) once past this instant. */
  readonly expiresAt: Scalars["String"]["output"];
  readonly token: Scalars["String"]["output"];
  readonly wsUrl: Scalars["String"]["output"];
};

/** One IdP connection config entry (e.g. SAML entityId/ssoUrl/signingCertificate, or OIDC issuer/clientId). */
export type KeyValueInput = {
  readonly key: Scalars["String"]["input"];
  readonly value: Scalars["String"]["input"];
};

/** The facts about the signed-in user that drive identity and permission checks. */
export type Me = {
  readonly __typename?: "Me";
  readonly email: Scalars["String"]["output"];
  /** Structured given name; empty when the identity provider sent none and the user hasn't set it. */
  readonly firstName: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  /** Structured family name; empty when the identity provider sent none and the user hasn't set it. */
  readonly lastName: Scalars["String"]["output"];
  readonly name: Scalars["String"]["output"];
  readonly permissions: ReadonlyArray<Scalars["String"]["output"]>;
  readonly roles: ReadonlyArray<Scalars["String"]["output"]>;
  readonly username: Scalars["String"]["output"];
};

export type Mutation = {
  readonly __typename?: "Mutation";
  /** Records the CALLING user's acknowledgement of a published policy version. Refused when the caller isn't in the ack audience, or the version isn't published. */
  readonly acknowledgePolicy: AckStatus;
  /** Enables an organisation's SSO connection for sign-in. Site-admin only. */
  readonly activateOrganization: Organization;
  readonly addAppendix: Appendix;
  /** Adds an IdP-group-claim-to-platform-group mapping for a connection. Site-admin only. */
  readonly addGroupMapping: GroupMapping;
  /**
   * Registers a new organisation SSO connection: unverified, untested and disabled until the
   * domain is verified and the IdP connection passes its test. Site-admin only.
   */
  readonly addOrganization: Organization;
  /** A site admin's time-boxed, audited reveal of a sensitive policy's real content. A non-empty reason is required; the grant is recorded for audit. */
  readonly breakGlassReveal: BreakGlassGrant;
  /**
   * Changes an organisation's IdP protocol (SAML <-> OIDC). DESTRUCTIVE: it resets the
   * connection to the start, clearing both gates and disabling it, so the domain must be
   * re-verified and re-tested before re-activation. Site-admin only.
   */
  readonly changeOrgProtocol: Organization;
  /** Creates a taxonomy group. Site-admin only. */
  readonly createGroup: Group;
  /** Creates a new policy/procedure with an empty working draft. The owner is the calling user. */
  readonly createPolicy: Policy;
  readonly deleteAppendix: Scalars["Boolean"]["output"];
  /**
   * Deletes a group and its policy-free descendants. Refused when the group or any descendant
   * owns policies. Site-admin only.
   */
  readonly deleteGroup: Scalars["Boolean"]["output"];
  /** Removes a group mapping by id. Site-admin only. */
  readonly deleteGroupMapping: Scalars["Boolean"]["output"];
  /** Removes an organisation's SSO connection. Irreversible. Site-admin only. */
  readonly deleteOrganization: Scalars["Boolean"]["output"];
  /**
   * Soft-deletes a user: revokes their sessions and drops their access. Never deletes a policy
   * they own; deleteUser is refused while previewUserDeletion reports blocksDelete. Site-admin
   * only.
   */
  readonly deleteUser: DeleteUserResult;
  /** Disables an organisation's SSO connection. Does not clear its gates. Site-admin only. */
  readonly disableOrganization: Organization;
  readonly disableUser: User;
  /** Discards a policy's working draft, leaving any already-published version untouched. */
  readonly discardDraft: Scalars["Boolean"]["output"];
  readonly enableUser: User;
  /**
   * Mints a new SP signing certificate and activates it immediately, superseding the previous
   * one. Site-admin only.
   */
  readonly forceRotateSpCertificate: SpCertificate;
  /** Grants a GLOBAL role (no category). Site-admin only. */
  readonly grantRole: User;
  /**
   * Issues a short-lived websocket token for the co-editing session. The caller must already
   * hold edit access to the draft; refused otherwise.
   */
  readonly issueCollabToken: IssueCollabTokenPayload;
  /**
   * Re-parents a group (and its whole descendant subtree). A null newParentId promotes it to a
   * root. Refused when the move would exceed the max depth or create a cycle. Site-admin only.
   */
  readonly moveGroup: Group;
  /** Cuts the working draft as a new published version. Refused unless the caller holds edit access and every required section has content. */
  readonly publishDraft: PolicyVersion;
  /** Renames a group (name and slug). Does not renumber existing policies. Site-admin only. */
  readonly renameGroup: Group;
  readonly reorderAppendices: ReadonlyArray<Appendix>;
  /** Revokes a GLOBAL role (no category). Site-admin only. */
  readonly revokeRole: User;
  /** Revokes every active session for a user, signing them out everywhere. Site-admin only. */
  readonly revokeUserSessions: Scalars["Int"]["output"];
  /** Saves the author's edits to the policy's working draft. templateVersionId pins the template version the content was scaffolded from; null for a freeform draft. */
  readonly saveDraft: PolicyVersion;
  /**
   * Mints a DNS TXT domain-verification challenge. The token is stable by default; rotate:
   * true mints a fresh one, which also revokes the domain's prior verified proof. Site-admin
   * only.
   */
  readonly startDomainVerification: DomainVerification;
  /** Submit whole-draft generation as an async job; poll aiJob(jobId) for the result. */
  readonly submitDraftGeneration: AiJobHandle;
  /** Submit review & gap-analysis of an existing draft as an async job; the result is a findings list, never an edit applied to the policy. */
  readonly submitPolicyReview: AiJobHandle;
  readonly updateAppendix: Appendix;
  /**
   * Sets a group's inherited defaults (template, workflow) and governance (owners, review
   * cadence). Site-admin only.
   */
  readonly updateGroupSettings: Group;
  /**
   * Updates an organisation's per-connection login toggles. Each argument is optional; omit
   * one to leave it unchanged. Site-admin only.
   */
  readonly updateIdPConnection: Organization;
  /** Edits the CALLING user's own name. Refused when signed out. */
  readonly updateMyProfile: Me;
  /** Edits another user's name and email. Local (non-federated) accounts only, site-admin only. */
  readonly updateUserProfile: User;
  /** Checks the domain's DNS TXT record against its verification token. Site-admin only. */
  readonly verifyDomain: Organization;
};

export type MutationAcknowledgePolicyArgs = {
  policyVersionId: Scalars["ID"]["input"];
};

export type MutationActivateOrganizationArgs = {
  domain: Scalars["String"]["input"];
};

export type MutationAddAppendixArgs = {
  contentJson: Scalars["String"]["input"];
  policyVersionId: Scalars["ID"]["input"];
  title: Scalars["String"]["input"];
};

export type MutationAddGroupMappingArgs = {
  connectionId: Scalars["ID"]["input"];
  idpGroupClaimValue: Scalars["String"]["input"];
  targetGroupId: Scalars["ID"]["input"];
};

export type MutationAddOrganizationArgs = {
  input: AddOrganizationInput;
};

export type MutationBreakGlassRevealArgs = {
  policyId: Scalars["ID"]["input"];
  reason: Scalars["String"]["input"];
};

export type MutationChangeOrgProtocolArgs = {
  config?: InputMaybe<ReadonlyArray<KeyValueInput>>;
  domain: Scalars["String"]["input"];
  protocol: Scalars["String"]["input"];
  secretRef?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationCreateGroupArgs = {
  name: Scalars["String"]["input"];
  parentId?: InputMaybe<Scalars["ID"]["input"]>;
  slug: Scalars["String"]["input"];
};

export type MutationCreatePolicyArgs = {
  documentType?: InputMaybe<DocumentType>;
  homeGroupId: Scalars["ID"]["input"];
  sensitivity: Sensitivity;
  templateId?: InputMaybe<Scalars["ID"]["input"]>;
  title: Scalars["String"]["input"];
};

export type MutationDeleteAppendixArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteGroupArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteGroupMappingArgs = {
  mappingId: Scalars["ID"]["input"];
};

export type MutationDeleteOrganizationArgs = {
  domain: Scalars["String"]["input"];
};

export type MutationDeleteUserArgs = {
  userId: Scalars["ID"]["input"];
};

export type MutationDisableOrganizationArgs = {
  domain: Scalars["String"]["input"];
};

export type MutationDisableUserArgs = {
  userId: Scalars["ID"]["input"];
};

export type MutationDiscardDraftArgs = {
  policyId: Scalars["ID"]["input"];
};

export type MutationEnableUserArgs = {
  userId: Scalars["ID"]["input"];
};

export type MutationGrantRoleArgs = {
  role: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationIssueCollabTokenArgs = {
  input: IssueCollabTokenInput;
};

export type MutationMoveGroupArgs = {
  groupId: Scalars["ID"]["input"];
  newParentId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type MutationPublishDraftArgs = {
  policyId: Scalars["ID"]["input"];
};

export type MutationRenameGroupArgs = {
  id: Scalars["ID"]["input"];
  name: Scalars["String"]["input"];
  slug: Scalars["String"]["input"];
};

export type MutationReorderAppendicesArgs = {
  orderedIds: ReadonlyArray<Scalars["ID"]["input"]>;
  policyVersionId: Scalars["ID"]["input"];
};

export type MutationRevokeRoleArgs = {
  role: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationRevokeUserSessionsArgs = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
  userId: Scalars["ID"]["input"];
};

export type MutationSaveDraftArgs = {
  contentJson: Scalars["String"]["input"];
  policyId: Scalars["ID"]["input"];
  templateVersionId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type MutationStartDomainVerificationArgs = {
  domain: Scalars["String"]["input"];
  rotate?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MutationSubmitDraftGenerationArgs = {
  input: SubmitDraftGenerationInput;
};

export type MutationSubmitPolicyReviewArgs = {
  input: SubmitPolicyReviewInput;
};

export type MutationUpdateAppendixArgs = {
  contentJson: Scalars["String"]["input"];
  id: Scalars["ID"]["input"];
  title: Scalars["String"]["input"];
};

export type MutationUpdateGroupSettingsArgs = {
  defaultTemplateId?: InputMaybe<Scalars["ID"]["input"]>;
  defaultTemplateNone?: InputMaybe<Scalars["Boolean"]["input"]>;
  defaultWorkflowId?: InputMaybe<Scalars["ID"]["input"]>;
  id: Scalars["ID"]["input"];
  owners?: InputMaybe<ReadonlyArray<Scalars["ID"]["input"]>>;
  reviewCadence?: InputMaybe<ReviewCadence>;
  reviewDate?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationUpdateIdPConnectionArgs = {
  allowLocal?: InputMaybe<Scalars["Boolean"]["input"]>;
  domain: Scalars["String"]["input"];
  jitEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MutationUpdateMyProfileArgs = {
  firstName: Scalars["String"]["input"];
  lastName: Scalars["String"]["input"];
};

export type MutationUpdateUserProfileArgs = {
  email: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationVerifyDomainArgs = {
  domain: Scalars["String"]["input"];
};

/** One organisation's SSO connection, keyed by email domain. */
export type Organization = {
  readonly __typename?: "Organization";
  /** When true, this organisation's users may also sign in with a local password. */
  readonly allowLocal: Scalars["Boolean"]["output"];
  /** Identity-service connection id; keys SP-cert-independent, per-connection calls. */
  readonly connectionId: Scalars["ID"]["output"];
  readonly displayName: Scalars["String"]["output"];
  readonly domain: Scalars["String"]["output"];
  /** Currently live for sign-in. Both gates must have passed to activate. */
  readonly enabled: Scalars["Boolean"]["output"];
  /** When true, an unknown SSO email is auto-provisioned on first sign-in. */
  readonly jitEnabled: Scalars["Boolean"]["output"];
  readonly orgName: Scalars["String"]["output"];
  /** 'saml' | 'oidc' */
  readonly protocol: Scalars["String"]["output"];
  /** End-to-end IdP login test gate. */
  readonly testPassed: Scalars["Boolean"]["output"];
  /** Domain-ownership gate (DNS TXT verification). */
  readonly verified: Scalars["Boolean"]["output"];
};

/** One row of the policy/procedure library catalog. */
export type Policy = {
  readonly __typename?: "Policy";
  readonly category: Scalars["String"]["output"];
  readonly currentDraftVersionId?: Maybe<Scalars["ID"]["output"]>;
  readonly currentPublishedVersionId?: Maybe<Scalars["ID"]["output"]>;
  readonly documentType: DocumentType;
  readonly homeGroupId: Scalars["ID"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly number: Scalars["String"]["output"];
  readonly ownerUserId: Scalars["ID"]["output"];
  readonly retiredAt?: Maybe<Scalars["String"]["output"]>;
  readonly sensitivity: Sensitivity;
  readonly status: PolicyStatus;
  readonly subcategory: Scalars["String"]["output"];
  readonly templateId?: Maybe<Scalars["ID"]["output"]>;
  readonly templateNone: Scalars["Boolean"]["output"];
  readonly title: Scalars["String"]["output"];
  /** When the current version was last updated. */
  readonly updated: Scalars["DateTime"]["output"];
  readonly version: Scalars["String"]["output"];
  readonly viewerCan: PolicyViewerCan;
};

export type PolicyAppendix = {
  readonly __typename?: "PolicyAppendix";
  readonly id: Scalars["ID"]["output"];
  readonly letter: Scalars["String"]["output"];
  readonly text: Scalars["String"]["output"];
  readonly title: Scalars["String"]["output"];
};

/** A reusable contact block attached to this policy (U16). */
export type PolicyContact = {
  readonly __typename?: "PolicyContact";
  readonly department?: Maybe<Scalars["String"]["output"]>;
  readonly email?: Maybe<Scalars["String"]["output"]>;
  readonly hours?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["ID"]["output"];
  readonly label: Scalars["String"]["output"];
  readonly name?: Maybe<Scalars["String"]["output"]>;
  readonly notes?: Maybe<Scalars["String"]["output"]>;
  readonly phone?: Maybe<Scalars["String"]["output"]>;
  readonly role?: Maybe<Scalars["String"]["output"]>;
};

/** A reusable glossary entry attached to this policy (the original's PolicyDefinitions, U13). */
export type PolicyDefinition = {
  readonly __typename?: "PolicyDefinition";
  readonly definition: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly term: Scalars["String"]["output"];
};

/** The reader's full view of one policy or procedure (U7 in the original design). */
export type PolicyDetail = {
  readonly __typename?: "PolicyDetail";
  /** This caller's acknowledgement of the current published version, when the document carries acknowledgement at all. */
  readonly ack?: Maybe<AckStatus>;
  /** The appendix list of the current version (published, or the working draft when there is no published version yet). */
  readonly appendices: ReadonlyArray<PolicyAppendix>;
  readonly bodyText: Scalars["String"]["output"];
  readonly canBreakGlass: Scalars["Boolean"]["output"];
  readonly category: Scalars["String"]["output"];
  readonly contacts: ReadonlyArray<PolicyContact>;
  /** True while this caller sees the body and panels below obfuscated, because they are outside the policy's sensitive read audience. */
  readonly contentObfuscated: Scalars["Boolean"]["output"];
  /** The current version's id, for `acknowledgePolicy`. Null when there is no published version yet. */
  readonly currentVersionId?: Maybe<Scalars["ID"]["output"]>;
  readonly definitions: ReadonlyArray<PolicyDefinition>;
  readonly documentType: DocumentType;
  readonly history: ReadonlyArray<HistoryEntry>;
  readonly id: Scalars["ID"]["output"];
  readonly number: Scalars["String"]["output"];
  /** Resolved from the owning user; null when the lookup is unavailable. */
  readonly ownerName?: Maybe<Scalars["String"]["output"]>;
  /** A summary of the current version against the one it superseded. Null for a first version. */
  readonly priorVersion?: Maybe<PolicyVersionSummary>;
  readonly published?: Maybe<Scalars["DateTime"]["output"]>;
  readonly references: ReadonlyArray<PolicyReference>;
  readonly related: ReadonlyArray<RelatedPolicy>;
  readonly sensitivity: Sensitivity;
  readonly status: PolicyStatus;
  readonly subcategory: Scalars["String"]["output"];
  readonly title: Scalars["String"]["output"];
  readonly updated: Scalars["DateTime"]["output"];
  readonly version: Scalars["String"]["output"];
};

/** A references/standards entry attached to this policy (U15). */
export type PolicyReference = {
  readonly __typename?: "PolicyReference";
  readonly body?: Maybe<Scalars["String"]["output"]>;
  readonly clause?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["ID"]["output"];
  readonly kind: ReferenceKind;
  readonly label: Scalars["String"]["output"];
  readonly url?: Maybe<Scalars["String"]["output"]>;
};

export type PolicySectionDiff = {
  readonly __typename?: "PolicySectionDiff";
  readonly changeType: Scalars["String"]["output"];
  readonly sectionKey: Scalars["String"]["output"];
  readonly sectionTitle: Scalars["String"]["output"];
  readonly wordDiffHtml?: Maybe<Scalars["String"]["output"]>;
};

export enum PolicyStatus {
  Draft = "DRAFT",
  InReview = "IN_REVIEW",
  Published = "PUBLISHED",
  Rejected = "REJECTED",
  Superseded = "SUPERSEDED",
  Withdrawn = "WITHDRAWN",
}

export type PolicyVersion = {
  readonly __typename?: "PolicyVersion";
  readonly appendices: ReadonlyArray<Appendix>;
  /** Opaque to the gateway: a JSON-encoded array of `{ sectionKey, title, text }` authored sections. */
  readonly contentJson: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly policyId: Scalars["ID"]["output"];
  readonly status: Scalars["String"]["output"];
  readonly templateVersionId?: Maybe<Scalars["ID"]["output"]>;
  readonly versionNo: Scalars["Int"]["output"];
};

/** The diff between the current version and the one it superseded (U12/U19). */
export type PolicyVersionSummary = {
  readonly __typename?: "PolicyVersionSummary";
  readonly diff: ReadonlyArray<PolicySectionDiff>;
  readonly version: Scalars["String"]["output"];
};

/** Per-viewer authorization projection of a Policy, computed server-side. The UI mirrors these for UX only; the gateway is the real enforcement boundary. */
export type PolicyViewerCan = {
  readonly __typename?: "PolicyViewerCan";
  readonly ack: Scalars["Boolean"]["output"];
  readonly approve: Scalars["Boolean"]["output"];
  readonly canBreakGlass: Scalars["Boolean"]["output"];
  readonly contentObfuscated: Scalars["Boolean"]["output"];
  readonly edit: Scalars["Boolean"]["output"];
  readonly read: Scalars["Boolean"]["output"];
  readonly submit: Scalars["Boolean"]["output"];
};

export type Query = {
  readonly __typename?: "Query";
  /** Whether AI is usable right now for the calling user. */
  readonly aiHealth: AiHealth;
  readonly aiJob: AiJobStatus;
  /** Fetch a completed async AI job's content by resultRef (AIJobStatus.resultRef once phase is SUCCEEDED). */
  readonly aiJobResultContent: AiJobResultContent;
  /** A page of audit records, newest first. tier/groupId/actorUserId/subject filter server-side; action and a date range are left to the caller. Site-admin only. */
  readonly auditLog: AuditQueryPage;
  /** The groups any signed-in author may create a policy under (unlike groupChildren, not site-admin-gated). */
  readonly authorableGroups: ReadonlyArray<Group>;
  /** The templates selectable when creating a policy (unlike templates, not site-admin-gated). */
  readonly authorableTemplates: ReadonlyArray<Template>;
  /** One inline authoring suggestion for a section currently being edited. Never auto-applied. */
  readonly authoringAssist: AuthoringAssistResult;
  /** The category tree for the policy/procedure library browse. Any signed-in user. */
  readonly categories: ReadonlyArray<Category>;
  /** Build and version facts for a bug report. Any signed-in user; refused when signed out. */
  readonly diagnostics: Diagnostics;
  /** The working draft version of a policy's content, for the editor. Null when there is no draft. */
  readonly draftVersion?: Maybe<PolicyVersion>;
  /** A group's direct children. A null parentId lists the root groups. Site-admin only. */
  readonly groupChildren: ReadonlyArray<Group>;
  /** An organisation's IdP-group-claim-to-platform-group mappings. Site-admin only. */
  readonly groupMappings: ReadonlyArray<GroupMapping>;
  /** A template's current (newest) version, with its section outline. Null for a template with no version yet. */
  readonly latestTemplateVersion?: Maybe<TemplateVersion>;
  /** A user's sessions, site-admin only. */
  readonly listUserSessions: ReadonlyArray<Session>;
  /** The signed-in user, from the verified session. Null when signed out. */
  readonly me?: Maybe<Me>;
  /** The CALLING user's own policies with a working draft, most-recently-updated first. Any signed-in author. */
  readonly myDraftPolicies: ReadonlyArray<Policy>;
  /** Every configured organisation SSO connection. Site-admin only. */
  readonly organizations: ReadonlyArray<Organization>;
  /** The library catalog for one document type. Any signed-in user. */
  readonly policies: ReadonlyArray<Policy>;
  /** One policy by backend id, for the editor. Null when it doesn't exist or the caller can't see it. */
  readonly policy?: Maybe<Policy>;
  /** The reader's full detail for one policy/procedure, found by number. Null when there is no such document, or the caller cannot see it at all. */
  readonly policyDetail?: Maybe<PolicyDetail>;
  /**
   * A read-only dry run of deleteUser for the delete confirmation screen: what the delete would
   * block on, orphan or drop. Site-admin only.
   */
  readonly previewUserDeletion: UserDeletionPreview;
  /** The platform's active SP (service-provider) signing certificate. Site-admin only. */
  readonly spCertificate: SpCertificate;
  /** The templates selectable as a group's default. Site-admin only. */
  readonly templates: ReadonlyArray<Template>;
  /**
   * The platform's users, site-admin only. search filters by email substring; includeDeleted
   * also returns tombstoned accounts.
   */
  readonly users: UserPage;
  /** Recomputes the hash chain across [fromRecordId, toRecordId] and reports whether it still holds. Site-admin only. */
  readonly verifyAuditChain: AuditChainVerification;
  /** The workflows selectable as a group's default. Site-admin only. */
  readonly workflows: ReadonlyArray<Workflow>;
};

export type QueryAiJobArgs = {
  jobId: Scalars["ID"]["input"];
};

export type QueryAiJobResultContentArgs = {
  resultRef: Scalars["String"]["input"];
};

export type QueryAuditLogArgs = {
  actorUserId?: InputMaybe<Scalars["ID"]["input"]>;
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
  pageToken?: InputMaybe<Scalars["String"]["input"]>;
  subject?: InputMaybe<Scalars["String"]["input"]>;
  tier?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryAuthorableTemplatesArgs = {
  ownerGroupId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryAuthoringAssistArgs = {
  input: AuthoringAssistInput;
};

export type QueryDraftVersionArgs = {
  policyId: Scalars["ID"]["input"];
};

export type QueryGroupChildrenArgs = {
  parentId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryGroupMappingsArgs = {
  connectionId: Scalars["ID"]["input"];
};

export type QueryLatestTemplateVersionArgs = {
  templateId: Scalars["ID"]["input"];
};

export type QueryListUserSessionsArgs = {
  userId: Scalars["ID"]["input"];
};

export type QueryPoliciesArgs = {
  documentType: DocumentType;
};

export type QueryPolicyArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryPolicyDetailArgs = {
  documentType: DocumentType;
  number: Scalars["String"]["input"];
};

export type QueryPreviewUserDeletionArgs = {
  userId: Scalars["ID"]["input"];
};

export type QueryTemplatesArgs = {
  ownerGroupId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryUsersArgs = {
  includeDeleted?: InputMaybe<Scalars["Boolean"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
  pageToken?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryVerifyAuditChainArgs = {
  fromRecordId: Scalars["String"]["input"];
  toRecordId: Scalars["String"]["input"];
};

export enum ReferenceKind {
  Link = "LINK",
  Standard = "STANDARD",
  Text = "TEXT",
}

/** A structured link to another policy (U14). One-way; the link target's own number and title are resolved live. */
export type RelatedPolicy = {
  readonly __typename?: "RelatedPolicy";
  readonly number: Scalars["String"]["output"];
  readonly policyId: Scalars["ID"]["output"];
  readonly title: Scalars["String"]["output"];
};

export enum ReviewCadence {
  Annual = "ANNUAL",
  Biennial = "BIENNIAL",
  None = "NONE",
  OnDate = "ON_DATE",
}

/** One section of a template's outline; a draft scaffolded from a template keeps these keys. */
export type Section = {
  readonly __typename?: "Section";
  readonly key: Scalars["String"]["output"];
  readonly level: Scalars["Int"]["output"];
  readonly order: Scalars["Int"]["output"];
  readonly required: Scalars["Boolean"]["output"];
  readonly title: Scalars["String"]["output"];
};

export enum Sensitivity {
  Sensitive = "SENSITIVE",
  Standard = "STANDARD",
}

export type Session = {
  readonly __typename?: "Session";
  readonly clientIp: Scalars["String"]["output"];
  readonly expiresAt: Scalars["String"]["output"];
  readonly issuedAt: Scalars["String"]["output"];
  readonly lastSeenAt: Scalars["String"]["output"];
  /** Null while the session is still active. */
  readonly revokedAt?: Maybe<Scalars["String"]["output"]>;
  readonly sessionId: Scalars["ID"]["output"];
  readonly userAgent: Scalars["String"]["output"];
};

/** One SP (service-provider) signing certificate. At most one is active at a time. */
export type SpCertificate = {
  readonly __typename?: "SpCertificate";
  readonly active: Scalars["Boolean"]["output"];
  readonly certPem: Scalars["String"]["output"];
  readonly notAfter: Scalars["String"]["output"];
  readonly serial: Scalars["String"]["output"];
  readonly spMetadataXml: Scalars["String"]["output"];
};

export type SubmitDraftGenerationInput = {
  readonly brief: Scalars["String"]["input"];
  readonly homeGroupId?: InputMaybe<Scalars["ID"]["input"]>;
  readonly sections: ReadonlyArray<SubmitDraftGenerationSectionInput>;
  readonly title?: InputMaybe<Scalars["String"]["input"]>;
};

export type SubmitDraftGenerationSectionInput = {
  readonly key: Scalars["String"]["input"];
  readonly order: Scalars["Int"]["input"];
  readonly title: Scalars["String"]["input"];
};

export type SubmitPolicyReviewInput = {
  readonly policyId: Scalars["ID"]["input"];
  readonly sections: ReadonlyArray<SubmitPolicyReviewSectionInput>;
};

export type SubmitPolicyReviewSectionInput = {
  readonly content: Scalars["String"]["input"];
  readonly key: Scalars["String"]["input"];
  readonly title: Scalars["String"]["input"];
};

/** A template selectable as a group's default. */
export type Template = {
  readonly __typename?: "Template";
  readonly id: Scalars["ID"]["output"];
  readonly name: Scalars["String"]["output"];
};

export type TemplateVersion = {
  readonly __typename?: "TemplateVersion";
  readonly id: Scalars["ID"]["output"];
  readonly sections: ReadonlyArray<Section>;
  readonly templateId: Scalars["ID"]["output"];
  readonly versionNo: Scalars["Int"]["output"];
};

/** One platform user. */
export type User = {
  readonly __typename?: "User";
  /** AD group names (membership source), read-only here. */
  readonly adGroups: ReadonlyArray<Scalars["String"]["output"]>;
  /** Tombstone time for a soft-deleted account. Null for a live account. */
  readonly deletedAt?: Maybe<Scalars["String"]["output"]>;
  readonly email: Scalars["String"]["output"];
  readonly enabled: Scalars["Boolean"]["output"];
  /** Structured given name; empty when the identity provider sent none and the user hasn't set it. */
  readonly firstName: Scalars["String"]["output"];
  /** The protected root site-admin; can't be disabled or stripped of site-admin. */
  readonly isRoot: Scalars["Boolean"]["output"];
  /** Structured family name; empty when the identity provider sent none and the user hasn't set it. */
  readonly lastName: Scalars["String"]["output"];
  /** True when the account was created locally (lldap-backed); false when federated (SSO). */
  readonly localAccount: Scalars["Boolean"]["output"];
  /** The surviving account a merged-away row now points at. Null unless the account was merged. */
  readonly mergedIntoUserId?: Maybe<Scalars["ID"]["output"]>;
  readonly name: Scalars["String"]["output"];
  /** Global elevated roles; the Reader baseline is implicit and never listed. */
  readonly roles: ReadonlyArray<Scalars["String"]["output"]>;
  readonly userId: Scalars["ID"]["output"];
  /** Login handle; for SSO/JIT accounts derived from the email local part. */
  readonly username: Scalars["String"]["output"];
};

export type UserDeletionCounts = {
  readonly __typename?: "UserDeletionCounts";
  readonly accessRows: Scalars["Int"]["output"];
  readonly ownedPolicies: Scalars["Int"]["output"];
  readonly pendingApprovals: Scalars["Int"]["output"];
  readonly raciGrants: Scalars["Int"]["output"];
  readonly roles: Scalars["Int"]["output"];
};

/**
 * Read-only projection of deleting userId. blocksDelete is true when deleteUser would refuse
 * right now. locallyAuthenticable reports whether the account can sign in without the identity
 * provider today.
 */
export type UserDeletionPreview = {
  readonly __typename?: "UserDeletionPreview";
  readonly blocksDelete: Scalars["Boolean"]["output"];
  readonly counts: UserDeletionCounts;
  readonly items: ReadonlyArray<UserDeletionPreviewItem>;
  readonly locallyAuthenticable: Scalars["Boolean"]["output"];
  readonly userId: Scalars["ID"]["output"];
  readonly warnings: ReadonlyArray<UserDeletionWarning>;
};

/**
 * One reviewable line in the deletion preview. blocksDelete marks the rows that make deleteUser
 * refuse until they are cleared.
 */
export type UserDeletionPreviewItem = {
  readonly __typename?: "UserDeletionPreviewItem";
  readonly blocksDelete: Scalars["Boolean"]["output"];
  readonly detail: Scalars["String"]["output"];
  readonly kind: DeletionItemKind;
  readonly label: Scalars["String"]["output"];
  readonly refId: Scalars["ID"]["output"];
};

export type UserDeletionWarning = {
  readonly __typename?: "UserDeletionWarning";
  readonly code: Scalars["String"]["output"];
  readonly message: Scalars["String"]["output"];
};

export type UserPage = {
  readonly __typename?: "UserPage";
  readonly nextPageToken: Scalars["String"]["output"];
  readonly users: ReadonlyArray<User>;
};

/** A workflow definition selectable as a group's default. */
export type Workflow = {
  readonly __typename?: "Workflow";
  readonly id: Scalars["ID"]["output"];
  readonly name: Scalars["String"]["output"];
};
