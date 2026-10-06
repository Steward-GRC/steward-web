export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: string; output: string };
};

export type AiCitation = {
  readonly __typename?: "AICitation";
  readonly chunkId?: Maybe<Scalars["ID"]["output"]>;
  readonly chunkIndex?: Maybe<Scalars["Int"]["output"]>;
  readonly documentType?: Maybe<Scalars["String"]["output"]>;
  readonly policyId: Scalars["ID"]["output"];
  readonly policyTitle: Scalars["String"]["output"];
  readonly sectionKey: Scalars["String"]["output"];
  readonly versionId: Scalars["ID"]["output"];
  readonly versionNo: Scalars["Int"]["output"];
};

export type AiConfig = {
  readonly __typename?: "AIConfig";
  readonly baseUrl: Scalars["String"]["output"];
  readonly credentialLast4: Scalars["String"]["output"];
  readonly credentialSet: Scalars["Boolean"]["output"];
  readonly dataNotice: AiDataNotice;
  readonly deployment: Scalars["String"]["output"];
  readonly enabled: Scalars["Boolean"]["output"];
  readonly model: Scalars["String"]["output"];
  readonly provider?: Maybe<AiProvider>;
  readonly region: Scalars["String"]["output"];
  readonly topK: Scalars["Int"]["output"];
};

export type AiCredentialStatus = {
  readonly __typename?: "AICredentialStatus";
  readonly credentialLast4: Scalars["String"]["output"];
  readonly credentialSet: Scalars["Boolean"]["output"];
};

export type AiDataNotice = {
  readonly __typename?: "AIDataNotice";
  readonly acceptedAt?: Maybe<Scalars["String"]["output"]>;
  readonly acceptedBy?: Maybe<Scalars["ID"]["output"]>;
  readonly acceptedVersion: Scalars["String"]["output"];
  readonly currentVersion: Scalars["String"]["output"];
};

export type AiHealth = {
  readonly __typename?: "AIHealth";
  readonly available: Scalars["Boolean"]["output"];
  /**
   * Populated only when available is false: "ai_service_unavailable" (the ai
   * service is unreachable), "disabled_by_admin" (the module switch is off; ai
   * refuses every intake call while it is, site admins included), or
   * "provider_unavailable" (the configured model provider is failing or not
   * configured). Null when available is true.
   */
  readonly reason?: Maybe<Scalars["String"]["output"]>;
};

export enum AiJobPhase {
  AiJobPhaseFailed = "AI_JOB_PHASE_FAILED",
  AiJobPhasePending = "AI_JOB_PHASE_PENDING",
  AiJobPhaseRunning = "AI_JOB_PHASE_RUNNING",
  AiJobPhaseSucceeded = "AI_JOB_PHASE_SUCCEEDED",
}

export type AiJobResult = {
  readonly __typename?: "AIJobResult";
  readonly error?: Maybe<Scalars["String"]["output"]>;
  readonly finishedAt?: Maybe<Scalars["String"]["output"]>;
  readonly jobId: Scalars["ID"]["output"];
  readonly phase: AiJobPhase;
  readonly resultRef?: Maybe<Scalars["String"]["output"]>;
};

export type AiJobResultContent = {
  readonly __typename?: "AIJobResultContent";
  readonly operation: Scalars["String"]["output"];
  readonly resultJson: Scalars["String"]["output"];
};

export type AiJobStatus = {
  readonly __typename?: "AIJobStatus";
  readonly error?: Maybe<Scalars["String"]["output"]>;
  readonly finishedAt?: Maybe<Scalars["String"]["output"]>;
  readonly jobId: Scalars["ID"]["output"];
  readonly phase: AiJobPhase;
  readonly resultRef?: Maybe<Scalars["String"]["output"]>;
  readonly startedAt?: Maybe<Scalars["String"]["output"]>;
};

export enum AiProvider {
  Anthropic = "ANTHROPIC",
  AzureOpenai = "AZURE_OPENAI",
  Bedrock = "BEDROCK",
  Gemini = "GEMINI",
  Openai = "OPENAI",
  OpenaiCompatible = "OPENAI_COMPATIBLE",
}

export type AiProviderConfigInput = {
  readonly baseUrl?: InputMaybe<Scalars["String"]["input"]>;
  readonly deployment?: InputMaybe<Scalars["String"]["input"]>;
  readonly model?: InputMaybe<Scalars["String"]["input"]>;
  readonly provider: AiProvider;
  readonly region?: InputMaybe<Scalars["String"]["input"]>;
};

export type AiProviderTestResult = {
  readonly __typename?: "AIProviderTestResult";
  readonly latencyMs: Scalars["Int"]["output"];
  readonly ok: Scalars["Boolean"]["output"];
  readonly reason?: Maybe<Scalars["String"]["output"]>;
};

export type AiRetrievalConfig = {
  readonly __typename?: "AIRetrievalConfig";
  /**
   * The current EFFECTIVE retrieval candidate count (top_k) used when the ai
   * service gathers policy chunks before ranking. DB-configured when a
   * site-admin has set one, else the bootstrap default (50). The server clamps
   * to a ceiling, so this is the value actually in force. Not a secret —
   * returned verbatim for the admin Settings page.
   */
  readonly topK: Scalars["Int"]["output"];
};

export type AiUserQueryLimit = {
  readonly __typename?: "AIUserQueryLimit";
  /**
   * The target user's now-effective per-day AI query limit. Meaningless when
   * unlimited is true.
   */
  readonly effectiveLimit: Scalars["Int"]["output"];
  /**
   * True when the user has no override and is therefore governed by the global
   * default limit.
   */
  readonly isDefault: Scalars["Boolean"]["output"];
  /** True when the user has no per-day cap (limit set to -1). */
  readonly unlimited: Scalars["Boolean"]["output"];
};

export type AccountMergePreview = {
  readonly __typename?: "AccountMergePreview";
  readonly counts: MergeCounts;
  readonly items: ReadonlyArray<MergePreviewItem>;
  readonly requiresPrivilegedConfirm: Scalars["Boolean"]["output"];
  readonly sourceUserId: Scalars["ID"]["output"];
  readonly targetUserId: Scalars["ID"]["output"];
  readonly warnings: ReadonlyArray<MergeWarning>;
};

export type AckActivityDay = {
  readonly __typename?: "AckActivityDay";
  readonly acks: Scalars["Int"]["output"];
  readonly date: Scalars["String"]["output"];
  readonly views: Scalars["Int"]["output"];
};

export type AckExport = {
  readonly __typename?: "AckExport";
  readonly contentType: Scalars["String"]["output"];
  readonly data: Scalars["String"]["output"];
};

export type AckRoster = {
  readonly __typename?: "AckRoster";
  readonly acked: ReadonlyArray<AckRosterEntry>;
  readonly pending: ReadonlyArray<AckRosterEntry>;
};

export type AckRosterEntry = {
  readonly __typename?: "AckRosterEntry";
  readonly ackedAt?: Maybe<Scalars["String"]["output"]>;
  readonly email: Scalars["String"]["output"];
  readonly userId: Scalars["ID"]["output"];
  readonly userName?: Maybe<Scalars["String"]["output"]>;
};

export type AckStatus = {
  readonly __typename?: "AckStatus";
  readonly ackedAt?: Maybe<Scalars["String"]["output"]>;
  readonly acknowledged: Scalars["Boolean"]["output"];
};

export type AckSummary = {
  readonly __typename?: "AckSummary";
  readonly done: Scalars["Int"]["output"];
  readonly required: Scalars["Int"]["output"];
};

export enum AckTrigger {
  None = "NONE",
  OnChange = "ON_CHANGE",
  OnPublish = "ON_PUBLISH",
}

export type Acknowledgment = {
  readonly __typename?: "Acknowledgment";
  readonly ackedAt: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly policyVersionId: Scalars["ID"]["output"];
  readonly userId: Scalars["ID"]["output"];
};

export type AddOrganizationInput = {
  readonly config?: InputMaybe<ReadonlyArray<KeyValueInput>>;
  readonly displayName?: InputMaybe<Scalars["String"]["input"]>;
  readonly domain: Scalars["String"]["input"];
  readonly orgName: Scalars["String"]["input"];
  readonly protocol: Scalars["String"]["input"];
  readonly secretRef?: InputMaybe<Scalars["String"]["input"]>;
};

export type Announcement = {
  readonly __typename?: "Announcement";
  readonly enabled: Scalars["Boolean"]["output"];
  readonly level: Scalars["String"]["output"];
  readonly message: Scalars["String"]["output"];
};

export type AnnouncementInput = {
  readonly enabled: Scalars["Boolean"]["input"];
  readonly level: Scalars["String"]["input"];
  readonly message: Scalars["String"]["input"];
};

export type AnonymousReportReceipt = {
  readonly __typename?: "AnonymousReportReceipt";
  readonly caseCode: Scalars["String"]["output"];
};

