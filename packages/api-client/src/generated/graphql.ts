/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type * as Types from "./schema";

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type AckActivityQueryVariables = Exact<{
  policyVersionId: string | number;
  groupId?: string | number | null | undefined;
  days: number;
}>;

export type AckActivityQuery = {
  readonly ackActivity: ReadonlyArray<{
    readonly date: string;
    readonly acks: number;
    readonly views: number;
  }>;
};

export type AckRosterQueryVariables = Exact<{
  policyVersionId: string | number;
  groupId?: string | number | null | undefined;
}>;

export type AckRosterQuery = {
  readonly ackRoster: {
    readonly acked: ReadonlyArray<{
      readonly userId: string;
      readonly email: string;
      readonly userName: string | null;
      readonly ackedAt: string | null;
      readonly dueAt: string | null;
      readonly groups: ReadonlyArray<string>;
    }>;
    readonly pending: ReadonlyArray<{
      readonly userId: string;
      readonly email: string;
      readonly userName: string | null;
      readonly ackedAt: string | null;
      readonly dueAt: string | null;
      readonly groups: ReadonlyArray<string>;
    }>;
  };
};

export type AckStatusQueryVariables = Exact<{
  policyVersionId: string | number;
}>;

export type AckStatusQuery = {
  readonly ackStatus: { readonly acknowledged: boolean; readonly ackedAt: string | null };
};

export type ActivateOrganizationMutationVariables = Exact<{
  domain: string;
}>;

export type ActivateOrganizationMutation = {
  readonly activateOrganization: {
    readonly connectionId: string;
    readonly connectionAlias: string;
    readonly displayName: string;
    readonly domain: string;
    readonly enabled: boolean;
    readonly jitEnabled: boolean;
    readonly orgName: string;
    readonly protocol: string;
    readonly testPassed: boolean;
    readonly verified: boolean;
    readonly allowLocal: boolean;
    readonly secretReentryRequired: boolean;
  };
};

export type AddAppendixMutationVariables = Exact<{
  policyVersionId: string | number;
  title: string;
  contentJson: string;
}>;

export type AddAppendixMutation = {
  readonly addAppendix: {
    readonly id: string;
    readonly policyVersionId: string;
    readonly title: string;
    readonly contentJson: string;
    readonly orderIndex: number;
    readonly letter: string;
  };
};

export type AddCaseNoteMutationVariables = Exact<{
  caseId: string | number;
  body: string;
}>;

export type AddCaseNoteMutation = {
  readonly addCaseNote: {
    readonly id: string;
    readonly authorUserId: string;
    readonly body: string;
    readonly createdAt: string;
  };
};

export type AddCaseNoticeMutationVariables = Exact<{
  caseId: string | number;
  recipient: Types.NoticeRecipient;
  label?: string | null | undefined;
  method?: string | null | undefined;
}>;

export type AddCaseNoticeMutation = {
  readonly addCaseNotice: {
    readonly id: string;
    readonly recipient: Types.NoticeRecipient;
    readonly label: string;
    readonly method: string;
    readonly daysAllowed: number;
    readonly dueOn: string;
    readonly status: Types.NoticeStatus;
    readonly sentOn: string | null;
  };
};

export type AddGroupMappingMutationVariables = Exact<{
  connectionId: string | number;
  idpGroupClaimValue: string;
  targetGroupId: string | number;
}>;

export type AddGroupMappingMutation = {
  readonly addGroupMapping: {
    readonly connectionId: string;
    readonly id: string;
    readonly idpGroupClaimValue: string;
    readonly targetGroupId: string;
  };
};

export type AddOrganizationMutationVariables = Exact<{
  input: Types.AddOrganizationInput;
}>;

export type AddOrganizationMutation = {
  readonly addOrganization: {
    readonly connectionId: string;
    readonly connectionAlias: string;
    readonly displayName: string;
    readonly domain: string;
    readonly enabled: boolean;
    readonly jitEnabled: boolean;
    readonly orgName: string;
    readonly protocol: string;
    readonly testPassed: boolean;
    readonly verified: boolean;
    readonly allowLocal: boolean;
    readonly secretReentryRequired: boolean;
  };
};

export type AddReviewThreadMutationVariables = Exact<{
  policyVersionId: string | number;
  quote: string;
  occurrence: number;
  body: string;
  suggestedText?: string | null | undefined;
  toUserId?: string | number | null | undefined;
}>;

export type AddReviewThreadMutation = {
  readonly addReviewThread: {
    readonly id: string;
    readonly policyVersionId: string;
    readonly quote: string;
    readonly occurrence: number;
    readonly resolved: boolean;
    readonly approverUserId: string;
    readonly createdAt: string;
    readonly messages: ReadonlyArray<{
      readonly id: string;
      readonly authorUserId: string;
      readonly authorName: string | null;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly suggestion: {
      readonly text: string;
      readonly turn: Types.SuggestionSide;
      readonly outcome: Types.SuggestionOutcome | null;
      readonly reason: string | null;
      readonly closedBy: string | null;
      readonly closedText: string | null;
      readonly rounds: ReadonlyArray<{
        readonly by: Types.SuggestionSide;
        readonly text: string;
        readonly userId: string;
        readonly createdAt: string;
      }>;
    } | null;
  };
};

export type AddUserToGroupMutationVariables = Exact<{
  userId: string | number;
  groupId: string | number;
}>;

export type AddUserToGroupMutation = {
  readonly addUserToGroup: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly idpGroups: ReadonlyArray<string>;
    readonly groupIds: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
    readonly policyOverrides: ReadonlyArray<{
      readonly policyNumber: string;
      readonly effect: Types.OverrideEffect;
    }>;
    readonly memberships: ReadonlyArray<{ readonly groupId: string; readonly source: string }>;
  };
};

export type AiConfigQueryVariables = Exact<{ [key: string]: never }>;

export type AiConfigQuery = {
  readonly aiConfig: {
    readonly enabled: boolean;
    readonly provider: Types.AiProvider | null;
    readonly model: string;
    readonly credentialSet: boolean;
    readonly credentialLast4: string;
    readonly topK: number;
  };
};

export type AiHealthQueryVariables = Exact<{ [key: string]: never }>;

export type AiHealthQuery = {
  readonly aiHealth: { readonly available: boolean; readonly reason: string | null };
};

export type AiJobQueryVariables = Exact<{
  jobId: string | number;
}>;

export type AiJobQuery = {
  readonly aiJob: {
    readonly jobId: string;
    readonly phase: Types.AiJobPhase;
    readonly resultRef: string | null;
    readonly error: string | null;
  };
};

export type AiJobResultSubscriptionVariables = Exact<{
  jobId: string | number;
}>;

export type AiJobResultSubscription = {
  readonly aiJobResult: {
    readonly jobId: string;
    readonly phase: Types.AiJobPhase;
    readonly resultRef: string | null;
    readonly error: string | null;
    readonly finishedAt: string | null;
  };
};

export type AiJobResultContentQueryVariables = Exact<{
  resultRef: string;
}>;

export type AiJobResultContentQuery = {
  readonly aiJobResultContent: { readonly operation: string; readonly resultJson: string };
};

export type AppendixDiffQueryVariables = Exact<{
  id: string | number;
}>;

export type AppendixDiffQuery = {
  readonly appendixDiff: ReadonlyArray<{
    readonly sectionKey: string;
    readonly sectionTitle: string;
    readonly changeType: string;
    readonly wordDiffHtml: string | null;
  }>;
};

export type AppendixFieldsFragment = {
  readonly id: string;
  readonly policyVersionId: string;
  readonly title: string;
  readonly contentJson: string;
  readonly orderIndex: number;
  readonly letter: string;
};

export type AppendixVersionFieldsFragment = {
  readonly id: string;
  readonly versionNo: number;
  readonly state: Types.AppendixState;
  readonly title: string;
  readonly contentJson: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly publishedAt: string | null;
  readonly publishedBy: string | null;
};

export type ApproveHardResetMutationVariables = Exact<{
  requestId: string | number;
}>;

export type ApproveHardResetMutation = {
  readonly approveHardReset: {
    readonly id: string;
    readonly module: string;
    readonly reason: string;
    readonly state: string;
    readonly requestedBy: string;
    readonly requestedAt: string;
    readonly expiresAt: string;
    readonly approvedBy: string | null;
    readonly approvedAt: string | null;
    readonly approvalExpiresAt: string | null;
    readonly cancelledAt: string | null;
    readonly consumedAt: string | null;
    readonly consumedBy: string | null;
  };
};

export type ArchiveWorkflowDefMutationVariables = Exact<{
  id: string | number;
}>;

export type ArchiveWorkflowDefMutation = { readonly archiveWorkflowDef: boolean };

export type AssignCaseMutationVariables = Exact<{
  caseId: string | number;
  assigneeUserId?: string | number | null | undefined;
}>;

export type AssignCaseMutation = {
  readonly assignCase: {
    readonly id: string;
    readonly caseCode: string;
    readonly kind: Types.ReportKind;
    readonly status: Types.CaseStatus;
    readonly reporterUserId: string | null;
    readonly assigneeUserId: string | null;
    readonly receivedAt: string;
    readonly discoveredOn: string | null;
    readonly outcome: Types.CaseOutcome | null;
    readonly closedAt: string | null;
    readonly details: {
      readonly whatHappened: string;
      readonly occurred: string;
      readonly location: string;
      readonly informationKinds: ReadonlyArray<Types.InformationKind>;
      readonly stillHappening: Types.ReportAnswer | null;
    };
    readonly attachments: ReadonlyArray<{
      readonly id: string;
      readonly filename: string;
      readonly contentType: string;
      readonly sizeBytes: number;
      readonly metadataStripped: boolean;
    }>;
    readonly thread: ReadonlyArray<{
      readonly id: string;
      readonly author: Types.MessageAuthor;
      readonly officerUserId: string | null;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly notes: ReadonlyArray<{
      readonly id: string;
      readonly authorUserId: string;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly assessment: {
      readonly suggestion: Types.RiskSuggestion | null;
      readonly decision: Types.BreachDecision | null;
      readonly reason: string;
      readonly decidedByUserId: string;
      readonly decidedAt: string;
      readonly factors: {
        readonly information: ReadonlyArray<Types.InformationKind>;
        readonly recipient: Types.RiskRecipient | null;
        readonly viewed: Types.RiskViewed | null;
        readonly mitigation: Types.RiskMitigation | null;
      };
    } | null;
    readonly notices: ReadonlyArray<{
      readonly id: string;
      readonly recipient: Types.NoticeRecipient;
      readonly label: string;
      readonly method: string;
      readonly daysAllowed: number;
      readonly dueOn: string;
      readonly status: Types.NoticeStatus;
      readonly sentOn: string | null;
    }>;
    readonly correctiveActions: ReadonlyArray<{
      readonly description: string;
      readonly policyId: string | null;
    }>;
  };
};

export type AuditLogQueryVariables = Exact<{
  tier?: string | null | undefined;
  groupId?: string | number | null | undefined;
  actorUserId?: string | number | null | undefined;
  subject?: string | null | undefined;
  pageSize?: number | null | undefined;
  pageToken?: string | null | undefined;
}>;

export type AuditLogQuery = {
  readonly auditLog: {
    readonly nextPageToken: string;
    readonly records: ReadonlyArray<{
      readonly id: string;
      readonly recordUuid: string;
      readonly tier: string;
      readonly action: string;
      readonly actorUserId: string;
      readonly subject: string;
      readonly groupId: string;
      readonly occurredAt: string;
      readonly prevHash: string;
      readonly recordHash: string;
      readonly legalBasisExempt: boolean;
      readonly actorName: string | null;
      readonly groupName: string | null;
      readonly subjectLabel: string | null;
    }>;
  };
};

export type AuditRecordFieldsFragment = {
  readonly id: string;
  readonly recordUuid: string;
  readonly tier: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly subject: string;
  readonly groupId: string;
  readonly occurredAt: string;
  readonly prevHash: string;
  readonly recordHash: string;
  readonly legalBasisExempt: boolean;
  readonly actorName: string | null;
  readonly groupName: string | null;
  readonly subjectLabel: string | null;
};

export type AuthoringAssistQueryVariables = Exact<{
  input: Types.AuthoringAssistInput;
}>;

export type AuthoringAssistQuery = {
  readonly authoringAssist: { readonly suggestion: string; readonly operationId: string };
};

export type AuthoringPolicyFieldsFragment = {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly documentType: Types.DocumentType;
  readonly sensitivity: Types.Sensitivity;
  readonly ownerUserId: string;
  readonly ownerName: string | null;
  readonly homeCategoryId: string;
  readonly ackTriggers: Types.AckTrigger | null;
  readonly ackAudienceOverride: ReadonlyArray<string> | null;
  readonly templateId: string | null;
  readonly templateNone: boolean;
  readonly currentDraftVersionId: string | null;
  readonly currentPublishedVersionId: string | null;
  readonly currentVersionNo: number | null;
  readonly currentVersionStatus: string | null;
  readonly updatedAt: string | null;
  readonly retiredAt: string | null;
  readonly viewerCan: {
    readonly read: boolean;
    readonly edit: boolean;
    readonly submit: boolean;
    readonly approve: boolean;
    readonly contentObfuscated: boolean;
    readonly canBreakGlass: boolean;
    readonly ack: boolean;
    readonly manage: boolean;
  };
};

export type BreakGlassRevealMutationVariables = Exact<{
  policyId: string | number;
  reason: string;
}>;

export type BreakGlassRevealMutation = {
  readonly breakGlassReveal: { readonly grantedUntil: string };
};

export type CancelHardResetMutationVariables = Exact<{
  requestId: string | number;
}>;

export type CancelHardResetMutation = {
  readonly cancelHardReset: {
    readonly id: string;
    readonly module: string;
    readonly reason: string;
    readonly state: string;
    readonly requestedBy: string;
    readonly requestedAt: string;
    readonly expiresAt: string;
    readonly approvedBy: string | null;
    readonly approvedAt: string | null;
    readonly approvalExpiresAt: string | null;
    readonly cancelledAt: string | null;
    readonly consumedAt: string | null;
    readonly consumedBy: string | null;
  };
};

export type CategoryQueryVariables = Exact<{
  id: string | number;
}>;

export type CategoryQuery = {
  readonly category: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly idpGroupIds: ReadonlyArray<string> | null;
    readonly exclusionGroupIds: ReadonlyArray<string> | null;
    readonly ackTriggers: Types.AckTrigger;
    readonly ackEveryone: boolean;
    readonly ackEveryoneSet: boolean;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  } | null;
};

export type CategoryChildrenQueryVariables = Exact<{
  parentId?: string | number | null | undefined;
}>;

export type CategoryChildrenQuery = {
  readonly categoryChildren: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly idpGroupIds: ReadonlyArray<string> | null;
    readonly exclusionGroupIds: ReadonlyArray<string> | null;
    readonly ackTriggers: Types.AckTrigger;
    readonly ackEveryone: boolean;
    readonly ackEveryoneSet: boolean;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  }>;
};

export type CategoryDocumentCountsQueryVariables = Exact<{
  categoryId: string | number;
}>;

export type CategoryDocumentCountsQuery = {
  readonly categoryDocumentCounts: { readonly policies: number; readonly procedures: number };
};

export type CategoryDocumentTypesAllQueryVariables = Exact<{ [key: string]: never }>;

export type CategoryDocumentTypesAllQuery = {
  readonly categoryTree: ReadonlyArray<{
    readonly id: string;
    readonly documentTypes: Types.CategoryDocumentTypes;
  }>;
};

export type CategoryFieldsFragment = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly parentId: string | null;
  readonly defaultTemplateId: string | null;
  readonly defaultTemplateNone: boolean;
  readonly defaultWorkflowId: string | null;
  readonly owners: ReadonlyArray<string>;
  readonly idpGroupIds: ReadonlyArray<string> | null;
  readonly exclusionGroupIds: ReadonlyArray<string> | null;
  readonly ackTriggers: Types.AckTrigger;
  readonly ackEveryone: boolean;
  readonly ackEveryoneSet: boolean;
  readonly reviewCadence: Types.ReviewCadence;
  readonly reviewDate: string | null;
};

export type CategoryRulesetQueryVariables = Exact<{
  categoryId: string | number;
}>;

export type CategoryRulesetQuery = {
  readonly categoryRuleset: {
    readonly categoryId: string;
    readonly rules: ReadonlyArray<{
      readonly subjectKind: Types.RaciSubjectKind;
      readonly subjectRef: string;
      readonly read: Types.RaciGrant;
      readonly ack: Types.RaciGrant;
      readonly approve: Types.RaciGrant;
      readonly author: Types.RaciGrant;
      readonly manage: Types.RaciGrant;
    }>;
  };
};

export type CategoryTemplateLocksQueryVariables = Exact<{ [key: string]: never }>;

export type CategoryTemplateLocksQuery = {
  readonly categoryTree: ReadonlyArray<{
    readonly id: string;
    readonly defaultTemplateLocked: boolean;
  }>;
};

export type CategoryTreeQueryVariables = Exact<{
  rootId?: string | number | null | undefined;
}>;

export type CategoryTreeQuery = {
  readonly categoryTree: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly idpGroupIds: ReadonlyArray<string> | null;
    readonly exclusionGroupIds: ReadonlyArray<string> | null;
    readonly ackTriggers: Types.AckTrigger;
    readonly ackEveryone: boolean;
    readonly ackEveryoneSet: boolean;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  }>;
};

export type ChangeOrgProtocolMutationVariables = Exact<{
  domain: string;
  protocol: string;
  config?: ReadonlyArray<Types.KeyValueInput> | Types.KeyValueInput | null | undefined;
  secretRef?: string | null | undefined;
  clientSecret?: string | null | undefined;
}>;

export type ChangeOrgProtocolMutation = {
  readonly changeOrgProtocol: {
    readonly connectionId: string;
    readonly connectionAlias: string;
    readonly displayName: string;
    readonly domain: string;
    readonly enabled: boolean;
    readonly jitEnabled: boolean;
    readonly orgName: string;
    readonly protocol: string;
    readonly testPassed: boolean;
    readonly verified: boolean;
    readonly allowLocal: boolean;
    readonly secretReentryRequired: boolean;
  };
};

export type CloseCaseMutationVariables = Exact<{
  caseId: string | number;
  outcome: Types.CaseOutcome;
  correctiveActions?:
    | ReadonlyArray<Types.CorrectiveActionInput>
    | Types.CorrectiveActionInput
    | null
    | undefined;
  closingMessage?: string | null | undefined;
}>;

export type CloseCaseMutation = {
  readonly closeCase: {
    readonly id: string;
    readonly caseCode: string;
    readonly kind: Types.ReportKind;
    readonly status: Types.CaseStatus;
    readonly reporterUserId: string | null;
    readonly assigneeUserId: string | null;
    readonly receivedAt: string;
    readonly discoveredOn: string | null;
    readonly outcome: Types.CaseOutcome | null;
    readonly closedAt: string | null;
    readonly details: {
      readonly whatHappened: string;
      readonly occurred: string;
      readonly location: string;
      readonly informationKinds: ReadonlyArray<Types.InformationKind>;
      readonly stillHappening: Types.ReportAnswer | null;
    };
    readonly attachments: ReadonlyArray<{
      readonly id: string;
      readonly filename: string;
      readonly contentType: string;
      readonly sizeBytes: number;
      readonly metadataStripped: boolean;
    }>;
    readonly thread: ReadonlyArray<{
      readonly id: string;
      readonly author: Types.MessageAuthor;
      readonly officerUserId: string | null;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly notes: ReadonlyArray<{
      readonly id: string;
      readonly authorUserId: string;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly assessment: {
      readonly suggestion: Types.RiskSuggestion | null;
      readonly decision: Types.BreachDecision | null;
      readonly reason: string;
      readonly decidedByUserId: string;
      readonly decidedAt: string;
      readonly factors: {
        readonly information: ReadonlyArray<Types.InformationKind>;
        readonly recipient: Types.RiskRecipient | null;
        readonly viewed: Types.RiskViewed | null;
        readonly mitigation: Types.RiskMitigation | null;
      };
    } | null;
    readonly notices: ReadonlyArray<{
      readonly id: string;
      readonly recipient: Types.NoticeRecipient;
      readonly label: string;
      readonly method: string;
      readonly daysAllowed: number;
      readonly dueOn: string;
      readonly status: Types.NoticeStatus;
      readonly sentOn: string | null;
    }>;
    readonly correctiveActions: ReadonlyArray<{
      readonly description: string;
      readonly policyId: string | null;
    }>;
  };
};

export type CloseReviewSuggestionMutationVariables = Exact<{
  threadId: string | number;
  outcome: Types.SuggestionOutcome;
  reason?: string | null | undefined;
}>;

export type CloseReviewSuggestionMutation = {
  readonly closeReviewSuggestion: {
    readonly id: string;
    readonly policyVersionId: string;
    readonly quote: string;
    readonly occurrence: number;
    readonly resolved: boolean;
    readonly approverUserId: string;
    readonly createdAt: string;
    readonly messages: ReadonlyArray<{
      readonly id: string;
      readonly authorUserId: string;
      readonly authorName: string | null;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly suggestion: {
      readonly text: string;
      readonly turn: Types.SuggestionSide;
      readonly outcome: Types.SuggestionOutcome | null;
      readonly reason: string | null;
      readonly closedBy: string | null;
      readonly closedText: string | null;
      readonly rounds: ReadonlyArray<{
        readonly by: Types.SuggestionSide;
        readonly text: string;
        readonly userId: string;
        readonly createdAt: string;
      }>;
    } | null;
  };
};

export type CompleteOnboardingMutationVariables = Exact<{
  acceptTerms: boolean;
  username?: string | null | undefined;
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  email?: string | null | undefined;
}>;

export type CompleteOnboardingMutation = {
  readonly completeOnboarding: {
    readonly userId: string;
    readonly username: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly roles: ReadonlyArray<string>;
    readonly permissions: ReadonlyArray<string>;
    readonly managedGroupIds: ReadonlyArray<string>;
    readonly needsOnboarding: boolean;
  };
};

export type CompletionReportQueryVariables = Exact<{
  policyVersionId: string | number;
  groupId?: string | number | null | undefined;
}>;

export type CompletionReportQuery = {
  readonly completionReport: {
    readonly totalAudience: number;
    readonly totalAcked: number;
    readonly completionPct: number;
    readonly avgDaysToAck: number;
    readonly viewedNotAckedCount: number;
    readonly overdue: ReadonlyArray<{
      readonly userId: string;
      readonly email: string;
      readonly userName: string | null;
    }>;
  };
};

export type ComplianceSettingsQueryVariables = Exact<{ [key: string]: never }>;

export type ComplianceSettingsQuery = {
  readonly complianceSettings: { readonly moduleEnabled: boolean };
};

export type ContactBlocksQueryVariables = Exact<{
  includeArchived?: boolean | null | undefined;
}>;

export type ContactBlocksQuery = {
  readonly contactBlocks: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly name: string | null;
    readonly role: string | null;
    readonly department: string | null;
    readonly email: string | null;
    readonly phone: string | null;
    readonly hours: string | null;
    readonly notes: string | null;
    readonly archived: boolean;
    readonly usedByCount: number;
  }>;
};

export type CounterReviewSuggestionMutationVariables = Exact<{
  threadId: string | number;
  text: string;
}>;

export type CounterReviewSuggestionMutation = {
  readonly counterReviewSuggestion: {
    readonly id: string;
    readonly policyVersionId: string;
    readonly quote: string;
    readonly occurrence: number;
    readonly resolved: boolean;
    readonly approverUserId: string;
    readonly createdAt: string;
    readonly messages: ReadonlyArray<{
      readonly id: string;
      readonly authorUserId: string;
      readonly authorName: string | null;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly suggestion: {
      readonly text: string;
      readonly turn: Types.SuggestionSide;
      readonly outcome: Types.SuggestionOutcome | null;
      readonly reason: string | null;
      readonly closedBy: string | null;
      readonly closedText: string | null;
      readonly rounds: ReadonlyArray<{
        readonly by: Types.SuggestionSide;
        readonly text: string;
        readonly userId: string;
        readonly createdAt: string;
      }>;
    } | null;
  };
};

export type CreateCategoryMutationVariables = Exact<{
  name: string;
  slug: string;
  parentId?: string | number | null | undefined;
}>;

export type CreateCategoryMutation = {
  readonly createCategory: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly idpGroupIds: ReadonlyArray<string> | null;
    readonly exclusionGroupIds: ReadonlyArray<string> | null;
    readonly ackTriggers: Types.AckTrigger;
    readonly ackEveryone: boolean;
    readonly ackEveryoneSet: boolean;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  };
};

export type CreateContactBlockMutationVariables = Exact<{
  block: Types.ContactBlockInput;
}>;

export type CreateContactBlockMutation = {
  readonly createContactBlock: {
    readonly id: string;
    readonly label: string;
    readonly name: string | null;
    readonly role: string | null;
    readonly department: string | null;
    readonly email: string | null;
    readonly phone: string | null;
    readonly hours: string | null;
    readonly notes: string | null;
    readonly archived: boolean;
    readonly usedByCount: number;
  };
};

export type CreateDefinitionMutationVariables = Exact<{
  input: Types.DefinitionEntryInput;
}>;

export type CreateDefinitionMutation = {
  readonly createDefinition: {
    readonly id: string;
    readonly categoryId: string;
    readonly term: string;
    readonly definition: string;
    readonly archived: boolean;
    readonly createdByUserId: string | null;
    readonly usedByCount: number;
  };
};

export type CreateMagicLinkMutationVariables = Exact<{
  policyVersionId: string | number;
  sensitive: boolean;
}>;

export type CreateMagicLinkMutation = {
  readonly createMagicLink: { readonly token: string; readonly expiresAt: string };
};

export type CreatePlatformGroupMutationVariables = Exact<{
  name: string;
  parentId?: string | number | null | undefined;
}>;

export type CreatePlatformGroupMutation = {
  readonly createPlatformGroup: {
    readonly id: string;
    readonly name: string;
    readonly parentId: string | null;
  };
};

export type CreatePolicyMutationVariables = Exact<{
  homeCategoryId: string | number;
  title: string;
  sensitivity: Types.Sensitivity;
  templateId?: string | number | null | undefined;
  documentType?: Types.DocumentType | null | undefined;
}>;

export type CreatePolicyMutation = {
  readonly createPolicy: {
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly documentType: Types.DocumentType;
    readonly sensitivity: Types.Sensitivity;
    readonly ownerUserId: string;
    readonly ownerName: string | null;
    readonly homeCategoryId: string;
    readonly ackTriggers: Types.AckTrigger | null;
    readonly ackAudienceOverride: ReadonlyArray<string> | null;
    readonly templateId: string | null;
    readonly templateNone: boolean;
    readonly currentDraftVersionId: string | null;
    readonly currentPublishedVersionId: string | null;
    readonly currentVersionNo: number | null;
    readonly currentVersionStatus: string | null;
    readonly updatedAt: string | null;
    readonly retiredAt: string | null;
    readonly viewerCan: {
      readonly read: boolean;
      readonly edit: boolean;
      readonly submit: boolean;
      readonly approve: boolean;
      readonly contentObfuscated: boolean;
      readonly canBreakGlass: boolean;
      readonly ack: boolean;
      readonly manage: boolean;
    };
  };
};

export type CreatePolicyAppendixMutationVariables = Exact<{
  policyId: string | number;
  title?: string | null | undefined;
  contentJson: string;
}>;

export type CreatePolicyAppendixMutation = {
  readonly createPolicyAppendix: {
    readonly id: string;
    readonly policyId: string;
    readonly letter: string | null;
    readonly orderIndex: number;
    readonly retiredAt: string | null;
    readonly published: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly draft: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly versions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly publishedVersions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly contributors: ReadonlyArray<{
      readonly userId: string;
      readonly name: string;
      readonly active: boolean;
    }>;
  };
};

export type CreateReferenceMutationVariables = Exact<{
  input: Types.ReferenceInput;
}>;

export type CreateReferenceMutation = {
  readonly createReference: {
    readonly id: string;
    readonly label: string;
    readonly kind: Types.ReferenceKind;
    readonly clause: string | null;
    readonly body: string | null;
    readonly url: string | null;
    readonly archived: boolean;
    readonly createdByUserId: string | null;
    readonly usedByCount: number;
  };
};

export type CreateTemplateMutationVariables = Exact<{
  name: string;
  ownerCategoryId?: string | number | null | undefined;
}>;

export type CreateTemplateMutation = {
  readonly createTemplate: {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly ownerCategoryId: string | null;
    readonly retiredAt: string | null;
    readonly updatedAt: string | null;
  };
};

export type CreateTemplateVersionMutationVariables = Exact<{
  templateId: string | number;
  sections: ReadonlyArray<Types.SectionInput> | Types.SectionInput;
}>;

export type CreateTemplateVersionMutation = {
  readonly createTemplateVersion: {
    readonly id: string;
    readonly templateId: string;
    readonly versionNo: number;
    readonly semanticVersion: string | null;
    readonly changeType: Types.ChangeType | null;
    readonly createdAt: string | null;
    readonly publishedAt: string | null;
    readonly status: string;
    readonly sections: ReadonlyArray<{
      readonly key: string;
      readonly title: string;
      readonly order: number;
      readonly level: number;
      readonly required: boolean;
      readonly blocks: ReadonlyArray<{
        readonly type: string;
        readonly contentJson: string | null;
      }>;
    }>;
  };
};

export type CreateWorkflowDefMutationVariables = Exact<{
  name: string;
  description?: string | null | undefined;
  stages: ReadonlyArray<Types.WorkflowStageInput> | Types.WorkflowStageInput;
}>;

export type CreateWorkflowDefMutation = {
  readonly createWorkflowDef: {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly version: number;
    readonly stages: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly approvers: ReadonlyArray<string>;
      readonly quorum: string;
      readonly slaDays: number | null;
      readonly rejectOnSlaBreach: boolean | null;
      readonly remindEveryDays: number;
      readonly escalateAfterDays: number;
      readonly pinnedLast: boolean | null;
      readonly vetoUserIds: ReadonlyArray<string>;
      readonly approversByCategory: ReadonlyArray<{
        readonly categoryId: string;
        readonly approverIds: ReadonlyArray<string>;
      }>;
      readonly groupUnits: ReadonlyArray<{
        readonly groupId: string;
        readonly internalQuorum: string;
        readonly memberUserIds: ReadonlyArray<string>;
      }>;
    }>;
  };
};

export type DefinitionsQueryVariables = Exact<{
  categoryId?: string | number | null | undefined;
  includeArchived?: boolean | null | undefined;
}>;

export type DefinitionsQuery = {
  readonly definitions: ReadonlyArray<{
    readonly id: string;
    readonly categoryId: string;
    readonly term: string;
    readonly definition: string;
    readonly archived: boolean;
    readonly createdByUserId: string | null;
    readonly usedByCount: number;
  }>;
};

export type DeleteAppendixMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteAppendixMutation = { readonly deleteAppendix: boolean };

export type DeleteCategoryMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteCategoryMutation = { readonly deleteCategory: boolean };

export type DeleteDefinitionMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteDefinitionMutation = { readonly deleteDefinition: boolean };

export type DeleteGroupMappingMutationVariables = Exact<{
  mappingId: string | number;
}>;

export type DeleteGroupMappingMutation = { readonly deleteGroupMapping: boolean };

export type DeleteOrganizationMutationVariables = Exact<{
  domain: string;
}>;

export type DeleteOrganizationMutation = { readonly deleteOrganization: boolean };

export type DeletePolicyMutationVariables = Exact<{
  id: string | number;
}>;

export type DeletePolicyMutation = { readonly deletePolicy: boolean };

export type DeleteReferenceMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteReferenceMutation = { readonly deleteReference: boolean };

export type DeleteReviewThreadMutationVariables = Exact<{
  threadId: string | number;
}>;

export type DeleteReviewThreadMutation = { readonly deleteReviewThread: boolean };

export type DeleteTemplateMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteTemplateMutation = { readonly deleteTemplate: boolean };

export type DeleteUserMutationVariables = Exact<{
  userId: string | number;
}>;

export type DeleteUserMutation = {
  readonly deleteUser: { readonly userId: string; readonly revokedSessions: number };
};

export type DeleteWorkflowDefMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteWorkflowDefMutation = { readonly deleteWorkflowDef: boolean };

export type DiagnosticsQueryVariables = Exact<{ [key: string]: never }>;

export type DiagnosticsQuery = {
  readonly diagnostics: {
    readonly generatedAt: string;
    readonly traceId: string;
    readonly release: string | null;
    readonly appliance: string | null;
    readonly actor: {
      readonly id: string;
      readonly username: string;
      readonly roles: ReadonlyArray<string>;
      readonly actingAs: {
        readonly id: string;
        readonly username: string;
        readonly roles: ReadonlyArray<string>;
      } | null;
    };
    readonly gateway: {
      readonly name: string;
      readonly version: string;
      readonly commit: string | null;
      readonly status: Types.ComponentStatus;
    };
    readonly services: ReadonlyArray<{
      readonly name: string;
      readonly version: string;
      readonly commit: string | null;
      readonly status: Types.ComponentStatus;
    }>;
    readonly thirdParty: ReadonlyArray<{
      readonly name: string;
      readonly version: string;
      readonly commit: string | null;
      readonly status: Types.ComponentStatus;
    }>;
  };
};

export type DiffVersionsQueryVariables = Exact<{
  fromVersionId: string | number;
  toVersionId: string | number;
}>;

export type DiffVersionsQuery = {
  readonly diffVersions: ReadonlyArray<{
    readonly sectionKey: string;
    readonly sectionTitle: string;
    readonly changeType: string;
    readonly wordDiffHtml: string | null;
  }>;
};

export type DisableOrganizationMutationVariables = Exact<{
  domain: string;
}>;

export type DisableOrganizationMutation = {
  readonly disableOrganization: {
    readonly connectionId: string;
    readonly connectionAlias: string;
    readonly displayName: string;
    readonly domain: string;
    readonly enabled: boolean;
    readonly jitEnabled: boolean;
    readonly orgName: string;
    readonly protocol: string;
    readonly testPassed: boolean;
    readonly verified: boolean;
    readonly allowLocal: boolean;
    readonly secretReentryRequired: boolean;
  };
};

export type DisableUserMutationVariables = Exact<{
  userId: string | number;
}>;

export type DisableUserMutation = {
  readonly disableUser: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly idpGroups: ReadonlyArray<string>;
    readonly groupIds: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
    readonly policyOverrides: ReadonlyArray<{
      readonly policyNumber: string;
      readonly effect: Types.OverrideEffect;
    }>;
    readonly memberships: ReadonlyArray<{ readonly groupId: string; readonly source: string }>;
  };
};

