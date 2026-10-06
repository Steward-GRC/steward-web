/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type * as Types from "./schema";

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type AcknowledgePolicyMutationVariables = Exact<{
  policyVersionId: string | number;
}>;

export type AcknowledgePolicyMutation = {
  readonly acknowledgePolicy: {
    readonly acknowledged: boolean;
    readonly ackedAt: string | null;
    readonly required: boolean;
  };
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

export type AuthorableGroupsQueryVariables = Exact<{ [key: string]: never }>;

export type AuthorableGroupsQuery = {
  readonly authorableGroups: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  }>;
};

export type AuthorableTemplatesQueryVariables = Exact<{
  ownerGroupId?: string | number | null | undefined;
}>;

export type AuthorableTemplatesQuery = {
  readonly authorableTemplates: ReadonlyArray<{ readonly id: string; readonly name: string }>;
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
  readonly category: string;
  readonly subcategory: string;
  readonly status: Types.PolicyStatus;
  readonly version: string;
  readonly updated: string;
  readonly ownerUserId: string;
  readonly homeGroupId: string;
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

export type CategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type CategoriesQuery = {
  readonly categories: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly subcategories: ReadonlyArray<string>;
  }>;
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

export type CreateGroupMutationVariables = Exact<{
  name: string;
  slug: string;
  parentId?: string | number | null | undefined;
}>;

export type CreateGroupMutation = {
  readonly createGroup: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  };
};

export type CreatePolicyMutationVariables = Exact<{
  homeGroupId: string | number;
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
    readonly category: string;
    readonly subcategory: string;
    readonly status: Types.PolicyStatus;
    readonly version: string;
    readonly updated: string;
    readonly ownerUserId: string;
    readonly homeGroupId: string;
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

export type DeleteGroupMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteGroupMutation = { readonly deleteGroup: boolean };

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
    readonly adGroups: ReadonlyArray<string>;
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

export type DraftVersionQueryVariables = Exact<{
  policyId: string | number;
}>;

export type DraftVersionQuery = {
  readonly draftVersion: {
    readonly id: string;
    readonly policyId: string;
    readonly versionNo: number;
    readonly status: string;
    readonly templateVersionId: string | null;
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
    readonly adGroups: ReadonlyArray<string>;
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
    readonly adGroups: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
  };
};

export type GroupChildrenQueryVariables = Exact<{
  parentId?: string | number | null | undefined;
}>;

export type GroupChildrenQuery = {
  readonly groupChildren: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  }>;
};

export type GroupFieldsFragment = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly parentId: string | null;
  readonly defaultTemplateId: string | null;
  readonly defaultTemplateNone: boolean;
  readonly defaultWorkflowId: string | null;
  readonly owners: ReadonlyArray<string>;
  readonly reviewCadence: Types.ReviewCadence;
  readonly reviewDate: string | null;
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
    readonly issuedAt: string;
    readonly lastSeenAt: string;
    readonly expiresAt: string;
    readonly revokedAt: string | null;
    readonly clientIp: string;
    readonly userAgent: string;
  }>;
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  readonly me: {
    readonly id: string;
    readonly username: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly roles: ReadonlyArray<string>;
    readonly permissions: ReadonlyArray<string>;
  } | null;
};

export type MoveGroupMutationVariables = Exact<{
  groupId: string | number;
  newParentId?: string | number | null | undefined;
}>;

export type MoveGroupMutation = {
  readonly moveGroup: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
  };
};

export type MyDraftPoliciesQueryVariables = Exact<{ [key: string]: never }>;