export type AnswerSegment = {
  readonly __typename?: "AnswerSegment";
  readonly end: Scalars["Int"]["output"];
  readonly sources: ReadonlyArray<SegmentSource>;
  readonly start: Scalars["Int"]["output"];
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

export enum ApprovalStatus {
  ApprovalStatusApproved = "APPROVAL_STATUS_APPROVED",
  ApprovalStatusArchived = "APPROVAL_STATUS_ARCHIVED",
  ApprovalStatusDraft = "APPROVAL_STATUS_DRAFT",
  ApprovalStatusInReview = "APPROVAL_STATUS_IN_REVIEW",
  ApprovalStatusPublished = "APPROVAL_STATUS_PUBLISHED",
  ApprovalStatusRejected = "APPROVAL_STATUS_REJECTED",
  ApprovalStatusScheduled = "APPROVAL_STATUS_SCHEDULED",
  ApprovalStatusSuperseded = "APPROVAL_STATUS_SUPERSEDED",
  ApprovalStatusUnspecified = "APPROVAL_STATUS_UNSPECIFIED",
  ApprovalStatusWithdrawn = "APPROVAL_STATUS_WITHDRAWN",
}

export type AssignmentHistoryEntry = {
  readonly __typename?: "AssignmentHistoryEntry";
  readonly actorName?: Maybe<Scalars["String"]["output"]>;
  readonly actorRole?: Maybe<Scalars["String"]["output"]>;
  readonly actorUserId: Scalars["ID"]["output"];
  readonly assignmentId: Scalars["ID"]["output"];
  readonly createdAt: Scalars["String"]["output"];
  readonly event: Scalars["String"]["output"];
  readonly id: Scalars["String"]["output"];
  readonly newUserId?: Maybe<Scalars["ID"]["output"]>;
  readonly newUserName?: Maybe<Scalars["String"]["output"]>;
  readonly outOfEligibility: Scalars["Boolean"]["output"];
  readonly previousUserId?: Maybe<Scalars["ID"]["output"]>;
  readonly previousUserName?: Maybe<Scalars["String"]["output"]>;
  readonly reason?: Maybe<Scalars["String"]["output"]>;
};

export enum AssistOperation {
  AssistOperationClarify = "ASSIST_OPERATION_CLARIFY",
  AssistOperationDraft = "ASSIST_OPERATION_DRAFT",
  AssistOperationExpand = "ASSIST_OPERATION_EXPAND",
  AssistOperationRewrite = "ASSIST_OPERATION_REWRITE",
  AssistOperationSummarize = "ASSIST_OPERATION_SUMMARIZE",
  AssistOperationUnspecified = "ASSIST_OPERATION_UNSPECIFIED",
}

export type AuditChainVerification = {
  readonly __typename?: "AuditChainVerification";
  readonly errors: ReadonlyArray<Scalars["String"]["output"]>;
  readonly recordsChecked: Scalars["Int"]["output"];
  readonly valid: Scalars["Boolean"]["output"];
};

export type AuditCheckpoint = {
  readonly __typename?: "AuditCheckpoint";
  readonly anchorType: Scalars["String"]["output"];
  readonly anchorUrl: Scalars["String"]["output"];
  readonly anchoredAt: Scalars["String"]["output"];
  readonly checkpointUuid: Scalars["ID"]["output"];
  readonly merkleRoot: Scalars["String"]["output"];
  readonly tsaToken: Scalars["String"]["output"];
};

export type AuditQueryPage = {
  readonly __typename?: "AuditQueryPage";
  readonly nextPageToken: Scalars["String"]["output"];
  readonly records: ReadonlyArray<AuditRecord>;
};

export type AuditRecord = {
  readonly __typename?: "AuditRecord";
  readonly action: Scalars["String"]["output"];
  readonly actorName?: Maybe<Scalars["String"]["output"]>;
  readonly actorUserId: Scalars["ID"]["output"];
  readonly groupId: Scalars["ID"]["output"];
  readonly groupName?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["String"]["output"];
  readonly legalBasisExempt: Scalars["Boolean"]["output"];
  readonly occurredAt: Scalars["String"]["output"];
  readonly prevHash: Scalars["String"]["output"];
  readonly recordHash: Scalars["String"]["output"];
  readonly recordUuid: Scalars["ID"]["output"];
  readonly subject: Scalars["String"]["output"];
  readonly subjectLabel?: Maybe<Scalars["String"]["output"]>;
  readonly tier: Scalars["String"]["output"];
};

export type AuditSegment = {
  readonly __typename?: "AuditSegment";
  readonly checkpoints: ReadonlyArray<AuditCheckpoint>;
  readonly records: ReadonlyArray<AuditRecord>;
};

export type AuthoringAssistInput = {
  readonly contextHint?: InputMaybe<Scalars["String"]["input"]>;
  readonly editableContent: Scalars["String"]["input"];
  readonly instruction?: InputMaybe<Scalars["String"]["input"]>;
  readonly operation: AssistOperation;
  readonly policyId: Scalars["ID"]["input"];
  readonly sectionKey: Scalars["String"]["input"];
  readonly versionId: Scalars["ID"]["input"];
};

export type AuthoringAssistResult = {
  readonly __typename?: "AuthoringAssistResult";
  readonly operationId: Scalars["String"]["output"];
  readonly suggestion: Scalars["String"]["output"];
};

export type Block = {
  readonly __typename?: "Block";
  readonly contentJson?: Maybe<Scalars["String"]["output"]>;
  readonly type: Scalars["String"]["output"];
};

export type BlockInput = {
  readonly contentJson?: InputMaybe<Scalars["String"]["input"]>;
  readonly type: Scalars["String"]["input"];
};

export enum BreachDecision {
  NotReportable = "NOT_REPORTABLE",
  Reportable = "REPORTABLE",
}

export type BreakGlassResult = {
  readonly __typename?: "BreakGlassResult";
  readonly grantedUntil: Scalars["String"]["output"];
};

export type BulkDecideInput = {
  readonly decisions: ReadonlyArray<DecisionInput>;
};

export type BulkDecideResult = {
  readonly __typename?: "BulkDecideResult";
  readonly bulkBatchId: Scalars["ID"]["output"];
  readonly results: ReadonlyArray<DecisionResult>;
};

export type CaseNote = {
  readonly __typename?: "CaseNote";
  readonly authorUserId: Scalars["ID"]["output"];
  readonly body: Scalars["String"]["output"];
  readonly createdAt: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
};

export type CaseNotice = {
  readonly __typename?: "CaseNotice";
  readonly daysAllowed: Scalars["Int"]["output"];
  readonly dueOn: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly label: Scalars["String"]["output"];
  readonly method: Scalars["String"]["output"];
  readonly recipient: NoticeRecipient;
  readonly sentOn?: Maybe<Scalars["String"]["output"]>;
  readonly status: NoticeStatus;
};

export enum CaseOutcome {
  Inconclusive = "INCONCLUSIVE",
  NotSubstantiated = "NOT_SUBSTANTIATED",
  Substantiated = "SUBSTANTIATED",
}

export type CaseQueue = {
  readonly __typename?: "CaseQueue";
  readonly cases: ReadonlyArray<CaseSummary>;
  readonly counts: ReadonlyArray<CaseStatusCount>;
};

export enum CaseStatus {
  Closed = "CLOSED",
  InReview = "IN_REVIEW",
  NeedsReporterReply = "NEEDS_REPORTER_REPLY",
  New = "NEW",
  NotificationDue = "NOTIFICATION_DUE",
  RiskAssessment = "RISK_ASSESSMENT",
}

export type CaseStatusCount = {
  readonly __typename?: "CaseStatusCount";
  readonly count: Scalars["Int"]["output"];
  readonly status: CaseStatus;
};

export type CaseSummary = {
  readonly __typename?: "CaseSummary";
  readonly assigneeUserId?: Maybe<Scalars["ID"]["output"]>;
  readonly caseCode: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly kind: ReportKind;
  readonly nextDeadline?: Maybe<Scalars["String"]["output"]>;
  readonly receivedAt: Scalars["String"]["output"];
  readonly status: CaseStatus;
  readonly summary: Scalars["String"]["output"];
};

export type Category = {
  readonly __typename?: "Category";
  readonly ackEveryone: Scalars["Boolean"]["output"];
  readonly ackEveryoneSet: Scalars["Boolean"]["output"];
  readonly ackTriggers: AckTrigger;
  readonly defaultTemplateId?: Maybe<Scalars["ID"]["output"]>;
  readonly defaultTemplateNone: Scalars["Boolean"]["output"];
  readonly defaultWorkflowId?: Maybe<Scalars["ID"]["output"]>;
  readonly exclusionGroupIds?: Maybe<ReadonlyArray<Scalars["String"]["output"]>>;
  readonly id: Scalars["ID"]["output"];
  readonly idpGroupIds?: Maybe<ReadonlyArray<Scalars["String"]["output"]>>;
  readonly name: Scalars["String"]["output"];
  readonly owners: ReadonlyArray<Scalars["ID"]["output"]>;
  readonly parentId?: Maybe<Scalars["ID"]["output"]>;
  readonly reviewCadence: ReviewCadence;
  readonly reviewDate?: Maybe<Scalars["String"]["output"]>;
  readonly slug: Scalars["String"]["output"];
};

export type CategoryApprovers = {
  readonly __typename?: "CategoryApprovers";
  readonly approverIds: ReadonlyArray<Scalars["ID"]["output"]>;
  readonly categoryId: Scalars["ID"]["output"];
};

export type CategoryApproversInput = {
  readonly approverIds: ReadonlyArray<Scalars["ID"]["input"]>;
  readonly categoryId: Scalars["ID"]["input"];
};

export type CategoryPref = {
  readonly __typename?: "CategoryPref";
  readonly cadence: NotifCadence;
  readonly category: NotifCategory;
  readonly mandatory: Scalars["Boolean"]["output"];
};

export type CategoryRuleset = {
  readonly __typename?: "CategoryRuleset";
  readonly categoryId: Scalars["ID"]["output"];
  readonly rules: ReadonlyArray<RaciRule>;
};

export type CompletionReport = {
  readonly __typename?: "CompletionReport";
  readonly avgDaysToAck: Scalars["Float"]["output"];
  readonly completionPct: Scalars["Float"]["output"];
  readonly overdue: ReadonlyArray<OverdueEntry>;
  readonly totalAcked: Scalars["Int"]["output"];
  readonly totalAudience: Scalars["Int"]["output"];
  readonly viewedNotAckedCount: Scalars["Int"]["output"];
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
  /** unavailable or unknown when it can't be read. */
  readonly version: Scalars["String"]["output"];
};

export type ContactBlock = {
  readonly __typename?: "ContactBlock";
  readonly archived: Scalars["Boolean"]["output"];
  readonly department?: Maybe<Scalars["String"]["output"]>;
  readonly email?: Maybe<Scalars["String"]["output"]>;
  readonly hours?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["ID"]["output"];
  readonly label: Scalars["String"]["output"];
  readonly name?: Maybe<Scalars["String"]["output"]>;
  readonly notes?: Maybe<Scalars["String"]["output"]>;
  readonly phone?: Maybe<Scalars["String"]["output"]>;
  readonly role?: Maybe<Scalars["String"]["output"]>;
  readonly usedByCount: Scalars["Int"]["output"];
};

export type ContactBlockInput = {
  readonly department?: InputMaybe<Scalars["String"]["input"]>;
  readonly email?: InputMaybe<Scalars["String"]["input"]>;
  readonly hours?: InputMaybe<Scalars["String"]["input"]>;
  readonly label: Scalars["String"]["input"];
  readonly name?: InputMaybe<Scalars["String"]["input"]>;
  readonly notes?: InputMaybe<Scalars["String"]["input"]>;
  readonly phone?: InputMaybe<Scalars["String"]["input"]>;
  readonly role?: InputMaybe<Scalars["String"]["input"]>;
};

export type CorrectiveAction = {
  readonly __typename?: "CorrectiveAction";
  readonly description: Scalars["String"]["output"];
  readonly policyId?: Maybe<Scalars["ID"]["output"]>;
};

export type CorrectiveActionInput = {
  readonly description: Scalars["String"]["input"];
  readonly policyId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DecisionInput = {
  readonly comment: Scalars["String"]["input"];
  readonly decision: DecisionType;
  readonly policyVersionId: Scalars["ID"]["input"];
  readonly stageIndex: Scalars["Int"]["input"];
};

export type DecisionResult = {
  readonly __typename?: "DecisionResult";
  readonly assignmentId?: Maybe<Scalars["ID"]["output"]>;
  readonly error?: Maybe<Scalars["String"]["output"]>;
  readonly ok: Scalars["Boolean"]["output"];
  readonly policyVersionId: Scalars["ID"]["output"];
  readonly stageIndex: Scalars["Int"]["output"];
};

export enum DecisionType {
  DecisionTypeApprove = "DECISION_TYPE_APPROVE",
  DecisionTypeReject = "DECISION_TYPE_REJECT",
  DecisionTypeUnspecified = "DECISION_TYPE_UNSPECIFIED",
}

export type DefinitionEntry = {
  readonly __typename?: "DefinitionEntry";
  readonly archived: Scalars["Boolean"]["output"];
  readonly categoryId: Scalars["ID"]["output"];
  readonly createdByUserId?: Maybe<Scalars["ID"]["output"]>;
  readonly definition: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly term: Scalars["String"]["output"];
  readonly usedByCount: Scalars["Int"]["output"];
};

export type DefinitionEntryInput = {
  readonly categoryId: Scalars["ID"]["input"];
  readonly definition: Scalars["String"]["input"];
  readonly term: Scalars["String"]["input"];
};

export type DeleteUserResult = {
  readonly __typename?: "DeleteUserResult";
  readonly revokedSessions: Scalars["Int"]["output"];
  readonly userId: Scalars["ID"]["output"];
};

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
  /** Null when not on the appliance. */
  readonly appliance?: Maybe<Scalars["String"]["output"]>;
  readonly gateway: ComponentVersion;
  readonly generatedAt: Scalars["DateTime"]["output"];
  /** Null when unknown. */
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
  /** Set during act-as: the user the signed-in admin is acting as. */
  readonly actingAs?: Maybe<DiagnosticsActingAs>;
  readonly id: Scalars["ID"]["output"];
  readonly roles: ReadonlyArray<Scalars["String"]["output"]>;
  readonly username: Scalars["String"]["output"];
};

export type DigestWindow = {
  readonly __typename?: "DigestWindow";
  readonly dailyHour: Scalars["Int"]["output"];
  readonly weeklyDow: Scalars["Int"]["output"];
};

export enum DocumentType {
  Policy = "POLICY",
  Procedure = "PROCEDURE",
}

export type DomainVerification = {
  readonly __typename?: "DomainVerification";
  readonly dnsRecordName: Scalars["String"]["output"];
  readonly dnsRecordValue: Scalars["String"]["output"];
  readonly instructions: Scalars["String"]["output"];
  readonly token: Scalars["String"]["output"];
};

export type EffectiveGovernance = {
  readonly __typename?: "EffectiveGovernance";
  readonly ackAudienceGroups?: Maybe<ReadonlyArray<Scalars["String"]["output"]>>;
  readonly ackEveryone: Scalars["Boolean"]["output"];
  readonly exclusionGroups?: Maybe<ReadonlyArray<Scalars["String"]["output"]>>;
};

export type EffectiveTemplate = {
  readonly __typename?: "EffectiveTemplate";
  readonly none: Scalars["Boolean"]["output"];
  readonly templateId: Scalars["ID"]["output"];
  readonly templateVersionId: Scalars["ID"]["output"];
};

export type EffectiveWorkflow = {
  readonly __typename?: "EffectiveWorkflow";
  readonly firstUnstaffedStage?: Maybe<Scalars["String"]["output"]>;
  readonly hasWorkflow: Scalars["Boolean"]["output"];
  readonly usable: Scalars["Boolean"]["output"];
  readonly workflowDefId?: Maybe<Scalars["ID"]["output"]>;
};

export type EmailServiceConfigInput = {
  /**
   * WRITE-ONLY, presence-tracked. The sending api key. Stored server-side and
   * never read back (see apiKeySet). Nullable so the field carries three states
   * on save: omitted/null leaves the stored key unchanged (persist non-secret
   * fields without re-sending the key); an empty string "" clears the stored key;
   * a non-empty value sets it.
   */
  readonly apiKey?: InputMaybe<Scalars["String"]["input"]>;
  readonly domain: Scalars["String"]["input"];
  readonly enabled: Scalars["Boolean"]["input"];
  readonly fromAddress: Scalars["String"]["input"];
  readonly provider: Scalars["String"]["input"];
  readonly region: Scalars["String"]["input"];
};

export type EmailServiceConfigStatus = {
  readonly __typename?: "EmailServiceConfigStatus";
  /**
   * Whether a sending key is currently stored. The key's value is never returned
   * by any query, only this presence flag, so the admin Settings page can show
   * "a key is stored and not retrievable; you can only replace it" versus "no key
   * set" without the value ever leaving core.
   */
  readonly apiKeySet: Scalars["Boolean"]["output"];
  readonly domain: Scalars["String"]["output"];
  readonly enabled: Scalars["Boolean"]["output"];
  readonly fromAddress: Scalars["String"]["output"];
  /** The provider the configuration is for; empty until an admin sets one. */
  readonly provider: Scalars["String"]["output"];
  readonly region: Scalars["String"]["output"];
};

export type EnrichmentOptOutInput = {
  readonly definitions?: InputMaybe<Scalars["Boolean"]["input"]>;
  readonly references?: InputMaybe<Scalars["Boolean"]["input"]>;
  readonly related?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type GlobalSettings = {
  readonly __typename?: "GlobalSettings";
  readonly announcement: Announcement;
  readonly maintenance: Maintenance;
};

export type GlobalSettingsInput = {
  readonly announcement: AnnouncementInput;
  readonly maintenance: MaintenanceInput;
};

export type GroupMapping = {
  readonly __typename?: "GroupMapping";
  readonly connectionId: Scalars["ID"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly idpGroupClaimValue: Scalars["String"]["output"];
  readonly targetGroupId: Scalars["ID"]["output"];
};

export type GroupMembership = {
  readonly __typename?: "GroupMembership";
  readonly groupId: Scalars["ID"]["output"];
  readonly source: Scalars["String"]["output"];
};

export type GroupUnit = {
  readonly __typename?: "GroupUnit";
  readonly groupId: Scalars["ID"]["output"];
  readonly internalQuorum: Scalars["String"]["output"];
  readonly memberUserIds: ReadonlyArray<Scalars["ID"]["output"]>;
};

export type GroupUnitInput = {
  readonly groupId: Scalars["ID"]["input"];
  readonly internalQuorum: Scalars["String"]["input"];
  readonly memberUserIds: ReadonlyArray<Scalars["ID"]["input"]>;
};

export type HealthStatus = {
  readonly __typename?: "HealthStatus";
  readonly status: Scalars["String"]["output"];
};

export type ImpersonationSession = {
  readonly __typename?: "ImpersonationSession";
  readonly expiresAt: Scalars["String"]["output"];
  readonly reason: Scalars["String"]["output"];
  readonly startedAt: Scalars["String"]["output"];
  readonly targetName: Scalars["String"]["output"];
  readonly targetUserId: Scalars["ID"]["output"];
};

export enum InformationKind {
  Contact = "CONTACT",
  Financial = "FINANCIAL",
  Health = "HEALTH",
  NotSure = "NOT_SURE",
}

export enum InitiatorRole {
  InitiatorRoleAdmin = "INITIATOR_ROLE_ADMIN",
  InitiatorRoleSelfDelegate = "INITIATOR_ROLE_SELF_DELEGATE",
  InitiatorRoleUnspecified = "INITIATOR_ROLE_UNSPECIFIED",
  InitiatorRoleWorkflowAuthor = "INITIATOR_ROLE_WORKFLOW_AUTHOR",
}

export type IssueCollabTokenInput = {
  readonly draftId: Scalars["ID"]["input"];
  readonly policyId: Scalars["ID"]["input"];
  readonly templateVersionId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type IssueCollabTokenPayload = {
  readonly __typename?: "IssueCollabTokenPayload";
  readonly expiresAt: Scalars["String"]["output"];
  readonly token: Scalars["String"]["output"];
  readonly wsUrl: Scalars["String"]["output"];
};

export type KeyValueInput = {
  readonly key: Scalars["String"]["input"];
  readonly value: Scalars["String"]["input"];
};

export type LiveEvent = {
  readonly __typename?: "LiveEvent";
  readonly actorUserId?: Maybe<Scalars["String"]["output"]>;
  readonly at: Scalars["String"]["output"];
  readonly entityId?: Maybe<Scalars["String"]["output"]>;
  readonly groupId?: Maybe<Scalars["String"]["output"]>;
  readonly type: Scalars["String"]["output"];
};

export type MagicLink = {
  readonly __typename?: "MagicLink";
  readonly expiresAt: Scalars["String"]["output"];
  readonly token: Scalars["String"]["output"];
};

export type Maintenance = {
  readonly __typename?: "Maintenance";
  readonly enabled: Scalars["Boolean"]["output"];
  readonly message: Scalars["String"]["output"];
};

export type MaintenanceInput = {
  readonly enabled: Scalars["Boolean"]["input"];
  readonly message: Scalars["String"]["input"];
};

export type MergeAccountsResult = {
  readonly __typename?: "MergeAccountsResult";
  readonly counts: MergeCounts;
  readonly mergeOperationId: Scalars["ID"]["output"];
  readonly status: MergeStatus;
  readonly steps: ReadonlyArray<MergeStepResult>;
};

export type MergeCounts = {
  readonly __typename?: "MergeCounts";
  readonly acknowledgmentsDeduped: Scalars["Int"]["output"];
  readonly acknowledgmentsMoved: Scalars["Int"]["output"];
  readonly policiesOwned: Scalars["Int"]["output"];
  readonly preferences: Scalars["Int"]["output"];
  readonly raciGrants: Scalars["Int"]["output"];
  readonly workflowItems: Scalars["Int"]["output"];
};

export enum MergeItemKind {
  Acknowledgment = "ACKNOWLEDGMENT",
  PolicyOwner = "POLICY_OWNER",
  Preference = "PREFERENCE",
  RaciGrant = "RACI_GRANT",
  WorkflowItem = "WORKFLOW_ITEM",
}

export type MergePreviewItem = {
  readonly __typename?: "MergePreviewItem";
  readonly detail: Scalars["String"]["output"];
  readonly kind: MergeItemKind;
  readonly label: Scalars["String"]["output"];
  readonly refId: Scalars["ID"]["output"];
};

export enum MergeStatus {
  Completed = "COMPLETED",
  Failed = "FAILED",
  Partial = "PARTIAL",
}

export type MergeStepResult = {
  readonly __typename?: "MergeStepResult";
  readonly detail: Scalars["String"]["output"];
  readonly error: Scalars["String"]["output"];
  readonly status: MergeStepStatus;
  readonly step: Scalars["String"]["output"];
};

export enum MergeStepStatus {
  Completed = "COMPLETED",
  Failed = "FAILED",
  Pending = "PENDING",
  Skipped = "SKIPPED",
}

export type MergeWarning = {
  readonly __typename?: "MergeWarning";
  readonly code: Scalars["String"]["output"];
  readonly message: Scalars["String"]["output"];
};

export enum MessageAuthor {
  Officer = "OFFICER",
  Reporter = "REPORTER",
}

export type MfaFactor = {
  readonly __typename?: "MfaFactor";
  readonly enrolledAt?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["ID"]["output"];
  readonly kind: Scalars["String"]["output"];
  readonly label?: Maybe<Scalars["String"]["output"]>;
};

export type Mutation = {
  readonly __typename?: "Mutation";
  /**
   * Site-admin only. Records that the caller accepted the current data notice;
   * turning the module on is refused until it is accepted.
   */
  readonly acceptAIDataNotice: AiDataNotice;
  readonly activateOrganization: Organization;
  readonly addAppendix: Appendix;
  readonly addCaseNote: CaseNote;
  readonly addCaseNotice: CaseNotice;
  readonly addGroupMapping: GroupMapping;
  readonly addOrganization: Organization;
  readonly addUserToGroup: User;
  readonly archiveWorkflowDef: Scalars["Boolean"]["output"];
  readonly assignCase: ReportCase;
  readonly breakGlassReveal: BreakGlassResult;
  /**
   * Approve or reject several pending assignments in one call. Every
   * decision in the batch must include a non-empty comment (the server stores
   * one comment per decision). Returns per-row results so a partially-
   * failed batch can be surfaced to the operator.
   */
  readonly bulkDecide: BulkDecideResult;
  readonly changeOrgProtocol: Organization;
  readonly checkReport: ReporterView;
  readonly closeCase: ReportCase;
  readonly completeOnboarding: User;
  readonly createCategory: Category;
  readonly createContactBlock: ContactBlock;
  readonly createDefinition: DefinitionEntry;
  readonly createLocalUser: User;
  readonly createMagicLink: MagicLink;
  readonly createPolicy: Policy;
  readonly createReference: Reference;
  readonly createTemplate: Template;
  readonly createTemplateVersion: TemplateVersion;
  readonly createWorkflowDef: WorkflowDef;
  readonly deleteAppendix: Scalars["Boolean"]["output"];
  readonly deleteCategory: Scalars["Boolean"]["output"];
  readonly deleteContactBlock: Scalars["Boolean"]["output"];
  readonly deleteDefinition: Scalars["Boolean"]["output"];
  readonly deleteGroupMapping: Scalars["Boolean"]["output"];
  readonly deleteOrganization: Scalars["Boolean"]["output"];
  readonly deletePolicy: Scalars["Boolean"]["output"];
  readonly deleteReference: Scalars["Boolean"]["output"];
  readonly deleteTemplate: Scalars["Boolean"]["output"];
  readonly deleteUser: DeleteUserResult;
  readonly disableOrganization: Organization;
  readonly disableUser: User;
  readonly discardDraft: Scalars["Boolean"]["output"];
  readonly discardTemplateVersion: Scalars["Boolean"]["output"];
  readonly enableUser: User;
  readonly enrollTotpBegin: TotpEnrollment;
  readonly enrollTotpConfirm: Scalars["Boolean"]["output"];
  readonly forceRotateSpCertificate: SpCertificate;
  readonly grantGroupManager: User;
  readonly grantRole: User;
  /**
   * Issue a short-lived websocket token for the Collaboration service.
   * The caller must be signed in and be able to edit the policy (collab checks
   * the edit grant again before minting).
   */
  readonly issueCollabToken: IssueCollabTokenPayload;
  readonly mergeAccounts: MergeAccountsResult;
  readonly moveCategory: Category;
  readonly movePolicy: Policy;
  readonly postCaseMessage: ThreadMessage;
  readonly publishDraft: PolicyVersion;
  readonly publishTemplateVersion: TemplateVersion;
  readonly reassignUserPolicies: ReassignUserPoliciesResult;
  readonly recordAck: Acknowledgment;
  readonly recordRiskAssessment: RiskAssessment;
  readonly recordView: Scalars["Boolean"]["output"];
  readonly reindexPolicy: ReindexResult;
  readonly reindexPolicyVersion: ReindexResult;
  readonly removeFactor: Scalars["Boolean"]["output"];
  readonly removeUserFromGroup: User;
  readonly removeUserMfaFactor: Scalars["Boolean"]["output"];
  readonly removeWebauthnCredential: Scalars["Boolean"]["output"];
  readonly renameCategory: Category;
  readonly renameMfaMethod: Scalars["Boolean"]["output"];
  readonly renamePolicy: RenamePolicyResult;
  readonly renameTemplate: Template;
  readonly renameUserMfaFactor: Scalars["Boolean"]["output"];
  readonly reorderAppendices: ReadonlyArray<Appendix>;
  readonly replyToMyReport: ReporterView;
  readonly replyToReport: ReporterView;
  readonly requestPDFExport: PdfExportJob;
  readonly requestStepUpOtp: Scalars["Boolean"]["output"];
  readonly resendWelcomeEmail: Scalars["Boolean"]["output"];
  readonly resetUserPassword: Scalars["Boolean"]["output"];
  readonly retirePolicy: Policy;
  readonly retireTemplate: Template;
  readonly revokeGroupManager: User;
  readonly revokeMagicLink: Scalars["Boolean"]["output"];
  readonly revokeMySessions: Scalars["Int"]["output"];
  readonly revokeRole: User;
  readonly revokeUserSessions: Scalars["Int"]["output"];
  readonly saveDraft: PolicyVersion;
  readonly sendEnrollEmailOtp: Scalars["Boolean"]["output"];
  /**
   * Site-admin only. Turns AI intake on/off: gates NEW submits/queries only
   * (searchAndAnswer/authoringAssist/submitDraftGeneration/
   * submitPolicyReview/submitPolicyRevision) — a job already running is NOT affected and
   * completes normally (graceful drain, not a hard stop). A job already in a
   * retry-after-failure state when this turns off IS hard-stopped rather than
   * continuing to retry. DB-backed (Redis-cached).
   */
  readonly setAIEnabled: Scalars["Boolean"]["output"];
  /**
   * Site-admin only. Sets the generative provider and its non-secret settings.
   * An empty model uses the provider's default. A model change affects jobs
   * submitted after it only. Returns the settings now in force.
   */
  readonly setAIProviderConfig: AiConfig;
  /**
   * Site-admin only. Stores the provider's key or token, encrypted; an empty
   * value clears it. Write-only: no query returns it.
   */
  readonly setAIProviderCredential: AiCredentialStatus;
  /**
   * Site-admin only. Sets the retrieval candidate count (top_k) the ai service
   * pulls before ranking when answering over policy content, in the DB-backed
   * ai_config table. Pass 0 to clear the override and fall back to the
   * bootstrap default (50); the server clamps to a ceiling. A change affects
   * only jobs submitted after it. Returns the now-effective value (echoed back
   * by the ai service after clamping) so the admin UI can reflect what was
   * actually applied.
   */
  readonly setAIRetrievalConfig: AiRetrievalConfig;
  readonly setCaseDiscoveryDate: ReportCase;
  readonly setCaseStatus: ReportCase;
  readonly setCategoryCadence: NotificationSettings;
  readonly setCategoryDefaults: Category;
  /**
   * Persists governance fields on a category. idpGroupIds and exclusionGroupIds
   * are IdP group names. Pass an empty list to explicitly set "no audience" /
   * "no exclusions" (overriding any ancestor value); pass null (or omit) to leave
   * the field unchanged so an inherited value is preserved. The stored
   * per-category values (not the inherited effective values) are returned in the
   * Category response. ackEveryone is tri-state like idpGroupIds: pass true/false
   * to set this category's own value, pass null (or omit) to leave it inheriting
   * from the ancestor chain.
   */
  readonly setCategoryGovernance: Category;
  readonly setCategoryRuleset: CategoryRuleset;
  readonly setContactBlockArchived: ContactBlock;
  readonly setDefinitionArchived: DefinitionEntry;
  readonly setDigestWindow: NotificationSettings;
  readonly setEmailServiceConfig: EmailServiceConfigStatus;
  readonly setGlobalSettings: GlobalSettings;
  readonly setNotificationChannels: NotificationSettings;
  readonly setPolicyAck: Policy;
  readonly setPolicyContactBlocks: ReadonlyArray<ContactBlock>;
  readonly setPolicyDefinitionEntries: ReadonlyArray<DefinitionEntry>;
  readonly setPolicyOwner: Policy;
  readonly setPolicyReferences: ReadonlyArray<Reference>;
  readonly setPolicySensitivity: Policy;
  readonly setPolicyTemplate: Policy;
  readonly setReferenceArchived: Reference;
  readonly setRelatedPolicies: ReadonlyArray<RelatedPolicy>;
  readonly setTypeCadence: NotificationSettings;
  /**
   * Site-admin only. Sets a single user's per-day AI query limit,
   * independent of the global AI on/off toggle. Pass a value >= 1 for an
   * explicit per-day cap, 0 to clear the override so the user reverts to the
   * global default (50), or -1 for unlimited. Site-admins are always exempt from
   * AI query limits regardless of this setting. Returns the now-effective state.
   * Over-limit AI queries fail with the AI_QUOTA_EXCEEDED error code.
   */
  readonly setUserAiQueryLimit: AiUserQueryLimit;
  readonly setUserPolicyOverride: User;
  /**
   * Deliver an approver decision to an active run. The actor is bound from
   * the signed-in user. The comment is required for APPROVE and REJECT signals
   * (the workflow service rejects empty comments with InvalidArgument).
   *
   * policyVersionId is authoritative: the decision targets that version's CURRENT
   * active approval. runId/taskId are advisory only (a cached inbox row may be
   * stale); the server ignores them for resolution. A stale click on a no-longer-
   * active approval returns FailedPrecondition ("refresh your inbox"), never a
   * raw NotFound.
   */
  readonly signalWorkflow: Scalars["Boolean"]["output"];
  readonly startDomainVerification: DomainVerification;
  readonly startImpersonation: ImpersonationSession;
  readonly stopImpersonation: Scalars["Boolean"]["output"];
  readonly submitAnonymousReport: AnonymousReportReceipt;
  /**
   * Submit whole-draft generation as an async job and return immediately with a
   * jobId. The read scope is derived at the gateway exactly as for
   * searchAndAnswer (never client-supplied); input.categoryId is an optional
   * scope hint checked the same way. Poll aiJob(jobId) for the result.
   */
  readonly submitDraftGeneration: SubmitDraftGenerationResult;
  /**
   * Submit a standalone enrichment-suggestion job and return immediately
   * with a jobId. Produces per-category proposals (related/definitions/references)
   * without regenerating the policy. Poll aiJob(jobId) and fetch the result via
   * aiJobResultContent — the suggestions ride in resultJson. Never auto-applied.
   */
  readonly submitEnrichmentSuggestions: SubmitDraftGenerationResult;
  readonly submitNamedReport: NamedReportReceipt;
  /**
   * Submit review & gap-analysis of an existing policy draft as an async job and
   * return immediately with a jobId. The read scope is derived at the gateway
   * exactly as for searchAndAnswer/submitDraftGeneration; input.categoryId is an
   * optional scope hint checked the same way. Poll aiJob(jobId) for
   * the result: a findings list (sectionKey?/severity/finding/suggestion), never
   * an edit applied to the policy.
   */
  readonly submitPolicyReview: SubmitPolicyReviewResult;
  /**
   * Submit a targeted revision of an existing policy as an async job and
   * return immediately with a jobId. instruction describes the requested
   * change in the author's own words; sections carries the CURRENT content of
   * every section so the model revises with the whole policy in context
   * rather than one region blind. Poll aiJob(jobId) for status and fetch the
   * result via aiJobResultContent, same as submitDraftGeneration/
   * submitPolicyReview — a suggestion for review, never auto-applied.
   */
  readonly submitPolicyRevision: SubmitDraftGenerationResult;
  /**
   * Start an approval saga for a policy version. The submittedBy field is bound
   * from the signed-in user; ancestorCategoryIds is the policy's category lineage leaf→root
   * so the workflow service can resolve the effective workflow without a
   * cross-service call back into policy-core.
   */
  readonly submitWorkflow: WorkflowSubmitResult;
  /**
   * Swap the active approver on a stage. Audited swap; the
   * initiator role is server-derived from the signed-in user (admin /
   * self-delegate / workflow-author). outOfEligibilityAck must be true
   * when an admin swaps in a user outside the seat's eligible pool. stageEligibleAssignees lists the users accepted without it.
   *
   * Workflow refusals relay as coded errors: extensions.code is the symbol,
   * extensions.codeNum the number, extensions.domain "workflow", and each
   * metadata key below is its own extension:
   *   SWAP_ASSIGNEE_FORBIDDEN (6002): role
   *   SWAP_REASON_REQUIRED (6004)
   *   SWAP_USERS_REQUIRED (6005)
   *   SWAP_SAME_USER (6006)
   *   SWAP_INITIATOR_ROLE_REQUIRED (6007)
   *   SWAP_ASSIGNMENT_NOT_FOUND (6008): stage, current_user_id
   *   SWAP_ASSIGNMENT_NOT_PENDING (6009): stage, current_user_id, state
   *   SWAP_ASSIGNEE_NOT_ELIGIBLE (6010): stage, stage_name, new_user_id (the
   *     refused candidate)
   *   STAGE_INDEX_OUT_OF_RANGE (6011): stage, stage_count
   *   APPROVAL_RUN_NOT_FOUND (6012): policy_version_id
   */
  readonly swapAssignee: SwapAssigneeResult;
  /**
   * Site-admin only. Makes one small call to the configured provider with the
   * stored credential and reports the outcome.
   */
  readonly testAIProvider: AiProviderTestResult;
  readonly transferRoot: User;
  readonly updateAppendix: Appendix;
  readonly updateCaseNotice: CaseNotice;
  readonly updateContactBlock: ContactBlock;
  readonly updateDefinition: DefinitionEntry;
  readonly updateIdPConnection: Organization;
  readonly updateMyProfile: User;
  readonly updateReference: Reference;
  readonly updateTemplateVersionSections: TemplateVersion;
  readonly updateUserProfile: User;
  readonly updateWorkflowDef: WorkflowDef;
  /** @deprecated Use setNotificationChannels */
  readonly upsertNotificationPref: NotificationPref;
  readonly verifyDomain: Organization;
  readonly verifyEnrollEmailOtp: Scalars["Boolean"]["output"];
  readonly webauthnRegisterBegin: WebauthnRegistration;
  readonly webauthnRegisterFinish: Scalars["Boolean"]["output"];
};

export type MutationAcceptAiDataNoticeArgs = {
  noticeVersion: Scalars["String"]["input"];
};

export type MutationActivateOrganizationArgs = {
  domain: Scalars["String"]["input"];
};

export type MutationAddAppendixArgs = {
  contentJson: Scalars["String"]["input"];
  policyVersionId: Scalars["ID"]["input"];
  title: Scalars["String"]["input"];
};

export type MutationAddCaseNoteArgs = {
  body: Scalars["String"]["input"];
  caseId: Scalars["ID"]["input"];
};

export type MutationAddCaseNoticeArgs = {
  caseId: Scalars["ID"]["input"];
  label?: InputMaybe<Scalars["String"]["input"]>;
  method?: InputMaybe<Scalars["String"]["input"]>;
  recipient: NoticeRecipient;
};

export type MutationAddGroupMappingArgs = {
  connectionId: Scalars["ID"]["input"];
  idpGroupClaimValue: Scalars["String"]["input"];
  targetGroupId: Scalars["ID"]["input"];
};

export type MutationAddOrganizationArgs = {
  input: AddOrganizationInput;
};

export type MutationAddUserToGroupArgs = {
  groupId: Scalars["ID"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationArchiveWorkflowDefArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationAssignCaseArgs = {
  assigneeUserId?: InputMaybe<Scalars["ID"]["input"]>;
  caseId: Scalars["ID"]["input"];
};

export type MutationBreakGlassRevealArgs = {
  policyId: Scalars["ID"]["input"];
  reason: Scalars["String"]["input"];
};

export type MutationBulkDecideArgs = {
  input: BulkDecideInput;
};

export type MutationChangeOrgProtocolArgs = {
  config?: InputMaybe<ReadonlyArray<KeyValueInput>>;
  domain: Scalars["String"]["input"];
  protocol: Scalars["String"]["input"];
  secretRef?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationCheckReportArgs = {
  caseCode: Scalars["String"]["input"];
  passphrase: Scalars["String"]["input"];
};

export type MutationCloseCaseArgs = {
  caseId: Scalars["ID"]["input"];
  closingMessage?: InputMaybe<Scalars["String"]["input"]>;
  correctiveActions?: InputMaybe<ReadonlyArray<CorrectiveActionInput>>;
  outcome: CaseOutcome;
};

export type MutationCompleteOnboardingArgs = {
  acceptTerms: Scalars["Boolean"]["input"];
  email?: InputMaybe<Scalars["String"]["input"]>;
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  username?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationCreateCategoryArgs = {
  name: Scalars["String"]["input"];
  parentId?: InputMaybe<Scalars["ID"]["input"]>;
  slug: Scalars["String"]["input"];
};

export type MutationCreateContactBlockArgs = {
  block: ContactBlockInput;
};

export type MutationCreateDefinitionArgs = {
  input: DefinitionEntryInput;
};

export type MutationCreateLocalUserArgs = {
  email: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  username: Scalars["String"]["input"];
};

export type MutationCreateMagicLinkArgs = {
  policyVersionId: Scalars["ID"]["input"];
  sensitive: Scalars["Boolean"]["input"];
};

export type MutationCreatePolicyArgs = {
  documentType?: InputMaybe<DocumentType>;
  homeCategoryId: Scalars["ID"]["input"];
  sensitivity: Sensitivity;
  templateId?: InputMaybe<Scalars["ID"]["input"]>;
  title: Scalars["String"]["input"];
};

export type MutationCreateReferenceArgs = {
  input: ReferenceInput;
};

export type MutationCreateTemplateArgs = {
  name: Scalars["String"]["input"];
  ownerCategoryId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type MutationCreateTemplateVersionArgs = {
  sections: ReadonlyArray<SectionInput>;
  templateId: Scalars["ID"]["input"];
};

export type MutationCreateWorkflowDefArgs = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  stages: ReadonlyArray<WorkflowStageInput>;
};

export type MutationDeleteAppendixArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteCategoryArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteContactBlockArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteDefinitionArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteGroupMappingArgs = {
  mappingId: Scalars["ID"]["input"];
};

export type MutationDeleteOrganizationArgs = {
  domain: Scalars["String"]["input"];
};

export type MutationDeletePolicyArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteReferenceArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteTemplateArgs = {
  id: Scalars["ID"]["input"];
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

export type MutationDiscardTemplateVersionArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationEnableUserArgs = {
  userId: Scalars["ID"]["input"];
};

export type MutationEnrollTotpConfirmArgs = {
  code: Scalars["String"]["input"];
};

export type MutationGrantGroupManagerArgs = {
  groupId: Scalars["ID"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationGrantRoleArgs = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  role: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationIssueCollabTokenArgs = {
  input: IssueCollabTokenInput;
};

export type MutationMergeAccountsArgs = {
  confirmPrivileged?: InputMaybe<Scalars["Boolean"]["input"]>;
  idempotencyKey?: InputMaybe<Scalars["String"]["input"]>;
  sourceUserId: Scalars["ID"]["input"];
  targetUserId: Scalars["ID"]["input"];
};

export type MutationMoveCategoryArgs = {
  categoryId: Scalars["ID"]["input"];
  newParentId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type MutationMovePolicyArgs = {
  homeCategoryId: Scalars["ID"]["input"];
  policyId: Scalars["ID"]["input"];
};

export type MutationPostCaseMessageArgs = {
  body: Scalars["String"]["input"];
  caseId: Scalars["ID"]["input"];
};

export type MutationPublishDraftArgs = {
  policyId: Scalars["ID"]["input"];
};

export type MutationPublishTemplateVersionArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationReassignUserPoliciesArgs = {
  fromUserId: Scalars["ID"]["input"];
  toUserId: Scalars["ID"]["input"];
};

export type MutationRecordAckArgs = {
  policyVersionId: Scalars["ID"]["input"];
};

export type MutationRecordRiskAssessmentArgs = {
  caseId: Scalars["ID"]["input"];
  decision: BreachDecision;
  factors: RiskFactorsInput;
  reason: Scalars["String"]["input"];
};

export type MutationRecordViewArgs = {
  policyVersionId: Scalars["ID"]["input"];
};

export type MutationReindexPolicyArgs = {
  policyId: Scalars["ID"]["input"];
};

export type MutationReindexPolicyVersionArgs = {
  policyVersionId: Scalars["ID"]["input"];
};

export type MutationRemoveFactorArgs = {
  kind: Scalars["String"]["input"];
};

export type MutationRemoveUserFromGroupArgs = {
  groupId: Scalars["ID"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationRemoveUserMfaFactorArgs = {
  methodId: Scalars["ID"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationRemoveWebauthnCredentialArgs = {
  credentialId: Scalars["ID"]["input"];
};

export type MutationRenameCategoryArgs = {
  id: Scalars["ID"]["input"];
  name: Scalars["String"]["input"];
  slug: Scalars["String"]["input"];
};

export type MutationRenameMfaMethodArgs = {
  label: Scalars["String"]["input"];
  methodId: Scalars["ID"]["input"];
};

export type MutationRenamePolicyArgs = {
  newTitle: Scalars["String"]["input"];
  policyId: Scalars["ID"]["input"];
};

export type MutationRenameTemplateArgs = {
  id: Scalars["ID"]["input"];
  name: Scalars["String"]["input"];
};

export type MutationRenameUserMfaFactorArgs = {
  label: Scalars["String"]["input"];
  methodId: Scalars["ID"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationReorderAppendicesArgs = {
  orderedIds: ReadonlyArray<Scalars["ID"]["input"]>;
  policyVersionId: Scalars["ID"]["input"];
};

export type MutationReplyToMyReportArgs = {
  body: Scalars["String"]["input"];
  caseId: Scalars["ID"]["input"];
};

export type MutationReplyToReportArgs = {
  body: Scalars["String"]["input"];
  caseCode: Scalars["String"]["input"];
  passphrase: Scalars["String"]["input"];
};

export type MutationRequestPdfExportArgs = {
  policyVersionId: Scalars["ID"]["input"];
};

export type MutationResendWelcomeEmailArgs = {
  userId: Scalars["ID"]["input"];
};

export type MutationResetUserPasswordArgs = {
  newPassword: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationRetirePolicyArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRetireTemplateArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRevokeGroupManagerArgs = {
  groupId: Scalars["ID"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationRevokeMagicLinkArgs = {
  token: Scalars["String"]["input"];
};

export type MutationRevokeRoleArgs = {
  category?: InputMaybe<Scalars["String"]["input"]>;
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

export type MutationSetAiEnabledArgs = {
  enabled: Scalars["Boolean"]["input"];
};

export type MutationSetAiProviderConfigArgs = {
  input: AiProviderConfigInput;
};

export type MutationSetAiProviderCredentialArgs = {
  credential: Scalars["String"]["input"];
};

export type MutationSetAiRetrievalConfigArgs = {
  topK: Scalars["Int"]["input"];
};

export type MutationSetCaseDiscoveryDateArgs = {
  caseId: Scalars["ID"]["input"];
  discoveredOn: Scalars["String"]["input"];
};

export type MutationSetCaseStatusArgs = {
  caseId: Scalars["ID"]["input"];
  status: CaseStatus;
};

export type MutationSetCategoryCadenceArgs = {
  cadence: NotifCadence;
  category: NotifCategory;
};

export type MutationSetCategoryDefaultsArgs = {
  defaultTemplateId?: InputMaybe<Scalars["ID"]["input"]>;
  defaultTemplateNone?: InputMaybe<Scalars["Boolean"]["input"]>;
  defaultWorkflowId?: InputMaybe<Scalars["ID"]["input"]>;
  id: Scalars["ID"]["input"];
};

export type MutationSetCategoryGovernanceArgs = {
  ackEveryone?: InputMaybe<Scalars["Boolean"]["input"]>;
  ackTriggers: AckTrigger;
  exclusionGroupIds?: InputMaybe<ReadonlyArray<Scalars["String"]["input"]>>;
  id: Scalars["ID"]["input"];
  idpGroupIds?: InputMaybe<ReadonlyArray<Scalars["String"]["input"]>>;
  owners: ReadonlyArray<Scalars["ID"]["input"]>;
  reviewCadence: ReviewCadence;
  reviewDate?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationSetCategoryRulesetArgs = {
  categoryId: Scalars["ID"]["input"];
  rules: ReadonlyArray<RaciRuleInput>;
};

export type MutationSetContactBlockArchivedArgs = {
  archived: Scalars["Boolean"]["input"];
  id: Scalars["ID"]["input"];
};

export type MutationSetDefinitionArchivedArgs = {
  archived: Scalars["Boolean"]["input"];
  id: Scalars["ID"]["input"];
};

export type MutationSetDigestWindowArgs = {
  dailyHour: Scalars["Int"]["input"];
  weeklyDow: Scalars["Int"]["input"];
};

export type MutationSetEmailServiceConfigArgs = {
  input: EmailServiceConfigInput;
};

export type MutationSetGlobalSettingsArgs = {
  input: GlobalSettingsInput;
};

export type MutationSetNotificationChannelsArgs = {
  input: NotificationPrefInput;
};

export type MutationSetPolicyAckArgs = {
  ackAudienceOverride?: InputMaybe<ReadonlyArray<Scalars["ID"]["input"]>>;
  ackTriggers?: InputMaybe<AckTrigger>;
  policyId: Scalars["ID"]["input"];
};

export type MutationSetPolicyContactBlocksArgs = {
  contactBlockIds: ReadonlyArray<Scalars["ID"]["input"]>;
  policyId: Scalars["ID"]["input"];
};

export type MutationSetPolicyDefinitionEntriesArgs = {
  definitionIds: ReadonlyArray<Scalars["ID"]["input"]>;
  policyId: Scalars["ID"]["input"];
};

export type MutationSetPolicyOwnerArgs = {
  ownerUserId: Scalars["ID"]["input"];
  policyId: Scalars["ID"]["input"];
};

export type MutationSetPolicyReferencesArgs = {
  policyId: Scalars["ID"]["input"];
  referenceIds: ReadonlyArray<Scalars["ID"]["input"]>;
};

export type MutationSetPolicySensitivityArgs = {
  policyId: Scalars["ID"]["input"];
  sensitivity: Sensitivity;
};

export type MutationSetPolicyTemplateArgs = {
  none: Scalars["Boolean"]["input"];
  policyId: Scalars["ID"]["input"];
  templateId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type MutationSetReferenceArchivedArgs = {
  archived: Scalars["Boolean"]["input"];
  id: Scalars["ID"]["input"];
};

export type MutationSetRelatedPoliciesArgs = {
  policyId: Scalars["ID"]["input"];
  relatedPolicyIds: ReadonlyArray<Scalars["ID"]["input"]>;
};

export type MutationSetTypeCadenceArgs = {
  cadence: NotifCadence;
  kind: Scalars["String"]["input"];
};

export type MutationSetUserAiQueryLimitArgs = {
  limit: Scalars["Int"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationSetUserPolicyOverrideArgs = {
  effect?: InputMaybe<OverrideEffect>;
  policyNumber: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationSignalWorkflowArgs = {
  comment: Scalars["String"]["input"];
  policyVersionId: Scalars["ID"]["input"];
  runId: Scalars["ID"]["input"];
  signal: SignalType;
  taskId: Scalars["ID"]["input"];
};

export type MutationStartDomainVerificationArgs = {
  domain: Scalars["String"]["input"];
  rotate?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MutationStartImpersonationArgs = {
  reason: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationSubmitAnonymousReportArgs = {
  attachments?: InputMaybe<ReadonlyArray<ReportAttachmentInput>>;
  details: ReportDetailsInput;
  passphrase: Scalars["String"]["input"];
};

export type MutationSubmitDraftGenerationArgs = {
  input: SubmitDraftGenerationInput;
};

export type MutationSubmitEnrichmentSuggestionsArgs = {
  input: SubmitEnrichmentSuggestionsInput;
};

export type MutationSubmitNamedReportArgs = {
  attachments?: InputMaybe<ReadonlyArray<ReportAttachmentInput>>;
  details: ReportDetailsInput;
};

export type MutationSubmitPolicyReviewArgs = {
  input: SubmitPolicyReviewInput;
};

export type MutationSubmitPolicyRevisionArgs = {
  input: SubmitPolicyRevisionInput;
};

export type MutationSubmitWorkflowArgs = {
  ancestorCategoryIds: ReadonlyArray<Scalars["ID"]["input"]>;
  categoryId: Scalars["ID"]["input"];
  policyId: Scalars["ID"]["input"];
  policyVersionId: Scalars["ID"]["input"];
};

export type MutationSwapAssigneeArgs = {
  input: SwapAssigneeInput;
};

export type MutationTransferRootArgs = {
  otp: Scalars["String"]["input"];
  toUserId: Scalars["ID"]["input"];
};

export type MutationUpdateAppendixArgs = {
  contentJson: Scalars["String"]["input"];
  id: Scalars["ID"]["input"];
  title: Scalars["String"]["input"];
};

export type MutationUpdateCaseNoticeArgs = {
  caseId: Scalars["ID"]["input"];
  noticeId: Scalars["ID"]["input"];
  sentOn?: InputMaybe<Scalars["String"]["input"]>;
  status: NoticeStatus;
};

export type MutationUpdateContactBlockArgs = {
  block: ContactBlockInput;
  id: Scalars["ID"]["input"];
};

export type MutationUpdateDefinitionArgs = {
  id: Scalars["ID"]["input"];
  input: DefinitionEntryInput;
};

export type MutationUpdateIdPConnectionArgs = {
  allowLocal?: InputMaybe<Scalars["Boolean"]["input"]>;
  domain: Scalars["String"]["input"];
  jitEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MutationUpdateMyProfileArgs = {
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  locale?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationUpdateReferenceArgs = {
  id: Scalars["ID"]["input"];
  input: ReferenceInput;
};

export type MutationUpdateTemplateVersionSectionsArgs = {
  id: Scalars["ID"]["input"];
  sections: ReadonlyArray<SectionInput>;
};

export type MutationUpdateUserProfileArgs = {
  email: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationUpdateWorkflowDefArgs = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
  name: Scalars["String"]["input"];
  stages: ReadonlyArray<WorkflowStageInput>;
};

export type MutationUpsertNotificationPrefArgs = {
  input: NotificationPrefInput;
};

export type MutationVerifyDomainArgs = {
  domain: Scalars["String"]["input"];
};

export type MutationVerifyEnrollEmailOtpArgs = {
  code: Scalars["String"]["input"];
};

export type MutationWebauthnRegisterFinishArgs = {
  credentialJson: Scalars["String"]["input"];
  label?: InputMaybe<Scalars["String"]["input"]>;
  sessionId: Scalars["ID"]["input"];
};

export type MyReport = {
  readonly __typename?: "MyReport";
  readonly caseId: Scalars["ID"]["output"];
  readonly report: ReporterView;
};

export type NamedReportReceipt = {
  readonly __typename?: "NamedReportReceipt";
  readonly caseCode: Scalars["String"]["output"];
  readonly caseId: Scalars["ID"]["output"];
};

export enum NoticeRecipient {
  AffectedPeople = "AFFECTED_PEOPLE",
  Media = "MEDIA",
  Other = "OTHER",
  Regulator = "REGULATOR",
}

export enum NoticeStatus {
  Draft = "DRAFT",
  NotNeeded = "NOT_NEEDED",
  NotSent = "NOT_SENT",
  Sent = "SENT",
}

export enum NotifCadence {
  Daily = "DAILY",
  Immediate = "IMMEDIATE",
  Off = "OFF",
  Weekly = "WEEKLY",
}

export enum NotifCategory {
  Compliance = "COMPLIANCE",
  Informational = "INFORMATIONAL",
  Security = "SECURITY",
  Transactional = "TRANSACTIONAL",
  Workflow = "WORKFLOW",
}

export enum NotifDelivery {
  DigestPreferred = "DIGEST_PREFERRED",
  ImmediateOnly = "IMMEDIATE_ONLY",
  ImmediateOrDigest = "IMMEDIATE_OR_DIGEST",
  ReminderSchedule = "REMINDER_SCHEDULE",
}

export type NotifTypeDef = {
  readonly __typename?: "NotifTypeDef";
  readonly category: NotifCategory;
  readonly delivery: NotifDelivery;
  readonly kind: Scalars["String"]["output"];
  readonly mandatory: Scalars["Boolean"]["output"];
};

export type NotificationPref = {
  readonly __typename?: "NotificationPref";
  readonly email: Scalars["Boolean"]["output"];
  readonly inApp: Scalars["Boolean"]["output"];
  readonly push: Scalars["Boolean"]["output"];
  readonly userId: Scalars["ID"]["output"];
};

export type NotificationPrefInput = {
  readonly email: Scalars["Boolean"]["input"];
  readonly inApp: Scalars["Boolean"]["input"];
  readonly push: Scalars["Boolean"]["input"];
};

export type NotificationSettings = {
  readonly __typename?: "NotificationSettings";
  readonly categories: ReadonlyArray<CategoryPref>;
  readonly channels: NotificationPref;
  readonly digest: DigestWindow;
  readonly overrides: ReadonlyArray<TypePref>;
};

export type Obligation = {
  readonly __typename?: "Obligation";
  readonly number: Scalars["String"]["output"];
  readonly policyId: Scalars["ID"]["output"];
  readonly policyVersionId: Scalars["ID"]["output"];
  readonly title: Scalars["String"]["output"];
  readonly version: Scalars["String"]["output"];
};

export type Organization = {
  readonly __typename?: "Organization";
  readonly allowLocal: Scalars["Boolean"]["output"];
  readonly connectionAlias: Scalars["String"]["output"];
  readonly connectionId: Scalars["ID"]["output"];
  readonly displayName: Scalars["String"]["output"];
  readonly domain: Scalars["String"]["output"];
  readonly enabled: Scalars["Boolean"]["output"];
  readonly jitEnabled: Scalars["Boolean"]["output"];
  readonly orgName: Scalars["String"]["output"];
  readonly protocol: Scalars["String"]["output"];
  readonly testPassed: Scalars["Boolean"]["output"];
  readonly verified: Scalars["Boolean"]["output"];
};

export type OverdueEntry = {
  readonly __typename?: "OverdueEntry";
  readonly email: Scalars["String"]["output"];
  readonly userId: Scalars["ID"]["output"];
  readonly userName?: Maybe<Scalars["String"]["output"]>;
};

export enum OverrideEffect {
  Allow = "ALLOW",
  Deny = "DENY",
}

export type PdfDownloadLink = {
  readonly __typename?: "PDFDownloadLink";
  readonly expiresAt: Scalars["String"]["output"];
  readonly signedUrl: Scalars["String"]["output"];
};

export type PdfExportJob = {
  readonly __typename?: "PDFExportJob";
  readonly jobId: Scalars["String"]["output"];
};

export type PendingTask = {
  readonly __typename?: "PendingTask";
  readonly dueAt?: Maybe<Scalars["String"]["output"]>;
  readonly policyTitle: Scalars["String"]["output"];
  readonly policyVersionId: Scalars["ID"]["output"];
  readonly runId: Scalars["String"]["output"];
  readonly stageIndex: Scalars["Int"]["output"];
  readonly taskId: Scalars["ID"]["output"];
};

export type Policy = {
  readonly __typename?: "Policy";
  readonly ackAudienceOverride?: Maybe<ReadonlyArray<Scalars["ID"]["output"]>>;
  readonly ackTriggers?: Maybe<AckTrigger>;
  readonly createdAt?: Maybe<Scalars["String"]["output"]>;
  readonly currentDraftVersionId?: Maybe<Scalars["ID"]["output"]>;
  readonly currentPublishedVersionId?: Maybe<Scalars["ID"]["output"]>;
  readonly currentVersionNo?: Maybe<Scalars["Int"]["output"]>;
  readonly currentVersionStatus?: Maybe<Scalars["String"]["output"]>;
  readonly documentType: DocumentType;
  readonly homeCategoryId: Scalars["ID"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly number: Scalars["String"]["output"];
  readonly ownerName?: Maybe<Scalars["String"]["output"]>;
  readonly ownerUserId: Scalars["ID"]["output"];
  readonly retiredAt?: Maybe<Scalars["String"]["output"]>;
  readonly sensitivity: Sensitivity;
  readonly templateId?: Maybe<Scalars["ID"]["output"]>;
  readonly templateNone: Scalars["Boolean"]["output"];
  readonly templateUpdateAvailable: Scalars["Boolean"]["output"];
  readonly title: Scalars["String"]["output"];
  readonly updatedAt?: Maybe<Scalars["String"]["output"]>;
  readonly viewerCan: PolicyViewerCan;
};

export type PolicyDiff = {
  readonly __typename?: "PolicyDiff";
  readonly sections: ReadonlyArray<SectionDiff>;
};

export type PolicyOverride = {
  readonly __typename?: "PolicyOverride";
  readonly effect: OverrideEffect;
  readonly policyNumber: Scalars["String"]["output"];
};

export type PolicyRevisionSectionInput = {
  readonly content: Scalars["String"]["input"];
  readonly key: Scalars["String"]["input"];
  readonly order: Scalars["Int"]["input"];
  readonly title: Scalars["String"]["input"];
};

export type PolicySummaryResult = {
  readonly __typename?: "PolicySummaryResult";
  readonly generatedAt: Scalars["String"]["output"];
  readonly summaryText: Scalars["String"]["output"];
};

export type PolicyVersion = {
  readonly __typename?: "PolicyVersion";
  readonly appendices: ReadonlyArray<Appendix>;
  readonly contentJson: Scalars["String"]["output"];
  readonly createdAt?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["ID"]["output"];
  readonly policyId: Scalars["ID"]["output"];
  readonly publishedAt?: Maybe<Scalars["String"]["output"]>;
  readonly status: Scalars["String"]["output"];
  readonly templateVersionId: Scalars["ID"]["output"];
  readonly versionNo: Scalars["Int"]["output"];
};

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
  readonly ackActivity: ReadonlyArray<AckActivityDay>;
  readonly ackRoster: AckRoster;
  readonly ackStatus: AckStatus;
  /**
   * The module's provider settings (site-admin only). The credential is never
   * returned, only whether one is set and its last four characters.
   */
  readonly aiConfig: AiConfig;
  /**
   * The raw site-admin AI on/off flag, independent of ai service and provider
   * reachability (see aiHealth for the full picture) — for the admin UI to
   * show the current toggle state. DB-backed (Redis-cached).
   */
  readonly aiEnabled: Scalars["Boolean"]["output"];
  /**
   * Whether AI is usable right now for the calling user. See AIHealth's field
   * docs.
   */
  readonly aiHealth: AiHealth;
  /**
   * Poll the status of a previously submitted async AI job (see
   * submitDraftGeneration). Once phase is SUCCEEDED, the result is available
   * under resultRef (a Redis key); fetch it with aiJobResultContent. The
   * aiJobResult subscription pushes completion instead of polling.
   */
  readonly aiJob: AiJobStatus;
  /**
   * Fetch the generated content of a completed async AI job by resultRef (from
   * AIJobStatus.resultRef / AIJobResult.resultRef, set once phase=
   * AI_JOB_PHASE_SUCCEEDED). Reads the job-result envelope from Redis and
   * returns it as operation + resultJson (opaque, operation-shaped JSON — see
   * above). Errors if resultRef doesn't resolve (not yet written, or past its
   * TTL).
   */
  readonly aiJobResultContent: AiJobResultContent;
  /**
   * The current retrieval config (top_k) the ai service uses when gathering
   * policy chunks before ranking. DB-backed (Redis-cached). See
   * AIRetrievalConfig.topK for the effective-value semantics.
   */
  readonly aiRetrievalConfig: AiRetrievalConfig;
  /**
   * Append-only audit history for one stage of one policy version's approval
   * run. Workflow authorizes it (admin, auditor, the policy's author, or a current
   * or past assignee on the stage).
   */
  readonly assignmentHistory: ReadonlyArray<AssignmentHistoryEntry>;
  readonly auditLog: AuditQueryPage;
  readonly auditSegment: AuditSegment;
  readonly authoringAssist: AuthoringAssistResult;
  readonly category?: Maybe<Category>;
  readonly categoryApprovers: ReadonlyArray<User>;
  readonly categoryChildren: ReadonlyArray<Category>;
  readonly categoryRuleset: CategoryRuleset;
  readonly categoryTree: ReadonlyArray<Category>;
  readonly completionReport: CompletionReport;
  readonly contactBlocks: ReadonlyArray<ContactBlock>;
  readonly definitions: ReadonlyArray<DefinitionEntry>;
  /** Build and version facts for a bug report. Any signed-in user. */
  readonly diagnostics: Diagnostics;
  readonly diffVersions: ReadonlyArray<SectionDiff>;
  /**
   * Returns the effective (inherited) ack-audience and exclusion groups for a
   * category by applying the leaf-wins ancestor-chain rule. Use this for
   * read-only display of inherited values and for the group picker affordance
   * ("override" vs. "inherited from <ancestor>").
   */
  readonly effectiveGovernance: EffectiveGovernance;
  readonly effectiveTemplate?: Maybe<EffectiveTemplate>;
  /**
   * The approval workflow EFFECTIVE for a policy — attached to its category or
   * inherited from an ancestor up to top level. hasWorkflow=false means the policy
   * cannot be submitted for approval until an admin attaches one. The gateway
   * resolves the category lineage and delegates to the workflow service so this is
   * the same resolution Submit enforces.
   */
  readonly effectiveWorkflow: EffectiveWorkflow;
  readonly emailServiceConfig: EmailServiceConfigStatus;
  readonly exportAcks: AckExport;
  readonly globalSettings: GlobalSettings;
  readonly groupMappings: ReadonlyArray<GroupMapping>;
  readonly health: HealthStatus;
  readonly impersonationStatus?: Maybe<ImpersonationSession>;
  readonly latestTemplateVersion?: Maybe<TemplateVersion>;
  readonly listUserSessions: ReadonlyArray<Session>;
  readonly managedGroupMembers: ReadonlyArray<User>;
  readonly me: User;
  readonly myAckSummary: AckSummary;
  readonly myDrafts: ReadonlyArray<Policy>;
  readonly myFactors: ReadonlyArray<UserFactor>;
  readonly myObligations: ReadonlyArray<Obligation>;
  readonly myReport: ReporterView;
  readonly myReports: ReadonlyArray<MyReport>;
  readonly myWebauthnCredentials: ReadonlyArray<WebauthnCredentialInfo>;
  /** @deprecated Use notificationSettings.channels */
  readonly notificationPref: NotificationPref;
  readonly notificationSettings: NotificationSettings;
  readonly notificationTypeCatalog: ReadonlyArray<NotifTypeDef>;
  readonly obligatedAudienceCount: Scalars["Int"]["output"];
  readonly organization?: Maybe<Organization>;
  readonly organizations: ReadonlyArray<Organization>;
  readonly pdfDownloadLink: PdfDownloadLink;
  /**
   * Pending approval tasks awaiting the authenticated user. The approver id is
   * bound from the signed-in user and is never client-supplied.
   */
  readonly pendingTasks: ReadonlyArray<PendingTask>;
  readonly policies: ReadonlyArray<Policy>;
  readonly policiesByOwner: ReadonlyArray<Policy>;
  readonly policy?: Maybe<Policy>;
  readonly policyByNumber?: Maybe<Policy>;
  readonly policyContactBlocks: ReadonlyArray<ContactBlock>;
  readonly policyDefinitionCandidates: ReadonlyArray<DefinitionEntry>;
  readonly policyDefinitionEntries: ReadonlyArray<DefinitionEntry>;
  readonly policyDiff: PolicyDiff;
  readonly policyReferences: ReadonlyArray<Reference>;
  readonly policyVersion?: Maybe<PolicyVersion>;
  /**
   * Read a previously-stored, publish-time policy summary for a version (see
   * PolicySummaryResult), so a viewer's summary panel can read it instead of
   * regenerating on every view. Null when no summary has been stored yet for
   * that version.
   */
  readonly policyVersionSummary?: Maybe<PolicySummaryResult>;
  readonly policyVersions: ReadonlyArray<PolicyVersion>;
  readonly previewAccountMerge: AccountMergePreview;
  readonly previewUserDeletion: UserDeletionPreview;
  readonly references: ReadonlyArray<Reference>;
  readonly relatedPolicies: ReadonlyArray<RelatedPolicy>;
  readonly relatedPolicyCandidates: ReadonlyArray<Policy>;
  /**
   * AI-suggested related policies for a policy, derived from per-policy centroid
   * similarity (the mean of each policy's indexed chunk embeddings), nearest
   * first. Results are access-filtered server-side by the caller's read
   * scope — the same READ model as searchAndAnswer (standard visible to all;
   * sensitive documents only with the read-sensitive grant) — so a
   * suggestion never reveals a policy the caller cannot read. first caps the
   * number returned (default 10). Named distinctly from the author-owned
   * relatedPolicies (core explicit links) — these are AI proposals, never
   * auto-applied.
   */
  readonly relatedPolicySuggestions: ReadonlyArray<RelatedPolicySuggestion>;
  readonly renderedContent: RenderedContent;
  readonly reportAttachment: ReportAttachmentContent;
  readonly reportCase: ReportCase;
  readonly reportCases: CaseQueue;
  readonly resolveUserLabels: ReadonlyArray<UserLabel>;
  /**
   * Grounded search-and-answer over policy content. The read scope (the
   * categories the caller reads, and sensitive documents with the individual
   * read-sensitive grant) is derived at the gateway and never taken from input.
   * categoryId is an optional scope hint and, when set, must be a category the
   * caller reads (PermissionDenied otherwise).
   */
  readonly searchAndAnswer: SearchAndAnswerResult;
  readonly searchUsers: ReadonlyArray<UserLabel>;
  readonly simulateCategory: RaciDecision;
  readonly spCertificate: SpCertificate;
  readonly spCertificates: ReadonlyArray<SpCertificate>;
  /**
   * The eligible-assignee pool for one stage of a policy version's approval run:
   * the users swapAssignee accepts as newUserId without outOfEligibilityAck, in
   * workflow definition order. It comes from the same stage descriptor
   * swapAssignee checks, so a picker built on it cannot drift from the rule. The
   * pool can include users who already hold a seat on the stage
   * (workflowStatus.stageAssignees says who does), and is empty when the stage
   * names no individual approvers.
   *
   * Requires workflow.manage (template-admin, site-admin), the same gate as
   * swapAssignee: workflow does no authz on this read. Anyone else gets
   * PERMISSION_DENIED before workflow is called.
   *
   * Workflow refusals relay as coded errors (extensions.domain "workflow"):
   *   STAGE_INDEX_OUT_OF_RANGE (codeNum 6011): extensions.stage, stage_count
   *   APPROVAL_RUN_NOT_FOUND (codeNum 6012): extensions.policy_version_id
   */
  readonly stageEligibleAssignees: StageEligibleAssignees;
  readonly templateVersions: ReadonlyArray<TemplateVersion>;
  readonly templates: ReadonlyArray<Template>;
  /**
   * Usage-driven suggestions for a "Try asking" surface: the top questions
   * actually asked via searchAndAnswer, most-frequent first, ranked and
   * maintained server-side (ai owns the ask-count tracking). limit caps the
   * number returned (default 6); the result may be shorter when fewer
   * distinct questions have been asked yet.
   */
  readonly topPolicyQuestions: ReadonlyArray<Scalars["String"]["output"]>;
  /**
   * Approvals where the authenticated user is an approver on a future (not-yet-
   * reached) stage — visibility/heads-up, not yet actionable. Approver id is bound
   * from the signed-in user and is never client-supplied.
   */
  readonly upcomingApprovals: ReadonlyArray<UpcomingApproval>;
  readonly userFactors: ReadonlyArray<MfaFactor>;
  readonly users: UserPage;
  readonly verifyAuditChain: AuditChainVerification;
  /**
   * viewerIsApprover is true when the signed-in user holds RACI Approve in any
   * category (rule-granted or owner); drives the staff Approvals-section eligibility.
   */
  readonly viewerIsApprover: Scalars["Boolean"]["output"];
  readonly workflowDef?: Maybe<WorkflowDef>;
  readonly workflowDefs: ReadonlyArray<WorkflowDef>;
  /**
   * Status of the approval saga for a policy version. Returns
   * APPROVAL_STATUS_UNSPECIFIED when the workflow service has no record (the
   * policy was published without going through an approval flow).
   */
  readonly workflowStatus: WorkflowStatus;
};

export type QueryAckActivityArgs = {
  days: Scalars["Int"]["input"];
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  policyVersionId: Scalars["ID"]["input"];
};

export type QueryAckRosterArgs = {
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  policyVersionId: Scalars["ID"]["input"];
};

export type QueryAckStatusArgs = {
  policyVersionId: Scalars["ID"]["input"];
};

export type QueryAiJobArgs = {
  jobId: Scalars["ID"]["input"];
};

export type QueryAiJobResultContentArgs = {
  resultRef: Scalars["String"]["input"];
};

export type QueryAssignmentHistoryArgs = {
  policyVersionId: Scalars["ID"]["input"];
  stageIndex: Scalars["Int"]["input"];
};

export type QueryAuditLogArgs = {
  actorUserId?: InputMaybe<Scalars["ID"]["input"]>;
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
  pageToken?: InputMaybe<Scalars["String"]["input"]>;
  subject?: InputMaybe<Scalars["String"]["input"]>;
  tier?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryAuditSegmentArgs = {
  fromRecordId: Scalars["String"]["input"];
  toRecordId: Scalars["String"]["input"];
};

export type QueryAuthoringAssistArgs = {
  input: AuthoringAssistInput;
};

export type QueryCategoryArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryCategoryApproversArgs = {
  categoryId: Scalars["ID"]["input"];
};

export type QueryCategoryChildrenArgs = {
  parentId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryCategoryRulesetArgs = {
  categoryId: Scalars["ID"]["input"];
};

export type QueryCategoryTreeArgs = {
  rootId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryCompletionReportArgs = {
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  policyVersionId: Scalars["ID"]["input"];
};

export type QueryContactBlocksArgs = {
  includeArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryDefinitionsArgs = {
  categoryId?: InputMaybe<Scalars["ID"]["input"]>;
  includeArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryDiffVersionsArgs = {
  fromVersionId: Scalars["ID"]["input"];
  toVersionId: Scalars["ID"]["input"];
};

export type QueryEffectiveGovernanceArgs = {
  categoryId: Scalars["ID"]["input"];
};

export type QueryEffectiveTemplateArgs = {
  policyId: Scalars["ID"]["input"];
};

export type QueryEffectiveWorkflowArgs = {
  policyId: Scalars["ID"]["input"];
};

export type QueryExportAcksArgs = {
  format: Scalars["String"]["input"];
  policyVersionId: Scalars["ID"]["input"];
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

export type QueryManagedGroupMembersArgs = {
  groupId: Scalars["ID"]["input"];
};

export type QueryMyReportArgs = {
  caseId: Scalars["ID"]["input"];
};

export type QueryObligatedAudienceCountArgs = {
  policyId: Scalars["ID"]["input"];
};

export type QueryOrganizationArgs = {
  domain: Scalars["String"]["input"];
};

export type QueryPdfDownloadLinkArgs = {
  jobId: Scalars["ID"]["input"];
};

export type QueryPoliciesArgs = {
  categoryId: Scalars["ID"]["input"];
  documentType?: InputMaybe<DocumentType>;
  includeDescendants?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryPoliciesByOwnerArgs = {
  includeRetired?: InputMaybe<Scalars["Boolean"]["input"]>;
  userId: Scalars["ID"]["input"];
};

export type QueryPolicyArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryPolicyByNumberArgs = {
  number: Scalars["String"]["input"];
};

export type QueryPolicyContactBlocksArgs = {
  policyId: Scalars["ID"]["input"];
};

export type QueryPolicyDefinitionCandidatesArgs = {
  includeArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
  policyId: Scalars["ID"]["input"];
};

export type QueryPolicyDefinitionEntriesArgs = {
  policyId: Scalars["ID"]["input"];
};

export type QueryPolicyDiffArgs = {
  fromVersionId: Scalars["ID"]["input"];
  toVersionId: Scalars["ID"]["input"];
};

export type QueryPolicyReferencesArgs = {
  policyId: Scalars["ID"]["input"];
};

export type QueryPolicyVersionArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryPolicyVersionSummaryArgs = {
  versionId: Scalars["ID"]["input"];
};

export type QueryPolicyVersionsArgs = {
  policyId: Scalars["ID"]["input"];
};

export type QueryPreviewAccountMergeArgs = {
  sourceUserId: Scalars["ID"]["input"];
  targetUserId: Scalars["ID"]["input"];
};

export type QueryPreviewUserDeletionArgs = {
  userId: Scalars["ID"]["input"];
};

export type QueryReferencesArgs = {
  includeArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryRelatedPoliciesArgs = {
  policyId: Scalars["ID"]["input"];
};

export type QueryRelatedPolicyCandidatesArgs = {
  policyId: Scalars["ID"]["input"];
};

export type QueryRelatedPolicySuggestionsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  policyId: Scalars["ID"]["input"];
};

export type QueryRenderedContentArgs = {
  policyVersionId: Scalars["ID"]["input"];
};

export type QueryReportAttachmentArgs = {
  attachmentId: Scalars["ID"]["input"];
  caseId: Scalars["ID"]["input"];
};

export type QueryReportCaseArgs = {
  caseId: Scalars["ID"]["input"];
};

export type QueryReportCasesArgs = {
  assigneeUserId?: InputMaybe<Scalars["ID"]["input"]>;
  statuses?: InputMaybe<ReadonlyArray<CaseStatus>>;
};

export type QueryResolveUserLabelsArgs = {
  ids: ReadonlyArray<Scalars["ID"]["input"]>;
};

export type QuerySearchAndAnswerArgs = {
  categoryId?: InputMaybe<Scalars["ID"]["input"]>;
  question: Scalars["String"]["input"];
};

export type QuerySearchUsersArgs = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  query: Scalars["String"]["input"];
};

export type QuerySimulateCategoryArgs = {
  categoryId: Scalars["ID"]["input"];
  draftRules?: InputMaybe<ReadonlyArray<RaciRuleInput>>;
  userId: Scalars["ID"]["input"];
};

export type QueryStageEligibleAssigneesArgs = {
  policyVersionId: Scalars["ID"]["input"];
  stageIndex: Scalars["Int"]["input"];
};

export type QueryTemplateVersionsArgs = {
  templateId: Scalars["ID"]["input"];
};

export type QueryTemplatesArgs = {
  ownerCategoryId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryTopPolicyQuestionsArgs = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryUserFactorsArgs = {
  userId: Scalars["ID"]["input"];
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

export type QueryWorkflowDefArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryWorkflowStatusArgs = {
  policyVersionId: Scalars["ID"]["input"];
};

export type RaciDecision = {
  readonly __typename?: "RaciDecision";
  readonly ack: Scalars["Boolean"]["output"];
  readonly ackReason: Scalars["String"]["output"];
  readonly approve: Scalars["Boolean"]["output"];
  readonly approveReason: Scalars["String"]["output"];
  readonly author: Scalars["Boolean"]["output"];
  readonly authorReason: Scalars["String"]["output"];
  readonly read: Scalars["Boolean"]["output"];
  readonly readReason: Scalars["String"]["output"];
};

export enum RaciGrant {
  Allow = "ALLOW",
  Blank = "BLANK",
  Deny = "DENY",
}

export type RaciRule = {
  readonly __typename?: "RaciRule";
  readonly ack: RaciGrant;
  readonly approve: RaciGrant;
  readonly author: RaciGrant;
  readonly read: RaciGrant;
  readonly subjectKind: RaciSubjectKind;
  readonly subjectRef: Scalars["String"]["output"];
};

export type RaciRuleInput = {
  readonly ack: RaciGrant;
  readonly approve: RaciGrant;
  readonly author: RaciGrant;
  readonly read: RaciGrant;
  readonly subjectKind: RaciSubjectKind;
  readonly subjectRef: Scalars["String"]["input"];
};

export enum RaciSubjectKind {
  Everyone = "EVERYONE",
  Group = "GROUP",
  User = "USER",
}

export type ReassignUserPoliciesResult = {
  readonly __typename?: "ReassignUserPoliciesResult";
  readonly reassignedAuthorGrants: Scalars["Int"]["output"];
  readonly reassignedOwnerCount: Scalars["Int"]["output"];
  readonly reassignedPolicyIds: ReadonlyArray<Scalars["ID"]["output"]>;
};

export type Reference = {
  readonly __typename?: "Reference";
  readonly archived: Scalars["Boolean"]["output"];
  readonly body?: Maybe<Scalars["String"]["output"]>;
  readonly clause?: Maybe<Scalars["String"]["output"]>;
  readonly createdByUserId?: Maybe<Scalars["ID"]["output"]>;
  readonly id: Scalars["ID"]["output"];
  readonly kind: ReferenceKind;
  readonly label: Scalars["String"]["output"];
  readonly url?: Maybe<Scalars["String"]["output"]>;
  readonly usedByCount: Scalars["Int"]["output"];
};

export type ReferenceDocumentInput = {
  readonly content: Scalars["String"]["input"];
  readonly title: Scalars["String"]["input"];
};

export type ReferenceInput = {
  readonly body?: InputMaybe<Scalars["String"]["input"]>;
  readonly clause?: InputMaybe<Scalars["String"]["input"]>;
  readonly kind: ReferenceKind;
  readonly label: Scalars["String"]["input"];
  readonly url?: InputMaybe<Scalars["String"]["input"]>;
};

export enum ReferenceKind {
  Link = "LINK",
  Standard = "STANDARD",
  Text = "TEXT",
}

export type ReindexResult = {
  readonly __typename?: "ReindexResult";
  readonly removedPrior: Scalars["Int"]["output"];
  readonly sections: Scalars["Int"]["output"];
  readonly versionId: Scalars["ID"]["output"];
};

export type RelatedPolicy = {
  readonly __typename?: "RelatedPolicy";
  readonly number: Scalars["String"]["output"];
  readonly policyId: Scalars["ID"]["output"];
  readonly title: Scalars["String"]["output"];
};

export type RelatedPolicySuggestion = {
  readonly __typename?: "RelatedPolicySuggestion";
  readonly categoryId: Scalars["ID"]["output"];
  /** Cosine distance between the two policies' centroids; lower is more related. */
  readonly distance: Scalars["Float"]["output"];
  readonly policyId: Scalars["ID"]["output"];
  readonly policyTitle: Scalars["String"]["output"];
  readonly versionNo: Scalars["Int"]["output"];
};

export type RenamePolicyResult = {
  readonly __typename?: "RenamePolicyResult";
  readonly draftVersionId?: Maybe<Scalars["ID"]["output"]>;
  readonly policy: Policy;
  readonly staged: Scalars["Boolean"]["output"];
};

export type RenderedContent = {
  readonly __typename?: "RenderedContent";
  readonly html: Scalars["String"]["output"];
};

export enum ReportAnswer {
  No = "NO",
  NotSure = "NOT_SURE",
  Yes = "YES",
}

export type ReportAttachment = {
  readonly __typename?: "ReportAttachment";
  readonly contentType: Scalars["String"]["output"];
  readonly filename: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly metadataStripped: Scalars["Boolean"]["output"];
  readonly sizeBytes: Scalars["Int"]["output"];
};

export type ReportAttachmentContent = {
  readonly __typename?: "ReportAttachmentContent";
  readonly attachment: ReportAttachment;
  readonly data: Scalars["String"]["output"];
};

export type ReportAttachmentInput = {
  readonly contentType: Scalars["String"]["input"];
  readonly data: Scalars["String"]["input"];
  readonly filename: Scalars["String"]["input"];
};

export type ReportCase = {
  readonly __typename?: "ReportCase";
  readonly assessment?: Maybe<RiskAssessment>;
  readonly assigneeUserId?: Maybe<Scalars["ID"]["output"]>;
  readonly attachments: ReadonlyArray<ReportAttachment>;
  readonly caseCode: Scalars["String"]["output"];
  readonly closedAt?: Maybe<Scalars["String"]["output"]>;
  readonly correctiveActions: ReadonlyArray<CorrectiveAction>;
  readonly details: ReportDetails;
  readonly discoveredOn?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["ID"]["output"];
  readonly kind: ReportKind;
  readonly notes: ReadonlyArray<CaseNote>;
  readonly notices: ReadonlyArray<CaseNotice>;
  readonly outcome?: Maybe<CaseOutcome>;
  readonly receivedAt: Scalars["String"]["output"];
  readonly reporterUserId?: Maybe<Scalars["ID"]["output"]>;
  readonly status: CaseStatus;
  readonly thread: ReadonlyArray<ThreadMessage>;
};

export type ReportDetails = {
  readonly __typename?: "ReportDetails";
  readonly informationKinds: ReadonlyArray<InformationKind>;
  readonly location: Scalars["String"]["output"];
  readonly occurred: Scalars["String"]["output"];
  readonly stillHappening?: Maybe<ReportAnswer>;
  readonly whatHappened: Scalars["String"]["output"];
};

export type ReportDetailsInput = {
  readonly informationKinds?: InputMaybe<ReadonlyArray<InformationKind>>;
  readonly location?: InputMaybe<Scalars["String"]["input"]>;
  readonly occurred?: InputMaybe<Scalars["String"]["input"]>;
  readonly stillHappening?: InputMaybe<ReportAnswer>;
  readonly whatHappened: Scalars["String"]["input"];
};

export enum ReportKind {
  Anonymous = "ANONYMOUS",
  Named = "NAMED",
}

export type ReporterView = {
  readonly __typename?: "ReporterView";
  readonly caseCode: Scalars["String"]["output"];
  readonly details: ReportDetails;
  readonly receivedAt: Scalars["String"]["output"];
  readonly status: CaseStatus;
  readonly thread: ReadonlyArray<ThreadMessage>;
};

export enum ReviewCadence {
  Annual = "ANNUAL",
  Biennial = "BIENNIAL",
  None = "NONE",
  OnDate = "ON_DATE",
}

export type RiskAssessment = {
  readonly __typename?: "RiskAssessment";
  readonly decidedAt: Scalars["String"]["output"];
  readonly decidedByUserId: Scalars["ID"]["output"];
  readonly decision?: Maybe<BreachDecision>;
  readonly factors: RiskFactors;
  readonly reason: Scalars["String"]["output"];
  readonly suggestion?: Maybe<RiskSuggestion>;
};

export type RiskFactors = {
  readonly __typename?: "RiskFactors";
  readonly information: ReadonlyArray<InformationKind>;
  readonly mitigation?: Maybe<RiskMitigation>;
  readonly recipient?: Maybe<RiskRecipient>;
  readonly viewed?: Maybe<RiskViewed>;
};

export type RiskFactorsInput = {
  readonly information: ReadonlyArray<InformationKind>;
  readonly mitigation: RiskMitigation;
  readonly recipient: RiskRecipient;
  readonly viewed: RiskViewed;
};

export enum RiskMitigation {
  Fully = "FULLY",
  NotAtAll = "NOT_AT_ALL",
  Partly = "PARTLY",
}

export enum RiskRecipient {
  AnotherOrganisation = "ANOTHER_ORGANISATION",
  StaffOnly = "STAFF_ONLY",
  UnknownPeople = "UNKNOWN_PEOPLE",
}

export enum RiskSuggestion {
  LowProbabilityOfCompromise = "LOW_PROBABILITY_OF_COMPROMISE",
  NotificationLikelyRequired = "NOTIFICATION_LIKELY_REQUIRED",
}

export enum RiskViewed {
  No = "NO",
  Probably = "PROBABLY",
  Yes = "YES",
}

export type RoleScopes = {
  readonly __typename?: "RoleScopes";
  readonly approver: ReadonlyArray<Scalars["String"]["output"]>;
  readonly author: ReadonlyArray<Scalars["String"]["output"]>;
};

export type SearchAndAnswerResult = {
  readonly __typename?: "SearchAndAnswerResult";
  readonly answer: Scalars["String"]["output"];
  readonly citations: ReadonlyArray<AiCitation>;
  readonly hasSensitiveSource: Scalars["Boolean"]["output"];
  readonly noAuthorizedSource: Scalars["Boolean"]["output"];
  readonly segments: ReadonlyArray<AnswerSegment>;
};

export type Section = {
  readonly __typename?: "Section";
  readonly blocks: ReadonlyArray<Block>;
  readonly key: Scalars["String"]["output"];
  readonly level: Scalars["Int"]["output"];
  readonly order: Scalars["Int"]["output"];
  readonly required: Scalars["Boolean"]["output"];
  readonly title: Scalars["String"]["output"];
};

export type SectionDiff = {
  readonly __typename?: "SectionDiff";
  readonly changeType: Scalars["String"]["output"];
  readonly isBoilerplate: Scalars["Boolean"]["output"];
  readonly sectionKey: Scalars["String"]["output"];
  readonly sectionTitle: Scalars["String"]["output"];
  readonly wordDiffHtml?: Maybe<Scalars["String"]["output"]>;
};

export type SectionInput = {
  readonly blocks: ReadonlyArray<BlockInput>;
  readonly key: Scalars["String"]["input"];
  readonly level?: InputMaybe<Scalars["Int"]["input"]>;
  readonly order: Scalars["Int"]["input"];
  readonly required?: InputMaybe<Scalars["Boolean"]["input"]>;
  readonly title: Scalars["String"]["input"];
};

export type SegmentSource = {
  readonly __typename?: "SegmentSource";
  readonly chunkId: Scalars["ID"]["output"];
  readonly chunkIndex: Scalars["Int"]["output"];
  readonly policyId: Scalars["ID"]["output"];
  readonly sectionKey: Scalars["String"]["output"];
  readonly versionId: Scalars["ID"]["output"];
};

export enum Sensitivity {
  Sensitive = "SENSITIVE",
  Standard = "STANDARD",
}

export type Session = {
  readonly __typename?: "Session";
  readonly active: Scalars["Boolean"]["output"];
  readonly authenticatedAt: Scalars["String"]["output"];
  readonly clientIp?: Maybe<Scalars["String"]["output"]>;
  readonly expiresAt: Scalars["String"]["output"];
  readonly issuedAt: Scalars["String"]["output"];
  readonly sessionId: Scalars["ID"]["output"];
  readonly userAgent: Scalars["String"]["output"];
  readonly userId: Scalars["ID"]["output"];
};

export enum SignalType {
  SignalTypeApprove = "SIGNAL_TYPE_APPROVE",
  SignalTypeReject = "SIGNAL_TYPE_REJECT",
  SignalTypeRequestChanges = "SIGNAL_TYPE_REQUEST_CHANGES",
  SignalTypeRetire = "SIGNAL_TYPE_RETIRE",
  SignalTypeUnspecified = "SIGNAL_TYPE_UNSPECIFIED",
  SignalTypeWithdraw = "SIGNAL_TYPE_WITHDRAW",
}

export type SpCertificate = {
  readonly __typename?: "SpCertificate";
  readonly active: Scalars["Boolean"]["output"];
  readonly certPem: Scalars["String"]["output"];
  readonly notAfter: Scalars["String"]["output"];
  readonly serial: Scalars["String"]["output"];
  readonly spMetadataXml: Scalars["String"]["output"];
};

export type StageAssignee = {
  readonly __typename?: "StageAssignee";
  readonly comment?: Maybe<Scalars["String"]["output"]>;
  readonly decidedAt?: Maybe<Scalars["String"]["output"]>;
  readonly groupId?: Maybe<Scalars["ID"]["output"]>;
  readonly name?: Maybe<Scalars["String"]["output"]>;
  readonly state: Scalars["String"]["output"];
  readonly userId: Scalars["String"]["output"];
};

export type StageEligibleAssignees = {
  readonly __typename?: "StageEligibleAssignees";
  readonly assignees: ReadonlyArray<UserLabel>;
  readonly stageIndex: Scalars["Int"]["output"];
  readonly stageName: Scalars["String"]["output"];
};

export type StageUnitProgress = {
  readonly __typename?: "StageUnitProgress";
  readonly approvals: Scalars["Int"]["output"];
  readonly groupId: Scalars["String"]["output"];
  readonly groupName?: Maybe<Scalars["String"]["output"]>;
  readonly pending: Scalars["Int"]["output"];
  readonly quorum: Scalars["String"]["output"];
  readonly required: Scalars["Int"]["output"];
  readonly roster: Scalars["Int"]["output"];
  readonly status: Scalars["String"]["output"];
};

export type SubmitDraftGenerationInput = {
  readonly brief: Scalars["String"]["input"];
  readonly categoryId?: InputMaybe<Scalars["ID"]["input"]>;
  readonly enrichmentOptOut?: InputMaybe<EnrichmentOptOutInput>;
  readonly referenceDocuments?: InputMaybe<ReadonlyArray<ReferenceDocumentInput>>;
  readonly referenceHints?: InputMaybe<ReadonlyArray<Scalars["String"]["input"]>>;
  readonly sections: ReadonlyArray<SubmitDraftGenerationSectionInput>;
  readonly title?: InputMaybe<Scalars["String"]["input"]>;
};

export type SubmitDraftGenerationResult = {
  readonly __typename?: "SubmitDraftGenerationResult";
  readonly jobId: Scalars["ID"]["output"];
};

export type SubmitDraftGenerationSectionInput = {
  readonly guidance?: InputMaybe<Scalars["String"]["input"]>;
  readonly key: Scalars["String"]["input"];
  readonly order: Scalars["Int"]["input"];
  readonly title: Scalars["String"]["input"];
};

export type SubmitEnrichmentSuggestionsInput = {
  readonly categoryId?: InputMaybe<Scalars["ID"]["input"]>;
  readonly enrichmentOptOut?: InputMaybe<EnrichmentOptOutInput>;
  readonly policyId: Scalars["ID"]["input"];
  readonly sections: ReadonlyArray<SubmitEnrichmentSuggestionsSectionInput>;
  readonly title?: InputMaybe<Scalars["String"]["input"]>;
  readonly versionId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type SubmitEnrichmentSuggestionsSectionInput = {
  readonly content: Scalars["String"]["input"];
  readonly key: Scalars["String"]["input"];
  readonly title: Scalars["String"]["input"];
};

export type SubmitPolicyReviewInput = {
  readonly categoryId?: InputMaybe<Scalars["ID"]["input"]>;
  readonly enrichmentOptOut?: InputMaybe<EnrichmentOptOutInput>;
  readonly policyId: Scalars["ID"]["input"];
  readonly relatedPolicyRefs?: InputMaybe<ReadonlyArray<Scalars["String"]["input"]>>;
  readonly sections: ReadonlyArray<SubmitPolicyReviewSectionInput>;
  readonly standardsRefs?: InputMaybe<ReadonlyArray<Scalars["String"]["input"]>>;
  readonly title?: InputMaybe<Scalars["String"]["input"]>;
  readonly versionId: Scalars["ID"]["input"];
};

export type SubmitPolicyReviewResult = {
  readonly __typename?: "SubmitPolicyReviewResult";
  readonly jobId: Scalars["ID"]["output"];
};

export type SubmitPolicyReviewSectionInput = {
  readonly content: Scalars["String"]["input"];
  readonly key: Scalars["String"]["input"];
  readonly title: Scalars["String"]["input"];
};

export type SubmitPolicyRevisionInput = {
  readonly enrichmentOptOut?: InputMaybe<EnrichmentOptOutInput>;
  readonly instruction: Scalars["String"]["input"];
  readonly policyId: Scalars["ID"]["input"];
  readonly sections: ReadonlyArray<PolicyRevisionSectionInput>;
  readonly versionId: Scalars["ID"]["input"];
};

export type Subscription = {
  readonly __typename?: "Subscription";
  /**
   * Streams the terminal result of a single async AI job to its submitter. The
   * subscriber is authenticated from session claims (never from input); only the
   * job's own submitter (matched on the event's actor_user_id) receives events,
   * and only for the requested jobId — a caller cannot observe another user's
   * job. On subscribe the resolver first checks GetAIJob: if the job already
   * reached a terminal phase (the completion event fired before the client
   * subscribed) it emits that immediately, then streams any live completion, so a
   * late subscriber never misses the result. The channel closes when the terminal
   * event is delivered or the client disconnects.
   */
  readonly aiJobResult: AiJobResult;
  readonly liveEvents: LiveEvent;
};

export type SubscriptionAiJobResultArgs = {
  jobId: Scalars["ID"]["input"];
};

export type SubscriptionLiveEventsArgs = {
  topics?: InputMaybe<ReadonlyArray<Scalars["String"]["input"]>>;
};

export type SwapAssigneeInput = {
  readonly currentUserId: Scalars["ID"]["input"];
  readonly newUserId: Scalars["ID"]["input"];
  /**
   * Must be true when an admin is swapping in a user outside the seat's
   * eligible pool; the swap is audited with out_of_eligibility=true.
   */
  readonly outOfEligibilityAck?: InputMaybe<Scalars["Boolean"]["input"]>;
  readonly policyVersionId: Scalars["ID"]["input"];
  readonly reason: Scalars["String"]["input"];
  readonly stageIndex: Scalars["Int"]["input"];
};

export type SwapAssigneeResult = {
  readonly __typename?: "SwapAssigneeResult";
  readonly newAssignmentId: Scalars["ID"]["output"];
  readonly newSlaDeadlineAt: Scalars["String"]["output"];
};

export type Template = {
  readonly __typename?: "Template";
  readonly code: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly name: Scalars["String"]["output"];
  readonly ownerCategoryId?: Maybe<Scalars["ID"]["output"]>;
  readonly retiredAt?: Maybe<Scalars["String"]["output"]>;
};

export type TemplateVersion = {
  readonly __typename?: "TemplateVersion";
  readonly id: Scalars["ID"]["output"];
  readonly sections: ReadonlyArray<Section>;
  readonly status: Scalars["String"]["output"];
  readonly templateId: Scalars["ID"]["output"];
  readonly versionNo: Scalars["Int"]["output"];
};

export type ThreadMessage = {
  readonly __typename?: "ThreadMessage";
  readonly author: MessageAuthor;
  readonly body: Scalars["String"]["output"];
  readonly createdAt: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly officerUserId?: Maybe<Scalars["ID"]["output"]>;
};

export type TotpEnrollment = {
  readonly __typename?: "TotpEnrollment";
  readonly otpauthUri: Scalars["String"]["output"];
  readonly secretMasked?: Maybe<Scalars["String"]["output"]>;
};

export type TypePref = {
  readonly __typename?: "TypePref";
  readonly cadence: NotifCadence;
  readonly category: NotifCategory;
  readonly delivery: NotifDelivery;
  readonly kind: Scalars["String"]["output"];
  readonly mandatory: Scalars["Boolean"]["output"];
};

export type UpcomingApproval = {
  readonly __typename?: "UpcomingApproval";
  readonly policyTitle: Scalars["String"]["output"];
  readonly policyVersionId: Scalars["ID"]["output"];
  readonly stageIndex: Scalars["Int"]["output"];
  readonly stageName: Scalars["String"]["output"];
};

export type User = {
  readonly __typename?: "User";
  readonly deletedAt?: Maybe<Scalars["String"]["output"]>;
  readonly email: Scalars["String"]["output"];
  readonly enabled: Scalars["Boolean"]["output"];
  readonly firstName: Scalars["String"]["output"];
  readonly groupIds: ReadonlyArray<Scalars["ID"]["output"]>;
  readonly idpGroups: ReadonlyArray<Scalars["String"]["output"]>;
  readonly isRoot: Scalars["Boolean"]["output"];
  readonly lastName: Scalars["String"]["output"];
  readonly localAccount: Scalars["Boolean"]["output"];
  readonly locale: Scalars["String"]["output"];
  readonly managedGroupIds: ReadonlyArray<Scalars["ID"]["output"]>;
  readonly memberships: ReadonlyArray<GroupMembership>;
  readonly mergedIntoUserId?: Maybe<Scalars["ID"]["output"]>;
  readonly name: Scalars["String"]["output"];
  readonly needsOnboarding: Scalars["Boolean"]["output"];
  readonly permissions: ReadonlyArray<Scalars["String"]["output"]>;
  readonly policyOverrides: ReadonlyArray<PolicyOverride>;
  readonly roles: ReadonlyArray<Scalars["String"]["output"]>;
  readonly scopes: RoleScopes;
  readonly userId: Scalars["ID"]["output"];
  readonly username: Scalars["String"]["output"];
};

export type UserDeletionCounts = {
  readonly __typename?: "UserDeletionCounts";
  readonly breakGlassGrants: Scalars["Int"]["output"];
  readonly groupMemberships: Scalars["Int"]["output"];
  readonly idpGroups: Scalars["Int"]["output"];
  readonly managedGroups: Scalars["Int"]["output"];
  readonly ownedPolicies: Scalars["Int"]["output"];
  readonly pendingApprovals: Scalars["Int"]["output"];
  readonly permissions: Scalars["Int"]["output"];
  readonly policyOverrides: Scalars["Int"]["output"];
  readonly raciGrants: Scalars["Int"]["output"];
  readonly roles: Scalars["Int"]["output"];
};

export type UserDeletionPreview = {
  readonly __typename?: "UserDeletionPreview";
  readonly blocksDelete: Scalars["Boolean"]["output"];
  readonly counts: UserDeletionCounts;
  readonly items: ReadonlyArray<UserDeletionPreviewItem>;
  readonly locallyAuthenticable: Scalars["Boolean"]["output"];
  readonly userId: Scalars["ID"]["output"];
  readonly warnings: ReadonlyArray<UserDeletionWarning>;
};

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

export type UserFactor = {
  readonly __typename?: "UserFactor";
  readonly enrolledAt?: Maybe<Scalars["String"]["output"]>;
  readonly kind: Scalars["String"]["output"];
  readonly label?: Maybe<Scalars["String"]["output"]>;
};

export type UserLabel = {
  readonly __typename?: "UserLabel";
  readonly email?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["ID"]["output"];
  readonly name: Scalars["String"]["output"];
};

export type UserPage = {
  readonly __typename?: "UserPage";
  readonly nextPageToken: Scalars["String"]["output"];
  readonly users: ReadonlyArray<User>;
};

export type WebauthnCredentialInfo = {
  readonly __typename?: "WebauthnCredentialInfo";
  readonly createdAt: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly label?: Maybe<Scalars["String"]["output"]>;
  readonly lastUsedAt?: Maybe<Scalars["String"]["output"]>;
  readonly transports?: Maybe<ReadonlyArray<Scalars["String"]["output"]>>;
};

export type WebauthnRegistration = {
  readonly __typename?: "WebauthnRegistration";
  readonly optionsJson: Scalars["String"]["output"];
  readonly sessionId: Scalars["ID"]["output"];
};

export type WorkflowDef = {
  readonly __typename?: "WorkflowDef";
  readonly description?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["ID"]["output"];
  readonly name: Scalars["String"]["output"];
  readonly stages: ReadonlyArray<WorkflowStageDef>;
  readonly version: Scalars["Int"]["output"];
};

export type WorkflowStageDef = {
  readonly __typename?: "WorkflowStageDef";
  readonly approvers: ReadonlyArray<Scalars["ID"]["output"]>;
  readonly approversByCategory: ReadonlyArray<CategoryApprovers>;
  readonly groupUnits: ReadonlyArray<GroupUnit>;
  readonly id: Scalars["ID"]["output"];
  readonly name: Scalars["String"]["output"];
  readonly pinnedLast?: Maybe<Scalars["Boolean"]["output"]>;
  readonly quorum: Scalars["String"]["output"];
  readonly rejectOnSlaBreach?: Maybe<Scalars["Boolean"]["output"]>;
  readonly slaDays?: Maybe<Scalars["Int"]["output"]>;
};

export type WorkflowStageInput = {
  readonly approvers: ReadonlyArray<Scalars["ID"]["input"]>;
  readonly approversByCategory?: InputMaybe<ReadonlyArray<CategoryApproversInput>>;
  readonly groupUnits?: InputMaybe<ReadonlyArray<GroupUnitInput>>;
  readonly id?: InputMaybe<Scalars["ID"]["input"]>;
  readonly name: Scalars["String"]["input"];
  readonly pinnedLast?: InputMaybe<Scalars["Boolean"]["input"]>;
  readonly quorum: Scalars["String"]["input"];
  readonly rejectOnSlaBreach?: InputMaybe<Scalars["Boolean"]["input"]>;
  readonly slaDays?: InputMaybe<Scalars["Int"]["input"]>;
};

export type WorkflowStatus = {
  readonly __typename?: "WorkflowStatus";
  readonly currentStageIdx: Scalars["Int"]["output"];
  readonly runId: Scalars["String"]["output"];
  readonly stageAssignees: ReadonlyArray<ReadonlyArray<StageAssignee>>;
  readonly stageNames: ReadonlyArray<Scalars["String"]["output"]>;
  readonly stageUnitProgress: ReadonlyArray<ReadonlyArray<StageUnitProgress>>;
  readonly status: ApprovalStatus;
};

export type WorkflowSubmitResult = {
  readonly __typename?: "WorkflowSubmitResult";
  readonly runId: Scalars["String"]["output"];
};