export type DiscardDraftMutationVariables = Exact<{
  policyId: string | number;
}>;

export type DiscardDraftMutation = { readonly discardDraft: boolean };

export type DiscardTemplateVersionMutationVariables = Exact<{
  id: string | number;
}>;

export type DiscardTemplateVersionMutation = { readonly discardTemplateVersion: boolean };

export type EmailServiceConfigQueryVariables = Exact<{ [key: string]: never }>;

export type EmailServiceConfigQuery = {
  readonly emailServiceConfig: {
    readonly apiKeySet: boolean;
    readonly provider: string;
    readonly domain: string;
    readonly region: string;
    readonly fromAddress: string;
    readonly enabled: boolean;
  };
};

export type EnableUserMutationVariables = Exact<{
  userId: string | number;
}>;

export type EnableUserMutation = {
  readonly enableUser: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly idpGroups: ReadonlyArray<string>;
    readonly groupIds: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
    readonly policyOverrides: ReadonlyArray<{
      readonly policyNumber: string;
      readonly effect: Types.OverrideEffect;
    }>;
    readonly memberships: ReadonlyArray<{ readonly groupId: string; readonly source: string }>;
  };
};

export type EnrollTotpBeginMutationVariables = Exact<{ [key: string]: never }>;

export type EnrollTotpBeginMutation = {
  readonly enrollTotpBegin: { readonly otpauthUri: string; readonly secretMasked: string | null };
};

export type EnrollTotpConfirmMutationVariables = Exact<{
  code: string;
}>;

export type EnrollTotpConfirmMutation = { readonly enrollTotpConfirm: boolean };

export type ExecuteHardResetMutationVariables = Exact<{
  requestId: string | number;
  confirmation: string;
}>;

export type ExecuteHardResetMutation = {
  readonly executeHardReset: {
    readonly casesDeleted: number;
    readonly requestedBy: string;
    readonly approvedBy: string;
  };
};

export type ExportAcksQueryVariables = Exact<{
  policyVersionId: string | number;
  format: string;
}>;

export type ExportAcksQuery = {
  readonly exportAcks: { readonly data: string; readonly contentType: string };
};

export type ForceRotateSpCertificateMutationVariables = Exact<{ [key: string]: never }>;

export type ForceRotateSpCertificateMutation = {
  readonly forceRotateSpCertificate: {
    readonly active: boolean;
    readonly certPem: string;
    readonly notAfter: string;
    readonly serial: string;
    readonly spMetadataXml: string;
  };
};

export type GlobalSettingsQueryVariables = Exact<{ [key: string]: never }>;

export type GlobalSettingsQuery = {
  readonly globalSettings: {
    readonly announcement: {
      readonly enabled: boolean;
      readonly level: string;
      readonly message: string;
    };
    readonly maintenance: { readonly enabled: boolean; readonly message: string };
    readonly workCalendar: {
      readonly weekdays: ReadonlyArray<number>;
      readonly timezone: string;
      readonly holidays: ReadonlyArray<{ readonly date: string; readonly label: string }>;
    };
  };
};

export type GrantRoleMutationVariables = Exact<{
  userId: string | number;
  role: string;
}>;

export type GrantRoleMutation = {
  readonly grantRole: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly idpGroups: ReadonlyArray<string>;
    readonly groupIds: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
    readonly policyOverrides: ReadonlyArray<{
      readonly policyNumber: string;
      readonly effect: Types.OverrideEffect;
    }>;
    readonly memberships: ReadonlyArray<{ readonly groupId: string; readonly source: string }>;
  };
};

export type GroupMappingsQueryVariables = Exact<{
  connectionId: string | number;
}>;

export type GroupMappingsQuery = {
  readonly groupMappings: ReadonlyArray<{
    readonly connectionId: string;
    readonly id: string;
    readonly idpGroupClaimValue: string;
    readonly targetGroupId: string;
  }>;
};

export type HardResetRequestFieldsFragment = {
  readonly id: string;
  readonly module: string;
  readonly reason: string;
  readonly state: string;
  readonly requestedBy: string;
  readonly requestedAt: string;
  readonly expiresAt: string;
  readonly approvedBy: string | null;
  readonly approvedAt: string | null;
  readonly approvalExpiresAt: string | null;
  readonly cancelledAt: string | null;
  readonly consumedAt: string | null;
  readonly consumedBy: string | null;
};

export type HardResetRequestsQueryVariables = Exact<{
  module?: string | null | undefined;
}>;

export type HardResetRequestsQuery = {
  readonly hardResetRequests: ReadonlyArray<{
    readonly id: string;
    readonly module: string;
    readonly reason: string;
    readonly state: string;
    readonly requestedBy: string;
    readonly requestedAt: string;
    readonly expiresAt: string;
    readonly approvedBy: string | null;
    readonly approvedAt: string | null;
    readonly approvalExpiresAt: string | null;
    readonly cancelledAt: string | null;
    readonly consumedAt: string | null;
    readonly consumedBy: string | null;
  }>;
};

export type ImpersonationStatusQueryVariables = Exact<{ [key: string]: never }>;

export type ImpersonationStatusQuery = {
  readonly impersonationStatus: {
    readonly targetUserId: string;
    readonly targetName: string;
    readonly startedAt: string;
    readonly expiresAt: string;
  } | null;
};

export type IssueAppendixCollabTokenMutationVariables = Exact<{
  appendixId: string | number;
}>;

export type IssueAppendixCollabTokenMutation = {
  readonly issueAppendixCollabToken: {
    readonly token: string;
    readonly wsUrl: string;
    readonly expiresAt: string;
  };
};

export type IssueCollabTokenMutationVariables = Exact<{
  policyId: string | number;
  draftId: string | number;
  templateVersionId?: string | number | null | undefined;
}>;

export type IssueCollabTokenMutation = {
  readonly issueCollabToken: {
    readonly token: string;
    readonly wsUrl: string;
    readonly expiresAt: string;
  };
};

export type LatestTemplateVersionQueryVariables = Exact<{
  templateId: string | number;
}>;

export type LatestTemplateVersionQuery = {
  readonly latestTemplateVersion: {
    readonly id: string;
    readonly templateId: string;
    readonly versionNo: number;
    readonly semanticVersion: string | null;
    readonly changeType: Types.ChangeType | null;
    readonly createdAt: string | null;
    readonly publishedAt: string | null;
    readonly status: string;
    readonly sections: ReadonlyArray<{
      readonly key: string;
      readonly title: string;
      readonly order: number;
      readonly level: number;
      readonly required: boolean;
      readonly blocks: ReadonlyArray<{
        readonly type: string;
        readonly contentJson: string | null;
      }>;
    }>;
  } | null;
};

export type ListUserSessionsQueryVariables = Exact<{
  userId: string | number;
}>;

export type ListUserSessionsQuery = {
  readonly listUserSessions: ReadonlyArray<{
    readonly sessionId: string;
    readonly userId: string;
    readonly issuedAt: string;
    readonly authenticatedAt: string;
    readonly expiresAt: string;
    readonly active: boolean;
    readonly userAgent: string;
    readonly clientIp: string | null;
    readonly lastSeenAt: string | null;
    readonly current: boolean;
  }>;
};

export type LiveEventsSubscriptionVariables = Exact<{
  topics?: ReadonlyArray<string> | string | null | undefined;
}>;

export type LiveEventsSubscription = {
  readonly liveEvents: {
    readonly type: string;
    readonly entityId: string | null;
    readonly groupId: string | null;
    readonly actorUserId: string | null;
    readonly at: string;
  };
};

export type ManagedGroupMembersQueryVariables = Exact<{
  groupId: string | number;
}>;

export type ManagedGroupMembersQuery = {
  readonly managedGroupMembers: ReadonlyArray<{
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly idpGroups: ReadonlyArray<string>;
    readonly groupIds: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
    readonly policyOverrides: ReadonlyArray<{
      readonly policyNumber: string;
      readonly effect: Types.OverrideEffect;
    }>;
    readonly memberships: ReadonlyArray<{ readonly groupId: string; readonly source: string }>;
  }>;
};

export type MarkVersionReviewedMutationVariables = Exact<{
  policyVersionId: string | number;
}>;

export type MarkVersionReviewedMutation = { readonly markVersionReviewed: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  readonly me: {
    readonly userId: string;
    readonly username: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly roles: ReadonlyArray<string>;
    readonly permissions: ReadonlyArray<string>;
    readonly managedGroupIds: ReadonlyArray<string>;
    readonly needsOnboarding: boolean;
    readonly locale: string;
    readonly scopes: { readonly author: ReadonlyArray<string> };
  };
};

export type MergeAccountsMutationVariables = Exact<{
  sourceUserId: string | number;
  targetUserId: string | number;
  confirmPrivileged?: boolean | null | undefined;
  idempotencyKey?: string | null | undefined;
}>;

export type MergeAccountsMutation = {
  readonly mergeAccounts: {
    readonly mergeOperationId: string;
    readonly status: Types.MergeStatus;
    readonly counts: {
      readonly policiesOwned: number;
      readonly raciGrants: number;
      readonly acknowledgmentsMoved: number;
      readonly acknowledgmentsDeduped: number;
      readonly workflowItems: number;
      readonly preferences: number;
    };
    readonly steps: ReadonlyArray<{
      readonly step: string;
      readonly status: Types.MergeStepStatus;
      readonly detail: string;
      readonly error: string;
    }>;
  };
};

export type MoveCategoryMutationVariables = Exact<{
  categoryId: string | number;
  newParentId?: string | number | null | undefined;
}>;

export type MoveCategoryMutation = {
  readonly moveCategory: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly idpGroupIds: ReadonlyArray<string> | null;
    readonly exclusionGroupIds: ReadonlyArray<string> | null;
    readonly ackTriggers: Types.AckTrigger;
    readonly ackEveryone: boolean;
    readonly ackEveryoneSet: boolean;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  };
};

export type MovePoliciesMutationVariables = Exact<{
  policyIds: ReadonlyArray<string | number> | string | number;
  homeCategoryId: string | number;
}>;

export type MovePoliciesMutation = {
  readonly movePolicies: {
    readonly moved: ReadonlyArray<{
      readonly policyId: string;
      readonly title: string;
      readonly number: string;
      readonly newNumber: string | null;
      readonly refusal: string | null;
    }>;
  };
};

export type MovePolicyMutationVariables = Exact<{
  policyId: string | number;
  homeCategoryId: string | number;
}>;

export type MovePolicyMutation = {
  readonly movePolicy: { readonly id: string; readonly number: string };
};

export type MyAckSummaryQueryVariables = Exact<{ [key: string]: never }>;

export type MyAckSummaryQuery = {
  readonly myAckSummary: { readonly required: number; readonly done: number };
};

export type MyDraftsQueryVariables = Exact<{ [key: string]: never }>;

export type MyDraftsQuery = {
  readonly myDrafts: ReadonlyArray<{
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly documentType: Types.DocumentType;
    readonly sensitivity: Types.Sensitivity;
    readonly ownerUserId: string;
    readonly ownerName: string | null;
    readonly homeCategoryId: string;
    readonly ackTriggers: Types.AckTrigger | null;
    readonly ackAudienceOverride: ReadonlyArray<string> | null;
    readonly templateId: string | null;
    readonly templateNone: boolean;
    readonly currentDraftVersionId: string | null;
    readonly currentPublishedVersionId: string | null;
    readonly currentVersionNo: number | null;
    readonly currentVersionStatus: string | null;
    readonly updatedAt: string | null;
    readonly retiredAt: string | null;
    readonly viewerCan: {
      readonly read: boolean;
      readonly edit: boolean;
      readonly submit: boolean;
      readonly approve: boolean;
      readonly contentObfuscated: boolean;
      readonly canBreakGlass: boolean;
      readonly ack: boolean;
      readonly manage: boolean;
    };
  }>;
};

export type MyFactorsQueryVariables = Exact<{ [key: string]: never }>;

export type MyFactorsQuery = {
  readonly myFactors: ReadonlyArray<{
    readonly kind: string;
    readonly enrolledAt: string | null;
    readonly label: string | null;
  }>;
};

export type MyManagedGroupsQueryVariables = Exact<{ [key: string]: never }>;

export type MyManagedGroupsQuery = {
  readonly myManagedGroups: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly parentId: string | null;
  }>;
};

export type MyObligationsQueryVariables = Exact<{ [key: string]: never }>;

export type MyObligationsQuery = {
  readonly myObligations: ReadonlyArray<{
    readonly policyId: string;
    readonly number: string;
    readonly title: string;
    readonly version: string;
    readonly policyVersionId: string;
  }>;
};

export type MyWebauthnCredentialsQueryVariables = Exact<{ [key: string]: never }>;

export type MyWebauthnCredentialsQuery = {
  readonly myWebauthnCredentials: ReadonlyArray<{
    readonly id: string;
    readonly label: string | null;
    readonly createdAt: string;
    readonly lastUsedAt: string | null;
  }>;
};

export type NotificationSettingsQueryVariables = Exact<{ [key: string]: never }>;

export type NotificationSettingsQuery = {
  readonly notificationSettings: {
    readonly channels: { readonly email: boolean; readonly inApp: boolean; readonly push: boolean };
    readonly categories: ReadonlyArray<{
      readonly category: Types.NotifCategory;
      readonly cadence: Types.NotifCadence;
      readonly mandatory: boolean;
    }>;
    readonly overrides: ReadonlyArray<{
      readonly kind: string;
      readonly category: Types.NotifCategory;
      readonly cadence: Types.NotifCadence;
      readonly mandatory: boolean;
      readonly delivery: Types.NotifDelivery;
    }>;
    readonly digest: { readonly dailyHour: number; readonly weeklyDow: number };
  };
  readonly notificationTypeCatalog: ReadonlyArray<{
    readonly kind: string;
    readonly category: Types.NotifCategory;
    readonly mandatory: boolean;
    readonly delivery: Types.NotifDelivery;
  }>;
};

export type NotificationSettingsFieldsFragment = {
  readonly channels: { readonly email: boolean; readonly inApp: boolean; readonly push: boolean };
  readonly categories: ReadonlyArray<{
    readonly category: Types.NotifCategory;
    readonly cadence: Types.NotifCadence;
    readonly mandatory: boolean;
  }>;
  readonly overrides: ReadonlyArray<{
    readonly kind: string;
    readonly category: Types.NotifCategory;
    readonly cadence: Types.NotifCadence;
    readonly mandatory: boolean;
    readonly delivery: Types.NotifDelivery;
  }>;
  readonly digest: { readonly dailyHour: number; readonly weeklyDow: number };
};

export type OrganizationFieldsFragment = {
  readonly connectionId: string;
  readonly connectionAlias: string;
  readonly displayName: string;
  readonly domain: string;
  readonly enabled: boolean;
  readonly jitEnabled: boolean;
  readonly orgName: string;
  readonly protocol: string;
  readonly testPassed: boolean;
  readonly verified: boolean;
  readonly allowLocal: boolean;
  readonly secretReentryRequired: boolean;
};

export type OrganizationsQueryVariables = Exact<{ [key: string]: never }>;

export type OrganizationsQuery = {
  readonly organizations: ReadonlyArray<{
    readonly connectionId: string;
    readonly connectionAlias: string;
    readonly displayName: string;
    readonly domain: string;
    readonly enabled: boolean;
    readonly jitEnabled: boolean;
    readonly orgName: string;
    readonly protocol: string;
    readonly testPassed: boolean;
    readonly verified: boolean;
    readonly allowLocal: boolean;
    readonly secretReentryRequired: boolean;
  }>;
};

export type PdfDownloadLinkQueryVariables = Exact<{
  jobId: string | number;
}>;

export type PdfDownloadLinkQuery = {
  readonly pdfDownloadLink: { readonly signedUrl: string; readonly expiresAt: string };
};

export type PendingTasksQueryVariables = Exact<{ [key: string]: never }>;

export type PendingTasksQuery = {
  readonly pendingTasks: ReadonlyArray<{
    readonly taskId: string;
    readonly runId: string;
    readonly policyVersionId: string;
    readonly policyTitle: string;
    readonly stageIndex: number;
    readonly dueAt: string | null;
  }>;
};

export type PlatformGroupsQueryVariables = Exact<{
  parentId?: string | number | null | undefined;
}>;

export type PlatformGroupsQuery = {
  readonly platformGroups: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly parentId: string | null;
  }>;
};

export type PoliciesQueryVariables = Exact<{
  categoryId: string | number;
  documentType?: Types.DocumentType | null | undefined;
}>;

export type PoliciesQuery = {
  readonly policies: ReadonlyArray<{
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly documentType: Types.DocumentType;
    readonly sensitivity: Types.Sensitivity;
    readonly ownerUserId: string;
    readonly ownerName: string | null;
    readonly homeCategoryId: string;
    readonly ackTriggers: Types.AckTrigger | null;
    readonly ackAudienceOverride: ReadonlyArray<string> | null;
    readonly templateId: string | null;
    readonly templateNone: boolean;
    readonly currentDraftVersionId: string | null;
    readonly currentPublishedVersionId: string | null;
    readonly currentVersionNo: number | null;
    readonly currentVersionStatus: string | null;
    readonly updatedAt: string | null;
    readonly retiredAt: string | null;
    readonly viewerCan: {
      readonly read: boolean;
      readonly edit: boolean;
      readonly submit: boolean;
      readonly approve: boolean;
      readonly contentObfuscated: boolean;
      readonly canBreakGlass: boolean;
      readonly ack: boolean;
      readonly manage: boolean;
    };
  }>;
};

export type PolicyQueryVariables = Exact<{
  id: string | number;
}>;

export type PolicyQuery = {
  readonly policy: {
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly documentType: Types.DocumentType;
    readonly sensitivity: Types.Sensitivity;
    readonly ownerUserId: string;
    readonly ownerName: string | null;
    readonly homeCategoryId: string;
    readonly ackTriggers: Types.AckTrigger | null;
    readonly ackAudienceOverride: ReadonlyArray<string> | null;
    readonly templateId: string | null;
    readonly templateNone: boolean;
    readonly currentDraftVersionId: string | null;
    readonly currentPublishedVersionId: string | null;
    readonly currentVersionNo: number | null;
    readonly currentVersionStatus: string | null;
    readonly updatedAt: string | null;
    readonly retiredAt: string | null;
    readonly viewerCan: {
      readonly read: boolean;
      readonly edit: boolean;
      readonly submit: boolean;
      readonly approve: boolean;
      readonly contentObfuscated: boolean;
      readonly canBreakGlass: boolean;
      readonly ack: boolean;
      readonly manage: boolean;
    };
  } | null;
};

export type PolicyAppendicesQueryVariables = Exact<{
  policyId: string | number;
  includeRetired?: boolean | null | undefined;
}>;

export type PolicyAppendicesQuery = {
  readonly policyAppendices: ReadonlyArray<{
    readonly id: string;
    readonly policyId: string;
    readonly letter: string | null;
    readonly orderIndex: number;
    readonly retiredAt: string | null;
    readonly published: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly draft: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly versions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly publishedVersions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly contributors: ReadonlyArray<{
      readonly userId: string;
      readonly name: string;
      readonly active: boolean;
    }>;
  }>;
};

export type PolicyAppendixFieldsFragment = {
  readonly id: string;
  readonly policyId: string;
  readonly letter: string | null;
  readonly orderIndex: number;
  readonly retiredAt: string | null;
  readonly published: {
    readonly id: string;
    readonly versionNo: number;
    readonly state: Types.AppendixState;
    readonly title: string;
    readonly contentJson: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly updatedBy: string;
    readonly publishedAt: string | null;
    readonly publishedBy: string | null;
  } | null;
  readonly draft: {
    readonly id: string;
    readonly versionNo: number;
    readonly state: Types.AppendixState;
    readonly title: string;
    readonly contentJson: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly updatedBy: string;
    readonly publishedAt: string | null;
    readonly publishedBy: string | null;
  } | null;
  readonly versions: ReadonlyArray<{
    readonly id: string;
    readonly versionNo: number;
    readonly state: Types.AppendixState;
    readonly title: string;
    readonly contentJson: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly updatedBy: string;
    readonly publishedAt: string | null;
    readonly publishedBy: string | null;
  }>;
  readonly publishedVersions: ReadonlyArray<{
    readonly id: string;
    readonly versionNo: number;
    readonly state: Types.AppendixState;
    readonly title: string;
    readonly contentJson: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly updatedBy: string;
    readonly publishedAt: string | null;
    readonly publishedBy: string | null;
  }>;
  readonly contributors: ReadonlyArray<{
    readonly userId: string;
    readonly name: string;
    readonly active: boolean;
  }>;
};

export type PolicyAttachmentsQueryVariables = Exact<{
  policyId: string | number;
}>;

export type PolicyAttachmentsQuery = {
  readonly relatedPolicies: ReadonlyArray<{
    readonly policyId: string;
    readonly number: string;
    readonly title: string;
  }>;
  readonly policyReferences: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly kind: Types.ReferenceKind;
    readonly clause: string | null;
    readonly body: string | null;
    readonly url: string | null;
  }>;
  readonly policyContactBlocks: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly name: string | null;
    readonly role: string | null;
    readonly department: string | null;
    readonly email: string | null;
    readonly phone: string | null;
    readonly hours: string | null;
    readonly notes: string | null;
  }>;
  readonly policyDefinitionEntries: ReadonlyArray<{
    readonly id: string;
    readonly term: string;
    readonly definition: string;
  }>;
};

export type PolicyByNumberQueryVariables = Exact<{
  number: string;
}>;

export type PolicyByNumberQuery = {
  readonly policyByNumber: {
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly documentType: Types.DocumentType;
    readonly sensitivity: Types.Sensitivity;
    readonly ownerUserId: string;
    readonly ownerName: string | null;
    readonly homeCategoryId: string;
    readonly ackTriggers: Types.AckTrigger | null;
    readonly ackAudienceOverride: ReadonlyArray<string> | null;
    readonly templateId: string | null;
    readonly templateNone: boolean;
    readonly currentDraftVersionId: string | null;
    readonly currentPublishedVersionId: string | null;
    readonly currentVersionNo: number | null;
    readonly currentVersionStatus: string | null;
    readonly updatedAt: string | null;
    readonly retiredAt: string | null;
    readonly viewerCan: {
      readonly read: boolean;
      readonly edit: boolean;
      readonly submit: boolean;
      readonly approve: boolean;
      readonly contentObfuscated: boolean;
      readonly canBreakGlass: boolean;
      readonly ack: boolean;
      readonly manage: boolean;
    };
  } | null;
};

export type PolicyVersionQueryVariables = Exact<{
  id: string | number;
}>;

export type PolicyVersionQuery = {
  readonly policyVersion: {
    readonly id: string;
    readonly policyId: string;
    readonly versionNo: number;
    readonly semanticVersion: string | null;
    readonly suggestedChangeType: Types.ChangeType | null;
    readonly changeType: Types.ChangeType | null;
    readonly requestedChangeType: Types.ChangeType | null;
    readonly changeTypeReason: string | null;
    readonly changeTypeSetByUserId: string | null;
    readonly changeTypeAgreedByUserIds: ReadonlyArray<string>;
    readonly status: string;
    readonly templateVersionId: string;
    readonly contentJson: string;
    readonly createdAt: string | null;
    readonly publishedAt: string | null;
    readonly reacknowledge: boolean;
    readonly appendices: ReadonlyArray<{
      readonly id: string;
      readonly policyVersionId: string;
      readonly title: string;
      readonly contentJson: string;
      readonly orderIndex: number;
      readonly letter: string;
    }>;
  } | null;
};

export type PolicyVersionFieldsFragment = {
  readonly id: string;
  readonly policyId: string;
  readonly versionNo: number;
  readonly semanticVersion: string | null;
  readonly suggestedChangeType: Types.ChangeType | null;
  readonly changeType: Types.ChangeType | null;
  readonly requestedChangeType: Types.ChangeType | null;
  readonly changeTypeReason: string | null;
  readonly changeTypeSetByUserId: string | null;
  readonly changeTypeAgreedByUserIds: ReadonlyArray<string>;
  readonly status: string;
  readonly templateVersionId: string;
  readonly contentJson: string;
  readonly createdAt: string | null;
  readonly publishedAt: string | null;
  readonly reacknowledge: boolean;
  readonly appendices: ReadonlyArray<{
    readonly id: string;
    readonly policyVersionId: string;
    readonly title: string;
    readonly contentJson: string;
    readonly orderIndex: number;
    readonly letter: string;
  }>;
};

export type PolicyVersionLinksQueryVariables = Exact<{
  policyVersionId: string | number;
}>;

export type PolicyVersionLinksQuery = {
  readonly policyVersionLinks: {
    readonly policyVersionId: string;
    readonly editable: boolean;
    readonly definitions: ReadonlyArray<{
      readonly id: string;
      readonly categoryId: string;
      readonly term: string;
      readonly definition: string;
      readonly archived: boolean;
      readonly createdByUserId: string | null;
      readonly usedByCount: number;
    }>;
    readonly related: ReadonlyArray<{
      readonly policyId: string;
      readonly number: string;
      readonly title: string;
      readonly type: string;
      readonly label: string;
      readonly direction: Types.RelatedDirection;
    }>;
    readonly references: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly kind: Types.ReferenceKind;
      readonly clause: string | null;
      readonly body: string | null;
      readonly url: string | null;
      readonly archived: boolean;
      readonly createdByUserId: string | null;
      readonly usedByCount: number;
    }>;
    readonly contacts: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly name: string | null;
      readonly role: string | null;
      readonly department: string | null;
      readonly email: string | null;
      readonly phone: string | null;
      readonly hours: string | null;
      readonly notes: string | null;
      readonly archived: boolean;
      readonly usedByCount: number;
    }>;
  };
};

export type PolicyVersionSummaryQueryVariables = Exact<{
  versionId: string | number;
}>;

export type PolicyVersionSummaryQuery = {
  readonly policyVersionSummary: {
    readonly summaryText: string;
    readonly generatedAt: string;
  } | null;
};

export type PolicyVersionsQueryVariables = Exact<{
  policyId: string | number;
}>;

export type PolicyVersionsQuery = {
  readonly policyVersions: ReadonlyArray<{
    readonly id: string;
    readonly versionNo: number;
    readonly semanticVersion: string | null;
    readonly changeType: Types.ChangeType | null;
    readonly status: string;
    readonly publishedAt: string | null;
  }>;
};

export type PostCaseMessageMutationVariables = Exact<{
  caseId: string | number;
  body: string;
}>;

export type PostCaseMessageMutation = {
  readonly postCaseMessage: {
    readonly id: string;
    readonly author: Types.MessageAuthor;
    readonly officerUserId: string | null;
    readonly body: string;
    readonly createdAt: string;
  };
};

export type PreviewAccountMergeQueryVariables = Exact<{
  sourceUserId: string | number;
  targetUserId: string | number;
}>;

export type PreviewAccountMergeQuery = {
  readonly previewAccountMerge: {
    readonly sourceUserId: string;
    readonly targetUserId: string;
    readonly requiresPrivilegedConfirm: boolean;
    readonly counts: {
      readonly policiesOwned: number;
      readonly raciGrants: number;
      readonly acknowledgmentsMoved: number;
      readonly acknowledgmentsDeduped: number;
      readonly workflowItems: number;
      readonly preferences: number;
    };
    readonly items: ReadonlyArray<{
      readonly kind: Types.MergeItemKind;
      readonly refId: string;
      readonly label: string;
      readonly detail: string;
    }>;
    readonly warnings: ReadonlyArray<{ readonly code: string; readonly message: string }>;
  };
};

export type PreviewMovePoliciesQueryVariables = Exact<{
  policyIds: ReadonlyArray<string | number> | string | number;
  homeCategoryId: string | number;
}>;

export type PreviewMovePoliciesQuery = {
  readonly previewMovePolicies: {
    readonly items: ReadonlyArray<{
      readonly policyId: string;
      readonly title: string;
      readonly number: string;
      readonly newNumber: string | null;
      readonly refusal: string | null;
    }>;
  };
};

export type PreviewUserDeletionQueryVariables = Exact<{
  userId: string | number;
}>;

export type PreviewUserDeletionQuery = {
  readonly previewUserDeletion: {
    readonly userId: string;
    readonly blocksDelete: boolean;
    readonly locallyAuthenticable: boolean;
    readonly counts: {
      readonly pendingApprovals: number;
      readonly ownedPolicies: number;
      readonly raciGrants: number;
      readonly roles: number;
      readonly permissions: number;
      readonly groupMemberships: number;
      readonly idpGroups: number;
      readonly policyOverrides: number;
      readonly breakGlassGrants: number;
      readonly managedGroups: number;
    };
    readonly items: ReadonlyArray<{
      readonly kind: Types.DeletionItemKind;
      readonly refId: string;
      readonly label: string;
      readonly detail: string;
      readonly blocksDelete: boolean;
    }>;
    readonly warnings: ReadonlyArray<{ readonly code: string; readonly message: string }>;
  };
};

export type PublishAppendixMutationVariables = Exact<{
  id: string | number;
}>;

export type PublishAppendixMutation = {
  readonly publishAppendix: {
    readonly id: string;
    readonly policyId: string;
    readonly letter: string | null;
    readonly orderIndex: number;
    readonly retiredAt: string | null;
    readonly published: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly draft: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly versions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly publishedVersions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly contributors: ReadonlyArray<{
      readonly userId: string;
      readonly name: string;
      readonly active: boolean;
    }>;
  };
};

export type PublishDraftMutationVariables = Exact<{
  policyId: string | number;
}>;

export type PublishDraftMutation = {
  readonly publishDraft: {
    readonly id: string;
    readonly policyId: string;
    readonly versionNo: number;
    readonly semanticVersion: string | null;
    readonly suggestedChangeType: Types.ChangeType | null;
    readonly changeType: Types.ChangeType | null;
    readonly requestedChangeType: Types.ChangeType | null;
    readonly changeTypeReason: string | null;
    readonly changeTypeSetByUserId: string | null;
    readonly changeTypeAgreedByUserIds: ReadonlyArray<string>;
    readonly status: string;
    readonly templateVersionId: string;
    readonly contentJson: string;
    readonly createdAt: string | null;
    readonly publishedAt: string | null;
    readonly reacknowledge: boolean;
    readonly appendices: ReadonlyArray<{
      readonly id: string;
      readonly policyVersionId: string;
      readonly title: string;
      readonly contentJson: string;
      readonly orderIndex: number;
      readonly letter: string;
    }>;
  };
};

