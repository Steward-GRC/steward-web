/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type * as Types from "./schema";

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
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

export type AiJobResultContentQueryVariables = Exact<{
  resultRef: string;
}>;

export type AiJobResultContentQuery = {
  readonly aiJobResultContent: { readonly operation: string; readonly resultJson: string };
};

export type AppendixFieldsFragment = {
  readonly id: string;
  readonly policyVersionId: string;
  readonly title: string;
  readonly contentJson: string;
  readonly orderIndex: number;
  readonly letter: string;
};

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
  readonly templateId: string | null;
  readonly templateNone: boolean;
  readonly currentDraftVersionId: string | null;
  readonly currentPublishedVersionId: string | null;
  readonly retiredAt: string | null;
  readonly viewerCan: {
    readonly read: boolean;
    readonly edit: boolean;
    readonly submit: boolean;
    readonly approve: boolean;
    readonly contentObfuscated: boolean;
    readonly canBreakGlass: boolean;
    readonly ack: boolean;
  };
};

export type BreakGlassRevealMutationVariables = Exact<{
  policyId: string | number;
  reason: string;
}>;

export type BreakGlassRevealMutation = {
  readonly breakGlassReveal: { readonly grantedUntil: string };
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
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
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
  readonly reviewCadence: Types.ReviewCadence;
  readonly reviewDate: string | null;
};

export type ChangeOrgProtocolMutationVariables = Exact<{
  domain: string;
  protocol: string;
  config?: ReadonlyArray<Types.KeyValueInput> | Types.KeyValueInput | null | undefined;
  secretRef?: string | null | undefined;
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
  };
};

export type CloseCaseMutationVariables = Exact<{
  caseId: string | number;
  outcome: Types.CaseOutcome;
  correctiveActions?:
    ReadonlyArray<Types.CorrectiveActionInput> | Types.CorrectiveActionInput | null | undefined;
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
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
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
    readonly templateId: string | null;
    readonly templateNone: boolean;
    readonly currentDraftVersionId: string | null;
    readonly currentPublishedVersionId: string | null;
    readonly retiredAt: string | null;
    readonly viewerCan: {
      readonly read: boolean;
      readonly edit: boolean;
      readonly submit: boolean;
      readonly approve: boolean;
      readonly contentObfuscated: boolean;
      readonly canBreakGlass: boolean;
      readonly ack: boolean;
    };
  };
};

export type DeleteAppendixMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteAppendixMutation = { readonly deleteAppendix: boolean };

export type DeleteCategoryMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteCategoryMutation = { readonly deleteCategory: boolean };

export type DeleteGroupMappingMutationVariables = Exact<{
  mappingId: string | number;
}>;

export type DeleteGroupMappingMutation = { readonly deleteGroupMapping: boolean };

export type DeleteOrganizationMutationVariables = Exact<{
  domain: string;
}>;

export type DeleteOrganizationMutation = { readonly deleteOrganization: boolean };

export type DeleteUserMutationVariables = Exact<{
  userId: string | number;
}>;

export type DeleteUserMutation = {
  readonly deleteUser: { readonly userId: string; readonly revokedSessions: number };
};

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
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
  };
};

export type DiscardDraftMutationVariables = Exact<{
  policyId: string | number;
}>;

export type DiscardDraftMutation = { readonly discardDraft: boolean };

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
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
  };
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
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
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
    readonly sections: ReadonlyArray<{
      readonly key: string;
      readonly title: string;
      readonly order: number;
      readonly level: number;
      readonly required: boolean;
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
  }>;
};

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
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  };
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
  }>;
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
    readonly templateId: string | null;
    readonly templateNone: boolean;
    readonly currentDraftVersionId: string | null;
    readonly currentPublishedVersionId: string | null;
    readonly retiredAt: string | null;
    readonly viewerCan: {
      readonly read: boolean;
      readonly edit: boolean;
      readonly submit: boolean;
      readonly approve: boolean;
      readonly contentObfuscated: boolean;
      readonly canBreakGlass: boolean;
      readonly ack: boolean;
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
    readonly templateId: string | null;
    readonly templateNone: boolean;
    readonly currentDraftVersionId: string | null;
    readonly currentPublishedVersionId: string | null;
    readonly retiredAt: string | null;
    readonly viewerCan: {
      readonly read: boolean;
      readonly edit: boolean;
      readonly submit: boolean;
      readonly approve: boolean;
      readonly contentObfuscated: boolean;
      readonly canBreakGlass: boolean;
      readonly ack: boolean;
    };
  } | null;
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

export type PolicyVersionQueryVariables = Exact<{
  id: string | number;
}>;