export type MyDraftPoliciesQuery = {
  readonly myDraftPolicies: ReadonlyArray<{
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly documentType: Types.DocumentType;
    readonly sensitivity: Types.Sensitivity;
    readonly category: string;
    readonly subcategory: string;
    readonly status: Types.PolicyStatus;
    readonly version: string;
    readonly updated: string;
    readonly ownerUserId: string;
    readonly homeGroupId: string;
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

export type PoliciesQueryVariables = Exact<{
  documentType: Types.DocumentType;
}>;

export type PoliciesQuery = {
  readonly policies: ReadonlyArray<{
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly documentType: Types.DocumentType;
    readonly sensitivity: Types.Sensitivity;
    readonly category: string;
    readonly subcategory: string;
    readonly status: Types.PolicyStatus;
    readonly version: string;
    readonly updated: string;
    readonly ownerUserId: string;
    readonly homeGroupId: string;
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
    readonly category: string;
    readonly subcategory: string;
    readonly status: Types.PolicyStatus;
    readonly version: string;
    readonly updated: string;
    readonly ownerUserId: string;
    readonly homeGroupId: string;
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

export type PolicyDetailQueryVariables = Exact<{
  documentType: Types.DocumentType;
  number: string;
}>;

export type PolicyDetailQuery = {
  readonly policyDetail: {
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly documentType: Types.DocumentType;
    readonly category: string;
    readonly subcategory: string;
    readonly sensitivity: Types.Sensitivity;
    readonly status: Types.PolicyStatus;
    readonly version: string;
    readonly ownerName: string | null;
    readonly published: string | null;
    readonly updated: string;
    readonly bodyText: string;
    readonly contentObfuscated: boolean;
    readonly canBreakGlass: boolean;
    readonly currentVersionId: string | null;
    readonly ack: {
      readonly acknowledged: boolean;
      readonly ackedAt: string | null;
      readonly required: boolean;
    } | null;
    readonly appendices: ReadonlyArray<{
      readonly id: string;
      readonly letter: string;
      readonly title: string;
      readonly text: string;
    }>;
    readonly definitions: ReadonlyArray<{
      readonly id: string;
      readonly term: string;
      readonly definition: string;
    }>;
    readonly related: ReadonlyArray<{
      readonly policyId: string;
      readonly number: string;
      readonly title: string;
    }>;
    readonly references: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly kind: Types.ReferenceKind;
      readonly clause: string | null;
      readonly body: string | null;
      readonly url: string | null;
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
    }>;
    readonly history: ReadonlyArray<{
      readonly kind: string;
      readonly versionLabel: string;
      readonly stage: string | null;
      readonly actorName: string | null;
      readonly comment: string | null;
      readonly at: string;
    }>;
    readonly priorVersion: {
      readonly version: string;
      readonly diff: ReadonlyArray<{
        readonly sectionKey: string;
        readonly sectionTitle: string;
        readonly changeType: string;
        readonly wordDiffHtml: string | null;
      }>;
    } | null;
  } | null;
};

export type PolicyVersionFieldsFragment = {
  readonly id: string;
  readonly policyId: string;
  readonly versionNo: number;
  readonly status: string;
  readonly templateVersionId: string | null;
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
      readonly accessRows: number;
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
    readonly templateVersionId: string | null;
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

export type RenameGroupMutationVariables = Exact<{
  id: string | number;
  name: string;
  slug: string;
}>;

export type RenameGroupMutation = {
  readonly renameGroup: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
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
    readonly adGroups: ReadonlyArray<string>;
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
    readonly templateVersionId: string | null;
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

export type TemplatesQueryVariables = Exact<{ [key: string]: never }>;

export type TemplatesQuery = {
  readonly templates: ReadonlyArray<{ readonly id: string; readonly name: string }>;
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

export type UpdateGroupSettingsMutationVariables = Exact<{
  id: string | number;
  defaultTemplateId?: string | number | null | undefined;
  defaultTemplateNone?: boolean | null | undefined;
  defaultWorkflowId?: string | number | null | undefined;
  owners?: ReadonlyArray<string | number> | string | number | null | undefined;
  reviewCadence?: Types.ReviewCadence | null | undefined;
  reviewDate?: string | null | undefined;
}>;

export type UpdateGroupSettingsMutation = {
  readonly updateGroupSettings: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly parentId: string | null;
    readonly defaultTemplateId: string | null;
    readonly defaultTemplateNone: boolean;
    readonly defaultWorkflowId: string | null;
    readonly owners: ReadonlyArray<string>;
    readonly reviewCadence: Types.ReviewCadence;
    readonly reviewDate: string | null;
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
    readonly id: string;
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
    readonly adGroups: ReadonlyArray<string>;
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
  readonly adGroups: ReadonlyArray<string>;
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
      readonly adGroups: ReadonlyArray<string>;
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

export type WorkflowsQueryVariables = Exact<{ [key: string]: never }>;

export type WorkflowsQuery = {
  readonly workflows: ReadonlyArray<{ readonly id: string; readonly name: string }>;
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
          { kind: "Field", name: { kind: "Name", value: "category" } },
          { kind: "Field", name: { kind: "Name", value: "subcategory" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "updated" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUserId" } },
          { kind: "Field", name: { kind: "Name", value: "homeGroupId" } },
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
export const GroupFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "GroupFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Group" } },
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GroupFieldsFragment, unknown>;
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
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
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
export const AcknowledgePolicyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AcknowledgePolicy" },
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
            name: { kind: "Name", value: "acknowledgePolicy" },
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
                { kind: "Field", name: { kind: "Name", value: "required" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AcknowledgePolicyMutation, AcknowledgePolicyMutationVariables>;
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
export const AuthorableGroupsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AuthorableGroups" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "authorableGroups" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "GroupFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "GroupFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Group" } },
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AuthorableGroupsQuery, AuthorableGroupsQueryVariables>;
export const AuthorableTemplatesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AuthorableTemplates" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "ownerGroupId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "authorableTemplates" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "ownerGroupId" },
                value: { kind: "Variable", name: { kind: "Name", value: "ownerGroupId" } },
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
} as unknown as DocumentNode<AuthorableTemplatesQuery, AuthorableTemplatesQueryVariables>;
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
export const CategoriesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Categories" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "categories" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "slug" } },
                { kind: "Field", name: { kind: "Name", value: "subcategories" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoriesQuery, CategoriesQueryVariables>;
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
export const CreateGroupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateGroup" },
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
            name: { kind: "Name", value: "createGroup" },
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
                { kind: "FragmentSpread", name: { kind: "Name", value: "GroupFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "GroupFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Group" } },
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateGroupMutation, CreateGroupMutationVariables>;
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
          variable: { kind: "Variable", name: { kind: "Name", value: "homeGroupId" } },
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
                name: { kind: "Name", value: "homeGroupId" },
                value: { kind: "Variable", name: { kind: "Name", value: "homeGroupId" } },
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
          { kind: "Field", name: { kind: "Name", value: "category" } },
          { kind: "Field", name: { kind: "Name", value: "subcategory" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "updated" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUserId" } },
          { kind: "Field", name: { kind: "Name", value: "homeGroupId" } },
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
export const DeleteGroupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteGroup" },
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
            name: { kind: "Name", value: "deleteGroup" },
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
} as unknown as DocumentNode<DeleteGroupMutation, DeleteGroupMutationVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
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
export const DraftVersionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DraftVersion" },
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
            name: { kind: "Name", value: "draftVersion" },
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
} as unknown as DocumentNode<DraftVersionQuery, DraftVersionQueryVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
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
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
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
export const GroupChildrenDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GroupChildren" },
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
            name: { kind: "Name", value: "groupChildren" },
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
                { kind: "FragmentSpread", name: { kind: "Name", value: "GroupFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "GroupFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Group" } },
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GroupChildrenQuery, GroupChildrenQueryVariables>;
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
                { kind: "Field", name: { kind: "Name", value: "issuedAt" } },
                { kind: "Field", name: { kind: "Name", value: "lastSeenAt" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
                { kind: "Field", name: { kind: "Name", value: "revokedAt" } },
                { kind: "Field", name: { kind: "Name", value: "clientIp" } },
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
                { kind: "Field", name: { kind: "Name", value: "id" } },
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
export const MoveGroupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "MoveGroup" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
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
            name: { kind: "Name", value: "moveGroup" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "groupId" },
                value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
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
                { kind: "FragmentSpread", name: { kind: "Name", value: "GroupFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "GroupFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Group" } },
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MoveGroupMutation, MoveGroupMutationVariables>;
export const MyDraftPoliciesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MyDraftPolicies" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "myDraftPolicies" },
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
          { kind: "Field", name: { kind: "Name", value: "category" } },
          { kind: "Field", name: { kind: "Name", value: "subcategory" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "updated" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUserId" } },
          { kind: "Field", name: { kind: "Name", value: "homeGroupId" } },
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
} as unknown as DocumentNode<MyDraftPoliciesQuery, MyDraftPoliciesQueryVariables>;
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
          variable: { kind: "Variable", name: { kind: "Name", value: "documentType" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DocumentType" } },
          },
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
          { kind: "Field", name: { kind: "Name", value: "category" } },
          { kind: "Field", name: { kind: "Name", value: "subcategory" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "updated" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUserId" } },
          { kind: "Field", name: { kind: "Name", value: "homeGroupId" } },
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
          { kind: "Field", name: { kind: "Name", value: "category" } },
          { kind: "Field", name: { kind: "Name", value: "subcategory" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "updated" } },
          { kind: "Field", name: { kind: "Name", value: "ownerUserId" } },
          { kind: "Field", name: { kind: "Name", value: "homeGroupId" } },
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
export const PolicyDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PolicyDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "documentType" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DocumentType" } },
          },
        },
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
            name: { kind: "Name", value: "policyDetail" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "documentType" },
                value: { kind: "Variable", name: { kind: "Name", value: "documentType" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: { kind: "Variable", name: { kind: "Name", value: "number" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "documentType" } },
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "subcategory" } },
                { kind: "Field", name: { kind: "Name", value: "sensitivity" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "ownerName" } },
                { kind: "Field", name: { kind: "Name", value: "published" } },
                { kind: "Field", name: { kind: "Name", value: "updated" } },
                { kind: "Field", name: { kind: "Name", value: "bodyText" } },
                { kind: "Field", name: { kind: "Name", value: "contentObfuscated" } },
                { kind: "Field", name: { kind: "Name", value: "canBreakGlass" } },
                { kind: "Field", name: { kind: "Name", value: "currentVersionId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "ack" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "acknowledged" } },
                      { kind: "Field", name: { kind: "Name", value: "ackedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "required" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "appendices" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "letter" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "text" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "definitions" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "term" } },
                      { kind: "Field", name: { kind: "Name", value: "definition" } },
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
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "history" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "kind" } },
                      { kind: "Field", name: { kind: "Name", value: "versionLabel" } },
                      { kind: "Field", name: { kind: "Name", value: "stage" } },
                      { kind: "Field", name: { kind: "Name", value: "actorName" } },
                      { kind: "Field", name: { kind: "Name", value: "comment" } },
                      { kind: "Field", name: { kind: "Name", value: "at" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "priorVersion" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "diff" },
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
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyDetailQuery, PolicyDetailQueryVariables>;
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
                      { kind: "Field", name: { kind: "Name", value: "accessRows" } },
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
export const RenameGroupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RenameGroup" },
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
            name: { kind: "Name", value: "renameGroup" },
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
                { kind: "FragmentSpread", name: { kind: "Name", value: "GroupFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "GroupFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Group" } },
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RenameGroupMutation, RenameGroupMutationVariables>;
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
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
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
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "templates" },
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
export const UpdateGroupSettingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateGroupSettings" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "defaultTemplateNone" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "defaultWorkflowId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "owners" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reviewCadence" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ReviewCadence" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reviewDate" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateGroupSettings" },
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
                name: { kind: "Name", value: "defaultTemplateNone" },
                value: { kind: "Variable", name: { kind: "Name", value: "defaultTemplateNone" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "defaultWorkflowId" },
                value: { kind: "Variable", name: { kind: "Name", value: "defaultWorkflowId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "owners" },
                value: { kind: "Variable", name: { kind: "Name", value: "owners" } },
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
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "GroupFields" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "GroupFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Group" } },
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
          { kind: "Field", name: { kind: "Name", value: "reviewCadence" } },
          { kind: "Field", name: { kind: "Name", value: "reviewDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateGroupSettingsMutation, UpdateGroupSettingsMutationVariables>;
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
                { kind: "Field", name: { kind: "Name", value: "id" } },
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
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
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
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
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
export const WorkflowsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Workflows" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workflows" },
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
} as unknown as DocumentNode<WorkflowsQuery, WorkflowsQueryVariables>;