export type PublishTemplateVersionMutationVariables = Exact<{
  id: string | number;
}>;

export type PublishTemplateVersionMutation = {
  readonly publishTemplateVersion: {
    readonly id: string;
    readonly templateId: string;
    readonly versionNo: number;
    readonly semanticVersion: string | null;
    readonly changeType: Types.ChangeType | null;
    readonly createdAt: string | null;
    readonly publishedAt: string | null;
    readonly status: string;
    readonly sections: ReadonlyArray<{
      readonly key: string;
      readonly title: string;
      readonly order: number;
      readonly level: number;
      readonly required: boolean;
      readonly blocks: ReadonlyArray<{
        readonly type: string;
        readonly contentJson: string | null;
      }>;
    }>;
  };
};

export type RaciRuleFieldsFragment = {
  readonly subjectKind: Types.RaciSubjectKind;
  readonly subjectRef: string;
  readonly read: Types.RaciGrant;
  readonly ack: Types.RaciGrant;
  readonly approve: Types.RaciGrant;
  readonly author: Types.RaciGrant;
  readonly manage: Types.RaciGrant;
};

export type ReassignUserPoliciesMutationVariables = Exact<{
  fromUserId: string | number;
  toUserId: string | number;
}>;

export type ReassignUserPoliciesMutation = {
  readonly reassignUserPolicies: {
    readonly reassignedOwnerCount: number;
    readonly reassignedAuthorGrants: number;
  };
};

export type RecordAckMutationVariables = Exact<{
  policyVersionId: string | number;
}>;

export type RecordAckMutation = { readonly recordAck: { readonly ackedAt: string } };

export type RecordRiskAssessmentMutationVariables = Exact<{
  caseId: string | number;
  factors: Types.RiskFactorsInput;
  decision: Types.BreachDecision;
  reason: string;
}>;

export type RecordRiskAssessmentMutation = {
  readonly recordRiskAssessment: {
    readonly suggestion: Types.RiskSuggestion | null;
    readonly decision: Types.BreachDecision | null;
    readonly reason: string;
    readonly decidedByUserId: string;
    readonly decidedAt: string;
    readonly factors: {
      readonly information: ReadonlyArray<Types.InformationKind>;
      readonly recipient: Types.RiskRecipient | null;
      readonly viewed: Types.RiskViewed | null;
      readonly mitigation: Types.RiskMitigation | null;
    };
  };
};

export type ReferencesQueryVariables = Exact<{
  includeArchived?: boolean | null | undefined;
}>;

export type ReferencesQuery = {
  readonly references: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly kind: Types.ReferenceKind;
    readonly clause: string | null;
    readonly body: string | null;
    readonly url: string | null;
    readonly archived: boolean;
    readonly createdByUserId: string | null;
    readonly usedByCount: number;
  }>;
};

export type RelationshipTypesQueryVariables = Exact<{ [key: string]: never }>;

export type RelationshipTypesQuery = {
  readonly relationshipTypes: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly inverseId: string;
    readonly inverseLabel: string;
  }>;
};

export type RemoveFactorMutationVariables = Exact<{
  kind: string;
}>;

export type RemoveFactorMutation = { readonly removeFactor: boolean };

export type RemoveUserFromGroupMutationVariables = Exact<{
  userId: string | number;
  groupId: string | number;
}>;

export type RemoveUserFromGroupMutation = {
  readonly removeUserFromGroup: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly idpGroups: ReadonlyArray<string>;
    readonly groupIds: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
    readonly policyOverrides: ReadonlyArray<{
      readonly policyNumber: string;
      readonly effect: Types.OverrideEffect;
    }>;
    readonly memberships: ReadonlyArray<{ readonly groupId: string; readonly source: string }>;
  };
};

export type RemoveUserMfaFactorMutationVariables = Exact<{
  userId: string | number;
  methodId: string | number;
}>;

export type RemoveUserMfaFactorMutation = { readonly removeUserMfaFactor: boolean };

export type RemoveWebauthnCredentialMutationVariables = Exact<{
  credentialId: string | number;
}>;

export type RemoveWebauthnCredentialMutation = { readonly removeWebauthnCredential: boolean };

export type RenameCategoryMutationVariables = Exact<{
  id: string | number;
  name: string;
  slug: string;
}>;

export type RenameCategoryMutation = {
  readonly renameCategory: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly idpGroupIds: ReadonlyArray<string> | null;
    readonly exclusionGroupIds: ReadonlyArray<string> | null;
    readonly ackTriggers: Types.AckTrigger;
    readonly ackEveryone: boolean;
    readonly ackEveryoneSet: boolean;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  };
};

export type RenameMfaMethodMutationVariables = Exact<{
  methodId: string | number;
  label: string;
}>;

export type RenameMfaMethodMutation = { readonly renameMfaMethod: boolean };

export type RenameTemplateMutationVariables = Exact<{
  id: string | number;
  name: string;
}>;

export type RenameTemplateMutation = {
  readonly renameTemplate: {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly ownerCategoryId: string | null;
    readonly retiredAt: string | null;
    readonly updatedAt: string | null;
  };
};

export type RenameUserMfaFactorMutationVariables = Exact<{
  userId: string | number;
  methodId: string | number;
  label: string;
}>;

export type RenameUserMfaFactorMutation = { readonly renameUserMfaFactor: boolean };

export type ReorderAppendicesMutationVariables = Exact<{
  policyVersionId: string | number;
  orderedIds: ReadonlyArray<string | number> | string | number;
}>;

export type ReorderAppendicesMutation = {
  readonly reorderAppendices: ReadonlyArray<{
    readonly id: string;
    readonly policyVersionId: string;
    readonly title: string;
    readonly contentJson: string;
    readonly orderIndex: number;
    readonly letter: string;
  }>;
};

export type ReorderPolicyAppendicesMutationVariables = Exact<{
  policyId: string | number;
  orderedIds: ReadonlyArray<string | number> | string | number;
}>;

export type ReorderPolicyAppendicesMutation = {
  readonly reorderPolicyAppendices: ReadonlyArray<{
    readonly id: string;
    readonly policyId: string;
    readonly letter: string | null;
    readonly orderIndex: number;
    readonly retiredAt: string | null;
    readonly published: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly draft: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly versions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly publishedVersions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly contributors: ReadonlyArray<{
      readonly userId: string;
      readonly name: string;
      readonly active: boolean;
    }>;
  }>;
};

export type ReplyReviewThreadMutationVariables = Exact<{
  threadId: string | number;
  body: string;
}>;

export type ReplyReviewThreadMutation = {
  readonly replyReviewThread: {
    readonly id: string;
    readonly policyVersionId: string;
    readonly quote: string;
    readonly occurrence: number;
    readonly resolved: boolean;
    readonly approverUserId: string;
    readonly createdAt: string;
    readonly messages: ReadonlyArray<{
      readonly id: string;
      readonly authorUserId: string;
      readonly authorName: string | null;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly suggestion: {
      readonly text: string;
      readonly turn: Types.SuggestionSide;
      readonly outcome: Types.SuggestionOutcome | null;
      readonly reason: string | null;
      readonly closedBy: string | null;
      readonly closedText: string | null;
      readonly rounds: ReadonlyArray<{
        readonly by: Types.SuggestionSide;
        readonly text: string;
        readonly userId: string;
        readonly createdAt: string;
      }>;
    } | null;
  };
};

export type ReportCaseQueryVariables = Exact<{
  caseId: string | number;
}>;

export type ReportCaseQuery = {
  readonly reportCase: {
    readonly id: string;
    readonly caseCode: string;
    readonly kind: Types.ReportKind;
    readonly status: Types.CaseStatus;
    readonly reporterUserId: string | null;
    readonly assigneeUserId: string | null;
    readonly receivedAt: string;
    readonly discoveredOn: string | null;
    readonly outcome: Types.CaseOutcome | null;
    readonly closedAt: string | null;
    readonly details: {
      readonly whatHappened: string;
      readonly occurred: string;
      readonly location: string;
      readonly informationKinds: ReadonlyArray<Types.InformationKind>;
      readonly stillHappening: Types.ReportAnswer | null;
    };
    readonly attachments: ReadonlyArray<{
      readonly id: string;
      readonly filename: string;
      readonly contentType: string;
      readonly sizeBytes: number;
      readonly metadataStripped: boolean;
    }>;
    readonly thread: ReadonlyArray<{
      readonly id: string;
      readonly author: Types.MessageAuthor;
      readonly officerUserId: string | null;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly notes: ReadonlyArray<{
      readonly id: string;
      readonly authorUserId: string;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly assessment: {
      readonly suggestion: Types.RiskSuggestion | null;
      readonly decision: Types.BreachDecision | null;
      readonly reason: string;
      readonly decidedByUserId: string;
      readonly decidedAt: string;
      readonly factors: {
        readonly information: ReadonlyArray<Types.InformationKind>;
        readonly recipient: Types.RiskRecipient | null;
        readonly viewed: Types.RiskViewed | null;
        readonly mitigation: Types.RiskMitigation | null;
      };
    } | null;
    readonly notices: ReadonlyArray<{
      readonly id: string;
      readonly recipient: Types.NoticeRecipient;
      readonly label: string;
      readonly method: string;
      readonly daysAllowed: number;
      readonly dueOn: string;
      readonly status: Types.NoticeStatus;
      readonly sentOn: string | null;
    }>;
    readonly correctiveActions: ReadonlyArray<{
      readonly description: string;
      readonly policyId: string | null;
    }>;
  };
};

export type ReportCaseFieldsFragment = {
  readonly id: string;
  readonly caseCode: string;
  readonly kind: Types.ReportKind;
  readonly status: Types.CaseStatus;
  readonly reporterUserId: string | null;
  readonly assigneeUserId: string | null;
  readonly receivedAt: string;
  readonly discoveredOn: string | null;
  readonly outcome: Types.CaseOutcome | null;
  readonly closedAt: string | null;
  readonly details: {
    readonly whatHappened: string;
    readonly occurred: string;
    readonly location: string;
    readonly informationKinds: ReadonlyArray<Types.InformationKind>;
    readonly stillHappening: Types.ReportAnswer | null;
  };
  readonly attachments: ReadonlyArray<{
    readonly id: string;
    readonly filename: string;
    readonly contentType: string;
    readonly sizeBytes: number;
    readonly metadataStripped: boolean;
  }>;
  readonly thread: ReadonlyArray<{
    readonly id: string;
    readonly author: Types.MessageAuthor;
    readonly officerUserId: string | null;
    readonly body: string;
    readonly createdAt: string;
  }>;
  readonly notes: ReadonlyArray<{
    readonly id: string;
    readonly authorUserId: string;
    readonly body: string;
    readonly createdAt: string;
  }>;
  readonly assessment: {
    readonly suggestion: Types.RiskSuggestion | null;
    readonly decision: Types.BreachDecision | null;
    readonly reason: string;
    readonly decidedByUserId: string;
    readonly decidedAt: string;
    readonly factors: {
      readonly information: ReadonlyArray<Types.InformationKind>;
      readonly recipient: Types.RiskRecipient | null;
      readonly viewed: Types.RiskViewed | null;
      readonly mitigation: Types.RiskMitigation | null;
    };
  } | null;
  readonly notices: ReadonlyArray<{
    readonly id: string;
    readonly recipient: Types.NoticeRecipient;
    readonly label: string;
    readonly method: string;
    readonly daysAllowed: number;
    readonly dueOn: string;
    readonly status: Types.NoticeStatus;
    readonly sentOn: string | null;
  }>;
  readonly correctiveActions: ReadonlyArray<{
    readonly description: string;
    readonly policyId: string | null;
  }>;
};

export type ReportCasesQueryVariables = Exact<{
  statuses?: ReadonlyArray<Types.CaseStatus> | Types.CaseStatus | null | undefined;
  assigneeUserId?: string | number | null | undefined;
}>;

export type ReportCasesQuery = {
  readonly reportCases: {
    readonly cases: ReadonlyArray<{
      readonly id: string;
      readonly caseCode: string;
      readonly kind: Types.ReportKind;
      readonly status: Types.CaseStatus;
      readonly summary: string;
      readonly assigneeUserId: string | null;
      readonly receivedAt: string;
      readonly nextDeadline: string | null;
    }>;
    readonly counts: ReadonlyArray<{ readonly status: Types.CaseStatus; readonly count: number }>;
  };
};

export type RequestHardResetMutationVariables = Exact<{
  module: string;
  reason: string;
}>;

export type RequestHardResetMutation = {
  readonly requestHardReset: {
    readonly id: string;
    readonly module: string;
    readonly reason: string;
    readonly state: string;
    readonly requestedBy: string;
    readonly requestedAt: string;
    readonly expiresAt: string;
    readonly approvedBy: string | null;
    readonly approvedAt: string | null;
    readonly approvalExpiresAt: string | null;
    readonly cancelledAt: string | null;
    readonly consumedAt: string | null;
    readonly consumedBy: string | null;
  };
};

export type RequestPdfExportMutationVariables = Exact<{
  policyVersionId: string | number;
}>;

export type RequestPdfExportMutation = { readonly requestPDFExport: { readonly jobId: string } };

export type RequestStepUpOtpMutationVariables = Exact<{ [key: string]: never }>;

export type RequestStepUpOtpMutation = { readonly requestStepUpOtp: boolean };

export type ResendWelcomeEmailMutationVariables = Exact<{
  userId: string | number;
}>;

export type ResendWelcomeEmailMutation = { readonly resendWelcomeEmail: boolean };

export type ResetUserPasswordMutationVariables = Exact<{
  userId: string | number;
  newPassword: string;
}>;

export type ResetUserPasswordMutation = { readonly resetUserPassword: boolean };

export type ResolveUserLabelsQueryVariables = Exact<{
  ids: ReadonlyArray<string | number> | string | number;
}>;

export type ResolveUserLabelsQuery = {
  readonly resolveUserLabels: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly email: string | null;
  }>;
};

export type RestoreAppendixMutationVariables = Exact<{
  id: string | number;
}>;

export type RestoreAppendixMutation = {
  readonly restoreAppendix: {
    readonly id: string;
    readonly policyId: string;
    readonly letter: string | null;
    readonly orderIndex: number;
    readonly retiredAt: string | null;
    readonly published: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly draft: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly versions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly publishedVersions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly contributors: ReadonlyArray<{
      readonly userId: string;
      readonly name: string;
      readonly active: boolean;
    }>;
  };
};

export type RetireAppendixMutationVariables = Exact<{
  id: string | number;
}>;

export type RetireAppendixMutation = {
  readonly retireAppendix: {
    readonly id: string;
    readonly policyId: string;
    readonly letter: string | null;
    readonly orderIndex: number;
    readonly retiredAt: string | null;
    readonly published: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly draft: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly versions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly publishedVersions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly contributors: ReadonlyArray<{
      readonly userId: string;
      readonly name: string;
      readonly active: boolean;
    }>;
  };
};

export type RetirePolicyMutationVariables = Exact<{
  id: string | number;
}>;

export type RetirePolicyMutation = { readonly retirePolicy: { readonly id: string } };

export type RetireTemplateMutationVariables = Exact<{
  id: string | number;
}>;

export type RetireTemplateMutation = {
  readonly retireTemplate: {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly ownerCategoryId: string | null;
    readonly retiredAt: string | null;
    readonly updatedAt: string | null;
  };
};

export type ReviewThreadFieldsFragment = {
  readonly id: string;
  readonly policyVersionId: string;
  readonly quote: string;
  readonly occurrence: number;
  readonly resolved: boolean;
  readonly approverUserId: string;
  readonly createdAt: string;
  readonly messages: ReadonlyArray<{
    readonly id: string;
    readonly authorUserId: string;
    readonly authorName: string | null;
    readonly body: string;
    readonly createdAt: string;
  }>;
  readonly suggestion: {
    readonly text: string;
    readonly turn: Types.SuggestionSide;
    readonly outcome: Types.SuggestionOutcome | null;
    readonly reason: string | null;
    readonly closedBy: string | null;
    readonly closedText: string | null;
    readonly rounds: ReadonlyArray<{
      readonly by: Types.SuggestionSide;
      readonly text: string;
      readonly userId: string;
      readonly createdAt: string;
    }>;
  } | null;
};

export type ReviewThreadsQueryVariables = Exact<{
  policyVersionId: string | number;
}>;

export type ReviewThreadsQuery = {
  readonly reviewThreads: ReadonlyArray<{
    readonly id: string;
    readonly policyVersionId: string;
    readonly quote: string;
    readonly occurrence: number;
    readonly resolved: boolean;
    readonly approverUserId: string;
    readonly createdAt: string;
    readonly messages: ReadonlyArray<{
      readonly id: string;
      readonly authorUserId: string;
      readonly authorName: string | null;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly suggestion: {
      readonly text: string;
      readonly turn: Types.SuggestionSide;
      readonly outcome: Types.SuggestionOutcome | null;
      readonly reason: string | null;
      readonly closedBy: string | null;
      readonly closedText: string | null;
      readonly rounds: ReadonlyArray<{
        readonly by: Types.SuggestionSide;
        readonly text: string;
        readonly userId: string;
        readonly createdAt: string;
      }>;
    } | null;
  }>;
};

export type RevokeMagicLinkMutationVariables = Exact<{
  token: string;
}>;

export type RevokeMagicLinkMutation = { readonly revokeMagicLink: boolean };

export type RevokeMySessionsMutationVariables = Exact<{ [key: string]: never }>;

export type RevokeMySessionsMutation = { readonly revokeMySessions: number };

export type RevokeRoleMutationVariables = Exact<{
  userId: string | number;
  role: string;
}>;

export type RevokeRoleMutation = {
  readonly revokeRole: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly idpGroups: ReadonlyArray<string>;
    readonly groupIds: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
    readonly policyOverrides: ReadonlyArray<{
      readonly policyNumber: string;
      readonly effect: Types.OverrideEffect;
    }>;
    readonly memberships: ReadonlyArray<{ readonly groupId: string; readonly source: string }>;
  };
};

export type RevokeUserSessionsMutationVariables = Exact<{
  userId: string | number;
  reason?: string | null | undefined;
}>;

export type RevokeUserSessionsMutation = { readonly revokeUserSessions: number };

export type RunVetoesQueryVariables = Exact<{
  policyVersionId: string | number;
}>;

export type RunVetoesQuery = {
  readonly workflowStatus: {
    readonly stageAssignees: ReadonlyArray<
      ReadonlyArray<{ readonly userId: string; readonly veto: boolean }>
    >;
  };
};

export type SaveAppendixDraftMutationVariables = Exact<{
  id: string | number;
  title: string;
  contentJson: string;
}>;

export type SaveAppendixDraftMutation = {
  readonly saveAppendixDraft: {
    readonly id: string;
    readonly policyId: string;
    readonly letter: string | null;
    readonly orderIndex: number;
    readonly retiredAt: string | null;
    readonly published: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly draft: {
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    } | null;
    readonly versions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly publishedVersions: ReadonlyArray<{
      readonly id: string;
      readonly versionNo: number;
      readonly state: Types.AppendixState;
      readonly title: string;
      readonly contentJson: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly updatedBy: string;
      readonly publishedAt: string | null;
      readonly publishedBy: string | null;
    }>;
    readonly contributors: ReadonlyArray<{
      readonly userId: string;
      readonly name: string;
      readonly active: boolean;
    }>;
  };
};

export type SaveDraftMutationVariables = Exact<{
  policyId: string | number;
  contentJson: string;
  templateVersionId?: string | number | null | undefined;
}>;

export type SaveDraftMutation = {
  readonly saveDraft: {
    readonly id: string;
    readonly policyId: string;
    readonly versionNo: number;
    readonly semanticVersion: string | null;
    readonly suggestedChangeType: Types.ChangeType | null;
    readonly changeType: Types.ChangeType | null;
    readonly requestedChangeType: Types.ChangeType | null;
    readonly changeTypeReason: string | null;
    readonly changeTypeSetByUserId: string | null;
    readonly changeTypeAgreedByUserIds: ReadonlyArray<string>;
    readonly status: string;
    readonly templateVersionId: string;
    readonly contentJson: string;
    readonly createdAt: string | null;
    readonly publishedAt: string | null;
    readonly reacknowledge: boolean;
    readonly appendices: ReadonlyArray<{
      readonly id: string;
      readonly policyVersionId: string;
      readonly title: string;
      readonly contentJson: string;
      readonly orderIndex: number;
      readonly letter: string;
    }>;
  };
};

export type SearchAndAnswerQueryVariables = Exact<{
  question: string;
  categoryId?: string | number | null | undefined;
}>;

export type SearchAndAnswerQuery = {
  readonly searchAndAnswer: {
    readonly answer: string;
    readonly hasSensitiveSource: boolean;
    readonly noAuthorizedSource: boolean;
    readonly citations: ReadonlyArray<{
      readonly documentType: string | null;
      readonly policyId: string;
      readonly policyTitle: string;
      readonly sectionKey: string;
      readonly versionId: string;
      readonly versionNo: number;
    }>;
    readonly segments: ReadonlyArray<{
      readonly start: number;
      readonly end: number;
      readonly sources: ReadonlyArray<{ readonly policyId: string; readonly sectionKey: string }>;
    }>;
  };
};

export type SearchUsersQueryVariables = Exact<{
  query: string;
  limit?: number | null | undefined;
}>;

export type SearchUsersQuery = {
  readonly searchUsers: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly email: string | null;
  }>;
};

export type SetAiEnabledMutationVariables = Exact<{
  enabled: boolean;
}>;

export type SetAiEnabledMutation = { readonly setAIEnabled: boolean };

export type SetAiProviderCredentialMutationVariables = Exact<{
  credential: string;
}>;

export type SetAiProviderCredentialMutation = {
  readonly setAIProviderCredential: {
    readonly credentialSet: boolean;
    readonly credentialLast4: string;
  };
};

export type SetAiRetrievalConfigMutationVariables = Exact<{
  topK: number;
}>;

export type SetAiRetrievalConfigMutation = {
  readonly setAIRetrievalConfig: { readonly topK: number };
};

export type SetCaseDiscoveryDateMutationVariables = Exact<{
  caseId: string | number;
  discoveredOn: string;
}>;

export type SetCaseDiscoveryDateMutation = {
  readonly setCaseDiscoveryDate: {
    readonly id: string;
    readonly caseCode: string;
    readonly kind: Types.ReportKind;
    readonly status: Types.CaseStatus;
    readonly reporterUserId: string | null;
    readonly assigneeUserId: string | null;
    readonly receivedAt: string;
    readonly discoveredOn: string | null;
    readonly outcome: Types.CaseOutcome | null;
    readonly closedAt: string | null;
    readonly details: {
      readonly whatHappened: string;
      readonly occurred: string;
      readonly location: string;
      readonly informationKinds: ReadonlyArray<Types.InformationKind>;
      readonly stillHappening: Types.ReportAnswer | null;
    };
    readonly attachments: ReadonlyArray<{
      readonly id: string;
      readonly filename: string;
      readonly contentType: string;
      readonly sizeBytes: number;
      readonly metadataStripped: boolean;
    }>;
    readonly thread: ReadonlyArray<{
      readonly id: string;
      readonly author: Types.MessageAuthor;
      readonly officerUserId: string | null;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly notes: ReadonlyArray<{
      readonly id: string;
      readonly authorUserId: string;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly assessment: {
      readonly suggestion: Types.RiskSuggestion | null;
      readonly decision: Types.BreachDecision | null;
      readonly reason: string;
      readonly decidedByUserId: string;
      readonly decidedAt: string;
      readonly factors: {
        readonly information: ReadonlyArray<Types.InformationKind>;
        readonly recipient: Types.RiskRecipient | null;
        readonly viewed: Types.RiskViewed | null;
        readonly mitigation: Types.RiskMitigation | null;
      };
    } | null;
    readonly notices: ReadonlyArray<{
      readonly id: string;
      readonly recipient: Types.NoticeRecipient;
      readonly label: string;
      readonly method: string;
      readonly daysAllowed: number;
      readonly dueOn: string;
      readonly status: Types.NoticeStatus;
      readonly sentOn: string | null;
    }>;
    readonly correctiveActions: ReadonlyArray<{
      readonly description: string;
      readonly policyId: string | null;
    }>;
  };
};

export type SetCaseStatusMutationVariables = Exact<{
  caseId: string | number;
  status: Types.CaseStatus;
}>;

export type SetCaseStatusMutation = {
  readonly setCaseStatus: {
    readonly id: string;
    readonly caseCode: string;
    readonly kind: Types.ReportKind;
    readonly status: Types.CaseStatus;
    readonly reporterUserId: string | null;
    readonly assigneeUserId: string | null;
    readonly receivedAt: string;
    readonly discoveredOn: string | null;
    readonly outcome: Types.CaseOutcome | null;
    readonly closedAt: string | null;
    readonly details: {
      readonly whatHappened: string;
      readonly occurred: string;
      readonly location: string;
      readonly informationKinds: ReadonlyArray<Types.InformationKind>;
      readonly stillHappening: Types.ReportAnswer | null;
    };
    readonly attachments: ReadonlyArray<{
      readonly id: string;
      readonly filename: string;
      readonly contentType: string;
      readonly sizeBytes: number;
      readonly metadataStripped: boolean;
    }>;
    readonly thread: ReadonlyArray<{
      readonly id: string;
      readonly author: Types.MessageAuthor;
      readonly officerUserId: string | null;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly notes: ReadonlyArray<{
      readonly id: string;
      readonly authorUserId: string;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly assessment: {
      readonly suggestion: Types.RiskSuggestion | null;
      readonly decision: Types.BreachDecision | null;
      readonly reason: string;
      readonly decidedByUserId: string;
      readonly decidedAt: string;
      readonly factors: {
        readonly information: ReadonlyArray<Types.InformationKind>;
        readonly recipient: Types.RiskRecipient | null;
        readonly viewed: Types.RiskViewed | null;
        readonly mitigation: Types.RiskMitigation | null;
      };
    } | null;
    readonly notices: ReadonlyArray<{
      readonly id: string;
      readonly recipient: Types.NoticeRecipient;
      readonly label: string;
      readonly method: string;
      readonly daysAllowed: number;
      readonly dueOn: string;
      readonly status: Types.NoticeStatus;
      readonly sentOn: string | null;
    }>;
    readonly correctiveActions: ReadonlyArray<{
      readonly description: string;
      readonly policyId: string | null;
    }>;
  };
};

export type SetCategoryCadenceMutationVariables = Exact<{
  category: Types.NotifCategory;
  cadence: Types.NotifCadence;
}>;

export type SetCategoryCadenceMutation = {
  readonly setCategoryCadence: {
    readonly channels: { readonly email: boolean; readonly inApp: boolean; readonly push: boolean };
    readonly categories: ReadonlyArray<{
      readonly category: Types.NotifCategory;
      readonly cadence: Types.NotifCadence;
      readonly mandatory: boolean;
    }>;
    readonly overrides: ReadonlyArray<{
      readonly kind: string;
      readonly category: Types.NotifCategory;
      readonly cadence: Types.NotifCadence;
      readonly mandatory: boolean;
      readonly delivery: Types.NotifDelivery;
    }>;
    readonly digest: { readonly dailyHour: number; readonly weeklyDow: number };
  };
};

export type SetCategoryDefaultsMutationVariables = Exact<{
  id: string | number;
  defaultTemplateId?: string | number | null | undefined;
  defaultWorkflowId?: string | number | null | undefined;
  defaultTemplateNone?: boolean | null | undefined;
}>;

export type SetCategoryDefaultsMutation = {
  readonly setCategoryDefaults: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly idpGroupIds: ReadonlyArray<string> | null;
    readonly exclusionGroupIds: ReadonlyArray<string> | null;
    readonly ackTriggers: Types.AckTrigger;
    readonly ackEveryone: boolean;
    readonly ackEveryoneSet: boolean;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  };
};

export type SetCategoryDocumentTypesMutationVariables = Exact<{
  id: string | number;
  documentTypes: Types.CategoryDocumentTypes;
}>;

export type SetCategoryDocumentTypesMutation = {
  readonly setCategoryDocumentTypes: {
    readonly id: string;
    readonly documentTypes: Types.CategoryDocumentTypes;
  };
};

export type SetCategoryGovernanceMutationVariables = Exact<{
  id: string | number;
  owners: ReadonlyArray<string | number> | string | number;
  idpGroupIds?: ReadonlyArray<string> | string | null | undefined;
  exclusionGroupIds?: ReadonlyArray<string> | string | null | undefined;
  ackTriggers: Types.AckTrigger;
  reviewCadence: Types.ReviewCadence;
  reviewDate?: string | null | undefined;
  ackEveryone?: boolean | null | undefined;
}>;

export type SetCategoryGovernanceMutation = {
  readonly setCategoryGovernance: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly idpGroupIds: ReadonlyArray<string> | null;
    readonly exclusionGroupIds: ReadonlyArray<string> | null;
    readonly ackTriggers: Types.AckTrigger;
    readonly ackEveryone: boolean;
    readonly ackEveryoneSet: boolean;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  };
};

export type SetCategoryRulesetMutationVariables = Exact<{
  categoryId: string | number;
  rules: ReadonlyArray<Types.RaciRuleInput> | Types.RaciRuleInput;
}>;

export type SetCategoryRulesetMutation = {
  readonly setCategoryRuleset: {
    readonly categoryId: string;
    readonly rules: ReadonlyArray<{
      readonly subjectKind: Types.RaciSubjectKind;
      readonly subjectRef: string;
      readonly read: Types.RaciGrant;
      readonly ack: Types.RaciGrant;
      readonly approve: Types.RaciGrant;
      readonly author: Types.RaciGrant;
      readonly manage: Types.RaciGrant;
    }>;
  };
};

export type SetCategoryTemplateLockMutationVariables = Exact<{
  id: string | number;
  locked: boolean;
}>;

export type SetCategoryTemplateLockMutation = {
  readonly setCategoryTemplateLock: {
    readonly id: string;
    readonly defaultTemplateLocked: boolean;
  };
};

export type SetComplianceModuleMutationVariables = Exact<{
  enabled: boolean;
}>;

export type SetComplianceModuleMutation = {
  readonly setComplianceModule: { readonly moduleEnabled: boolean };
};

export type SetContactBlockArchivedMutationVariables = Exact<{
  id: string | number;
  archived: boolean;
}>;

export type SetContactBlockArchivedMutation = {
  readonly setContactBlockArchived: {
    readonly id: string;
    readonly label: string;
    readonly name: string | null;
    readonly role: string | null;
    readonly department: string | null;
    readonly email: string | null;
    readonly phone: string | null;
    readonly hours: string | null;
    readonly notes: string | null;
    readonly archived: boolean;
    readonly usedByCount: number;
  };
};

export type SetDefinitionArchivedMutationVariables = Exact<{
  id: string | number;
  archived: boolean;
}>;

export type SetDefinitionArchivedMutation = {
  readonly setDefinitionArchived: {
    readonly id: string;
    readonly categoryId: string;
    readonly term: string;
    readonly definition: string;
    readonly archived: boolean;
    readonly createdByUserId: string | null;
    readonly usedByCount: number;
  };
};

export type SetDigestWindowMutationVariables = Exact<{
  dailyHour: number;
  weeklyDow: number;
}>;

export type SetDigestWindowMutation = {
  readonly setDigestWindow: {
    readonly channels: { readonly email: boolean; readonly inApp: boolean; readonly push: boolean };
    readonly categories: ReadonlyArray<{
      readonly category: Types.NotifCategory;
      readonly cadence: Types.NotifCadence;
      readonly mandatory: boolean;
    }>;
    readonly overrides: ReadonlyArray<{
      readonly kind: string;
      readonly category: Types.NotifCategory;
      readonly cadence: Types.NotifCadence;
      readonly mandatory: boolean;
      readonly delivery: Types.NotifDelivery;
    }>;
    readonly digest: { readonly dailyHour: number; readonly weeklyDow: number };
  };
};

export type SetEmailServiceConfigMutationVariables = Exact<{
  input: Types.EmailServiceConfigInput;
}>;

export type SetEmailServiceConfigMutation = {
  readonly setEmailServiceConfig: {
    readonly apiKeySet: boolean;
    readonly provider: string;
    readonly domain: string;
    readonly region: string;
    readonly fromAddress: string;
    readonly enabled: boolean;
  };
};

export type SetGlobalSettingsMutationVariables = Exact<{
  input: Types.GlobalSettingsInput;
}>;

export type SetGlobalSettingsMutation = {
  readonly setGlobalSettings: {
    readonly announcement: {
      readonly enabled: boolean;
      readonly level: string;
      readonly message: string;
    };
    readonly maintenance: { readonly enabled: boolean; readonly message: string };
    readonly workCalendar: {
      readonly weekdays: ReadonlyArray<number>;
      readonly timezone: string;
      readonly holidays: ReadonlyArray<{ readonly date: string; readonly label: string }>;
    };
  };
};

export type SetNotificationChannelsMutationVariables = Exact<{
  input: Types.NotificationPrefInput;
}>;

export type SetNotificationChannelsMutation = {
  readonly setNotificationChannels: {
    readonly channels: { readonly email: boolean; readonly inApp: boolean; readonly push: boolean };
    readonly categories: ReadonlyArray<{
      readonly category: Types.NotifCategory;
      readonly cadence: Types.NotifCadence;
      readonly mandatory: boolean;
    }>;
    readonly overrides: ReadonlyArray<{
      readonly kind: string;
      readonly category: Types.NotifCategory;
      readonly cadence: Types.NotifCadence;
      readonly mandatory: boolean;
      readonly delivery: Types.NotifDelivery;
    }>;
    readonly digest: { readonly dailyHour: number; readonly weeklyDow: number };
  };
};

export type SetPolicyOwnerMutationVariables = Exact<{
  policyId: string | number;
  ownerUserId: string | number;
}>;

export type SetPolicyOwnerMutation = { readonly setPolicyOwner: { readonly id: string } };

export type SetPolicyTemplateMutationVariables = Exact<{
  policyId: string | number;
  templateId?: string | number | null | undefined;
  none: boolean;
}>;

export type SetPolicyTemplateMutation = {
  readonly setPolicyTemplate: {
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly documentType: Types.DocumentType;
    readonly sensitivity: Types.Sensitivity;
    readonly ownerUserId: string;
    readonly ownerName: string | null;
    readonly homeCategoryId: string;
    readonly ackTriggers: Types.AckTrigger | null;
    readonly ackAudienceOverride: ReadonlyArray<string> | null;
    readonly templateId: string | null;
    readonly templateNone: boolean;
    readonly currentDraftVersionId: string | null;
    readonly currentPublishedVersionId: string | null;
    readonly currentVersionNo: number | null;
    readonly currentVersionStatus: string | null;
    readonly updatedAt: string | null;
    readonly retiredAt: string | null;
    readonly viewerCan: {
      readonly read: boolean;
      readonly edit: boolean;
      readonly submit: boolean;
      readonly approve: boolean;
      readonly contentObfuscated: boolean;
      readonly canBreakGlass: boolean;
      readonly ack: boolean;
      readonly manage: boolean;
    };
  };
};

export type SetReferenceArchivedMutationVariables = Exact<{
  id: string | number;
  archived: boolean;
}>;

export type SetReferenceArchivedMutation = {
  readonly setReferenceArchived: {
    readonly id: string;
    readonly label: string;
    readonly kind: Types.ReferenceKind;
    readonly clause: string | null;
    readonly body: string | null;
    readonly url: string | null;
    readonly archived: boolean;
    readonly createdByUserId: string | null;
    readonly usedByCount: number;
  };
};

export type SetReviewThreadResolvedMutationVariables = Exact<{
  threadId: string | number;
  resolved: boolean;
}>;

export type SetReviewThreadResolvedMutation = {
  readonly setReviewThreadResolved: {
    readonly id: string;
    readonly policyVersionId: string;
    readonly quote: string;
    readonly occurrence: number;
    readonly resolved: boolean;
    readonly approverUserId: string;
    readonly createdAt: string;
    readonly messages: ReadonlyArray<{
      readonly id: string;
      readonly authorUserId: string;
      readonly authorName: string | null;
      readonly body: string;
      readonly createdAt: string;
    }>;
    readonly suggestion: {
      readonly text: string;
      readonly turn: Types.SuggestionSide;
      readonly outcome: Types.SuggestionOutcome | null;
      readonly reason: string | null;
      readonly closedBy: string | null;
      readonly closedText: string | null;
      readonly rounds: ReadonlyArray<{
        readonly by: Types.SuggestionSide;
        readonly text: string;
        readonly userId: string;
        readonly createdAt: string;
      }>;
    } | null;
  };
};

export type SetTypeCadenceMutationVariables = Exact<{
  kind: string;
  cadence: Types.NotifCadence;
}>;

export type SetTypeCadenceMutation = {
  readonly setTypeCadence: {
    readonly channels: { readonly email: boolean; readonly inApp: boolean; readonly push: boolean };
    readonly categories: ReadonlyArray<{
      readonly category: Types.NotifCategory;
      readonly cadence: Types.NotifCadence;
      readonly mandatory: boolean;
    }>;
    readonly overrides: ReadonlyArray<{
      readonly kind: string;
      readonly category: Types.NotifCategory;
      readonly cadence: Types.NotifCadence;
      readonly mandatory: boolean;
      readonly delivery: Types.NotifDelivery;
    }>;
    readonly digest: { readonly dailyHour: number; readonly weeklyDow: number };
  };
};

export type SetUserPolicyOverrideMutationVariables = Exact<{
  userId: string | number;
  policyNumber: string;
  effect?: Types.OverrideEffect | null | undefined;
}>;

export type SetUserPolicyOverrideMutation = {
  readonly setUserPolicyOverride: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly idpGroups: ReadonlyArray<string>;
    readonly groupIds: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
    readonly policyOverrides: ReadonlyArray<{
      readonly policyNumber: string;
      readonly effect: Types.OverrideEffect;
    }>;
    readonly memberships: ReadonlyArray<{ readonly groupId: string; readonly source: string }>;
  };
};

export type SetVersionContactsMutationVariables = Exact<{
  policyVersionId: string | number;
  contactBlockIds: ReadonlyArray<string | number> | string | number;
}>;

export type SetVersionContactsMutation = {
  readonly setVersionContacts: {
    readonly policyVersionId: string;
    readonly editable: boolean;
    readonly definitions: ReadonlyArray<{
      readonly id: string;
      readonly categoryId: string;
      readonly term: string;
      readonly definition: string;
      readonly archived: boolean;
      readonly createdByUserId: string | null;
      readonly usedByCount: number;
    }>;
    readonly related: ReadonlyArray<{
      readonly policyId: string;
      readonly number: string;
      readonly title: string;
      readonly type: string;
      readonly label: string;
      readonly direction: Types.RelatedDirection;
    }>;
    readonly references: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly kind: Types.ReferenceKind;
      readonly clause: string | null;
      readonly body: string | null;
      readonly url: string | null;
      readonly archived: boolean;
      readonly createdByUserId: string | null;
      readonly usedByCount: number;
    }>;
    readonly contacts: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly name: string | null;
      readonly role: string | null;
      readonly department: string | null;
      readonly email: string | null;
      readonly phone: string | null;
      readonly hours: string | null;
      readonly notes: string | null;
      readonly archived: boolean;
      readonly usedByCount: number;
    }>;
  };
};