export type PolicyVersionQuery = {
  readonly policyVersion: {
    readonly id: string;
    readonly policyId: string;
    readonly versionNo: number;
    readonly status: string;
    readonly templateVersionId: string;
    readonly contentJson: string;
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
  readonly status: string;
  readonly templateVersionId: string;
  readonly contentJson: string;
  readonly appendices: ReadonlyArray<{
    readonly id: string;
    readonly policyVersionId: string;
    readonly title: string;
    readonly contentJson: string;
    readonly orderIndex: number;
    readonly letter: string;
  }>;
};

export type PolicyVersionMetaQueryVariables = Exact<{
  id: string | number;
}>;

export type PolicyVersionMetaQuery = {
  readonly policyVersion: {
    readonly id: string;
    readonly versionNo: number;
    readonly status: string;
  } | null;
};

export type PolicyVersionsQueryVariables = Exact<{
  policyId: string | number;
}>;

export type PolicyVersionsQuery = {
  readonly policyVersions: ReadonlyArray<{
    readonly id: string;
    readonly versionNo: number;
    readonly status: string;
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

export type PublishDraftMutationVariables = Exact<{
  policyId: string | number;
}>;

export type PublishDraftMutation = {
  readonly publishDraft: {
    readonly id: string;
    readonly policyId: string;
    readonly versionNo: number;
    readonly status: string;
    readonly templateVersionId: string;
    readonly contentJson: string;
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
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  };
};

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
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
  };
};

export type RevokeUserSessionsMutationVariables = Exact<{
  userId: string | number;
  reason?: string | null | undefined;
}>;

export type RevokeUserSessionsMutation = { readonly revokeUserSessions: number };

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
    readonly status: string;
    readonly templateVersionId: string;
    readonly contentJson: string;
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
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
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
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
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

export type TemplatesQueryVariables = Exact<{
  ownerCategoryId?: string | number | null | undefined;
}>;

export type TemplatesQuery = {
  readonly templates: ReadonlyArray<{ readonly id: string; readonly name: string }>;
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

export type UpdateIdPConnectionMutationVariables = Exact<{
  domain: string;
  jitEnabled?: boolean | null | undefined;
  allowLocal?: boolean | null | undefined;
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
  };
};

export type UpdateMyProfileMutationVariables = Exact<{
  firstName: string;
  lastName: string;
}>;

export type UpdateMyProfileMutation = {
  readonly updateMyProfile: {
    readonly userId: string;
    readonly username: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly roles: ReadonlyArray<string>;
    readonly permissions: ReadonlyArray<string>;
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
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
  };
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
  readonly isRoot: boolean;
  readonly localAccount: boolean;
  readonly username: string;
  readonly deletedAt: string | null;
  readonly mergedIntoUserId: string | null;
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
      readonly isRoot: boolean;
      readonly localAccount: boolean;
      readonly username: string;
      readonly deletedAt: string | null;
      readonly mergedIntoUserId: string | null;
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
  };
};

export type WorkflowDefsQueryVariables = Exact<{ [key: string]: never }>;

export type WorkflowDefsQuery = {
  readonly workflowDefs: ReadonlyArray<{ readonly id: string; readonly name: string }>;
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
    readonly stageAssignees: ReadonlyArray<
      ReadonlyArray<{
        readonly userId: string;
        readonly name: string | null;
        readonly state: string;
        readonly comment: string | null;
        readonly decidedAt: string | null;
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
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "templateNone" } },
          { kind: "Field", name: { kind: "Name", value: "currentDraftVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentPublishedVersionId" } },
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoryFieldsFragment, unknown>;
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrganizationFieldsFragment, unknown>;
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
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "templateVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
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
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserFieldsFragment, unknown>;
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddOrganizationMutation, AddOrganizationMutationVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoryChildrenQuery, CategoryChildrenQueryVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "templateNone" } },
          { kind: "Field", name: { kind: "Name", value: "currentDraftVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentPublishedVersionId" } },
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
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreatePolicyMutation, CreatePolicyMutationVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
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
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EnableUserMutation, EnableUserMutationVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
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
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "templateId" } },
                { kind: "Field", name: { kind: "Name", value: "versionNo" } },
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
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListUserSessionsQuery, ListUserSessionsQueryVariables>;
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
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MoveCategoryMutation, MoveCategoryMutationVariables>;
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrganizationsQuery, OrganizationsQueryVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "templateNone" } },
          { kind: "Field", name: { kind: "Name", value: "currentDraftVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentPublishedVersionId" } },
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
          { kind: "Field", name: { kind: "Name", value: "templateId" } },
          { kind: "Field", name: { kind: "Name", value: "templateNone" } },
          { kind: "Field", name: { kind: "Name", value: "currentDraftVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "currentPublishedVersionId" } },
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
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyQuery, PolicyQueryVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "templateVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
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
export const PolicyVersionMetaDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PolicyVersionMeta" },
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
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "versionNo" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyVersionMetaQuery, PolicyVersionMetaQueryVariables>;
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
                { kind: "Field", name: { kind: "Name", value: "status" } },
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
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "templateVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RenameCategoryMutation, RenameCategoryMutationVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
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
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "templateVersionId" } },
          { kind: "Field", name: { kind: "Name", value: "contentJson" } },
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetCategoryDefaultsMutation, SetCategoryDefaultsMutationVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetCategoryGovernanceMutation, SetCategoryGovernanceMutationVariables>;
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
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TemplatesQuery, TemplatesQueryVariables>;
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
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "lastName" } },
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
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<VerifyDomainMutation, VerifyDomainMutationVariables>;
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
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
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
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<WorkflowStatusQuery, WorkflowStatusQueryVariables>;