export type SetVersionDefinitionsMutationVariables = Exact<{
  policyVersionId: string | number;
  definitionIds: ReadonlyArray<string | number> | string | number;
}>;

export type SetVersionDefinitionsMutation = {
  readonly setVersionDefinitions: {
    readonly policyVersionId: string;
    readonly editable: boolean;
    readonly definitions: ReadonlyArray<{
      readonly id: string;
      readonly categoryId: string;
      readonly term: string;
      readonly definition: string;
      readonly archived: boolean;
      readonly createdByUserId: string | null;
      readonly usedByCount: number;
    }>;
    readonly related: ReadonlyArray<{
      readonly policyId: string;
      readonly number: string;
      readonly title: string;
      readonly type: string;
      readonly label: string;
      readonly direction: Types.RelatedDirection;
    }>;
    readonly references: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly kind: Types.ReferenceKind;
      readonly clause: string | null;
      readonly body: string | null;
      readonly url: string | null;
      readonly archived: boolean;
      readonly createdByUserId: string | null;
      readonly usedByCount: number;
    }>;
    readonly contacts: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly name: string | null;
      readonly role: string | null;
      readonly department: string | null;
      readonly email: string | null;
      readonly phone: string | null;
      readonly hours: string | null;
      readonly notes: string | null;
      readonly archived: boolean;
      readonly usedByCount: number;
    }>;
  };
};

export type SetVersionReferencesMutationVariables = Exact<{
  policyVersionId: string | number;
  referenceIds: ReadonlyArray<string | number> | string | number;
}>;

export type SetVersionReferencesMutation = {
  readonly setVersionReferences: {
    readonly policyVersionId: string;
    readonly editable: boolean;
    readonly definitions: ReadonlyArray<{
      readonly id: string;
      readonly categoryId: string;
      readonly term: string;
      readonly definition: string;
      readonly archived: boolean;
      readonly createdByUserId: string | null;
      readonly usedByCount: number;
    }>;
    readonly related: ReadonlyArray<{
      readonly policyId: string;
      readonly number: string;
      readonly title: string;
      readonly type: string;
      readonly label: string;
      readonly direction: Types.RelatedDirection;
    }>;
    readonly references: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly kind: Types.ReferenceKind;
      readonly clause: string | null;
      readonly body: string | null;
      readonly url: string | null;
      readonly archived: boolean;
      readonly createdByUserId: string | null;
      readonly usedByCount: number;
    }>;
    readonly contacts: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly name: string | null;
      readonly role: string | null;
      readonly department: string | null;
      readonly email: string | null;
      readonly phone: string | null;
      readonly hours: string | null;
      readonly notes: string | null;
      readonly archived: boolean;
      readonly usedByCount: number;
    }>;
  };
};

export type SetVersionRelatedMutationVariables = Exact<{
  policyVersionId: string | number;
  links: ReadonlyArray<Types.RelatedLinkInput> | Types.RelatedLinkInput;
}>;

export type SetVersionRelatedMutation = {
  readonly setVersionRelated: {
    readonly policyVersionId: string;
    readonly editable: boolean;
    readonly definitions: ReadonlyArray<{
      readonly id: string;
      readonly categoryId: string;
      readonly term: string;
      readonly definition: string;
      readonly archived: boolean;
      readonly createdByUserId: string | null;
      readonly usedByCount: number;
    }>;
    readonly related: ReadonlyArray<{
      readonly policyId: string;
      readonly number: string;
      readonly title: string;
      readonly type: string;
      readonly label: string;
      readonly direction: Types.RelatedDirection;
    }>;
    readonly references: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly kind: Types.ReferenceKind;
      readonly clause: string | null;
      readonly body: string | null;
      readonly url: string | null;
      readonly archived: boolean;
      readonly createdByUserId: string | null;
      readonly usedByCount: number;
    }>;
    readonly contacts: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly name: string | null;
      readonly role: string | null;
      readonly department: string | null;
      readonly email: string | null;
      readonly phone: string | null;
      readonly hours: string | null;
      readonly notes: string | null;
      readonly archived: boolean;
      readonly usedByCount: number;
    }>;
  };
};

export type SignalWorkflowMutationVariables = Exact<{
  policyVersionId: string | number;
  runId: string | number;
  taskId: string | number;
  signal: Types.SignalType;
  comment: string;
}>;

export type SignalWorkflowMutation = { readonly signalWorkflow: boolean };

export type SimulateCategoryQueryVariables = Exact<{
  categoryId: string | number;
  userId: string | number;
  draftRules?: ReadonlyArray<Types.RaciRuleInput> | Types.RaciRuleInput | null | undefined;
}>;

export type SimulateCategoryQuery = {
  readonly simulateCategory: {
    readonly read: boolean;
    readonly readReason: string;
    readonly readCode: Types.RaciReasonCode;
    readonly ack: boolean;
    readonly ackReason: string;
    readonly ackCode: Types.RaciReasonCode;
    readonly approve: boolean;
    readonly approveReason: string;
    readonly approveCode: Types.RaciReasonCode;
    readonly author: boolean;
    readonly authorReason: string;
    readonly authorCode: Types.RaciReasonCode;
    readonly manage: boolean;
    readonly manageReason: string;
    readonly manageCode: Types.RaciReasonCode;
    readonly configuredBlock: ReadonlyArray<{
      readonly action: Types.RaciAction;
      readonly categoryId: string;
      readonly subjectKind: Types.RaciSubjectKind;
      readonly subjectRef: string;
    }>;
  };
};

export type SpCertificateQueryVariables = Exact<{ [key: string]: never }>;

export type SpCertificateQuery = {
  readonly spCertificate: {
    readonly active: boolean;
    readonly certPem: string;
    readonly notAfter: string;
    readonly serial: string;
    readonly spMetadataXml: string;
  };
};

export type StartDomainVerificationMutationVariables = Exact<{
  domain: string;
  rotate?: boolean | null | undefined;
}>;

export type StartDomainVerificationMutation = {
  readonly startDomainVerification: {
    readonly dnsRecordName: string;
    readonly dnsRecordValue: string;
    readonly instructions: string;
    readonly token: string;
  };
};

export type StartImpersonationMutationVariables = Exact<{
  userId: string | number;
  reason: string;
}>;

export type StartImpersonationMutation = {
  readonly startImpersonation: {
    readonly targetUserId: string;
    readonly targetName: string;
    readonly expiresAt: string;
  };
};

export type StopImpersonationMutationVariables = Exact<{ [key: string]: never }>;

export type StopImpersonationMutation = { readonly stopImpersonation: boolean };

export type SubmitDraftGenerationMutationVariables = Exact<{
  input: Types.SubmitDraftGenerationInput;
}>;

export type SubmitDraftGenerationMutation = {
  readonly submitDraftGeneration: { readonly jobId: string };
};

export type SubmitPolicyReviewMutationVariables = Exact<{
  input: Types.SubmitPolicyReviewInput;
}>;

export type SubmitPolicyReviewMutation = {
  readonly submitPolicyReview: { readonly jobId: string };
};

export type SubmitPolicyRevisionMutationVariables = Exact<{
  input: Types.SubmitPolicyRevisionInput;
}>;

export type SubmitPolicyRevisionMutation = {
  readonly submitPolicyRevision: { readonly jobId: string };
};

export type SubmitWorkflowMutationVariables = Exact<{
  policyVersionId: string | number;
  policyId: string | number;
  categoryId: string | number;
  ancestorCategoryIds: ReadonlyArray<string | number> | string | number;
  changeType?: Types.ChangeType | null | undefined;
  changeTypeReason?: string | null | undefined;
}>;

export type SubmitWorkflowMutation = { readonly submitWorkflow: { readonly runId: string } };

export type TemplateFieldsFragment = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly ownerCategoryId: string | null;
  readonly retiredAt: string | null;
  readonly updatedAt: string | null;
};

export type TemplateVersionFieldsFragment = {
  readonly id: string;
  readonly templateId: string;
  readonly versionNo: number;
  readonly semanticVersion: string | null;
  readonly changeType: Types.ChangeType | null;
  readonly createdAt: string | null;
  readonly publishedAt: string | null;
  readonly status: string;
  readonly sections: ReadonlyArray<{
    readonly key: string;
    readonly title: string;
    readonly order: number;
    readonly level: number;
    readonly required: boolean;
    readonly blocks: ReadonlyArray<{ readonly type: string; readonly contentJson: string | null }>;
  }>;
};

export type TemplateVersionsQueryVariables = Exact<{
  templateId: string | number;
}>;

export type TemplateVersionsQuery = {
  readonly templateVersions: ReadonlyArray<{
    readonly id: string;
    readonly templateId: string;
    readonly versionNo: number;
    readonly semanticVersion: string | null;
    readonly changeType: Types.ChangeType | null;
    readonly createdAt: string | null;
    readonly publishedAt: string | null;
    readonly status: string;
    readonly sections: ReadonlyArray<{
      readonly key: string;
      readonly title: string;
      readonly order: number;
      readonly level: number;
      readonly required: boolean;
      readonly blocks: ReadonlyArray<{
        readonly type: string;
        readonly contentJson: string | null;
      }>;
    }>;
  }>;
};

export type TemplatesQueryVariables = Exact<{
  ownerCategoryId?: string | number | null | undefined;
}>;

export type TemplatesQuery = {
  readonly templates: ReadonlyArray<{
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly ownerCategoryId: string | null;
    readonly retiredAt: string | null;
    readonly updatedAt: string | null;
  }>;
};

export type TopPolicyQuestionsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;

export type TopPolicyQuestionsQuery = { readonly topPolicyQuestions: ReadonlyArray<string> };

export type TransferRootMutationVariables = Exact<{
  userId: string | number;
  otp: string;
}>;

export type TransferRootMutation = {
  readonly transferRoot: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly idpGroups: ReadonlyArray<string>;
    readonly groupIds: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
    readonly policyOverrides: ReadonlyArray<{
      readonly policyNumber: string;
      readonly effect: Types.OverrideEffect;
    }>;
    readonly memberships: ReadonlyArray<{ readonly groupId: string; readonly source: string }>;
  };
};

export type UpcomingApprovalsQueryVariables = Exact<{ [key: string]: never }>;

export type UpcomingApprovalsQuery = {
  readonly upcomingApprovals: ReadonlyArray<{
    readonly policyVersionId: string;
    readonly policyTitle: string;
    readonly stageIndex: number;
    readonly stageName: string;
  }>;
};

export type UpdateAppendixMutationVariables = Exact<{
  id: string | number;
  title: string;
  contentJson: string;
}>;

export type UpdateAppendixMutation = {
  readonly updateAppendix: {
    readonly id: string;
    readonly policyVersionId: string;
    readonly title: string;
    readonly contentJson: string;
    readonly orderIndex: number;
    readonly letter: string;
  };
};

export type UpdateCaseNoticeMutationVariables = Exact<{
  caseId: string | number;
  noticeId: string | number;
  status: Types.NoticeStatus;
  sentOn?: string | null | undefined;
}>;

export type UpdateCaseNoticeMutation = {
  readonly updateCaseNotice: {
    readonly id: string;
    readonly recipient: Types.NoticeRecipient;
    readonly label: string;
    readonly method: string;
    readonly daysAllowed: number;
    readonly dueOn: string;
    readonly status: Types.NoticeStatus;
    readonly sentOn: string | null;
  };
};

export type UpdateContactBlockMutationVariables = Exact<{
  id: string | number;
  block: Types.ContactBlockInput;
}>;

export type UpdateContactBlockMutation = {
  readonly updateContactBlock: {
    readonly id: string;
    readonly label: string;
    readonly name: string | null;
    readonly role: string | null;
    readonly department: string | null;
    readonly email: string | null;
    readonly phone: string | null;
    readonly hours: string | null;
    readonly notes: string | null;
    readonly archived: boolean;
    readonly usedByCount: number;
  };
};

export type UpdateDefinitionMutationVariables = Exact<{
  id: string | number;
  input: Types.DefinitionEntryInput;
}>;

export type UpdateDefinitionMutation = {
  readonly updateDefinition: {
    readonly id: string;
    readonly categoryId: string;
    readonly term: string;
    readonly definition: string;
    readonly archived: boolean;
    readonly createdByUserId: string | null;
    readonly usedByCount: number;
  };
};

export type UpdateIdPConnectionMutationVariables = Exact<{
  domain: string;
  jitEnabled?: boolean | null | undefined;
  allowLocal?: boolean | null | undefined;
  secretRef?: string | null | undefined;
  clientSecret?: string | null | undefined;
}>;

export type UpdateIdPConnectionMutation = {
  readonly updateIdPConnection: {
    readonly connectionId: string;
    readonly connectionAlias: string;
    readonly displayName: string;
    readonly domain: string;
    readonly enabled: boolean;
    readonly jitEnabled: boolean;
    readonly orgName: string;
    readonly protocol: string;
    readonly testPassed: boolean;
    readonly verified: boolean;
    readonly allowLocal: boolean;
    readonly secretReentryRequired: boolean;
  };
};

export type UpdateMyProfileMutationVariables = Exact<{
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  locale?: string | null | undefined;
}>;

export type UpdateMyProfileMutation = {
  readonly updateMyProfile: {
    readonly userId: string;
    readonly username: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly locale: string;
    readonly roles: ReadonlyArray<string>;
    readonly permissions: ReadonlyArray<string>;
    readonly managedGroupIds: ReadonlyArray<string>;
  };
};

export type UpdateReferenceMutationVariables = Exact<{
  id: string | number;
  input: Types.ReferenceInput;
}>;

export type UpdateReferenceMutation = {
  readonly updateReference: {
    readonly id: string;
    readonly label: string;
    readonly kind: Types.ReferenceKind;
    readonly clause: string | null;
    readonly body: string | null;
    readonly url: string | null;
    readonly archived: boolean;
    readonly createdByUserId: string | null;
    readonly usedByCount: number;
  };
};

export type UpdateTemplateVersionSectionsMutationVariables = Exact<{
  id: string | number;
  sections: ReadonlyArray<Types.SectionInput> | Types.SectionInput;
}>;

export type UpdateTemplateVersionSectionsMutation = {
  readonly updateTemplateVersionSections: {
    readonly id: string;
    readonly templateId: string;
    readonly versionNo: number;
    readonly semanticVersion: string | null;
    readonly changeType: Types.ChangeType | null;
    readonly createdAt: string | null;
    readonly publishedAt: string | null;
    readonly status: string;
    readonly sections: ReadonlyArray<{
      readonly key: string;
      readonly title: string;
      readonly order: number;
      readonly level: number;
      readonly required: boolean;
      readonly blocks: ReadonlyArray<{
        readonly type: string;
        readonly contentJson: string | null;
      }>;
    }>;
  };
};

export type UpdateUserProfileMutationVariables = Exact<{
  userId: string | number;
  name: string;
  email: string;
}>;

export type UpdateUserProfileMutation = {
  readonly updateUserProfile: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly idpGroups: ReadonlyArray<string>;
    readonly groupIds: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
    readonly policyOverrides: ReadonlyArray<{
      readonly policyNumber: string;
      readonly effect: Types.OverrideEffect;
    }>;
    readonly memberships: ReadonlyArray<{ readonly groupId: string; readonly source: string }>;
  };
};

export type UpdateWorkflowDefMutationVariables = Exact<{
  id: string | number;
  name: string;
  description?: string | null | undefined;
  stages: ReadonlyArray<Types.WorkflowStageInput> | Types.WorkflowStageInput;
}>;

export type UpdateWorkflowDefMutation = {
  readonly updateWorkflowDef: {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly version: number;
    readonly stages: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly approvers: ReadonlyArray<string>;
      readonly quorum: string;
      readonly slaDays: number | null;
      readonly rejectOnSlaBreach: boolean | null;
      readonly remindEveryDays: number;
      readonly escalateAfterDays: number;
      readonly pinnedLast: boolean | null;
      readonly vetoUserIds: ReadonlyArray<string>;
      readonly approversByCategory: ReadonlyArray<{
        readonly categoryId: string;
        readonly approverIds: ReadonlyArray<string>;
      }>;
      readonly groupUnits: ReadonlyArray<{
        readonly groupId: string;
        readonly internalQuorum: string;
        readonly memberUserIds: ReadonlyArray<string>;
      }>;
    }>;
  };
};

export type UserFactorsQueryVariables = Exact<{
  userId: string | number;
}>;

export type UserFactorsQuery = {
  readonly userFactors: ReadonlyArray<{
    readonly id: string;
    readonly kind: string;
    readonly enrolledAt: string | null;
    readonly label: string | null;
  }>;
};

export type UserFieldsFragment = {
  readonly userId: string;
  readonly name: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly enabled: boolean;
  readonly roles: ReadonlyArray<string>;
  readonly idpGroups: ReadonlyArray<string>;
  readonly groupIds: ReadonlyArray<string>;
  readonly isRoot: boolean;
  readonly localAccount: boolean;
  readonly username: string;
  readonly deletedAt: string | null;
  readonly mergedIntoUserId: string | null;
  readonly policyOverrides: ReadonlyArray<{
    readonly policyNumber: string;
    readonly effect: Types.OverrideEffect;
  }>;
  readonly memberships: ReadonlyArray<{ readonly groupId: string; readonly source: string }>;
};

export type UsersQueryVariables = Exact<{
  search?: string | null | undefined;
  includeDeleted?: boolean | null | undefined;
}>;

export type UsersQuery = {
  readonly users: {
    readonly nextPageToken: string;
    readonly users: ReadonlyArray<{
      readonly userId: string;
      readonly name: string;
      readonly firstName: string;
      readonly lastName: string;
      readonly email: string;
      readonly enabled: boolean;
      readonly roles: ReadonlyArray<string>;
      readonly idpGroups: ReadonlyArray<string>;
      readonly groupIds: ReadonlyArray<string>;
      readonly isRoot: boolean;
      readonly localAccount: boolean;
      readonly username: string;
      readonly deletedAt: string | null;
      readonly mergedIntoUserId: string | null;
      readonly policyOverrides: ReadonlyArray<{
        readonly policyNumber: string;
        readonly effect: Types.OverrideEffect;
      }>;
      readonly memberships: ReadonlyArray<{ readonly groupId: string; readonly source: string }>;
    }>;
  };
};

export type VerifyAuditChainQueryVariables = Exact<{
  fromRecordId: string;
  toRecordId: string;
}>;

export type VerifyAuditChainQuery = {
  readonly verifyAuditChain: {
    readonly valid: boolean;
    readonly recordsChecked: number;
    readonly errors: ReadonlyArray<string>;
  };
};

export type VerifyDomainMutationVariables = Exact<{
  domain: string;
}>;

export type VerifyDomainMutation = {
  readonly verifyDomain: {
    readonly connectionId: string;
    readonly connectionAlias: string;
    readonly displayName: string;
    readonly domain: string;
    readonly enabled: boolean;
    readonly jitEnabled: boolean;
    readonly orgName: string;
    readonly protocol: string;
    readonly testPassed: boolean;
    readonly verified: boolean;
    readonly allowLocal: boolean;
    readonly secretReentryRequired: boolean;
  };
};

export type VersionChangesSinceReviewQueryVariables = Exact<{
  policyVersionId: string | number;
}>;

export type VersionChangesSinceReviewQuery = {
  readonly versionChangesSinceReview: ReadonlyArray<{
    readonly sectionKey: string;
    readonly sectionTitle: string;
    readonly changeType: string;
    readonly wordDiffHtml: string | null;
  }>;
};

export type VersionLinksFieldsFragment = {
  readonly policyVersionId: string;
  readonly editable: boolean;
  readonly definitions: ReadonlyArray<{
    readonly id: string;
    readonly categoryId: string;
    readonly term: string;
    readonly definition: string;
    readonly archived: boolean;
    readonly createdByUserId: string | null;
    readonly usedByCount: number;
  }>;
  readonly related: ReadonlyArray<{
    readonly policyId: string;
    readonly number: string;
    readonly title: string;
    readonly type: string;
    readonly label: string;
    readonly direction: Types.RelatedDirection;
  }>;
  readonly references: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly kind: Types.ReferenceKind;
    readonly clause: string | null;
    readonly body: string | null;
    readonly url: string | null;
    readonly archived: boolean;
    readonly createdByUserId: string | null;
    readonly usedByCount: number;
  }>;
  readonly contacts: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly name: string | null;
    readonly role: string | null;
    readonly department: string | null;
    readonly email: string | null;
    readonly phone: string | null;
    readonly hours: string | null;
    readonly notes: string | null;
    readonly archived: boolean;
    readonly usedByCount: number;
  }>;
};

export type WebauthnRegisterBeginMutationVariables = Exact<{ [key: string]: never }>;

export type WebauthnRegisterBeginMutation = {
  readonly webauthnRegisterBegin: { readonly optionsJson: string; readonly sessionId: string };
};

export type WebauthnRegisterFinishMutationVariables = Exact<{
  sessionId: string | number;
  credentialJson: string;
  label?: string | null | undefined;
}>;

export type WebauthnRegisterFinishMutation = { readonly webauthnRegisterFinish: boolean };

export type WorkflowApproverCandidatesQueryVariables = Exact<{
  workflowId: string | number;
}>;

export type WorkflowApproverCandidatesQuery = {
  readonly workflowApproverCandidates: {
    readonly workflowId: string;
    readonly attached: boolean;
    readonly categoryIds: ReadonlyArray<string>;
    readonly users: ReadonlyArray<{ readonly userId: string; readonly name: string }>;
  };
};

export type WorkflowDefQueryVariables = Exact<{
  id: string | number;
}>;

export type WorkflowDefQuery = {
  readonly workflowDef: {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly version: number;
    readonly stages: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly approvers: ReadonlyArray<string>;
      readonly quorum: string;
      readonly slaDays: number | null;
      readonly rejectOnSlaBreach: boolean | null;
      readonly remindEveryDays: number;
      readonly escalateAfterDays: number;
      readonly pinnedLast: boolean | null;
      readonly vetoUserIds: ReadonlyArray<string>;
      readonly approversByCategory: ReadonlyArray<{
        readonly categoryId: string;
        readonly approverIds: ReadonlyArray<string>;
      }>;
      readonly groupUnits: ReadonlyArray<{
        readonly groupId: string;
        readonly internalQuorum: string;
        readonly memberUserIds: ReadonlyArray<string>;
      }>;
    }>;
  } | null;
};

export type WorkflowDefFieldsFragment = {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly version: number;
  readonly stages: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly approvers: ReadonlyArray<string>;
    readonly quorum: string;
    readonly slaDays: number | null;
    readonly rejectOnSlaBreach: boolean | null;
    readonly remindEveryDays: number;
    readonly escalateAfterDays: number;
    readonly pinnedLast: boolean | null;
    readonly vetoUserIds: ReadonlyArray<string>;
    readonly approversByCategory: ReadonlyArray<{
      readonly categoryId: string;
      readonly approverIds: ReadonlyArray<string>;
    }>;
    readonly groupUnits: ReadonlyArray<{
      readonly groupId: string;
      readonly internalQuorum: string;
      readonly memberUserIds: ReadonlyArray<string>;
    }>;
  }>;
};

export type WorkflowDefsQueryVariables = Exact<{ [key: string]: never }>;

export type WorkflowDefsQuery = {
  readonly workflowDefs: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly version: number;
    readonly stages: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly approvers: ReadonlyArray<string>;
      readonly quorum: string;
      readonly slaDays: number | null;
      readonly rejectOnSlaBreach: boolean | null;
      readonly remindEveryDays: number;
      readonly escalateAfterDays: number;
      readonly pinnedLast: boolean | null;
      readonly vetoUserIds: ReadonlyArray<string>;
      readonly approversByCategory: ReadonlyArray<{
        readonly categoryId: string;
        readonly approverIds: ReadonlyArray<string>;
      }>;
      readonly groupUnits: ReadonlyArray<{
        readonly groupId: string;
        readonly internalQuorum: string;
        readonly memberUserIds: ReadonlyArray<string>;
      }>;
    }>;
  }>;
};

export type WorkflowStageDefFieldsFragment = {
  readonly id: string;
  readonly name: string;
  readonly approvers: ReadonlyArray<string>;
  readonly quorum: string;
  readonly slaDays: number | null;
  readonly rejectOnSlaBreach: boolean | null;
  readonly remindEveryDays: number;
  readonly escalateAfterDays: number;
  readonly pinnedLast: boolean | null;
  readonly vetoUserIds: ReadonlyArray<string>;
  readonly approversByCategory: ReadonlyArray<{
    readonly categoryId: string;
    readonly approverIds: ReadonlyArray<string>;
  }>;
  readonly groupUnits: ReadonlyArray<{
    readonly groupId: string;
    readonly internalQuorum: string;
    readonly memberUserIds: ReadonlyArray<string>;
  }>;
};

export type WorkflowStatusQueryVariables = Exact<{
  policyVersionId: string | number;
}>;

export type WorkflowStatusQuery = {
  readonly workflowStatus: {
    readonly status: Types.ApprovalStatus;
    readonly runId: string;
    readonly currentStageIdx: number;
    readonly stageNames: ReadonlyArray<string>;
    readonly submittedBy: string | null;
    readonly submittedAt: string | null;
    readonly stageAssignees: ReadonlyArray<
      ReadonlyArray<{
        readonly userId: string;
        readonly name: string | null;
        readonly state: string;
        readonly comment: string | null;
        readonly decidedAt: string | null;
        readonly groupId: string | null;
      }>
    >;
    readonly stageUnitProgress: ReadonlyArray<
      ReadonlyArray<{
        readonly groupId: string;
        readonly groupName: string | null;
        readonly quorum: string;
        readonly required: number;
        readonly approvals: number;
        readonly pending: number;
        readonly roster: number;
        readonly status: string;
      }>
    >;
    readonly stageProgress: ReadonlyArray<{
      readonly dueAt: string | null;
      readonly quorum: string;
      readonly quorumN: number;
      readonly approvals: number;
      readonly required: number;
    }>;
  };
};

export const AuditRecordFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AuditRecordFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AuditRecord" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "recordUuid" } },
          { kind: "Field", name: { kind: "Name", value: "tier" } },
          { kind: "Field", name: { kind: "Name", value: "action" } },
          { kind: "Field", name: { kind: "Name", value: "actorUserId" } },
          { kind: "Field", name: { kind: "Name", value: "subject" } },
          { kind: "Field", name: { kind: "Name", value: "groupId" } },
          { kind: "Field", name: { kind: "Name", value: "occurredAt" } },
          { kind: "Field", name: { kind: "Name", value: "prevHash" } },
          { kind: "Field", name: { kind: "Name", value: "recordHash" } },
          { kind: "Field", name: { kind: "Name", value: "legalBasisExempt" } },
          { kind: "Field", name: { kind: "Name", value: "actorName" } },
          { kind: "Field", name: { kind: "Name", value: "groupName" } },
          { kind: "Field", name: { kind: "Name", value: "subjectLabel" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AuditRecordFieldsFragment, unknown>;
export const AuthoringPolicyFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AuthoringPolicyFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Policy" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "number" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "documentType" } },
          { kind: "Field", name: { kind: "Name", value: "sensitivity" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUserId" } },
          { kind: "Field", name: { kind: "Name", value: "ownerName" } },
          { kind: "Field", name: { kind: "Name", value: "homeCategoryId" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackAudienceOverride" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "templateNone" } },
          { kind: "Field", name: { kind: "Name", value: "currentDraftVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentPublishedVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionNo" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "viewerCan" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "read" } },
                { kind: "Field", name: { kind: "Name", value: "edit" } },
                { kind: "Field", name: { kind: "Name", value: "submit" } },
                { kind: "Field", name: { kind: "Name", value: "approve" } },
                { kind: "Field", name: { kind: "Name", value: "contentObfuscated" } },
                { kind: "Field", name: { kind: "Name", value: "canBreakGlass" } },
                { kind: "Field", name: { kind: "Name", value: "ack" } },
                { kind: "Field", name: { kind: "Name", value: "manage" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AuthoringPolicyFieldsFragment, unknown>;
export const CategoryFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "CategoryFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Category" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "parentId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateNone" } },
          { kind: "Field", name: { kind: "Name", value: "defaultWorkflowId" } },
          { kind: "Field", name: { kind: "Name", value: "owners" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "exclusionGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryone" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryoneSet" } },
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoryFieldsFragment, unknown>;
export const HardResetRequestFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "HardResetRequestFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "HardResetRequest" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "module" } },
          { kind: "Field", name: { kind: "Name", value: "reason" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "requestedBy" } },
          { kind: "Field", name: { kind: "Name", value: "requestedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvedBy" } },
          { kind: "Field", name: { kind: "Name", value: "approvedAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvalExpiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "cancelledAt" } },
          { kind: "Field", name: { kind: "Name", value: "consumedAt" } },
          { kind: "Field", name: { kind: "Name", value: "consumedBy" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HardResetRequestFieldsFragment, unknown>;
export const NotificationSettingsFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "NotificationSettingsFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "NotificationSettings" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "channels" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "inApp" } },
                { kind: "Field", name: { kind: "Name", value: "push" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "categories" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "cadence" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "overrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "cadence" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
                { kind: "Field", name: { kind: "Name", value: "delivery" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "digest" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "dailyHour" } },
                { kind: "Field", name: { kind: "Name", value: "weeklyDow" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<NotificationSettingsFieldsFragment, unknown>;
export const OrganizationFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OrganizationFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Organization" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "connectionId" } },
          { kind: "Field", name: { kind: "Name", value: "connectionAlias" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "jitEnabled" } },
          { kind: "Field", name: { kind: "Name", value: "orgName" } },
          { kind: "Field", name: { kind: "Name", value: "protocol" } },
          { kind: "Field", name: { kind: "Name", value: "testPassed" } },
          { kind: "Field", name: { kind: "Name", value: "verified" } },
          { kind: "Field", name: { kind: "Name", value: "allowLocal" } },
          { kind: "Field", name: { kind: "Name", value: "secretReentryRequired" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrganizationFieldsFragment, unknown>;
export const AppendixVersionFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AppendixVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedBy" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedBy" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AppendixVersionFieldsFragment, unknown>;
export const PolicyAppendixFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PolicyAppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyAppendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyId" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "published" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "draft" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "versions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "publishedVersions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contributors" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "active" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AppendixVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedBy" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedBy" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyAppendixFieldsFragment, unknown>;
export const AppendixFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Appendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AppendixFieldsFragment, unknown>;
export const PolicyVersionFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PolicyVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyId" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "semanticVersion" } },
          { kind: "Field", name: { kind: "Name", value: "suggestedChangeType" } },
          { kind: "Field", name: { kind: "Name", value: "changeType" } },
          { kind: "Field", name: { kind: "Name", value: "requestedChangeType" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeReason" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeSetByUserId" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeAgreedByUserIds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "templateVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeAgreedByUserIds" } },
          { kind: "Field", name: { kind: "Name", value: "reacknowledge" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "appendices" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Appendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyVersionFieldsFragment, unknown>;
export const RaciRuleFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RaciRuleFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "RaciRule" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "subjectKind" } },
          { kind: "Field", name: { kind: "Name", value: "subjectRef" } },
          { kind: "Field", name: { kind: "Name", value: "read" } },
          { kind: "Field", name: { kind: "Name", value: "ack" } },
          { kind: "Field", name: { kind: "Name", value: "approve" } },
          { kind: "Field", name: { kind: "Name", value: "author" } },
          { kind: "Field", name: { kind: "Name", value: "manage" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RaciRuleFieldsFragment, unknown>;
export const ReportCaseFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReportCaseFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReportCase" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "caseCode" } },
          { kind: "Field", name: { kind: "Name", value: "kind" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "details" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "whatHappened" } },
                { kind: "Field", name: { kind: "Name", value: "occurred" } },
                { kind: "Field", name: { kind: "Name", value: "location" } },
                { kind: "Field", name: { kind: "Name", value: "informationKinds" } },
                { kind: "Field", name: { kind: "Name", value: "stillHappening" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "reporterUserId" } },
          { kind: "Field", name: { kind: "Name", value: "assigneeUserId" } },
          { kind: "Field", name: { kind: "Name", value: "receivedAt" } },
          { kind: "Field", name: { kind: "Name", value: "discoveredOn" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "attachments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "filename" } },
                { kind: "Field", name: { kind: "Name", value: "contentType" } },
                { kind: "Field", name: { kind: "Name", value: "sizeBytes" } },
                { kind: "Field", name: { kind: "Name", value: "metadataStripped" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "author" } },
                { kind: "Field", name: { kind: "Name", value: "officerUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "assessment" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "factors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "information" } },
                      { kind: "Field", name: { kind: "Name", value: "recipient" } },
                      { kind: "Field", name: { kind: "Name", value: "viewed" } },
                      { kind: "Field", name: { kind: "Name", value: "mitigation" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "suggestion" } },
                { kind: "Field", name: { kind: "Name", value: "decision" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "decidedByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "decidedAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notices" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "recipient" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "method" } },
                { kind: "Field", name: { kind: "Name", value: "daysAllowed" } },
                { kind: "Field", name: { kind: "Name", value: "dueOn" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "sentOn" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "outcome" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctiveActions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "closedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReportCaseFieldsFragment, unknown>;
export const ReviewThreadFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReviewThreadFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReviewThread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "quote" } },
          { kind: "Field", name: { kind: "Name", value: "occurrence" } },
          { kind: "Field", name: { kind: "Name", value: "resolved" } },
          { kind: "Field", name: { kind: "Name", value: "approverUserId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "messages" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "authorName" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "suggestion" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "turn" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rounds" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "by" } },
                      { kind: "Field", name: { kind: "Name", value: "text" } },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "outcome" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "closedBy" } },
                { kind: "Field", name: { kind: "Name", value: "closedText" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReviewThreadFieldsFragment, unknown>;
export const TemplateFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TemplateFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Template" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "code" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "ownerCategoryId" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TemplateFieldsFragment, unknown>;
export const TemplateVersionFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TemplateVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "TemplateVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "semanticVersion" } },
          { kind: "Field", name: { kind: "Name", value: "changeType" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "sections" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "key" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "order" } },
                { kind: "Field", name: { kind: "Name", value: "level" } },
                { kind: "Field", name: { kind: "Name", value: "required" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "blocks" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "contentJson" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TemplateVersionFieldsFragment, unknown>;
export const UserFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
          { kind: "Field", name: { kind: "Name", value: "groupIds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyOverrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyNumber" } },
                { kind: "Field", name: { kind: "Name", value: "effect" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "memberships" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserFieldsFragment, unknown>;
export const VersionLinksFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "VersionLinksFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyVersionLinks" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "editable" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "definitions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                { kind: "Field", name: { kind: "Name", value: "definition" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "related" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "direction" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "references" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "clause" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contacts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "department" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "phone" } },
                { kind: "Field", name: { kind: "Name", value: "hours" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VersionLinksFieldsFragment, unknown>;
export const WorkflowStageDefFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "WorkflowStageDefFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "WorkflowStageDef" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "approvers" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "approversByCategory" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "approverIds" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "groupUnits" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "internalQuorum" } },
                { kind: "Field", name: { kind: "Name", value: "memberUserIds" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "quorum" } },
          { kind: "Field", name: { kind: "Name", value: "slaDays" } },
          { kind: "Field", name: { kind: "Name", value: "rejectOnSlaBreach" } },
          { kind: "Field", name: { kind: "Name", value: "remindEveryDays" } },
          { kind: "Field", name: { kind: "Name", value: "escalateAfterDays" } },
          { kind: "Field", name: { kind: "Name", value: "pinnedLast" } },
          { kind: "Field", name: { kind: "Name", value: "vetoUserIds" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<WorkflowStageDefFieldsFragment, unknown>;
export const WorkflowDefFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "WorkflowDefFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "WorkflowDef" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "stages" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "WorkflowStageDefFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "WorkflowStageDefFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "WorkflowStageDef" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "approvers" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "approversByCategory" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "approverIds" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "groupUnits" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "internalQuorum" } },
                { kind: "Field", name: { kind: "Name", value: "memberUserIds" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "quorum" } },
          { kind: "Field", name: { kind: "Name", value: "slaDays" } },
          { kind: "Field", name: { kind: "Name", value: "rejectOnSlaBreach" } },
          { kind: "Field", name: { kind: "Name", value: "remindEveryDays" } },
          { kind: "Field", name: { kind: "Name", value: "escalateAfterDays" } },
          { kind: "Field", name: { kind: "Name", value: "pinnedLast" } },
          { kind: "Field", name: { kind: "Name", value: "vetoUserIds" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<WorkflowDefFieldsFragment, unknown>;
export const AckActivityDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AckActivity" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "days" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "ackActivity" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "groupId" },
                value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "days" },
                value: { kind: "Variable", name: { kind: "Name", value: "days" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "date" } },
                { kind: "Field", name: { kind: "Name", value: "acks" } },
                { kind: "Field", name: { kind: "Name", value: "views" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AckActivityQuery, AckActivityQueryVariables>;
export const AckRosterDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AckRoster" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "ackRoster" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "groupId" },
                value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "acked" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                      { kind: "Field", name: { kind: "Name", value: "userName" } },
                      { kind: "Field", name: { kind: "Name", value: "ackedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "dueAt" } },
                      { kind: "Field", name: { kind: "Name", value: "groups" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pending" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                      { kind: "Field", name: { kind: "Name", value: "userName" } },
                      { kind: "Field", name: { kind: "Name", value: "ackedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "dueAt" } },
                      { kind: "Field", name: { kind: "Name", value: "groups" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AckRosterQuery, AckRosterQueryVariables>;
export const AckStatusDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AckStatus" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "ackStatus" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "acknowledged" } },
                { kind: "Field", name: { kind: "Name", value: "ackedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AckStatusQuery, AckStatusQueryVariables>;
export const ActivateOrganizationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ActivateOrganization" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "domain" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "activateOrganization" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "domain" },
                value: { kind: "Variable", name: { kind: "Name", value: "domain" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "OrganizationFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OrganizationFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Organization" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "connectionId" } },
          { kind: "Field", name: { kind: "Name", value: "connectionAlias" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "jitEnabled" } },
          { kind: "Field", name: { kind: "Name", value: "orgName" } },
          { kind: "Field", name: { kind: "Name", value: "protocol" } },
          { kind: "Field", name: { kind: "Name", value: "testPassed" } },
          { kind: "Field", name: { kind: "Name", value: "verified" } },
          { kind: "Field", name: { kind: "Name", value: "allowLocal" } },
          { kind: "Field", name: { kind: "Name", value: "secretReentryRequired" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ActivateOrganizationMutation, ActivateOrganizationMutationVariables>;
export const AddAppendixDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddAppendix" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "title" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "contentJson" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addAppendix" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: { kind: "Variable", name: { kind: "Name", value: "title" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "contentJson" },
                value: { kind: "Variable", name: { kind: "Name", value: "contentJson" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Appendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddAppendixMutation, AddAppendixMutationVariables>;
export const AddCaseNoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddCaseNote" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "body" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addCaseNote" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "caseId" },
                value: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "body" },
                value: { kind: "Variable", name: { kind: "Name", value: "body" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddCaseNoteMutation, AddCaseNoteMutationVariables>;
export const AddCaseNoticeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddCaseNotice" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "recipient" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "NoticeRecipient" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "label" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "method" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addCaseNotice" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "caseId" },
                value: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "recipient" },
                value: { kind: "Variable", name: { kind: "Name", value: "recipient" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "label" },
                value: { kind: "Variable", name: { kind: "Name", value: "label" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "method" },
                value: { kind: "Variable", name: { kind: "Name", value: "method" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "recipient" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "method" } },
                { kind: "Field", name: { kind: "Name", value: "daysAllowed" } },
                { kind: "Field", name: { kind: "Name", value: "dueOn" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "sentOn" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddCaseNoticeMutation, AddCaseNoticeMutationVariables>;
export const AddGroupMappingDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddGroupMapping" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "connectionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "idpGroupClaimValue" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "targetGroupId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addGroupMapping" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "connectionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "connectionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "idpGroupClaimValue" },
                value: { kind: "Variable", name: { kind: "Name", value: "idpGroupClaimValue" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "targetGroupId" },
                value: { kind: "Variable", name: { kind: "Name", value: "targetGroupId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "connectionId" } },
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "idpGroupClaimValue" } },
                { kind: "Field", name: { kind: "Name", value: "targetGroupId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddGroupMappingMutation, AddGroupMappingMutationVariables>;
export const AddOrganizationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddOrganization" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "AddOrganizationInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addOrganization" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "OrganizationFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OrganizationFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Organization" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "connectionId" } },
          { kind: "Field", name: { kind: "Name", value: "connectionAlias" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "jitEnabled" } },
          { kind: "Field", name: { kind: "Name", value: "orgName" } },
          { kind: "Field", name: { kind: "Name", value: "protocol" } },
          { kind: "Field", name: { kind: "Name", value: "testPassed" } },
          { kind: "Field", name: { kind: "Name", value: "verified" } },
          { kind: "Field", name: { kind: "Name", value: "allowLocal" } },
          { kind: "Field", name: { kind: "Name", value: "secretReentryRequired" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddOrganizationMutation, AddOrganizationMutationVariables>;
export const AddReviewThreadDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddReviewThread" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "quote" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "occurrence" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "body" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "suggestedText" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "toUserId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addReviewThread" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "quote" },
                value: { kind: "Variable", name: { kind: "Name", value: "quote" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "occurrence" },
                value: { kind: "Variable", name: { kind: "Name", value: "occurrence" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "body" },
                value: { kind: "Variable", name: { kind: "Name", value: "body" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "suggestedText" },
                value: { kind: "Variable", name: { kind: "Name", value: "suggestedText" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "toUserId" },
                value: { kind: "Variable", name: { kind: "Name", value: "toUserId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ReviewThreadFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReviewThreadFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReviewThread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "quote" } },
          { kind: "Field", name: { kind: "Name", value: "occurrence" } },
          { kind: "Field", name: { kind: "Name", value: "resolved" } },
          { kind: "Field", name: { kind: "Name", value: "approverUserId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "messages" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "authorName" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "suggestion" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "turn" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rounds" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "by" } },
                      { kind: "Field", name: { kind: "Name", value: "text" } },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "outcome" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "closedBy" } },
                { kind: "Field", name: { kind: "Name", value: "closedText" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddReviewThreadMutation, AddReviewThreadMutationVariables>;
export const AddUserToGroupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddUserToGroup" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addUserToGroup" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "groupId" },
                value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
          { kind: "Field", name: { kind: "Name", value: "groupIds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyOverrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyNumber" } },
                { kind: "Field", name: { kind: "Name", value: "effect" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "memberships" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddUserToGroupMutation, AddUserToGroupMutationVariables>;
export const AiConfigDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AiConfig" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "aiConfig" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "enabled" } },
                { kind: "Field", name: { kind: "Name", value: "provider" } },
                { kind: "Field", name: { kind: "Name", value: "model" } },
                { kind: "Field", name: { kind: "Name", value: "credentialSet" } },
                { kind: "Field", name: { kind: "Name", value: "credentialLast4" } },
                { kind: "Field", name: { kind: "Name", value: "topK" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiConfigQuery, AiConfigQueryVariables>;
export const AiHealthDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AiHealth" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "aiHealth" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "available" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiHealthQuery, AiHealthQueryVariables>;
export const AiJobDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AiJob" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "jobId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "aiJob" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "jobId" },
                value: { kind: "Variable", name: { kind: "Name", value: "jobId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "phase" } },
                { kind: "Field", name: { kind: "Name", value: "resultRef" } },
                { kind: "Field", name: { kind: "Name", value: "error" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiJobQuery, AiJobQueryVariables>;
export const AiJobResultDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "subscription",
      name: { kind: "Name", value: "AiJobResult" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "jobId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "aiJobResult" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "jobId" },
                value: { kind: "Variable", name: { kind: "Name", value: "jobId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "phase" } },
                { kind: "Field", name: { kind: "Name", value: "resultRef" } },
                { kind: "Field", name: { kind: "Name", value: "error" } },
                { kind: "Field", name: { kind: "Name", value: "finishedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiJobResultSubscription, AiJobResultSubscriptionVariables>;
export const AiJobResultContentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AiJobResultContent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "resultRef" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "aiJobResultContent" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "resultRef" },
                value: { kind: "Variable", name: { kind: "Name", value: "resultRef" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "operation" } },
                { kind: "Field", name: { kind: "Name", value: "resultJson" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiJobResultContentQuery, AiJobResultContentQueryVariables>;
export const AppendixDiffDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AppendixDiff" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "appendixDiff" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "sectionKey" } },
                { kind: "Field", name: { kind: "Name", value: "sectionTitle" } },
                { kind: "Field", name: { kind: "Name", value: "changeType" } },
                { kind: "Field", name: { kind: "Name", value: "wordDiffHtml" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AppendixDiffQuery, AppendixDiffQueryVariables>;
export const ApproveHardResetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ApproveHardReset" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "requestId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "approveHardReset" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "requestId" },
                value: { kind: "Variable", name: { kind: "Name", value: "requestId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "HardResetRequestFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "HardResetRequestFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "HardResetRequest" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "module" } },
          { kind: "Field", name: { kind: "Name", value: "reason" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "requestedBy" } },
          { kind: "Field", name: { kind: "Name", value: "requestedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvedBy" } },
          { kind: "Field", name: { kind: "Name", value: "approvedAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvalExpiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "cancelledAt" } },
          { kind: "Field", name: { kind: "Name", value: "consumedAt" } },
          { kind: "Field", name: { kind: "Name", value: "consumedBy" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApproveHardResetMutation, ApproveHardResetMutationVariables>;
export const ArchiveWorkflowDefDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ArchiveWorkflowDef" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "archiveWorkflowDef" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ArchiveWorkflowDefMutation, ArchiveWorkflowDefMutationVariables>;
export const AssignCaseDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AssignCase" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "assigneeUserId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "assignCase" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "caseId" },
                value: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "assigneeUserId" },
                value: { kind: "Variable", name: { kind: "Name", value: "assigneeUserId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ReportCaseFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReportCaseFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReportCase" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "caseCode" } },
          { kind: "Field", name: { kind: "Name", value: "kind" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "details" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "whatHappened" } },
                { kind: "Field", name: { kind: "Name", value: "occurred" } },
                { kind: "Field", name: { kind: "Name", value: "location" } },
                { kind: "Field", name: { kind: "Name", value: "informationKinds" } },
                { kind: "Field", name: { kind: "Name", value: "stillHappening" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "reporterUserId" } },
          { kind: "Field", name: { kind: "Name", value: "assigneeUserId" } },
          { kind: "Field", name: { kind: "Name", value: "receivedAt" } },
          { kind: "Field", name: { kind: "Name", value: "discoveredOn" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "attachments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "filename" } },
                { kind: "Field", name: { kind: "Name", value: "contentType" } },
                { kind: "Field", name: { kind: "Name", value: "sizeBytes" } },
                { kind: "Field", name: { kind: "Name", value: "metadataStripped" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "author" } },
                { kind: "Field", name: { kind: "Name", value: "officerUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "assessment" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "factors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "information" } },
                      { kind: "Field", name: { kind: "Name", value: "recipient" } },
                      { kind: "Field", name: { kind: "Name", value: "viewed" } },
                      { kind: "Field", name: { kind: "Name", value: "mitigation" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "suggestion" } },
                { kind: "Field", name: { kind: "Name", value: "decision" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "decidedByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "decidedAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notices" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "recipient" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "method" } },
                { kind: "Field", name: { kind: "Name", value: "daysAllowed" } },
                { kind: "Field", name: { kind: "Name", value: "dueOn" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "sentOn" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "outcome" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctiveActions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "closedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssignCaseMutation, AssignCaseMutationVariables>;
export const AuditLogDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AuditLog" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "tier" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "actorUserId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "subject" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "pageSize" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "pageToken" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "auditLog" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "tier" },
                value: { kind: "Variable", name: { kind: "Name", value: "tier" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "groupId" },
                value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "actorUserId" },
                value: { kind: "Variable", name: { kind: "Name", value: "actorUserId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: { kind: "Variable", name: { kind: "Name", value: "subject" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "pageSize" },
                value: { kind: "Variable", name: { kind: "Name", value: "pageSize" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "pageToken" },
                value: { kind: "Variable", name: { kind: "Name", value: "pageToken" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "nextPageToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "records" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "AuditRecordFields" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AuditRecordFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AuditRecord" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "recordUuid" } },
          { kind: "Field", name: { kind: "Name", value: "tier" } },
          { kind: "Field", name: { kind: "Name", value: "action" } },
          { kind: "Field", name: { kind: "Name", value: "actorUserId" } },
          { kind: "Field", name: { kind: "Name", value: "subject" } },
          { kind: "Field", name: { kind: "Name", value: "groupId" } },
          { kind: "Field", name: { kind: "Name", value: "occurredAt" } },
          { kind: "Field", name: { kind: "Name", value: "prevHash" } },
          { kind: "Field", name: { kind: "Name", value: "recordHash" } },
          { kind: "Field", name: { kind: "Name", value: "legalBasisExempt" } },
          { kind: "Field", name: { kind: "Name", value: "actorName" } },
          { kind: "Field", name: { kind: "Name", value: "groupName" } },
          { kind: "Field", name: { kind: "Name", value: "subjectLabel" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AuditLogQuery, AuditLogQueryVariables>;
export const AuthoringAssistDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AuthoringAssist" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "AuthoringAssistInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "authoringAssist" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "suggestion" } },
                { kind: "Field", name: { kind: "Name", value: "operationId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AuthoringAssistQuery, AuthoringAssistQueryVariables>;
export const BreakGlassRevealDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "BreakGlassReveal" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reason" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "breakGlassReveal" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reason" },
                value: { kind: "Variable", name: { kind: "Name", value: "reason" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "grantedUntil" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BreakGlassRevealMutation, BreakGlassRevealMutationVariables>;
export const CancelHardResetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CancelHardReset" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "requestId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "cancelHardReset" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "requestId" },
                value: { kind: "Variable", name: { kind: "Name", value: "requestId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "HardResetRequestFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "HardResetRequestFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "HardResetRequest" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "module" } },
          { kind: "Field", name: { kind: "Name", value: "reason" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "requestedBy" } },
          { kind: "Field", name: { kind: "Name", value: "requestedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvedBy" } },
          { kind: "Field", name: { kind: "Name", value: "approvedAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvalExpiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "cancelledAt" } },
          { kind: "Field", name: { kind: "Name", value: "consumedAt" } },
          { kind: "Field", name: { kind: "Name", value: "consumedBy" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CancelHardResetMutation, CancelHardResetMutationVariables>;
export const CategoryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Category" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "category" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "CategoryFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "CategoryFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Category" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "parentId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateNone" } },
          { kind: "Field", name: { kind: "Name", value: "defaultWorkflowId" } },
          { kind: "Field", name: { kind: "Name", value: "owners" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "exclusionGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryone" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryoneSet" } },
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoryQuery, CategoryQueryVariables>;
export const CategoryChildrenDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CategoryChildren" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "parentId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "categoryChildren" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "parentId" },
                value: { kind: "Variable", name: { kind: "Name", value: "parentId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "CategoryFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "CategoryFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Category" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "parentId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateNone" } },
          { kind: "Field", name: { kind: "Name", value: "defaultWorkflowId" } },
          { kind: "Field", name: { kind: "Name", value: "owners" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "exclusionGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryone" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryoneSet" } },
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoryChildrenQuery, CategoryChildrenQueryVariables>;
export const CategoryDocumentCountsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CategoryDocumentCounts" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "categoryDocumentCounts" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "categoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policies" } },
                { kind: "Field", name: { kind: "Name", value: "procedures" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoryDocumentCountsQuery, CategoryDocumentCountsQueryVariables>;
export const CategoryDocumentTypesAllDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CategoryDocumentTypesAll" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "categoryTree" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "documentTypes" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoryDocumentTypesAllQuery, CategoryDocumentTypesAllQueryVariables>;
export const CategoryRulesetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CategoryRuleset" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "categoryRuleset" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "categoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rules" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "RaciRuleFields" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RaciRuleFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "RaciRule" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "subjectKind" } },
          { kind: "Field", name: { kind: "Name", value: "subjectRef" } },
          { kind: "Field", name: { kind: "Name", value: "read" } },
          { kind: "Field", name: { kind: "Name", value: "ack" } },
          { kind: "Field", name: { kind: "Name", value: "approve" } },
          { kind: "Field", name: { kind: "Name", value: "author" } },
          { kind: "Field", name: { kind: "Name", value: "manage" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoryRulesetQuery, CategoryRulesetQueryVariables>;
export const CategoryTemplateLocksDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CategoryTemplateLocks" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "categoryTree" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "defaultTemplateLocked" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoryTemplateLocksQuery, CategoryTemplateLocksQueryVariables>;
export const CategoryTreeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CategoryTree" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "rootId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "categoryTree" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "rootId" },
                value: { kind: "Variable", name: { kind: "Name", value: "rootId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "CategoryFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "CategoryFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Category" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "parentId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateNone" } },
          { kind: "Field", name: { kind: "Name", value: "defaultWorkflowId" } },
          { kind: "Field", name: { kind: "Name", value: "owners" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "exclusionGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryone" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryoneSet" } },
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoryTreeQuery, CategoryTreeQueryVariables>;
export const ChangeOrgProtocolDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ChangeOrgProtocol" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "domain" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "protocol" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "config" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "KeyValueInput" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "secretRef" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "clientSecret" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "changeOrgProtocol" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "domain" },
                value: { kind: "Variable", name: { kind: "Name", value: "domain" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "protocol" },
                value: { kind: "Variable", name: { kind: "Name", value: "protocol" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "config" },
                value: { kind: "Variable", name: { kind: "Name", value: "config" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "secretRef" },
                value: { kind: "Variable", name: { kind: "Name", value: "secretRef" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "clientSecret" },
                value: { kind: "Variable", name: { kind: "Name", value: "clientSecret" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "OrganizationFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OrganizationFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Organization" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "connectionId" } },
          { kind: "Field", name: { kind: "Name", value: "connectionAlias" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "jitEnabled" } },
          { kind: "Field", name: { kind: "Name", value: "orgName" } },
          { kind: "Field", name: { kind: "Name", value: "protocol" } },
          { kind: "Field", name: { kind: "Name", value: "testPassed" } },
          { kind: "Field", name: { kind: "Name", value: "verified" } },
          { kind: "Field", name: { kind: "Name", value: "allowLocal" } },
          { kind: "Field", name: { kind: "Name", value: "secretReentryRequired" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ChangeOrgProtocolMutation, ChangeOrgProtocolMutationVariables>;
export const CloseCaseDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CloseCase" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "outcome" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "CaseOutcome" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "correctiveActions" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "CorrectiveActionInput" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "closingMessage" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "closeCase" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "caseId" },
                value: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "outcome" },
                value: { kind: "Variable", name: { kind: "Name", value: "outcome" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "correctiveActions" },
                value: { kind: "Variable", name: { kind: "Name", value: "correctiveActions" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "closingMessage" },
                value: { kind: "Variable", name: { kind: "Name", value: "closingMessage" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ReportCaseFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReportCaseFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReportCase" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "caseCode" } },
          { kind: "Field", name: { kind: "Name", value: "kind" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "details" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "whatHappened" } },
                { kind: "Field", name: { kind: "Name", value: "occurred" } },
                { kind: "Field", name: { kind: "Name", value: "location" } },
                { kind: "Field", name: { kind: "Name", value: "informationKinds" } },
                { kind: "Field", name: { kind: "Name", value: "stillHappening" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "reporterUserId" } },
          { kind: "Field", name: { kind: "Name", value: "assigneeUserId" } },
          { kind: "Field", name: { kind: "Name", value: "receivedAt" } },
          { kind: "Field", name: { kind: "Name", value: "discoveredOn" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "attachments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "filename" } },
                { kind: "Field", name: { kind: "Name", value: "contentType" } },
                { kind: "Field", name: { kind: "Name", value: "sizeBytes" } },
                { kind: "Field", name: { kind: "Name", value: "metadataStripped" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "author" } },
                { kind: "Field", name: { kind: "Name", value: "officerUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "assessment" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "factors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "information" } },
                      { kind: "Field", name: { kind: "Name", value: "recipient" } },
                      { kind: "Field", name: { kind: "Name", value: "viewed" } },
                      { kind: "Field", name: { kind: "Name", value: "mitigation" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "suggestion" } },
                { kind: "Field", name: { kind: "Name", value: "decision" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "decidedByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "decidedAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notices" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "recipient" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "method" } },
                { kind: "Field", name: { kind: "Name", value: "daysAllowed" } },
                { kind: "Field", name: { kind: "Name", value: "dueOn" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "sentOn" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "outcome" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctiveActions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "closedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CloseCaseMutation, CloseCaseMutationVariables>;
export const CloseReviewSuggestionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CloseReviewSuggestion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "outcome" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "SuggestionOutcome" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reason" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "closeReviewSuggestion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "threadId" },
                value: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "outcome" },
                value: { kind: "Variable", name: { kind: "Name", value: "outcome" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reason" },
                value: { kind: "Variable", name: { kind: "Name", value: "reason" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ReviewThreadFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReviewThreadFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReviewThread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "quote" } },
          { kind: "Field", name: { kind: "Name", value: "occurrence" } },
          { kind: "Field", name: { kind: "Name", value: "resolved" } },
          { kind: "Field", name: { kind: "Name", value: "approverUserId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "messages" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "authorName" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "suggestion" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "turn" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rounds" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "by" } },
                      { kind: "Field", name: { kind: "Name", value: "text" } },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "outcome" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "closedBy" } },
                { kind: "Field", name: { kind: "Name", value: "closedText" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CloseReviewSuggestionMutation, CloseReviewSuggestionMutationVariables>;
export const CompleteOnboardingDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CompleteOnboarding" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "acceptTerms" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "username" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "firstName" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "lastName" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "email" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "completeOnboarding" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "acceptTerms" },
                value: { kind: "Variable", name: { kind: "Name", value: "acceptTerms" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "username" },
                value: { kind: "Variable", name: { kind: "Name", value: "username" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "firstName" },
                value: { kind: "Variable", name: { kind: "Name", value: "firstName" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "lastName" },
                value: { kind: "Variable", name: { kind: "Name", value: "lastName" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "email" },
                value: { kind: "Variable", name: { kind: "Name", value: "email" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "firstName" } },
                { kind: "Field", name: { kind: "Name", value: "lastName" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "roles" } },
                { kind: "Field", name: { kind: "Name", value: "permissions" } },
                { kind: "Field", name: { kind: "Name", value: "managedGroupIds" } },
                { kind: "Field", name: { kind: "Name", value: "needsOnboarding" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CompleteOnboardingMutation, CompleteOnboardingMutationVariables>;
export const CompletionReportDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CompletionReport" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "completionReport" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "groupId" },
                value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "totalAudience" } },
                { kind: "Field", name: { kind: "Name", value: "totalAcked" } },
                { kind: "Field", name: { kind: "Name", value: "completionPct" } },
                { kind: "Field", name: { kind: "Name", value: "avgDaysToAck" } },
                { kind: "Field", name: { kind: "Name", value: "viewedNotAckedCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "overdue" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                      { kind: "Field", name: { kind: "Name", value: "userName" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CompletionReportQuery, CompletionReportQueryVariables>;
export const ComplianceSettingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ComplianceSettings" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "complianceSettings" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "moduleEnabled" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ComplianceSettingsQuery, ComplianceSettingsQueryVariables>;
export const ContactBlocksDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ContactBlocks" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "includeArchived" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "contactBlocks" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "includeArchived" },
                value: { kind: "Variable", name: { kind: "Name", value: "includeArchived" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "department" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "phone" } },
                { kind: "Field", name: { kind: "Name", value: "hours" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ContactBlocksQuery, ContactBlocksQueryVariables>;
export const CounterReviewSuggestionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CounterReviewSuggestion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "text" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "counterReviewSuggestion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "threadId" },
                value: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "text" },
                value: { kind: "Variable", name: { kind: "Name", value: "text" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ReviewThreadFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReviewThreadFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReviewThread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "quote" } },
          { kind: "Field", name: { kind: "Name", value: "occurrence" } },
          { kind: "Field", name: { kind: "Name", value: "resolved" } },
          { kind: "Field", name: { kind: "Name", value: "approverUserId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "messages" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "authorName" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "suggestion" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "turn" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rounds" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "by" } },
                      { kind: "Field", name: { kind: "Name", value: "text" } },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "outcome" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "closedBy" } },
                { kind: "Field", name: { kind: "Name", value: "closedText" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CounterReviewSuggestionMutation,
  CounterReviewSuggestionMutationVariables
>;
export const CreateCategoryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateCategory" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "slug" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "parentId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createCategory" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: { kind: "Variable", name: { kind: "Name", value: "name" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "slug" },
                value: { kind: "Variable", name: { kind: "Name", value: "slug" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "parentId" },
                value: { kind: "Variable", name: { kind: "Name", value: "parentId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "CategoryFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "CategoryFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Category" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "parentId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateNone" } },
          { kind: "Field", name: { kind: "Name", value: "defaultWorkflowId" } },
          { kind: "Field", name: { kind: "Name", value: "owners" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "exclusionGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryone" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryoneSet" } },
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const CreateContactBlockDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateContactBlock" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "block" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ContactBlockInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createContactBlock" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "block" },
                value: { kind: "Variable", name: { kind: "Name", value: "block" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "department" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "phone" } },
                { kind: "Field", name: { kind: "Name", value: "hours" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateContactBlockMutation, CreateContactBlockMutationVariables>;
export const CreateDefinitionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateDefinition" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DefinitionEntryInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createDefinition" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                { kind: "Field", name: { kind: "Name", value: "definition" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateDefinitionMutation, CreateDefinitionMutationVariables>;
export const CreateMagicLinkDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateMagicLink" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sensitive" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createMagicLink" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sensitive" },
                value: { kind: "Variable", name: { kind: "Name", value: "sensitive" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "token" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateMagicLinkMutation, CreateMagicLinkMutationVariables>;
export const CreatePlatformGroupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreatePlatformGroup" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "parentId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createPlatformGroup" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: { kind: "Variable", name: { kind: "Name", value: "name" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "parentId" },
                value: { kind: "Variable", name: { kind: "Name", value: "parentId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "parentId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreatePlatformGroupMutation, CreatePlatformGroupMutationVariables>;
export const CreatePolicyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreatePolicy" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "homeCategoryId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "title" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sensitivity" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Sensitivity" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "templateId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "documentType" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "DocumentType" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createPolicy" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "homeCategoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "homeCategoryId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: { kind: "Variable", name: { kind: "Name", value: "title" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sensitivity" },
                value: { kind: "Variable", name: { kind: "Name", value: "sensitivity" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "templateId" },
                value: { kind: "Variable", name: { kind: "Name", value: "templateId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "documentType" },
                value: { kind: "Variable", name: { kind: "Name", value: "documentType" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AuthoringPolicyFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AuthoringPolicyFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Policy" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "number" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "documentType" } },
          { kind: "Field", name: { kind: "Name", value: "sensitivity" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUserId" } },
          { kind: "Field", name: { kind: "Name", value: "ownerName" } },
          { kind: "Field", name: { kind: "Name", value: "homeCategoryId" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackAudienceOverride" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "templateNone" } },
          { kind: "Field", name: { kind: "Name", value: "currentDraftVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentPublishedVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionNo" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "viewerCan" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "read" } },
                { kind: "Field", name: { kind: "Name", value: "edit" } },
                { kind: "Field", name: { kind: "Name", value: "submit" } },
                { kind: "Field", name: { kind: "Name", value: "approve" } },
                { kind: "Field", name: { kind: "Name", value: "contentObfuscated" } },
                { kind: "Field", name: { kind: "Name", value: "canBreakGlass" } },
                { kind: "Field", name: { kind: "Name", value: "ack" } },
                { kind: "Field", name: { kind: "Name", value: "manage" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreatePolicyMutation, CreatePolicyMutationVariables>;
export const CreatePolicyAppendixDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreatePolicyAppendix" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "title" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "contentJson" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createPolicyAppendix" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: { kind: "Variable", name: { kind: "Name", value: "title" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "contentJson" },
                value: { kind: "Variable", name: { kind: "Name", value: "contentJson" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PolicyAppendixFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AppendixVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedBy" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedBy" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PolicyAppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyAppendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyId" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "published" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "draft" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "versions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "publishedVersions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contributors" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "active" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreatePolicyAppendixMutation, CreatePolicyAppendixMutationVariables>;
export const CreateReferenceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateReference" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ReferenceInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createReference" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "clause" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateReferenceMutation, CreateReferenceMutationVariables>;
export const CreateTemplateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateTemplate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "ownerCategoryId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createTemplate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: { kind: "Variable", name: { kind: "Name", value: "name" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "ownerCategoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "ownerCategoryId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "TemplateFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TemplateFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Template" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "code" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "ownerCategoryId" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateTemplateMutation, CreateTemplateMutationVariables>;
export const CreateTemplateVersionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateTemplateVersion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "templateId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sections" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "SectionInput" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createTemplateVersion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "templateId" },
                value: { kind: "Variable", name: { kind: "Name", value: "templateId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sections" },
                value: { kind: "Variable", name: { kind: "Name", value: "sections" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "TemplateVersionFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TemplateVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "TemplateVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "semanticVersion" } },
          { kind: "Field", name: { kind: "Name", value: "changeType" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "sections" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "key" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "order" } },
                { kind: "Field", name: { kind: "Name", value: "level" } },
                { kind: "Field", name: { kind: "Name", value: "required" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "blocks" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "contentJson" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateTemplateVersionMutation, CreateTemplateVersionMutationVariables>;
export const CreateWorkflowDefDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateWorkflowDef" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "description" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "stages" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "WorkflowStageInput" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createWorkflowDef" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: { kind: "Variable", name: { kind: "Name", value: "name" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "description" },
                value: { kind: "Variable", name: { kind: "Name", value: "description" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "stages" },
                value: { kind: "Variable", name: { kind: "Name", value: "stages" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "WorkflowDefFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "WorkflowStageDefFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "WorkflowStageDef" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "approvers" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "approversByCategory" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "approverIds" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "groupUnits" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "internalQuorum" } },
                { kind: "Field", name: { kind: "Name", value: "memberUserIds" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "quorum" } },
          { kind: "Field", name: { kind: "Name", value: "slaDays" } },
          { kind: "Field", name: { kind: "Name", value: "rejectOnSlaBreach" } },
          { kind: "Field", name: { kind: "Name", value: "remindEveryDays" } },
          { kind: "Field", name: { kind: "Name", value: "escalateAfterDays" } },
          { kind: "Field", name: { kind: "Name", value: "pinnedLast" } },
          { kind: "Field", name: { kind: "Name", value: "vetoUserIds" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "WorkflowDefFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "WorkflowDef" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "stages" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "WorkflowStageDefFields" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateWorkflowDefMutation, CreateWorkflowDefMutationVariables>;
export const DefinitionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Definitions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "includeArchived" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "definitions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "categoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "includeArchived" },
                value: { kind: "Variable", name: { kind: "Name", value: "includeArchived" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                { kind: "Field", name: { kind: "Name", value: "definition" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DefinitionsQuery, DefinitionsQueryVariables>;
export const DeleteAppendixDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteAppendix" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteAppendix" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteAppendixMutation, DeleteAppendixMutationVariables>;
export const DeleteCategoryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteCategory" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteCategory" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
export const DeleteDefinitionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteDefinition" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteDefinition" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteDefinitionMutation, DeleteDefinitionMutationVariables>;
export const DeleteGroupMappingDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteGroupMapping" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "mappingId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteGroupMapping" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "mappingId" },
                value: { kind: "Variable", name: { kind: "Name", value: "mappingId" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteGroupMappingMutation, DeleteGroupMappingMutationVariables>;
export const DeleteOrganizationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteOrganization" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "domain" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteOrganization" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "domain" },
                value: { kind: "Variable", name: { kind: "Name", value: "domain" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteOrganizationMutation, DeleteOrganizationMutationVariables>;
export const DeletePolicyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeletePolicy" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deletePolicy" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeletePolicyMutation, DeletePolicyMutationVariables>;
export const DeleteReferenceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteReference" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteReference" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteReferenceMutation, DeleteReferenceMutationVariables>;
export const DeleteReviewThreadDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteReviewThread" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteReviewThread" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "threadId" },
                value: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteReviewThreadMutation, DeleteReviewThreadMutationVariables>;
export const DeleteTemplateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteTemplate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteTemplate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteTemplateMutation, DeleteTemplateMutationVariables>;
export const DeleteUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "revokedSessions" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteUserMutation, DeleteUserMutationVariables>;
export const DeleteWorkflowDefDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteWorkflowDef" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteWorkflowDef" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteWorkflowDefMutation, DeleteWorkflowDefMutationVariables>;
export const DiagnosticsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Diagnostics" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "diagnostics" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "generatedAt" } },
                { kind: "Field", name: { kind: "Name", value: "traceId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "actor" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                      { kind: "Field", name: { kind: "Name", value: "roles" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "actingAs" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "username" } },
                            { kind: "Field", name: { kind: "Name", value: "roles" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "gateway" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      { kind: "Field", name: { kind: "Name", value: "commit" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "release" } },
                { kind: "Field", name: { kind: "Name", value: "appliance" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "services" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      { kind: "Field", name: { kind: "Name", value: "commit" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "thirdParty" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      { kind: "Field", name: { kind: "Name", value: "commit" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DiagnosticsQuery, DiagnosticsQueryVariables>;
export const DiffVersionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DiffVersions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fromVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "toVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "diffVersions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "fromVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "toVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "toVersionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "sectionKey" } },
                { kind: "Field", name: { kind: "Name", value: "sectionTitle" } },
                { kind: "Field", name: { kind: "Name", value: "changeType" } },
                { kind: "Field", name: { kind: "Name", value: "wordDiffHtml" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DiffVersionsQuery, DiffVersionsQueryVariables>;
export const DisableOrganizationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DisableOrganization" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "domain" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "disableOrganization" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "domain" },
                value: { kind: "Variable", name: { kind: "Name", value: "domain" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "OrganizationFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OrganizationFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Organization" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "connectionId" } },
          { kind: "Field", name: { kind: "Name", value: "connectionAlias" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "jitEnabled" } },
          { kind: "Field", name: { kind: "Name", value: "orgName" } },
          { kind: "Field", name: { kind: "Name", value: "protocol" } },
          { kind: "Field", name: { kind: "Name", value: "testPassed" } },
          { kind: "Field", name: { kind: "Name", value: "verified" } },
          { kind: "Field", name: { kind: "Name", value: "allowLocal" } },
          { kind: "Field", name: { kind: "Name", value: "secretReentryRequired" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DisableOrganizationMutation, DisableOrganizationMutationVariables>;
export const DisableUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DisableUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "disableUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
          { kind: "Field", name: { kind: "Name", value: "groupIds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyOverrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyNumber" } },
                { kind: "Field", name: { kind: "Name", value: "effect" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "memberships" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DisableUserMutation, DisableUserMutationVariables>;
export const DiscardDraftDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DiscardDraft" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "discardDraft" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DiscardDraftMutation, DiscardDraftMutationVariables>;
export const DiscardTemplateVersionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DiscardTemplateVersion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "discardTemplateVersion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DiscardTemplateVersionMutation,
  DiscardTemplateVersionMutationVariables
>;
export const EmailServiceConfigDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "EmailServiceConfig" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "emailServiceConfig" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "apiKeySet" } },
                { kind: "Field", name: { kind: "Name", value: "provider" } },
                { kind: "Field", name: { kind: "Name", value: "domain" } },
                { kind: "Field", name: { kind: "Name", value: "region" } },
                { kind: "Field", name: { kind: "Name", value: "fromAddress" } },
                { kind: "Field", name: { kind: "Name", value: "enabled" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EmailServiceConfigQuery, EmailServiceConfigQueryVariables>;
export const EnableUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "EnableUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "enableUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
          { kind: "Field", name: { kind: "Name", value: "groupIds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyOverrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyNumber" } },
                { kind: "Field", name: { kind: "Name", value: "effect" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "memberships" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EnableUserMutation, EnableUserMutationVariables>;
export const EnrollTotpBeginDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "EnrollTotpBegin" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "enrollTotpBegin" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "otpauthUri" } },
                { kind: "Field", name: { kind: "Name", value: "secretMasked" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EnrollTotpBeginMutation, EnrollTotpBeginMutationVariables>;
export const EnrollTotpConfirmDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "EnrollTotpConfirm" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "code" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "enrollTotpConfirm" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "code" },
                value: { kind: "Variable", name: { kind: "Name", value: "code" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EnrollTotpConfirmMutation, EnrollTotpConfirmMutationVariables>;
export const ExecuteHardResetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ExecuteHardReset" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "requestId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "confirmation" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "executeHardReset" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "requestId" },
                value: { kind: "Variable", name: { kind: "Name", value: "requestId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "confirmation" },
                value: { kind: "Variable", name: { kind: "Name", value: "confirmation" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "casesDeleted" } },
                { kind: "Field", name: { kind: "Name", value: "requestedBy" } },
                { kind: "Field", name: { kind: "Name", value: "approvedBy" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExecuteHardResetMutation, ExecuteHardResetMutationVariables>;
export const ExportAcksDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ExportAcks" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "format" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "exportAcks" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "format" },
                value: { kind: "Variable", name: { kind: "Name", value: "format" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "data" } },
                { kind: "Field", name: { kind: "Name", value: "contentType" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExportAcksQuery, ExportAcksQueryVariables>;
export const ForceRotateSpCertificateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ForceRotateSpCertificate" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "forceRotateSpCertificate" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "active" } },
                { kind: "Field", name: { kind: "Name", value: "certPem" } },
                { kind: "Field", name: { kind: "Name", value: "notAfter" } },
                { kind: "Field", name: { kind: "Name", value: "serial" } },
                { kind: "Field", name: { kind: "Name", value: "spMetadataXml" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ForceRotateSpCertificateMutation,
  ForceRotateSpCertificateMutationVariables
>;
export const GlobalSettingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GlobalSettings" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "globalSettings" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "announcement" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "enabled" } },
                      { kind: "Field", name: { kind: "Name", value: "level" } },
                      { kind: "Field", name: { kind: "Name", value: "message" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "maintenance" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "enabled" } },
                      { kind: "Field", name: { kind: "Name", value: "message" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workCalendar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "weekdays" } },
                      { kind: "Field", name: { kind: "Name", value: "timezone" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "holidays" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "date" } },
                            { kind: "Field", name: { kind: "Name", value: "label" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GlobalSettingsQuery, GlobalSettingsQueryVariables>;
export const GrantRoleDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "GrantRole" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "role" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "grantRole" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "role" },
                value: { kind: "Variable", name: { kind: "Name", value: "role" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
          { kind: "Field", name: { kind: "Name", value: "groupIds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyOverrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyNumber" } },
                { kind: "Field", name: { kind: "Name", value: "effect" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "memberships" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GrantRoleMutation, GrantRoleMutationVariables>;
export const GroupMappingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GroupMappings" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "connectionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "groupMappings" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "connectionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "connectionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "connectionId" } },
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "idpGroupClaimValue" } },
                { kind: "Field", name: { kind: "Name", value: "targetGroupId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GroupMappingsQuery, GroupMappingsQueryVariables>;
export const HardResetRequestsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "HardResetRequests" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "module" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "hardResetRequests" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "module" },
                value: { kind: "Variable", name: { kind: "Name", value: "module" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "HardResetRequestFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "HardResetRequestFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "HardResetRequest" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "module" } },
          { kind: "Field", name: { kind: "Name", value: "reason" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "requestedBy" } },
          { kind: "Field", name: { kind: "Name", value: "requestedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvedBy" } },
          { kind: "Field", name: { kind: "Name", value: "approvedAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvalExpiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "cancelledAt" } },
          { kind: "Field", name: { kind: "Name", value: "consumedAt" } },
          { kind: "Field", name: { kind: "Name", value: "consumedBy" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HardResetRequestsQuery, HardResetRequestsQueryVariables>;
export const ImpersonationStatusDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ImpersonationStatus" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "impersonationStatus" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "targetUserId" } },
                { kind: "Field", name: { kind: "Name", value: "targetName" } },
                { kind: "Field", name: { kind: "Name", value: "startedAt" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ImpersonationStatusQuery, ImpersonationStatusQueryVariables>;
export const IssueAppendixCollabTokenDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "IssueAppendixCollabToken" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "appendixId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "issueAppendixCollabToken" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "appendixId" },
                value: { kind: "Variable", name: { kind: "Name", value: "appendixId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "token" } },
                { kind: "Field", name: { kind: "Name", value: "wsUrl" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  IssueAppendixCollabTokenMutation,
  IssueAppendixCollabTokenMutationVariables
>;
export const IssueCollabTokenDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "IssueCollabToken" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "draftId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "templateVersionId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "issueCollabToken" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "policyId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "draftId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "draftId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "templateVersionId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "templateVersionId" },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "token" } },
                { kind: "Field", name: { kind: "Name", value: "wsUrl" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<IssueCollabTokenMutation, IssueCollabTokenMutationVariables>;
export const LatestTemplateVersionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "LatestTemplateVersion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "templateId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "latestTemplateVersion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "templateId" },
                value: { kind: "Variable", name: { kind: "Name", value: "templateId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "TemplateVersionFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TemplateVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "TemplateVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "semanticVersion" } },
          { kind: "Field", name: { kind: "Name", value: "changeType" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "sections" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "key" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "order" } },
                { kind: "Field", name: { kind: "Name", value: "level" } },
                { kind: "Field", name: { kind: "Name", value: "required" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "blocks" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "contentJson" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LatestTemplateVersionQuery, LatestTemplateVersionQueryVariables>;
export const ListUserSessionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ListUserSessions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "listUserSessions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "issuedAt" } },
                { kind: "Field", name: { kind: "Name", value: "authenticatedAt" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
                { kind: "Field", name: { kind: "Name", value: "active" } },
                { kind: "Field", name: { kind: "Name", value: "userAgent" } },
                { kind: "Field", name: { kind: "Name", value: "clientIp" } },
                { kind: "Field", name: { kind: "Name", value: "lastSeenAt" } },
                { kind: "Field", name: { kind: "Name", value: "current" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListUserSessionsQuery, ListUserSessionsQueryVariables>;
export const LiveEventsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "subscription",
      name: { kind: "Name", value: "LiveEvents" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "topics" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "liveEvents" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "topics" },
                value: { kind: "Variable", name: { kind: "Name", value: "topics" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "entityId" } },
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "actorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "at" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LiveEventsSubscription, LiveEventsSubscriptionVariables>;
export const ManagedGroupMembersDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ManagedGroupMembers" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "managedGroupMembers" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "groupId" },
                value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
          { kind: "Field", name: { kind: "Name", value: "groupIds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyOverrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyNumber" } },
                { kind: "Field", name: { kind: "Name", value: "effect" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "memberships" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ManagedGroupMembersQuery, ManagedGroupMembersQueryVariables>;
export const MarkVersionReviewedDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "MarkVersionReviewed" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "markVersionReviewed" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MarkVersionReviewedMutation, MarkVersionReviewedMutationVariables>;
export const MeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Me" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "firstName" } },
                { kind: "Field", name: { kind: "Name", value: "lastName" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "roles" } },
                { kind: "Field", name: { kind: "Name", value: "permissions" } },
                { kind: "Field", name: { kind: "Name", value: "managedGroupIds" } },
                { kind: "Field", name: { kind: "Name", value: "needsOnboarding" } },
                { kind: "Field", name: { kind: "Name", value: "locale" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "scopes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "author" } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const MergeAccountsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "MergeAccounts" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sourceUserId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "targetUserId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "confirmPrivileged" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "idempotencyKey" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "mergeAccounts" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "sourceUserId" },
                value: { kind: "Variable", name: { kind: "Name", value: "sourceUserId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "targetUserId" },
                value: { kind: "Variable", name: { kind: "Name", value: "targetUserId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "confirmPrivileged" },
                value: { kind: "Variable", name: { kind: "Name", value: "confirmPrivileged" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "idempotencyKey" },
                value: { kind: "Variable", name: { kind: "Name", value: "idempotencyKey" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "mergeOperationId" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "counts" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "policiesOwned" } },
                      { kind: "Field", name: { kind: "Name", value: "raciGrants" } },
                      { kind: "Field", name: { kind: "Name", value: "acknowledgmentsMoved" } },
                      { kind: "Field", name: { kind: "Name", value: "acknowledgmentsDeduped" } },
                      { kind: "Field", name: { kind: "Name", value: "workflowItems" } },
                      { kind: "Field", name: { kind: "Name", value: "preferences" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "steps" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "step" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                      { kind: "Field", name: { kind: "Name", value: "detail" } },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MergeAccountsMutation, MergeAccountsMutationVariables>;
export const MoveCategoryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "MoveCategory" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "newParentId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "moveCategory" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "categoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "newParentId" },
                value: { kind: "Variable", name: { kind: "Name", value: "newParentId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "CategoryFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "CategoryFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Category" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "parentId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateNone" } },
          { kind: "Field", name: { kind: "Name", value: "defaultWorkflowId" } },
          { kind: "Field", name: { kind: "Name", value: "owners" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "exclusionGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryone" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryoneSet" } },
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MoveCategoryMutation, MoveCategoryMutationVariables>;
export const MovePoliciesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "MovePolicies" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyIds" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
              },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "homeCategoryId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "movePolicies" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyIds" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyIds" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "homeCategoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "homeCategoryId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "moved" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "policyId" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "number" } },
                      { kind: "Field", name: { kind: "Name", value: "newNumber" } },
                      { kind: "Field", name: { kind: "Name", value: "refusal" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MovePoliciesMutation, MovePoliciesMutationVariables>;
export const MovePolicyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "MovePolicy" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "homeCategoryId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "movePolicy" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "homeCategoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "homeCategoryId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MovePolicyMutation, MovePolicyMutationVariables>;
export const MyAckSummaryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MyAckSummary" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "myAckSummary" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "required" } },
                { kind: "Field", name: { kind: "Name", value: "done" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyAckSummaryQuery, MyAckSummaryQueryVariables>;
export const MyDraftsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MyDrafts" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "myDrafts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AuthoringPolicyFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AuthoringPolicyFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Policy" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "number" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "documentType" } },
          { kind: "Field", name: { kind: "Name", value: "sensitivity" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUserId" } },
          { kind: "Field", name: { kind: "Name", value: "ownerName" } },
          { kind: "Field", name: { kind: "Name", value: "homeCategoryId" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackAudienceOverride" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "templateNone" } },
          { kind: "Field", name: { kind: "Name", value: "currentDraftVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentPublishedVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionNo" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "viewerCan" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "read" } },
                { kind: "Field", name: { kind: "Name", value: "edit" } },
                { kind: "Field", name: { kind: "Name", value: "submit" } },
                { kind: "Field", name: { kind: "Name", value: "approve" } },
                { kind: "Field", name: { kind: "Name", value: "contentObfuscated" } },
                { kind: "Field", name: { kind: "Name", value: "canBreakGlass" } },
                { kind: "Field", name: { kind: "Name", value: "ack" } },
                { kind: "Field", name: { kind: "Name", value: "manage" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyDraftsQuery, MyDraftsQueryVariables>;
export const MyFactorsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MyFactors" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "myFactors" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "enrolledAt" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyFactorsQuery, MyFactorsQueryVariables>;
export const MyManagedGroupsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MyManagedGroups" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "myManagedGroups" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "parentId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyManagedGroupsQuery, MyManagedGroupsQueryVariables>;
export const MyObligationsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MyObligations" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "myObligations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyObligationsQuery, MyObligationsQueryVariables>;
export const MyWebauthnCredentialsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MyWebauthnCredentials" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "myWebauthnCredentials" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "lastUsedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyWebauthnCredentialsQuery, MyWebauthnCredentialsQueryVariables>;
export const NotificationSettingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "NotificationSettings" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "notificationSettings" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "NotificationSettingsFields" },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notificationTypeCatalog" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
                { kind: "Field", name: { kind: "Name", value: "delivery" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "NotificationSettingsFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "NotificationSettings" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "channels" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "inApp" } },
                { kind: "Field", name: { kind: "Name", value: "push" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "categories" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "cadence" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "overrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "cadence" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
                { kind: "Field", name: { kind: "Name", value: "delivery" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "digest" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "dailyHour" } },
                { kind: "Field", name: { kind: "Name", value: "weeklyDow" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<NotificationSettingsQuery, NotificationSettingsQueryVariables>;
export const OrganizationsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Organizations" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "organizations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "OrganizationFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OrganizationFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Organization" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "connectionId" } },
          { kind: "Field", name: { kind: "Name", value: "connectionAlias" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "jitEnabled" } },
          { kind: "Field", name: { kind: "Name", value: "orgName" } },
          { kind: "Field", name: { kind: "Name", value: "protocol" } },
          { kind: "Field", name: { kind: "Name", value: "testPassed" } },
          { kind: "Field", name: { kind: "Name", value: "verified" } },
          { kind: "Field", name: { kind: "Name", value: "allowLocal" } },
          { kind: "Field", name: { kind: "Name", value: "secretReentryRequired" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrganizationsQuery, OrganizationsQueryVariables>;
export const PdfDownloadLinkDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PdfDownloadLink" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "jobId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "pdfDownloadLink" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "jobId" },
                value: { kind: "Variable", name: { kind: "Name", value: "jobId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "signedUrl" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PdfDownloadLinkQuery, PdfDownloadLinkQueryVariables>;
export const PendingTasksDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PendingTasks" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "pendingTasks" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "taskId" } },
                { kind: "Field", name: { kind: "Name", value: "runId" } },
                { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
                { kind: "Field", name: { kind: "Name", value: "policyTitle" } },
                { kind: "Field", name: { kind: "Name", value: "stageIndex" } },
                { kind: "Field", name: { kind: "Name", value: "dueAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PendingTasksQuery, PendingTasksQueryVariables>;
export const PlatformGroupsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PlatformGroups" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "parentId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "platformGroups" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "parentId" },
                value: { kind: "Variable", name: { kind: "Name", value: "parentId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "parentId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PlatformGroupsQuery, PlatformGroupsQueryVariables>;
export const PoliciesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Policies" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "documentType" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "DocumentType" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "policies" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "categoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "includeDescendants" },
                value: { kind: "BooleanValue", value: true },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "documentType" },
                value: { kind: "Variable", name: { kind: "Name", value: "documentType" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AuthoringPolicyFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AuthoringPolicyFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Policy" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "number" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "documentType" } },
          { kind: "Field", name: { kind: "Name", value: "sensitivity" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUserId" } },
          { kind: "Field", name: { kind: "Name", value: "ownerName" } },
          { kind: "Field", name: { kind: "Name", value: "homeCategoryId" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackAudienceOverride" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "templateNone" } },
          { kind: "Field", name: { kind: "Name", value: "currentDraftVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentPublishedVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionNo" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "viewerCan" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "read" } },
                { kind: "Field", name: { kind: "Name", value: "edit" } },
                { kind: "Field", name: { kind: "Name", value: "submit" } },
                { kind: "Field", name: { kind: "Name", value: "approve" } },
                { kind: "Field", name: { kind: "Name", value: "contentObfuscated" } },
                { kind: "Field", name: { kind: "Name", value: "canBreakGlass" } },
                { kind: "Field", name: { kind: "Name", value: "ack" } },
                { kind: "Field", name: { kind: "Name", value: "manage" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PoliciesQuery, PoliciesQueryVariables>;
export const PolicyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Policy" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "policy" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AuthoringPolicyFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AuthoringPolicyFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Policy" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "number" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "documentType" } },
          { kind: "Field", name: { kind: "Name", value: "sensitivity" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUserId" } },
          { kind: "Field", name: { kind: "Name", value: "ownerName" } },
          { kind: "Field", name: { kind: "Name", value: "homeCategoryId" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackAudienceOverride" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "templateNone" } },
          { kind: "Field", name: { kind: "Name", value: "currentDraftVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentPublishedVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionNo" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "viewerCan" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "read" } },
                { kind: "Field", name: { kind: "Name", value: "edit" } },
                { kind: "Field", name: { kind: "Name", value: "submit" } },
                { kind: "Field", name: { kind: "Name", value: "approve" } },
                { kind: "Field", name: { kind: "Name", value: "contentObfuscated" } },
                { kind: "Field", name: { kind: "Name", value: "canBreakGlass" } },
                { kind: "Field", name: { kind: "Name", value: "ack" } },
                { kind: "Field", name: { kind: "Name", value: "manage" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyQuery, PolicyQueryVariables>;
export const PolicyAppendicesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PolicyAppendices" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "includeRetired" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "policyAppendices" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "includeRetired" },
                value: { kind: "Variable", name: { kind: "Name", value: "includeRetired" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PolicyAppendixFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AppendixVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedBy" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedBy" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PolicyAppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyAppendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyId" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "published" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "draft" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "versions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "publishedVersions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contributors" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "active" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyAppendicesQuery, PolicyAppendicesQueryVariables>;
export const PolicyAttachmentsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PolicyAttachments" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "relatedPolicies" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyReferences" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "clause" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyContactBlocks" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "department" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "phone" } },
                { kind: "Field", name: { kind: "Name", value: "hours" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyDefinitionEntries" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                { kind: "Field", name: { kind: "Name", value: "definition" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyAttachmentsQuery, PolicyAttachmentsQueryVariables>;
export const PolicyByNumberDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PolicyByNumber" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "number" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "policyByNumber" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: { kind: "Variable", name: { kind: "Name", value: "number" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AuthoringPolicyFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AuthoringPolicyFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Policy" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "number" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "documentType" } },
          { kind: "Field", name: { kind: "Name", value: "sensitivity" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUserId" } },
          { kind: "Field", name: { kind: "Name", value: "ownerName" } },
          { kind: "Field", name: { kind: "Name", value: "homeCategoryId" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackAudienceOverride" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "templateNone" } },
          { kind: "Field", name: { kind: "Name", value: "currentDraftVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentPublishedVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionNo" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "viewerCan" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "read" } },
                { kind: "Field", name: { kind: "Name", value: "edit" } },
                { kind: "Field", name: { kind: "Name", value: "submit" } },
                { kind: "Field", name: { kind: "Name", value: "approve" } },
                { kind: "Field", name: { kind: "Name", value: "contentObfuscated" } },
                { kind: "Field", name: { kind: "Name", value: "canBreakGlass" } },
                { kind: "Field", name: { kind: "Name", value: "ack" } },
                { kind: "Field", name: { kind: "Name", value: "manage" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyByNumberQuery, PolicyByNumberQueryVariables>;
export const PolicyVersionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PolicyVersion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "policyVersion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PolicyVersionFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Appendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PolicyVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyId" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "semanticVersion" } },
          { kind: "Field", name: { kind: "Name", value: "suggestedChangeType" } },
          { kind: "Field", name: { kind: "Name", value: "changeType" } },
          { kind: "Field", name: { kind: "Name", value: "requestedChangeType" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeReason" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeSetByUserId" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeAgreedByUserIds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "templateVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeAgreedByUserIds" } },
          { kind: "Field", name: { kind: "Name", value: "reacknowledge" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "appendices" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixFields" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyVersionQuery, PolicyVersionQueryVariables>;
export const PolicyVersionLinksDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PolicyVersionLinks" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "policyVersionLinks" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "VersionLinksFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "VersionLinksFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyVersionLinks" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "editable" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "definitions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                { kind: "Field", name: { kind: "Name", value: "definition" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "related" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "direction" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "references" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "clause" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contacts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "department" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "phone" } },
                { kind: "Field", name: { kind: "Name", value: "hours" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyVersionLinksQuery, PolicyVersionLinksQueryVariables>;
export const PolicyVersionSummaryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PolicyVersionSummary" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "versionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "policyVersionSummary" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "versionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "versionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "summaryText" } },
                { kind: "Field", name: { kind: "Name", value: "generatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyVersionSummaryQuery, PolicyVersionSummaryQueryVariables>;
export const PolicyVersionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PolicyVersions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "policyVersions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "versionNo" } },
                { kind: "Field", name: { kind: "Name", value: "semanticVersion" } },
                { kind: "Field", name: { kind: "Name", value: "changeType" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyVersionsQuery, PolicyVersionsQueryVariables>;
export const PostCaseMessageDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "PostCaseMessage" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "body" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "postCaseMessage" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "caseId" },
                value: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "body" },
                value: { kind: "Variable", name: { kind: "Name", value: "body" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "author" } },
                { kind: "Field", name: { kind: "Name", value: "officerUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostCaseMessageMutation, PostCaseMessageMutationVariables>;
export const PreviewAccountMergeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PreviewAccountMerge" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sourceUserId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "targetUserId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "previewAccountMerge" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "sourceUserId" },
                value: { kind: "Variable", name: { kind: "Name", value: "sourceUserId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "targetUserId" },
                value: { kind: "Variable", name: { kind: "Name", value: "targetUserId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "sourceUserId" } },
                { kind: "Field", name: { kind: "Name", value: "targetUserId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "counts" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "policiesOwned" } },
                      { kind: "Field", name: { kind: "Name", value: "raciGrants" } },
                      { kind: "Field", name: { kind: "Name", value: "acknowledgmentsMoved" } },
                      { kind: "Field", name: { kind: "Name", value: "acknowledgmentsDeduped" } },
                      { kind: "Field", name: { kind: "Name", value: "workflowItems" } },
                      { kind: "Field", name: { kind: "Name", value: "preferences" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "kind" } },
                      { kind: "Field", name: { kind: "Name", value: "refId" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "detail" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "warnings" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "code" } },
                      { kind: "Field", name: { kind: "Name", value: "message" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "requiresPrivilegedConfirm" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PreviewAccountMergeQuery, PreviewAccountMergeQueryVariables>;
export const PreviewMovePoliciesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PreviewMovePolicies" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyIds" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
              },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "homeCategoryId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "previewMovePolicies" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyIds" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyIds" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "homeCategoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "homeCategoryId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "policyId" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "number" } },
                      { kind: "Field", name: { kind: "Name", value: "newNumber" } },
                      { kind: "Field", name: { kind: "Name", value: "refusal" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PreviewMovePoliciesQuery, PreviewMovePoliciesQueryVariables>;
export const PreviewUserDeletionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PreviewUserDeletion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "previewUserDeletion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "blocksDelete" } },
                { kind: "Field", name: { kind: "Name", value: "locallyAuthenticable" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "counts" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "pendingApprovals" } },
                      { kind: "Field", name: { kind: "Name", value: "ownedPolicies" } },
                      { kind: "Field", name: { kind: "Name", value: "raciGrants" } },
                      { kind: "Field", name: { kind: "Name", value: "roles" } },
                      { kind: "Field", name: { kind: "Name", value: "permissions" } },
                      { kind: "Field", name: { kind: "Name", value: "groupMemberships" } },
                      { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
                      { kind: "Field", name: { kind: "Name", value: "policyOverrides" } },
                      { kind: "Field", name: { kind: "Name", value: "breakGlassGrants" } },
                      { kind: "Field", name: { kind: "Name", value: "managedGroups" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "kind" } },
                      { kind: "Field", name: { kind: "Name", value: "refId" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "detail" } },
                      { kind: "Field", name: { kind: "Name", value: "blocksDelete" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "warnings" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "code" } },
                      { kind: "Field", name: { kind: "Name", value: "message" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PreviewUserDeletionQuery, PreviewUserDeletionQueryVariables>;
export const PublishAppendixDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "PublishAppendix" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "publishAppendix" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PolicyAppendixFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AppendixVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedBy" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedBy" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PolicyAppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyAppendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyId" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "published" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "draft" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "versions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "publishedVersions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contributors" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "active" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PublishAppendixMutation, PublishAppendixMutationVariables>;
export const PublishDraftDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "PublishDraft" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "publishDraft" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PolicyVersionFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Appendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PolicyVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyId" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "semanticVersion" } },
          { kind: "Field", name: { kind: "Name", value: "suggestedChangeType" } },
          { kind: "Field", name: { kind: "Name", value: "changeType" } },
          { kind: "Field", name: { kind: "Name", value: "requestedChangeType" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeReason" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeSetByUserId" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeAgreedByUserIds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "templateVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeAgreedByUserIds" } },
          { kind: "Field", name: { kind: "Name", value: "reacknowledge" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "appendices" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixFields" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PublishDraftMutation, PublishDraftMutationVariables>;
export const PublishTemplateVersionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "PublishTemplateVersion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "publishTemplateVersion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "TemplateVersionFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TemplateVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "TemplateVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "semanticVersion" } },
          { kind: "Field", name: { kind: "Name", value: "changeType" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "sections" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "key" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "order" } },
                { kind: "Field", name: { kind: "Name", value: "level" } },
                { kind: "Field", name: { kind: "Name", value: "required" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "blocks" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "contentJson" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  PublishTemplateVersionMutation,
  PublishTemplateVersionMutationVariables
>;
export const ReassignUserPoliciesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ReassignUserPolicies" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fromUserId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "toUserId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "reassignUserPolicies" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromUserId" },
                value: { kind: "Variable", name: { kind: "Name", value: "fromUserId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "toUserId" },
                value: { kind: "Variable", name: { kind: "Name", value: "toUserId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "reassignedOwnerCount" } },
                { kind: "Field", name: { kind: "Name", value: "reassignedAuthorGrants" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReassignUserPoliciesMutation, ReassignUserPoliciesMutationVariables>;
export const RecordAckDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RecordAck" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "recordAck" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "ackedAt" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RecordAckMutation, RecordAckMutationVariables>;
export const RecordRiskAssessmentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RecordRiskAssessment" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "factors" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "RiskFactorsInput" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "decision" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "BreachDecision" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reason" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "recordRiskAssessment" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "caseId" },
                value: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "factors" },
                value: { kind: "Variable", name: { kind: "Name", value: "factors" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "decision" },
                value: { kind: "Variable", name: { kind: "Name", value: "decision" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reason" },
                value: { kind: "Variable", name: { kind: "Name", value: "reason" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "factors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "information" } },
                      { kind: "Field", name: { kind: "Name", value: "recipient" } },
                      { kind: "Field", name: { kind: "Name", value: "viewed" } },
                      { kind: "Field", name: { kind: "Name", value: "mitigation" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "suggestion" } },
                { kind: "Field", name: { kind: "Name", value: "decision" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "decidedByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "decidedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RecordRiskAssessmentMutation, RecordRiskAssessmentMutationVariables>;
export const ReferencesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "References" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "includeArchived" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "references" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "includeArchived" },
                value: { kind: "Variable", name: { kind: "Name", value: "includeArchived" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "clause" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReferencesQuery, ReferencesQueryVariables>;
export const RelationshipTypesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "RelationshipTypes" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "relationshipTypes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "inverseId" } },
                { kind: "Field", name: { kind: "Name", value: "inverseLabel" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RelationshipTypesQuery, RelationshipTypesQueryVariables>;
export const RemoveFactorDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RemoveFactor" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "kind" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "removeFactor" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "kind" },
                value: { kind: "Variable", name: { kind: "Name", value: "kind" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveFactorMutation, RemoveFactorMutationVariables>;
export const RemoveUserFromGroupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RemoveUserFromGroup" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "removeUserFromGroup" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "groupId" },
                value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
          { kind: "Field", name: { kind: "Name", value: "groupIds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyOverrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyNumber" } },
                { kind: "Field", name: { kind: "Name", value: "effect" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "memberships" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveUserFromGroupMutation, RemoveUserFromGroupMutationVariables>;
export const RemoveUserMfaFactorDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RemoveUserMfaFactor" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "methodId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "removeUserMfaFactor" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "methodId" },
                value: { kind: "Variable", name: { kind: "Name", value: "methodId" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveUserMfaFactorMutation, RemoveUserMfaFactorMutationVariables>;
export const RemoveWebauthnCredentialDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RemoveWebauthnCredential" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "credentialId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "removeWebauthnCredential" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "credentialId" },
                value: { kind: "Variable", name: { kind: "Name", value: "credentialId" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveWebauthnCredentialMutation,
  RemoveWebauthnCredentialMutationVariables
>;
export const RenameCategoryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RenameCategory" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "slug" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "renameCategory" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: { kind: "Variable", name: { kind: "Name", value: "name" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "slug" },
                value: { kind: "Variable", name: { kind: "Name", value: "slug" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "CategoryFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "CategoryFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Category" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "parentId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateNone" } },
          { kind: "Field", name: { kind: "Name", value: "defaultWorkflowId" } },
          { kind: "Field", name: { kind: "Name", value: "owners" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "exclusionGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryone" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryoneSet" } },
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RenameCategoryMutation, RenameCategoryMutationVariables>;
export const RenameMfaMethodDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RenameMfaMethod" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "methodId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "label" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "renameMfaMethod" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "methodId" },
                value: { kind: "Variable", name: { kind: "Name", value: "methodId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "label" },
                value: { kind: "Variable", name: { kind: "Name", value: "label" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RenameMfaMethodMutation, RenameMfaMethodMutationVariables>;
export const RenameTemplateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RenameTemplate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "renameTemplate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: { kind: "Variable", name: { kind: "Name", value: "name" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "TemplateFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TemplateFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Template" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "code" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "ownerCategoryId" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RenameTemplateMutation, RenameTemplateMutationVariables>;
export const RenameUserMfaFactorDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RenameUserMfaFactor" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "methodId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "label" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "renameUserMfaFactor" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "methodId" },
                value: { kind: "Variable", name: { kind: "Name", value: "methodId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "label" },
                value: { kind: "Variable", name: { kind: "Name", value: "label" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RenameUserMfaFactorMutation, RenameUserMfaFactorMutationVariables>;
export const ReorderAppendicesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ReorderAppendices" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "orderedIds" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "reorderAppendices" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderedIds" },
                value: { kind: "Variable", name: { kind: "Name", value: "orderedIds" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Appendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReorderAppendicesMutation, ReorderAppendicesMutationVariables>;
export const ReorderPolicyAppendicesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ReorderPolicyAppendices" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "orderedIds" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "reorderPolicyAppendices" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "orderedIds" },
                value: { kind: "Variable", name: { kind: "Name", value: "orderedIds" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PolicyAppendixFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AppendixVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedBy" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedBy" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PolicyAppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyAppendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyId" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "published" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "draft" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "versions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "publishedVersions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contributors" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "active" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ReorderPolicyAppendicesMutation,
  ReorderPolicyAppendicesMutationVariables
>;
export const ReplyReviewThreadDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ReplyReviewThread" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "body" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "replyReviewThread" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "threadId" },
                value: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "body" },
                value: { kind: "Variable", name: { kind: "Name", value: "body" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ReviewThreadFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReviewThreadFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReviewThread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "quote" } },
          { kind: "Field", name: { kind: "Name", value: "occurrence" } },
          { kind: "Field", name: { kind: "Name", value: "resolved" } },
          { kind: "Field", name: { kind: "Name", value: "approverUserId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "messages" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "authorName" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "suggestion" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "turn" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rounds" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "by" } },
                      { kind: "Field", name: { kind: "Name", value: "text" } },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "outcome" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "closedBy" } },
                { kind: "Field", name: { kind: "Name", value: "closedText" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReplyReviewThreadMutation, ReplyReviewThreadMutationVariables>;
export const ReportCaseDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ReportCase" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "reportCase" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "caseId" },
                value: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ReportCaseFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReportCaseFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReportCase" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "caseCode" } },
          { kind: "Field", name: { kind: "Name", value: "kind" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "details" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "whatHappened" } },
                { kind: "Field", name: { kind: "Name", value: "occurred" } },
                { kind: "Field", name: { kind: "Name", value: "location" } },
                { kind: "Field", name: { kind: "Name", value: "informationKinds" } },
                { kind: "Field", name: { kind: "Name", value: "stillHappening" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "reporterUserId" } },
          { kind: "Field", name: { kind: "Name", value: "assigneeUserId" } },
          { kind: "Field", name: { kind: "Name", value: "receivedAt" } },
          { kind: "Field", name: { kind: "Name", value: "discoveredOn" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "attachments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "filename" } },
                { kind: "Field", name: { kind: "Name", value: "contentType" } },
                { kind: "Field", name: { kind: "Name", value: "sizeBytes" } },
                { kind: "Field", name: { kind: "Name", value: "metadataStripped" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "author" } },
                { kind: "Field", name: { kind: "Name", value: "officerUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "assessment" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "factors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "information" } },
                      { kind: "Field", name: { kind: "Name", value: "recipient" } },
                      { kind: "Field", name: { kind: "Name", value: "viewed" } },
                      { kind: "Field", name: { kind: "Name", value: "mitigation" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "suggestion" } },
                { kind: "Field", name: { kind: "Name", value: "decision" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "decidedByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "decidedAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notices" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "recipient" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "method" } },
                { kind: "Field", name: { kind: "Name", value: "daysAllowed" } },
                { kind: "Field", name: { kind: "Name", value: "dueOn" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "sentOn" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "outcome" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctiveActions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "closedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReportCaseQuery, ReportCaseQueryVariables>;
export const ReportCasesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ReportCases" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "statuses" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "CaseStatus" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "assigneeUserId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "reportCases" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "statuses" },
                value: { kind: "Variable", name: { kind: "Name", value: "statuses" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "assigneeUserId" },
                value: { kind: "Variable", name: { kind: "Name", value: "assigneeUserId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "cases" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "caseCode" } },
                      { kind: "Field", name: { kind: "Name", value: "kind" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                      { kind: "Field", name: { kind: "Name", value: "summary" } },
                      { kind: "Field", name: { kind: "Name", value: "assigneeUserId" } },
                      { kind: "Field", name: { kind: "Name", value: "receivedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "nextDeadline" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "counts" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReportCasesQuery, ReportCasesQueryVariables>;
export const RequestHardResetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RequestHardReset" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "module" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reason" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "requestHardReset" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "module" },
                value: { kind: "Variable", name: { kind: "Name", value: "module" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reason" },
                value: { kind: "Variable", name: { kind: "Name", value: "reason" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "HardResetRequestFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "HardResetRequestFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "HardResetRequest" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "module" } },
          { kind: "Field", name: { kind: "Name", value: "reason" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "requestedBy" } },
          { kind: "Field", name: { kind: "Name", value: "requestedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvedBy" } },
          { kind: "Field", name: { kind: "Name", value: "approvedAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvalExpiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "cancelledAt" } },
          { kind: "Field", name: { kind: "Name", value: "consumedAt" } },
          { kind: "Field", name: { kind: "Name", value: "consumedBy" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RequestHardResetMutation, RequestHardResetMutationVariables>;
export const RequestPdfExportDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RequestPdfExport" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "requestPDFExport" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "jobId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RequestPdfExportMutation, RequestPdfExportMutationVariables>;
export const RequestStepUpOtpDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RequestStepUpOtp" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [{ kind: "Field", name: { kind: "Name", value: "requestStepUpOtp" } }],
      },
    },
  ],
} as unknown as DocumentNode<RequestStepUpOtpMutation, RequestStepUpOtpMutationVariables>;
export const ResendWelcomeEmailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ResendWelcomeEmail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "resendWelcomeEmail" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ResendWelcomeEmailMutation, ResendWelcomeEmailMutationVariables>;
export const ResetUserPasswordDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ResetUserPassword" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "newPassword" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "resetUserPassword" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "newPassword" },
                value: { kind: "Variable", name: { kind: "Name", value: "newPassword" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ResetUserPasswordMutation, ResetUserPasswordMutationVariables>;
export const ResolveUserLabelsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ResolveUserLabels" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "ids" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "resolveUserLabels" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "ids" },
                value: { kind: "Variable", name: { kind: "Name", value: "ids" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ResolveUserLabelsQuery, ResolveUserLabelsQueryVariables>;
export const RestoreAppendixDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RestoreAppendix" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "restoreAppendix" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PolicyAppendixFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AppendixVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedBy" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedBy" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PolicyAppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyAppendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyId" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "published" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "draft" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "versions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "publishedVersions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contributors" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "active" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RestoreAppendixMutation, RestoreAppendixMutationVariables>;
export const RetireAppendixDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RetireAppendix" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "retireAppendix" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PolicyAppendixFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AppendixVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedBy" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedBy" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PolicyAppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyAppendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyId" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "published" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "draft" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "versions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "publishedVersions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contributors" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "active" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RetireAppendixMutation, RetireAppendixMutationVariables>;
export const RetirePolicyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RetirePolicy" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "retirePolicy" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RetirePolicyMutation, RetirePolicyMutationVariables>;
export const RetireTemplateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RetireTemplate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "retireTemplate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "TemplateFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TemplateFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Template" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "code" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "ownerCategoryId" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RetireTemplateMutation, RetireTemplateMutationVariables>;
export const ReviewThreadsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ReviewThreads" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "reviewThreads" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ReviewThreadFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReviewThreadFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReviewThread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "quote" } },
          { kind: "Field", name: { kind: "Name", value: "occurrence" } },
          { kind: "Field", name: { kind: "Name", value: "resolved" } },
          { kind: "Field", name: { kind: "Name", value: "approverUserId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "messages" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "authorName" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "suggestion" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "turn" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rounds" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "by" } },
                      { kind: "Field", name: { kind: "Name", value: "text" } },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "outcome" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "closedBy" } },
                { kind: "Field", name: { kind: "Name", value: "closedText" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReviewThreadsQuery, ReviewThreadsQueryVariables>;
export const RevokeMagicLinkDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RevokeMagicLink" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "token" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "revokeMagicLink" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "token" },
                value: { kind: "Variable", name: { kind: "Name", value: "token" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RevokeMagicLinkMutation, RevokeMagicLinkMutationVariables>;
export const RevokeMySessionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RevokeMySessions" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [{ kind: "Field", name: { kind: "Name", value: "revokeMySessions" } }],
      },
    },
  ],
} as unknown as DocumentNode<RevokeMySessionsMutation, RevokeMySessionsMutationVariables>;
export const RevokeRoleDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RevokeRole" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "role" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "revokeRole" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "role" },
                value: { kind: "Variable", name: { kind: "Name", value: "role" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
          { kind: "Field", name: { kind: "Name", value: "groupIds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyOverrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyNumber" } },
                { kind: "Field", name: { kind: "Name", value: "effect" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "memberships" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RevokeRoleMutation, RevokeRoleMutationVariables>;
export const RevokeUserSessionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RevokeUserSessions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reason" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "revokeUserSessions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reason" },
                value: { kind: "Variable", name: { kind: "Name", value: "reason" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RevokeUserSessionsMutation, RevokeUserSessionsMutationVariables>;
export const RunVetoesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "RunVetoes" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workflowStatus" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "stageAssignees" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "veto" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RunVetoesQuery, RunVetoesQueryVariables>;
export const SaveAppendixDraftDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SaveAppendixDraft" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "title" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "contentJson" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "saveAppendixDraft" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: { kind: "Variable", name: { kind: "Name", value: "title" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "contentJson" },
                value: { kind: "Variable", name: { kind: "Name", value: "contentJson" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PolicyAppendixFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AppendixVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedBy" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedBy" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PolicyAppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyAppendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyId" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "published" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "draft" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "versions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "publishedVersions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixVersionFields" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contributors" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "active" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SaveAppendixDraftMutation, SaveAppendixDraftMutationVariables>;
export const SaveDraftDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SaveDraft" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "contentJson" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "templateVersionId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "saveDraft" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "contentJson" },
                value: { kind: "Variable", name: { kind: "Name", value: "contentJson" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "templateVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "templateVersionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PolicyVersionFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Appendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PolicyVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyId" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "semanticVersion" } },
          { kind: "Field", name: { kind: "Name", value: "suggestedChangeType" } },
          { kind: "Field", name: { kind: "Name", value: "changeType" } },
          { kind: "Field", name: { kind: "Name", value: "requestedChangeType" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeReason" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeSetByUserId" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeAgreedByUserIds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "templateVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "changeTypeAgreedByUserIds" } },
          { kind: "Field", name: { kind: "Name", value: "reacknowledge" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "appendices" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixFields" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SaveDraftMutation, SaveDraftMutationVariables>;
export const SearchAndAnswerDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SearchAndAnswer" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "question" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "searchAndAnswer" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "question" },
                value: { kind: "Variable", name: { kind: "Name", value: "question" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "categoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "answer" } },
                { kind: "Field", name: { kind: "Name", value: "hasSensitiveSource" } },
                { kind: "Field", name: { kind: "Name", value: "noAuthorizedSource" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "citations" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "documentType" } },
                      { kind: "Field", name: { kind: "Name", value: "policyId" } },
                      { kind: "Field", name: { kind: "Name", value: "policyTitle" } },
                      { kind: "Field", name: { kind: "Name", value: "sectionKey" } },
                      { kind: "Field", name: { kind: "Name", value: "versionId" } },
                      { kind: "Field", name: { kind: "Name", value: "versionNo" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "segments" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "start" } },
                      { kind: "Field", name: { kind: "Name", value: "end" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sources" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "policyId" } },
                            { kind: "Field", name: { kind: "Name", value: "sectionKey" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchAndAnswerQuery, SearchAndAnswerQueryVariables>;
export const SearchUsersDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SearchUsers" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "query" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "limit" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "searchUsers" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "query" },
                value: { kind: "Variable", name: { kind: "Name", value: "query" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "limit" },
                value: { kind: "Variable", name: { kind: "Name", value: "limit" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchUsersQuery, SearchUsersQueryVariables>;
export const SetAiEnabledDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetAiEnabled" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "enabled" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setAIEnabled" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "enabled" },
                value: { kind: "Variable", name: { kind: "Name", value: "enabled" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetAiEnabledMutation, SetAiEnabledMutationVariables>;
export const SetAiProviderCredentialDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetAiProviderCredential" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "credential" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setAIProviderCredential" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "credential" },
                value: { kind: "Variable", name: { kind: "Name", value: "credential" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "credentialSet" } },
                { kind: "Field", name: { kind: "Name", value: "credentialLast4" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetAiProviderCredentialMutation,
  SetAiProviderCredentialMutationVariables
>;
export const SetAiRetrievalConfigDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetAiRetrievalConfig" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "topK" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setAIRetrievalConfig" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "topK" },
                value: { kind: "Variable", name: { kind: "Name", value: "topK" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "topK" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetAiRetrievalConfigMutation, SetAiRetrievalConfigMutationVariables>;
export const SetCaseDiscoveryDateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetCaseDiscoveryDate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "discoveredOn" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setCaseDiscoveryDate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "caseId" },
                value: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "discoveredOn" },
                value: { kind: "Variable", name: { kind: "Name", value: "discoveredOn" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ReportCaseFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReportCaseFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReportCase" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "caseCode" } },
          { kind: "Field", name: { kind: "Name", value: "kind" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "details" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "whatHappened" } },
                { kind: "Field", name: { kind: "Name", value: "occurred" } },
                { kind: "Field", name: { kind: "Name", value: "location" } },
                { kind: "Field", name: { kind: "Name", value: "informationKinds" } },
                { kind: "Field", name: { kind: "Name", value: "stillHappening" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "reporterUserId" } },
          { kind: "Field", name: { kind: "Name", value: "assigneeUserId" } },
          { kind: "Field", name: { kind: "Name", value: "receivedAt" } },
          { kind: "Field", name: { kind: "Name", value: "discoveredOn" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "attachments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "filename" } },
                { kind: "Field", name: { kind: "Name", value: "contentType" } },
                { kind: "Field", name: { kind: "Name", value: "sizeBytes" } },
                { kind: "Field", name: { kind: "Name", value: "metadataStripped" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "author" } },
                { kind: "Field", name: { kind: "Name", value: "officerUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "assessment" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "factors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "information" } },
                      { kind: "Field", name: { kind: "Name", value: "recipient" } },
                      { kind: "Field", name: { kind: "Name", value: "viewed" } },
                      { kind: "Field", name: { kind: "Name", value: "mitigation" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "suggestion" } },
                { kind: "Field", name: { kind: "Name", value: "decision" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "decidedByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "decidedAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notices" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "recipient" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "method" } },
                { kind: "Field", name: { kind: "Name", value: "daysAllowed" } },
                { kind: "Field", name: { kind: "Name", value: "dueOn" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "sentOn" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "outcome" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctiveActions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "closedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetCaseDiscoveryDateMutation, SetCaseDiscoveryDateMutationVariables>;
export const SetCaseStatusDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetCaseStatus" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "status" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "CaseStatus" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setCaseStatus" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "caseId" },
                value: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "status" },
                value: { kind: "Variable", name: { kind: "Name", value: "status" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ReportCaseFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReportCaseFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReportCase" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "caseCode" } },
          { kind: "Field", name: { kind: "Name", value: "kind" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "details" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "whatHappened" } },
                { kind: "Field", name: { kind: "Name", value: "occurred" } },
                { kind: "Field", name: { kind: "Name", value: "location" } },
                { kind: "Field", name: { kind: "Name", value: "informationKinds" } },
                { kind: "Field", name: { kind: "Name", value: "stillHappening" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "reporterUserId" } },
          { kind: "Field", name: { kind: "Name", value: "assigneeUserId" } },
          { kind: "Field", name: { kind: "Name", value: "receivedAt" } },
          { kind: "Field", name: { kind: "Name", value: "discoveredOn" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "attachments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "filename" } },
                { kind: "Field", name: { kind: "Name", value: "contentType" } },
                { kind: "Field", name: { kind: "Name", value: "sizeBytes" } },
                { kind: "Field", name: { kind: "Name", value: "metadataStripped" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "author" } },
                { kind: "Field", name: { kind: "Name", value: "officerUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "assessment" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "factors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "information" } },
                      { kind: "Field", name: { kind: "Name", value: "recipient" } },
                      { kind: "Field", name: { kind: "Name", value: "viewed" } },
                      { kind: "Field", name: { kind: "Name", value: "mitigation" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "suggestion" } },
                { kind: "Field", name: { kind: "Name", value: "decision" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "decidedByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "decidedAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "notices" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "recipient" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "method" } },
                { kind: "Field", name: { kind: "Name", value: "daysAllowed" } },
                { kind: "Field", name: { kind: "Name", value: "dueOn" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "sentOn" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "outcome" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctiveActions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "closedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetCaseStatusMutation, SetCaseStatusMutationVariables>;
export const SetCategoryCadenceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetCategoryCadence" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "category" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "NotifCategory" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "cadence" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "NotifCadence" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setCategoryCadence" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "category" },
                value: { kind: "Variable", name: { kind: "Name", value: "category" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "cadence" },
                value: { kind: "Variable", name: { kind: "Name", value: "cadence" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "NotificationSettingsFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "NotificationSettingsFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "NotificationSettings" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "channels" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "inApp" } },
                { kind: "Field", name: { kind: "Name", value: "push" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "categories" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "cadence" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "overrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "cadence" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
                { kind: "Field", name: { kind: "Name", value: "delivery" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "digest" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "dailyHour" } },
                { kind: "Field", name: { kind: "Name", value: "weeklyDow" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetCategoryCadenceMutation, SetCategoryCadenceMutationVariables>;
export const SetCategoryDefaultsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetCategoryDefaults" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "defaultTemplateId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "defaultWorkflowId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "defaultTemplateNone" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setCategoryDefaults" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "defaultTemplateId" },
                value: { kind: "Variable", name: { kind: "Name", value: "defaultTemplateId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "defaultWorkflowId" },
                value: { kind: "Variable", name: { kind: "Name", value: "defaultWorkflowId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "defaultTemplateNone" },
                value: { kind: "Variable", name: { kind: "Name", value: "defaultTemplateNone" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "CategoryFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "CategoryFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Category" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "parentId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateNone" } },
          { kind: "Field", name: { kind: "Name", value: "defaultWorkflowId" } },
          { kind: "Field", name: { kind: "Name", value: "owners" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "exclusionGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryone" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryoneSet" } },
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetCategoryDefaultsMutation, SetCategoryDefaultsMutationVariables>;
export const SetCategoryDocumentTypesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetCategoryDocumentTypes" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "documentTypes" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "CategoryDocumentTypes" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setCategoryDocumentTypes" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "documentTypes" },
                value: { kind: "Variable", name: { kind: "Name", value: "documentTypes" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "documentTypes" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetCategoryDocumentTypesMutation,
  SetCategoryDocumentTypesMutationVariables
>;
export const SetCategoryGovernanceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetCategoryGovernance" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "owners" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
              },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "idpGroupIds" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "exclusionGroupIds" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "ackTriggers" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "AckTrigger" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reviewCadence" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ReviewCadence" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reviewDate" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "ackEveryone" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setCategoryGovernance" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "owners" },
                value: { kind: "Variable", name: { kind: "Name", value: "owners" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "idpGroupIds" },
                value: { kind: "Variable", name: { kind: "Name", value: "idpGroupIds" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "exclusionGroupIds" },
                value: { kind: "Variable", name: { kind: "Name", value: "exclusionGroupIds" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "ackTriggers" },
                value: { kind: "Variable", name: { kind: "Name", value: "ackTriggers" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reviewCadence" },
                value: { kind: "Variable", name: { kind: "Name", value: "reviewCadence" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reviewDate" },
                value: { kind: "Variable", name: { kind: "Name", value: "reviewDate" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "ackEveryone" },
                value: { kind: "Variable", name: { kind: "Name", value: "ackEveryone" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "CategoryFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "CategoryFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Category" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "parentId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateId" } },
          { kind: "Field", name: { kind: "Name", value: "defaultTemplateNone" } },
          { kind: "Field", name: { kind: "Name", value: "defaultWorkflowId" } },
          { kind: "Field", name: { kind: "Name", value: "owners" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "exclusionGroupIds" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryone" } },
          { kind: "Field", name: { kind: "Name", value: "ackEveryoneSet" } },
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetCategoryGovernanceMutation, SetCategoryGovernanceMutationVariables>;
export const SetCategoryRulesetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetCategoryRuleset" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "rules" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "RaciRuleInput" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setCategoryRuleset" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "categoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "rules" },
                value: { kind: "Variable", name: { kind: "Name", value: "rules" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rules" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "RaciRuleFields" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RaciRuleFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "RaciRule" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "subjectKind" } },
          { kind: "Field", name: { kind: "Name", value: "subjectRef" } },
          { kind: "Field", name: { kind: "Name", value: "read" } },
          { kind: "Field", name: { kind: "Name", value: "ack" } },
          { kind: "Field", name: { kind: "Name", value: "approve" } },
          { kind: "Field", name: { kind: "Name", value: "author" } },
          { kind: "Field", name: { kind: "Name", value: "manage" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetCategoryRulesetMutation, SetCategoryRulesetMutationVariables>;
export const SetCategoryTemplateLockDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetCategoryTemplateLock" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "locked" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setCategoryTemplateLock" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "locked" },
                value: { kind: "Variable", name: { kind: "Name", value: "locked" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "defaultTemplateLocked" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetCategoryTemplateLockMutation,
  SetCategoryTemplateLockMutationVariables
>;
export const SetComplianceModuleDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetComplianceModule" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "enabled" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setComplianceModule" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "enabled" },
                value: { kind: "Variable", name: { kind: "Name", value: "enabled" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "moduleEnabled" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetComplianceModuleMutation, SetComplianceModuleMutationVariables>;
export const SetContactBlockArchivedDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetContactBlockArchived" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "archived" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setContactBlockArchived" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "archived" },
                value: { kind: "Variable", name: { kind: "Name", value: "archived" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "department" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "phone" } },
                { kind: "Field", name: { kind: "Name", value: "hours" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetContactBlockArchivedMutation,
  SetContactBlockArchivedMutationVariables
>;
export const SetDefinitionArchivedDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetDefinitionArchived" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "archived" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setDefinitionArchived" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "archived" },
                value: { kind: "Variable", name: { kind: "Name", value: "archived" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                { kind: "Field", name: { kind: "Name", value: "definition" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetDefinitionArchivedMutation, SetDefinitionArchivedMutationVariables>;
export const SetDigestWindowDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetDigestWindow" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "dailyHour" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "weeklyDow" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setDigestWindow" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "dailyHour" },
                value: { kind: "Variable", name: { kind: "Name", value: "dailyHour" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "weeklyDow" },
                value: { kind: "Variable", name: { kind: "Name", value: "weeklyDow" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "NotificationSettingsFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "NotificationSettingsFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "NotificationSettings" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "channels" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "inApp" } },
                { kind: "Field", name: { kind: "Name", value: "push" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "categories" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "cadence" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "overrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "cadence" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
                { kind: "Field", name: { kind: "Name", value: "delivery" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "digest" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "dailyHour" } },
                { kind: "Field", name: { kind: "Name", value: "weeklyDow" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetDigestWindowMutation, SetDigestWindowMutationVariables>;
export const SetEmailServiceConfigDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetEmailServiceConfig" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "EmailServiceConfigInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setEmailServiceConfig" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "apiKeySet" } },
                { kind: "Field", name: { kind: "Name", value: "provider" } },
                { kind: "Field", name: { kind: "Name", value: "domain" } },
                { kind: "Field", name: { kind: "Name", value: "region" } },
                { kind: "Field", name: { kind: "Name", value: "fromAddress" } },
                { kind: "Field", name: { kind: "Name", value: "enabled" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetEmailServiceConfigMutation, SetEmailServiceConfigMutationVariables>;
export const SetGlobalSettingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetGlobalSettings" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "GlobalSettingsInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setGlobalSettings" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "announcement" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "enabled" } },
                      { kind: "Field", name: { kind: "Name", value: "level" } },
                      { kind: "Field", name: { kind: "Name", value: "message" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "maintenance" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "enabled" } },
                      { kind: "Field", name: { kind: "Name", value: "message" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workCalendar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "weekdays" } },
                      { kind: "Field", name: { kind: "Name", value: "timezone" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "holidays" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "date" } },
                            { kind: "Field", name: { kind: "Name", value: "label" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetGlobalSettingsMutation, SetGlobalSettingsMutationVariables>;
export const SetNotificationChannelsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetNotificationChannels" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "NotificationPrefInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setNotificationChannels" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "NotificationSettingsFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "NotificationSettingsFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "NotificationSettings" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "channels" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "inApp" } },
                { kind: "Field", name: { kind: "Name", value: "push" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "categories" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "cadence" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "overrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "cadence" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
                { kind: "Field", name: { kind: "Name", value: "delivery" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "digest" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "dailyHour" } },
                { kind: "Field", name: { kind: "Name", value: "weeklyDow" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetNotificationChannelsMutation,
  SetNotificationChannelsMutationVariables
>;
export const SetPolicyOwnerDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetPolicyOwner" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "ownerUserId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setPolicyOwner" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "ownerUserId" },
                value: { kind: "Variable", name: { kind: "Name", value: "ownerUserId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetPolicyOwnerMutation, SetPolicyOwnerMutationVariables>;
export const SetPolicyTemplateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetPolicyTemplate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "templateId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "none" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setPolicyTemplate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "templateId" },
                value: { kind: "Variable", name: { kind: "Name", value: "templateId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "none" },
                value: { kind: "Variable", name: { kind: "Name", value: "none" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AuthoringPolicyFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AuthoringPolicyFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Policy" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "number" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "documentType" } },
          { kind: "Field", name: { kind: "Name", value: "sensitivity" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUserId" } },
          { kind: "Field", name: { kind: "Name", value: "ownerName" } },
          { kind: "Field", name: { kind: "Name", value: "homeCategoryId" } },
          { kind: "Field", name: { kind: "Name", value: "ackTriggers" } },
          { kind: "Field", name: { kind: "Name", value: "ackAudienceOverride" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "templateNone" } },
          { kind: "Field", name: { kind: "Name", value: "currentDraftVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentPublishedVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionNo" } },
          { kind: "Field", name: { kind: "Name", value: "currentVersionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "viewerCan" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "read" } },
                { kind: "Field", name: { kind: "Name", value: "edit" } },
                { kind: "Field", name: { kind: "Name", value: "submit" } },
                { kind: "Field", name: { kind: "Name", value: "approve" } },
                { kind: "Field", name: { kind: "Name", value: "contentObfuscated" } },
                { kind: "Field", name: { kind: "Name", value: "canBreakGlass" } },
                { kind: "Field", name: { kind: "Name", value: "ack" } },
                { kind: "Field", name: { kind: "Name", value: "manage" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetPolicyTemplateMutation, SetPolicyTemplateMutationVariables>;
export const SetReferenceArchivedDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetReferenceArchived" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "archived" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setReferenceArchived" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "archived" },
                value: { kind: "Variable", name: { kind: "Name", value: "archived" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "clause" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetReferenceArchivedMutation, SetReferenceArchivedMutationVariables>;
export const SetReviewThreadResolvedDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetReviewThreadResolved" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "resolved" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setReviewThreadResolved" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "threadId" },
                value: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "resolved" },
                value: { kind: "Variable", name: { kind: "Name", value: "resolved" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ReviewThreadFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ReviewThreadFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ReviewThread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "quote" } },
          { kind: "Field", name: { kind: "Name", value: "occurrence" } },
          { kind: "Field", name: { kind: "Name", value: "resolved" } },
          { kind: "Field", name: { kind: "Name", value: "approverUserId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "messages" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "authorUserId" } },
                { kind: "Field", name: { kind: "Name", value: "authorName" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "suggestion" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "turn" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rounds" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "by" } },
                      { kind: "Field", name: { kind: "Name", value: "text" } },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "outcome" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "closedBy" } },
                { kind: "Field", name: { kind: "Name", value: "closedText" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetReviewThreadResolvedMutation,
  SetReviewThreadResolvedMutationVariables
>;
export const SetTypeCadenceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetTypeCadence" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "kind" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "cadence" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "NotifCadence" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setTypeCadence" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "kind" },
                value: { kind: "Variable", name: { kind: "Name", value: "kind" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "cadence" },
                value: { kind: "Variable", name: { kind: "Name", value: "cadence" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "NotificationSettingsFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "NotificationSettingsFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "NotificationSettings" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "channels" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "inApp" } },
                { kind: "Field", name: { kind: "Name", value: "push" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "categories" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "cadence" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "overrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "cadence" } },
                { kind: "Field", name: { kind: "Name", value: "mandatory" } },
                { kind: "Field", name: { kind: "Name", value: "delivery" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "digest" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "dailyHour" } },
                { kind: "Field", name: { kind: "Name", value: "weeklyDow" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetTypeCadenceMutation, SetTypeCadenceMutationVariables>;
export const SetUserPolicyOverrideDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetUserPolicyOverride" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyNumber" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "effect" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "OverrideEffect" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setUserPolicyOverride" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyNumber" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyNumber" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "effect" },
                value: { kind: "Variable", name: { kind: "Name", value: "effect" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
          { kind: "Field", name: { kind: "Name", value: "groupIds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyOverrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyNumber" } },
                { kind: "Field", name: { kind: "Name", value: "effect" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "memberships" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetUserPolicyOverrideMutation, SetUserPolicyOverrideMutationVariables>;
export const SetVersionContactsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetVersionContacts" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "contactBlockIds" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setVersionContacts" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "contactBlockIds" },
                value: { kind: "Variable", name: { kind: "Name", value: "contactBlockIds" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "VersionLinksFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "VersionLinksFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyVersionLinks" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "editable" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "definitions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                { kind: "Field", name: { kind: "Name", value: "definition" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "related" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "direction" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "references" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "clause" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contacts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "department" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "phone" } },
                { kind: "Field", name: { kind: "Name", value: "hours" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetVersionContactsMutation, SetVersionContactsMutationVariables>;
export const SetVersionDefinitionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetVersionDefinitions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "definitionIds" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setVersionDefinitions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "definitionIds" },
                value: { kind: "Variable", name: { kind: "Name", value: "definitionIds" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "VersionLinksFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "VersionLinksFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyVersionLinks" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "editable" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "definitions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                { kind: "Field", name: { kind: "Name", value: "definition" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "related" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "direction" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "references" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "clause" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contacts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "department" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "phone" } },
                { kind: "Field", name: { kind: "Name", value: "hours" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetVersionDefinitionsMutation, SetVersionDefinitionsMutationVariables>;
export const SetVersionReferencesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetVersionReferences" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "referenceIds" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setVersionReferences" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "referenceIds" },
                value: { kind: "Variable", name: { kind: "Name", value: "referenceIds" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "VersionLinksFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "VersionLinksFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyVersionLinks" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "editable" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "definitions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                { kind: "Field", name: { kind: "Name", value: "definition" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "related" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "direction" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "references" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "clause" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contacts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "department" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "phone" } },
                { kind: "Field", name: { kind: "Name", value: "hours" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetVersionReferencesMutation, SetVersionReferencesMutationVariables>;
export const SetVersionRelatedDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetVersionRelated" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "links" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "RelatedLinkInput" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setVersionRelated" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "links" },
                value: { kind: "Variable", name: { kind: "Name", value: "links" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "VersionLinksFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "VersionLinksFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PolicyVersionLinks" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "editable" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "definitions" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                { kind: "Field", name: { kind: "Name", value: "definition" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "related" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyId" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "direction" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "references" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "clause" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "contacts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "department" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "phone" } },
                { kind: "Field", name: { kind: "Name", value: "hours" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetVersionRelatedMutation, SetVersionRelatedMutationVariables>;
export const SignalWorkflowDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SignalWorkflow" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "runId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "taskId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "signal" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "SignalType" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "comment" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "signalWorkflow" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "runId" },
                value: { kind: "Variable", name: { kind: "Name", value: "runId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "taskId" },
                value: { kind: "Variable", name: { kind: "Name", value: "taskId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "signal" },
                value: { kind: "Variable", name: { kind: "Name", value: "signal" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "comment" },
                value: { kind: "Variable", name: { kind: "Name", value: "comment" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SignalWorkflowMutation, SignalWorkflowMutationVariables>;
export const SimulateCategoryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SimulateCategory" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "draftRules" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "RaciRuleInput" } },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "simulateCategory" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "categoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "draftRules" },
                value: { kind: "Variable", name: { kind: "Name", value: "draftRules" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "read" } },
                { kind: "Field", name: { kind: "Name", value: "readReason" } },
                { kind: "Field", name: { kind: "Name", value: "readCode" } },
                { kind: "Field", name: { kind: "Name", value: "ack" } },
                { kind: "Field", name: { kind: "Name", value: "ackReason" } },
                { kind: "Field", name: { kind: "Name", value: "ackCode" } },
                { kind: "Field", name: { kind: "Name", value: "approve" } },
                { kind: "Field", name: { kind: "Name", value: "approveReason" } },
                { kind: "Field", name: { kind: "Name", value: "approveCode" } },
                { kind: "Field", name: { kind: "Name", value: "author" } },
                { kind: "Field", name: { kind: "Name", value: "authorReason" } },
                { kind: "Field", name: { kind: "Name", value: "authorCode" } },
                { kind: "Field", name: { kind: "Name", value: "manage" } },
                { kind: "Field", name: { kind: "Name", value: "manageReason" } },
                { kind: "Field", name: { kind: "Name", value: "manageCode" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "configuredBlock" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "action" } },
                      { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                      { kind: "Field", name: { kind: "Name", value: "subjectKind" } },
                      { kind: "Field", name: { kind: "Name", value: "subjectRef" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SimulateCategoryQuery, SimulateCategoryQueryVariables>;
export const SpCertificateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SpCertificate" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "spCertificate" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "active" } },
                { kind: "Field", name: { kind: "Name", value: "certPem" } },
                { kind: "Field", name: { kind: "Name", value: "notAfter" } },
                { kind: "Field", name: { kind: "Name", value: "serial" } },
                { kind: "Field", name: { kind: "Name", value: "spMetadataXml" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SpCertificateQuery, SpCertificateQueryVariables>;
export const StartDomainVerificationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "StartDomainVerification" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "domain" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "rotate" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "startDomainVerification" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "domain" },
                value: { kind: "Variable", name: { kind: "Name", value: "domain" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "rotate" },
                value: { kind: "Variable", name: { kind: "Name", value: "rotate" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "dnsRecordName" } },
                { kind: "Field", name: { kind: "Name", value: "dnsRecordValue" } },
                { kind: "Field", name: { kind: "Name", value: "instructions" } },
                { kind: "Field", name: { kind: "Name", value: "token" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  StartDomainVerificationMutation,
  StartDomainVerificationMutationVariables
>;
export const StartImpersonationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "StartImpersonation" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reason" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "startImpersonation" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reason" },
                value: { kind: "Variable", name: { kind: "Name", value: "reason" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "targetUserId" } },
                { kind: "Field", name: { kind: "Name", value: "targetName" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StartImpersonationMutation, StartImpersonationMutationVariables>;
export const StopImpersonationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "StopImpersonation" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [{ kind: "Field", name: { kind: "Name", value: "stopImpersonation" } }],
      },
    },
  ],
} as unknown as DocumentNode<StopImpersonationMutation, StopImpersonationMutationVariables>;
export const SubmitDraftGenerationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SubmitDraftGeneration" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SubmitDraftGenerationInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "submitDraftGeneration" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "jobId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SubmitDraftGenerationMutation, SubmitDraftGenerationMutationVariables>;
export const SubmitPolicyReviewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SubmitPolicyReview" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "SubmitPolicyReviewInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "submitPolicyReview" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "jobId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SubmitPolicyReviewMutation, SubmitPolicyReviewMutationVariables>;
export const SubmitPolicyRevisionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SubmitPolicyRevision" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "SubmitPolicyRevisionInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "submitPolicyRevision" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "jobId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SubmitPolicyRevisionMutation, SubmitPolicyRevisionMutationVariables>;
export const SubmitWorkflowDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SubmitWorkflow" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "ancestorCategoryIds" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
              },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "changeType" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ChangeType" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "changeTypeReason" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "submitWorkflow" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "categoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "categoryId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "ancestorCategoryIds" },
                value: { kind: "Variable", name: { kind: "Name", value: "ancestorCategoryIds" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "changeType" },
                value: { kind: "Variable", name: { kind: "Name", value: "changeType" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "changeTypeReason" },
                value: { kind: "Variable", name: { kind: "Name", value: "changeTypeReason" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "runId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SubmitWorkflowMutation, SubmitWorkflowMutationVariables>;
export const TemplateVersionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "TemplateVersions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "templateId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "templateVersions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "templateId" },
                value: { kind: "Variable", name: { kind: "Name", value: "templateId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "TemplateVersionFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TemplateVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "TemplateVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "semanticVersion" } },
          { kind: "Field", name: { kind: "Name", value: "changeType" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "sections" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "key" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "order" } },
                { kind: "Field", name: { kind: "Name", value: "level" } },
                { kind: "Field", name: { kind: "Name", value: "required" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "blocks" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "contentJson" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TemplateVersionsQuery, TemplateVersionsQueryVariables>;
export const TemplatesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Templates" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "ownerCategoryId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "templates" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "ownerCategoryId" },
                value: { kind: "Variable", name: { kind: "Name", value: "ownerCategoryId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "TemplateFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TemplateFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Template" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "code" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "ownerCategoryId" } },
          { kind: "Field", name: { kind: "Name", value: "retiredAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TemplatesQuery, TemplatesQueryVariables>;
export const TopPolicyQuestionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "TopPolicyQuestions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "limit" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "topPolicyQuestions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "limit" },
                value: { kind: "Variable", name: { kind: "Name", value: "limit" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TopPolicyQuestionsQuery, TopPolicyQuestionsQueryVariables>;
export const TransferRootDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "TransferRoot" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "otp" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "transferRoot" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "otp" },
                value: { kind: "Variable", name: { kind: "Name", value: "otp" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
          { kind: "Field", name: { kind: "Name", value: "groupIds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyOverrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyNumber" } },
                { kind: "Field", name: { kind: "Name", value: "effect" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "memberships" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TransferRootMutation, TransferRootMutationVariables>;
export const UpcomingApprovalsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "UpcomingApprovals" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "upcomingApprovals" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
                { kind: "Field", name: { kind: "Name", value: "policyTitle" } },
                { kind: "Field", name: { kind: "Name", value: "stageIndex" } },
                { kind: "Field", name: { kind: "Name", value: "stageName" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpcomingApprovalsQuery, UpcomingApprovalsQueryVariables>;
export const UpdateAppendixDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateAppendix" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "title" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "contentJson" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateAppendix" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: { kind: "Variable", name: { kind: "Name", value: "title" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "contentJson" },
                value: { kind: "Variable", name: { kind: "Name", value: "contentJson" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "AppendixFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AppendixFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Appendix" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "policyVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
          { kind: "Field", name: { kind: "Name", value: "orderIndex" } },
          { kind: "Field", name: { kind: "Name", value: "letter" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateAppendixMutation, UpdateAppendixMutationVariables>;
export const UpdateCaseNoticeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateCaseNotice" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "noticeId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "status" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "NoticeStatus" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sentOn" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateCaseNotice" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "caseId" },
                value: { kind: "Variable", name: { kind: "Name", value: "caseId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "noticeId" },
                value: { kind: "Variable", name: { kind: "Name", value: "noticeId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "status" },
                value: { kind: "Variable", name: { kind: "Name", value: "status" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sentOn" },
                value: { kind: "Variable", name: { kind: "Name", value: "sentOn" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "recipient" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "method" } },
                { kind: "Field", name: { kind: "Name", value: "daysAllowed" } },
                { kind: "Field", name: { kind: "Name", value: "dueOn" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "sentOn" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateCaseNoticeMutation, UpdateCaseNoticeMutationVariables>;
export const UpdateContactBlockDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateContactBlock" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "block" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ContactBlockInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateContactBlock" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "block" },
                value: { kind: "Variable", name: { kind: "Name", value: "block" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "department" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "phone" } },
                { kind: "Field", name: { kind: "Name", value: "hours" } },
                { kind: "Field", name: { kind: "Name", value: "notes" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateContactBlockMutation, UpdateContactBlockMutationVariables>;
export const UpdateDefinitionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateDefinition" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DefinitionEntryInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateDefinition" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                { kind: "Field", name: { kind: "Name", value: "definition" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateDefinitionMutation, UpdateDefinitionMutationVariables>;
export const UpdateIdPConnectionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateIdPConnection" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "domain" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "jitEnabled" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "allowLocal" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "secretRef" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "clientSecret" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateIdPConnection" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "domain" },
                value: { kind: "Variable", name: { kind: "Name", value: "domain" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "jitEnabled" },
                value: { kind: "Variable", name: { kind: "Name", value: "jitEnabled" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "allowLocal" },
                value: { kind: "Variable", name: { kind: "Name", value: "allowLocal" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "secretRef" },
                value: { kind: "Variable", name: { kind: "Name", value: "secretRef" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "clientSecret" },
                value: { kind: "Variable", name: { kind: "Name", value: "clientSecret" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "OrganizationFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OrganizationFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Organization" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "connectionId" } },
          { kind: "Field", name: { kind: "Name", value: "connectionAlias" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "jitEnabled" } },
          { kind: "Field", name: { kind: "Name", value: "orgName" } },
          { kind: "Field", name: { kind: "Name", value: "protocol" } },
          { kind: "Field", name: { kind: "Name", value: "testPassed" } },
          { kind: "Field", name: { kind: "Name", value: "verified" } },
          { kind: "Field", name: { kind: "Name", value: "allowLocal" } },
          { kind: "Field", name: { kind: "Name", value: "secretReentryRequired" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateIdPConnectionMutation, UpdateIdPConnectionMutationVariables>;
export const UpdateMyProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateMyProfile" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "firstName" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "lastName" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "locale" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateMyProfile" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "firstName" },
                value: { kind: "Variable", name: { kind: "Name", value: "firstName" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "lastName" },
                value: { kind: "Variable", name: { kind: "Name", value: "lastName" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "locale" },
                value: { kind: "Variable", name: { kind: "Name", value: "locale" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "firstName" } },
                { kind: "Field", name: { kind: "Name", value: "lastName" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "locale" } },
                { kind: "Field", name: { kind: "Name", value: "roles" } },
                { kind: "Field", name: { kind: "Name", value: "permissions" } },
                { kind: "Field", name: { kind: "Name", value: "managedGroupIds" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;
export const UpdateReferenceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateReference" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ReferenceInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateReference" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "clause" } },
                { kind: "Field", name: { kind: "Name", value: "body" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "archived" } },
                { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                { kind: "Field", name: { kind: "Name", value: "usedByCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateReferenceMutation, UpdateReferenceMutationVariables>;
export const UpdateTemplateVersionSectionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateTemplateVersionSections" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sections" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "SectionInput" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateTemplateVersionSections" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sections" },
                value: { kind: "Variable", name: { kind: "Name", value: "sections" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "TemplateVersionFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TemplateVersionFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "TemplateVersion" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "versionNo" } },
          { kind: "Field", name: { kind: "Name", value: "semanticVersion" } },
          { kind: "Field", name: { kind: "Name", value: "changeType" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "sections" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "key" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "order" } },
                { kind: "Field", name: { kind: "Name", value: "level" } },
                { kind: "Field", name: { kind: "Name", value: "required" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "blocks" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "contentJson" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateTemplateVersionSectionsMutation,
  UpdateTemplateVersionSectionsMutationVariables
>;
export const UpdateUserProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateUserProfile" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "email" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateUserProfile" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: { kind: "Variable", name: { kind: "Name", value: "name" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "email" },
                value: { kind: "Variable", name: { kind: "Name", value: "email" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
          { kind: "Field", name: { kind: "Name", value: "groupIds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyOverrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyNumber" } },
                { kind: "Field", name: { kind: "Name", value: "effect" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "memberships" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;
export const UpdateWorkflowDefDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateWorkflowDef" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "description" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "stages" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "WorkflowStageInput" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateWorkflowDef" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: { kind: "Variable", name: { kind: "Name", value: "name" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "description" },
                value: { kind: "Variable", name: { kind: "Name", value: "description" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "stages" },
                value: { kind: "Variable", name: { kind: "Name", value: "stages" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "WorkflowDefFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "WorkflowStageDefFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "WorkflowStageDef" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "approvers" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "approversByCategory" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "approverIds" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "groupUnits" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "internalQuorum" } },
                { kind: "Field", name: { kind: "Name", value: "memberUserIds" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "quorum" } },
          { kind: "Field", name: { kind: "Name", value: "slaDays" } },
          { kind: "Field", name: { kind: "Name", value: "rejectOnSlaBreach" } },
          { kind: "Field", name: { kind: "Name", value: "remindEveryDays" } },
          { kind: "Field", name: { kind: "Name", value: "escalateAfterDays" } },
          { kind: "Field", name: { kind: "Name", value: "pinnedLast" } },
          { kind: "Field", name: { kind: "Name", value: "vetoUserIds" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "WorkflowDefFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "WorkflowDef" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "stages" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "WorkflowStageDefFields" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateWorkflowDefMutation, UpdateWorkflowDefMutationVariables>;
export const UserFactorsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "UserFactors" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userFactors" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "kind" } },
                { kind: "Field", name: { kind: "Name", value: "enrolledAt" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserFactorsQuery, UserFactorsQueryVariables>;
export const UsersDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Users" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "search" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "includeDeleted" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "users" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "search" },
                value: { kind: "Variable", name: { kind: "Name", value: "search" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "pageSize" },
                value: { kind: "IntValue", value: "200" },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "includeDeleted" },
                value: { kind: "Variable", name: { kind: "Name", value: "includeDeleted" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "nextPageToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "users" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "idpGroups" } },
          { kind: "Field", name: { kind: "Name", value: "groupIds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "policyOverrides" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "policyNumber" } },
                { kind: "Field", name: { kind: "Name", value: "effect" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "memberships" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const VerifyAuditChainDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "VerifyAuditChain" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fromRecordId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "toRecordId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "verifyAuditChain" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromRecordId" },
                value: { kind: "Variable", name: { kind: "Name", value: "fromRecordId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "toRecordId" },
                value: { kind: "Variable", name: { kind: "Name", value: "toRecordId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "valid" } },
                { kind: "Field", name: { kind: "Name", value: "recordsChecked" } },
                { kind: "Field", name: { kind: "Name", value: "errors" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VerifyAuditChainQuery, VerifyAuditChainQueryVariables>;
export const VerifyDomainDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "VerifyDomain" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "domain" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "verifyDomain" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "domain" },
                value: { kind: "Variable", name: { kind: "Name", value: "domain" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "OrganizationFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OrganizationFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Organization" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "connectionId" } },
          { kind: "Field", name: { kind: "Name", value: "connectionAlias" } },
          { kind: "Field", name: { kind: "Name", value: "displayName" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "jitEnabled" } },
          { kind: "Field", name: { kind: "Name", value: "orgName" } },
          { kind: "Field", name: { kind: "Name", value: "protocol" } },
          { kind: "Field", name: { kind: "Name", value: "testPassed" } },
          { kind: "Field", name: { kind: "Name", value: "verified" } },
          { kind: "Field", name: { kind: "Name", value: "allowLocal" } },
          { kind: "Field", name: { kind: "Name", value: "secretReentryRequired" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VerifyDomainMutation, VerifyDomainMutationVariables>;
export const VersionChangesSinceReviewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "VersionChangesSinceReview" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "versionChangesSinceReview" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "sectionKey" } },
                { kind: "Field", name: { kind: "Name", value: "sectionTitle" } },
                { kind: "Field", name: { kind: "Name", value: "changeType" } },
                { kind: "Field", name: { kind: "Name", value: "wordDiffHtml" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  VersionChangesSinceReviewQuery,
  VersionChangesSinceReviewQueryVariables
>;
export const WebauthnRegisterBeginDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "WebauthnRegisterBegin" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "webauthnRegisterBegin" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "optionsJson" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<WebauthnRegisterBeginMutation, WebauthnRegisterBeginMutationVariables>;
export const WebauthnRegisterFinishDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "WebauthnRegisterFinish" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sessionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "credentialJson" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "label" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "webauthnRegisterFinish" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "sessionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "sessionId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "credentialJson" },
                value: { kind: "Variable", name: { kind: "Name", value: "credentialJson" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "label" },
                value: { kind: "Variable", name: { kind: "Name", value: "label" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  WebauthnRegisterFinishMutation,
  WebauthnRegisterFinishMutationVariables
>;
export const WorkflowApproverCandidatesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "WorkflowApproverCandidates" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workflowId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workflowApproverCandidates" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "workflowId" },
                value: { kind: "Variable", name: { kind: "Name", value: "workflowId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "workflowId" } },
                { kind: "Field", name: { kind: "Name", value: "attached" } },
                { kind: "Field", name: { kind: "Name", value: "categoryIds" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "users" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  WorkflowApproverCandidatesQuery,
  WorkflowApproverCandidatesQueryVariables
>;
export const WorkflowDefDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "WorkflowDef" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workflowDef" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "WorkflowDefFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "WorkflowStageDefFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "WorkflowStageDef" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "approvers" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "approversByCategory" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "approverIds" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "groupUnits" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "internalQuorum" } },
                { kind: "Field", name: { kind: "Name", value: "memberUserIds" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "quorum" } },
          { kind: "Field", name: { kind: "Name", value: "slaDays" } },
          { kind: "Field", name: { kind: "Name", value: "rejectOnSlaBreach" } },
          { kind: "Field", name: { kind: "Name", value: "remindEveryDays" } },
          { kind: "Field", name: { kind: "Name", value: "escalateAfterDays" } },
          { kind: "Field", name: { kind: "Name", value: "pinnedLast" } },
          { kind: "Field", name: { kind: "Name", value: "vetoUserIds" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "WorkflowDefFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "WorkflowDef" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "stages" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "WorkflowStageDefFields" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<WorkflowDefQuery, WorkflowDefQueryVariables>;
export const WorkflowDefsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "WorkflowDefs" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workflowDefs" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "WorkflowDefFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "WorkflowStageDefFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "WorkflowStageDef" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "approvers" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "approversByCategory" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "categoryId" } },
                { kind: "Field", name: { kind: "Name", value: "approverIds" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "groupUnits" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "groupId" } },
                { kind: "Field", name: { kind: "Name", value: "internalQuorum" } },
                { kind: "Field", name: { kind: "Name", value: "memberUserIds" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "quorum" } },
          { kind: "Field", name: { kind: "Name", value: "slaDays" } },
          { kind: "Field", name: { kind: "Name", value: "rejectOnSlaBreach" } },
          { kind: "Field", name: { kind: "Name", value: "remindEveryDays" } },
          { kind: "Field", name: { kind: "Name", value: "escalateAfterDays" } },
          { kind: "Field", name: { kind: "Name", value: "pinnedLast" } },
          { kind: "Field", name: { kind: "Name", value: "vetoUserIds" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "WorkflowDefFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "WorkflowDef" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "stages" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "WorkflowStageDefFields" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<WorkflowDefsQuery, WorkflowDefsQueryVariables>;
export const WorkflowStatusDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "WorkflowStatus" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workflowStatus" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "runId" } },
                { kind: "Field", name: { kind: "Name", value: "currentStageIdx" } },
                { kind: "Field", name: { kind: "Name", value: "stageNames" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "stageAssignees" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "state" } },
                      { kind: "Field", name: { kind: "Name", value: "comment" } },
                      { kind: "Field", name: { kind: "Name", value: "decidedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "groupId" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "stageUnitProgress" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "groupId" } },
                      { kind: "Field", name: { kind: "Name", value: "groupName" } },
                      { kind: "Field", name: { kind: "Name", value: "quorum" } },
                      { kind: "Field", name: { kind: "Name", value: "required" } },
                      { kind: "Field", name: { kind: "Name", value: "approvals" } },
                      { kind: "Field", name: { kind: "Name", value: "pending" } },
                      { kind: "Field", name: { kind: "Name", value: "roster" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "submittedBy" } },
                { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "stageProgress" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "dueAt" } },
                      { kind: "Field", name: { kind: "Name", value: "quorum" } },
                      { kind: "Field", name: { kind: "Name", value: "quorumN" } },
                      { kind: "Field", name: { kind: "Name", value: "approvals" } },
                      { kind: "Field", name: { kind: "Name", value: "required" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<WorkflowStatusQuery, WorkflowStatusQueryVariables>;
