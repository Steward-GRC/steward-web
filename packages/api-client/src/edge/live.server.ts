// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Edge } from "../edge";
import type { Me, Policy, PolicyDetail, PolicySectionDiff } from "../views";

import { GatewayError, gatewayFetch } from "../gatewayFetch";
import { gatewayRestFetch, gatewayRestUpload } from "../gatewayRestFetch";
import {
  AckActivityDocument,
  AckRosterDocument,
  AckStatusDocument,
  ActivateOrganizationDocument,
  AddAppendixDocument,
  AddCaseNoteDocument,
  AddCaseNoticeDocument,
  AddGroupMappingDocument,
  AddOrganizationDocument,
  AddUserToGroupDocument,
  AiConfigDocument,
  AiHealthDocument,
  AiJobDocument,
  AiJobResultContentDocument,
  ArchiveWorkflowDefDocument,
  AssignCaseDocument,
  AuditLogDocument,
  AuthoringAssistDocument,
  type AuthoringPolicyFieldsFragment,
  BreakGlassRevealDocument,
  CategoryChildrenDocument,
  CategoryDocument,
  type CategoryFieldsFragment,
  CategoryRulesetDocument,
  CategoryTreeDocument,
  ChangeOrgProtocolDocument,
  CloseCaseDocument,
  CompleteOnboardingDocument,
  CompletionReportDocument,
  ContactBlocksDocument,
  CreateCategoryDocument,
  CreateContactBlockDocument,
  CreateDefinitionDocument,
  CreateMagicLinkDocument,
  CreatePlatformGroupDocument,
  CreatePolicyDocument,
  CreateReferenceDocument,
  CreateTemplateDocument,
  CreateTemplateVersionDocument,
  CreateWorkflowDefDocument,
  DefinitionsDocument,
  DeleteAppendixDocument,
  DeleteCategoryDocument,
  DeleteDefinitionDocument,
  DeleteGroupMappingDocument,
  DeleteOrganizationDocument,
  DeletePolicyDocument,
  DeleteReferenceDocument,
  DeleteTemplateDocument,
  DeleteUserDocument,
  DiagnosticsDocument,
  DiffVersionsDocument,
  DisableOrganizationDocument,
  DisableUserDocument,
  DiscardDraftDocument,
  DiscardTemplateVersionDocument,
  EmailServiceConfigDocument,
  EnableUserDocument,
  EnrollTotpBeginDocument,
  EnrollTotpConfirmDocument,
  ExportAcksDocument,
  ForceRotateSpCertificateDocument,
  GlobalSettingsDocument,
  GrantRoleDocument,
  GrantRootDocument,
  GroupMappingsDocument,
  ImpersonationStatusDocument,
  IssueCollabTokenDocument,
  LatestTemplateVersionDocument,
  ListUserSessionsDocument,
  ManagedGroupMembersDocument,
  MeDocument,
  MergeAccountsDocument,
  MoveCategoryDocument,
  MovePolicyDocument,
  MyAckSummaryDocument,
  MyDraftsDocument,
  MyFactorsDocument,
  MyManagedGroupsDocument,
  MyObligationsDocument,
  MyWebauthnCredentialsDocument,
  NotificationSettingsDocument,
  OrganizationsDocument,
  PdfDownloadLinkDocument,
  PendingTasksDocument,
  PlatformGroupsDocument,
  PoliciesDocument,
  PolicyAttachmentsDocument,
  PolicyByNumberDocument,
  PolicyDocument,
  PolicyVersionDocument,
  PolicyVersionsDocument,
  PolicyVersionSummaryDocument,
  PostCaseMessageDocument,
  PreviewAccountMergeDocument,
  PreviewUserDeletionDocument,
  PublishDraftDocument,
  PublishTemplateVersionDocument,
  ReassignUserPoliciesDocument,
  RecordAckDocument,
  RecordRiskAssessmentDocument,
  ReferencesDocument,
  RemoveFactorDocument,
  RemoveUserFromGroupDocument,
  RemoveUserMfaFactorDocument,
  RemoveWebauthnCredentialDocument,
  RenameCategoryDocument,
  RenameMfaMethodDocument,
  RenameTemplateDocument,
  RenameUserMfaFactorDocument,
  ReorderAppendicesDocument,
  ReportCaseDocument,
  ReportCasesDocument,
  RequestPdfExportDocument,
  RequestStepUpOtpDocument,
  ResendWelcomeEmailDocument,
  ResetUserPasswordDocument,
  ResolveUserLabelsDocument,
  RetirePolicyDocument,
  RetireTemplateDocument,
  RevokeMagicLinkDocument,
  RevokeMySessionsDocument,
  RevokeRoleDocument,
  RevokeUserSessionsDocument,
  SaveDraftDocument,
  SearchAndAnswerDocument,
  SearchUsersDocument,
  SetAiEnabledDocument,
  SetAiProviderCredentialDocument,
  SetAiRetrievalConfigDocument,
  SetCaseDiscoveryDateDocument,
  SetCaseStatusDocument,
  SetCategoryCadenceDocument,
  SetCategoryDefaultsDocument,
  SetCategoryGovernanceDocument,
  SetCategoryRulesetDocument,
  SetContactBlockArchivedDocument,
  SetDefinitionArchivedDocument,
  SetDigestWindowDocument,
  SetEmailServiceConfigDocument,
  SetGlobalSettingsDocument,
  SetNotificationChannelsDocument,
  SetPolicyOwnerDocument,
  SetReferenceArchivedDocument,
  SetTypeCadenceDocument,
  SetUserPolicyOverrideDocument,
  SignalWorkflowDocument,
  SimulateCategoryDocument,
  SpCertificateDocument,
  StartDomainVerificationDocument,
  StartImpersonationDocument,
  StopImpersonationDocument,
  SubmitDraftGenerationDocument,
  SubmitPolicyReviewDocument,
  SubmitPolicyRevisionDocument,
  SubmitWorkflowDocument,
  TemplatesDocument,
  TemplateVersionsDocument,
  TopPolicyQuestionsDocument,
  UpcomingApprovalsDocument,
  UpdateAppendixDocument,
  UpdateCaseNoticeDocument,
  UpdateContactBlockDocument,
  UpdateDefinitionDocument,
  UpdateIdPConnectionDocument,
  UpdateMyProfileDocument,
  UpdateReferenceDocument,
  UpdateTemplateVersionSectionsDocument,
  UpdateUserProfileDocument,
  UpdateWorkflowDefDocument,
  UserFactorsDocument,
  UsersDocument,
  VerifyAuditChainDocument,
  VerifyDomainDocument,
  WebauthnRegisterBeginDocument,
  WebauthnRegisterFinishDocument,
  WorkflowDefDocument,
  WorkflowDefsDocument,
  WorkflowStatusDocument,
} from "../generated/graphql";
import { DocumentType } from "../generated/schema";
import { semanticVersion } from "../semanticVersion";
import { awaitAiJobResult } from "./aiJobResult.server";
import {
  appendixText,
  bodyTextFromContent,
  categoryNames,
  type CategoryNode,
  documentBlocksFromContent,
  historyFromAuditLog,
  historyFromVersions,
  isNotFound,
  isPermissionDenied,
  isUnauthenticated,
  nextReviewOf,
  policyStatusOf,
  readableContent,
  toPolicyView,
} from "./assemble";
import { watchLiveEvents } from "./liveEvents.server";

const categoryChildren = async (
  parentId: null | string,
  cookie?: string,
): Promise<readonly CategoryFieldsFragment[]> => {
  const data = await gatewayFetch(CategoryChildrenDocument, { parentId }, "CategoryChildren", {
    cookie,
  });
  return data.categoryChildren;
};

/** Every category, parents before children, in one call. */
const categoryTree = async (cookie?: string): Promise<readonly CategoryFieldsFragment[]> => {
  const data = await gatewayFetch(CategoryTreeDocument, { rootId: null }, "CategoryTree", {
    cookie,
  });
  return data.categoryTree;
};

const categoryIndex = async (cookie?: string): Promise<Map<string, CategoryNode>> => {
  const all = await categoryTree(cookie);
  return new Map(all.map((c) => [c.id, c]));
};

/** One document type's policies across every root category, each listed once. */
const catalogPolicies = async (
  documentType: DocumentType,
  index: ReadonlyMap<string, CategoryNode>,
  cookie?: string,
): Promise<AuthoringPolicyFieldsFragment[]> => {
  const roots = [...index.values()].filter((c) => !c.parentId);
  const lists = await Promise.all(
    roots.map(async (root) => {
      const data = await gatewayFetch(
        PoliciesDocument,
        { categoryId: root.id, documentType },
        "Policies",
        { cookie },
      );
      return data.policies;
    }),
  );
  const byId = new Map(lists.flat().map((p) => [p.id, p]));
  return [...byId.values()];
};

const policyView = async (
  policy: AuthoringPolicyFieldsFragment,
  cookie?: string,
  index?: ReadonlyMap<string, CategoryNode>,
): Promise<Policy> => {
  const names = await (index ?? categoryIndex(cookie));
  return toPolicyView(policy, categoryNames(names, policy.homeCategoryId));
};

const catalog = async (
  documentType: DocumentType,
  index: ReadonlyMap<string, CategoryNode>,
  cookie?: string,
): Promise<Policy[]> => {
  const policies = await catalogPolicies(documentType, index, cookie);
  return Promise.all(policies.map((p) => policyView(p, cookie, index)));
};

const toMe = (user: {
  email: string;
  firstName: string;
  lastName: string;
  locale?: null | string;
  managedGroupIds: readonly string[];
  name: string;
  needsOnboarding?: boolean;
  permissions: readonly string[];
  roles: readonly string[];
  userId: string;
  username: string;
}): Me => ({
  email: user.email,
  firstName: user.firstName,
  id: user.userId,
  lastName: user.lastName,
  ...(user.locale === undefined || user.locale === null ? {} : { locale: user.locale }),
  managedGroupIds: user.managedGroupIds,
  name: user.name,
  needsOnboarding: user.needsOnboarding ?? false,
  permissions: user.permissions,
  roles: user.roles,
  username: user.username,
});

/**
 * The reader's detail, assembled from the gateway's separate reads: the current version's
 * content, the attachments, the version list and diff, and the caller's acknowledgement.
 */
const assembleDetail = async (
  policy: AuthoringPolicyFieldsFragment,
  index: ReadonlyMap<string, CategoryNode>,
  cookie?: string,
): Promise<PolicyDetail> => {
  const publishedId = policy.currentPublishedVersionId ?? null;
  const versionId = publishedId ?? policy.currentDraftVersionId ?? null;
  const acks = policy.documentType === DocumentType.Policy && publishedId !== null;
  const [version, attachments, versions, ack, auditPage, summary, ai] = await Promise.all([
    versionId
      ? gatewayFetch(PolicyVersionDocument, { id: versionId }, "PolicyVersion", { cookie }).then(
          (d) => d.policyVersion ?? null,
        )
      : null,
    gatewayFetch(PolicyAttachmentsDocument, { policyId: policy.id }, "PolicyAttachments", {
      cookie,
    }),
    gatewayFetch(PolicyVersionsDocument, { policyId: policy.id }, "PolicyVersions", {
      cookie,
    }).then((d) => d.policyVersions),
    acks && policy.viewerCan.ack
      ? gatewayFetch(AckStatusDocument, { policyVersionId: publishedId }, "AckStatus", {
          cookie,
        }).then((d) => d.ackStatus)
      : null,
    // The audit log is gated on audit.read (or managing a group); a plain reader is refused,
    // and reads the history off the published versions instead.
    gatewayFetch(AuditLogDocument, { subject: `policy:${policy.id}` }, "AuditLog", {
      cookie,
    }).catch((error: unknown) => {
      if (isPermissionDenied(error)) return null;
      throw error;
    }),
    // A missing or unreadable summary just leaves the AI summary toggle out.
    publishedId
      ? gatewayFetch(
          PolicyVersionSummaryDocument,
          { versionId: publishedId },
          "PolicyVersionSummary",
          { cookie },
        ).then(
          (d) => d.policyVersionSummary ?? null,
          () => null,
        )
      : null,
    // aiHealth answers a down service as unavailable rather than failing; a failed call reads
    // the same way, so the reader's AI pieces say so instead of breaking the page.
    gatewayFetch(AiHealthDocument, {}, "AiHealth", { cookie }).then(
      (d) => ({ available: d.aiHealth.available, reason: d.aiHealth.reason ?? null }),
      () => ({ available: false, reason: "ai_service_unavailable" }),
    ),
  ]);
  const history = auditPage
    ? historyFromAuditLog(
        auditPage.auditLog.records,
        version ? semanticVersion(version.versionNo) : "",
      )
    : historyFromVersions(versions);

  const at = publishedId ? versions.findIndex((v) => v.id === publishedId) : -1;
  const prior = at > 0 ? versions[at - 1] : undefined;
  let diff: readonly PolicySectionDiff[] = [];
  if (prior && publishedId) {
    const data = await gatewayFetch(
      DiffVersionsDocument,
      { fromVersionId: prior.id, toVersionId: publishedId },
      "DiffVersions",
      { cookie },
    );
    diff = data.diffVersions;
  }
  const names = categoryNames(index, policy.homeCategoryId);
  const draftId = policy.currentDraftVersionId ?? null;
  const draft =
    publishedId && draftId && draftId !== publishedId
      ? versions.find((v) => v.id === draftId)
      : undefined;
  const body = version ? documentBlocksFromContent(version.contentJson) : [];

  return {
    ai,
    ack: acks
      ? {
          ackedAt: ack?.ackedAt ?? null,
          acknowledged: ack?.acknowledged ?? false,
          required: policy.viewerCan.ack,
        }
      : null,
    appendices: (version?.appendices ?? []).map((a) => ({
      id: a.id,
      letter: a.letter,
      text: appendixText(a.contentJson),
      title: a.title,
    })),
    body,
    bodyText: version ? bodyTextFromContent(version.contentJson) : "",
    bodyUnreadable: version ? !readableContent(version.contentJson) : false,
    canBreakGlass: policy.viewerCan.canBreakGlass,
    canEdit: policy.viewerCan.edit,
    category: names.category,
    contacts: attachments.policyContactBlocks,
    contentObfuscated: policy.viewerCan.contentObfuscated,
    currentVersionId: publishedId,
    definitions: attachments.policyDefinitionEntries,
    documentType: policy.documentType,
    history,
    id: policy.id,
    nextReview: nextReviewOf(index, policy.homeCategoryId),
    number: policy.number,
    ownerName: policy.ownerName ?? null,
    priorVersion:
      prior && publishedId
        ? {
            diff,
            fromVersionId: prior.id,
            toVersionId: publishedId,
            version: semanticVersion(prior.versionNo),
          }
        : null,
    published: publishedId ? (version?.publishedAt ?? null) : null,
    references: attachments.policyReferences,
    related: attachments.relatedPolicies,
    revision: draft
      ? { status: policyStatusOf(false, draft.status), version: semanticVersion(draft.versionNo) }
      : null,
    sensitivity: policy.sensitivity,
    status: policyStatusOf(publishedId !== null, version?.status),
    subcategory: names.subcategory,
    summary: summary ? { generatedAt: summary.generatedAt, text: summary.summaryText } : null,
    title: policy.title,
    updated: policy.updatedAt,
    version: version ? semanticVersion(version.versionNo) : "",
    versions: versions.map((v) => ({
      id: v.id,
      status: v.status,
      version: semanticVersion(v.versionNo),
    })),
  };
};

/** The live edge: every call is a real POST to `GATEWAY_URL`, cookie forwarded. */
export const liveEdge: Edge = {
  async ackActivity(policyVersionId, groupId, days, cookie) {
    const data = await gatewayFetch(
      AckActivityDocument,
      { days, groupId, policyVersionId },
      "AckActivity",
      { cookie },
    );
    return data.ackActivity;
  },
  async acknowledgePolicy(policyVersionId, cookie) {
    const data = await gatewayFetch(RecordAckDocument, { policyVersionId }, "RecordAck", {
      cookie,
    });
    return { ackedAt: data.recordAck.ackedAt, acknowledged: true, required: true };
  },
  async ackRoster(policyVersionId, groupId, cookie) {
    const data = await gatewayFetch(AckRosterDocument, { groupId, policyVersionId }, "AckRoster", {
      cookie,
    });
    return data.ackRoster;
  },
  async activateOrganization(domain, cookie) {
    const data = await gatewayFetch(
      ActivateOrganizationDocument,
      { domain },
      "ActivateOrganization",
      { cookie },
    );
    return data.activateOrganization;
  },
  async addAppendix(policyVersionId, title, contentJson, cookie) {
    const data = await gatewayFetch(
      AddAppendixDocument,
      { contentJson, policyVersionId, title },
      "AddAppendix",
      { cookie },
    );
    return data.addAppendix;
  },
  async addCaseNote(caseId, body, cookie) {
    const data = await gatewayFetch(AddCaseNoteDocument, { body, caseId }, "AddCaseNote", {
      cookie,
    });
    return data.addCaseNote;
  },
  async addCaseNotice(caseId, recipient, label, method, cookie) {
    const data = await gatewayFetch(
      AddCaseNoticeDocument,
      { caseId, label, method, recipient },
      "AddCaseNotice",
      { cookie },
    );
    return data.addCaseNotice;
  },
  async addGroupMapping(connectionId, idpGroupClaimValue, targetGroupId, cookie) {
    const data = await gatewayFetch(
      AddGroupMappingDocument,
      { connectionId, idpGroupClaimValue, targetGroupId },
      "AddGroupMapping",
      { cookie },
    );
    return data.addGroupMapping;
  },
  async addOrganization(input, cookie) {
    const data = await gatewayFetch(AddOrganizationDocument, { input }, "AddOrganization", {
      cookie,
    });
    return data.addOrganization;
  },
  async addUserToGroup(userId, groupId, cookie) {
    const data = await gatewayFetch(AddUserToGroupDocument, { groupId, userId }, "AddUserToGroup", {
      cookie,
    });
    return data.addUserToGroup;
  },
  async aiConfig(cookie) {
    const data = await gatewayFetch(AiConfigDocument, {}, "AiConfig", { cookie });
    return { ...data.aiConfig, provider: data.aiConfig.provider ?? null };
  },
  async aiHealth(cookie) {
    const data = await gatewayFetch(AiHealthDocument, {}, "AiHealth", { cookie });
    return data.aiHealth;
  },
  async aiJob(jobId, cookie) {
    const data = await gatewayFetch(AiJobDocument, { jobId }, "AiJob", { cookie });
    return data.aiJob;
  },
  aiJobResult(jobId, cookie, signal) {
    return awaitAiJobResult(jobId, cookie, signal);
  },
  async aiJobResultContent(resultRef, cookie) {
    const data = await gatewayFetch(
      AiJobResultContentDocument,
      { resultRef },
      "AiJobResultContent",
      { cookie },
    );
    return data.aiJobResultContent;
  },
  async archiveWorkflowDef(id, cookie) {
    const data = await gatewayFetch(ArchiveWorkflowDefDocument, { id }, "ArchiveWorkflowDef", {
      cookie,
    });
    return data.archiveWorkflowDef;
  },
  async assignCase(caseId, assigneeUserId, cookie) {
    const data = await gatewayFetch(AssignCaseDocument, { assigneeUserId, caseId }, "AssignCase", {
      cookie,
    });
    return data.assignCase;
  },
  async auditLog(filters, cookie) {
    const data = await gatewayFetch(AuditLogDocument, { ...filters }, "AuditLog", { cookie });
    return data.auditLog;
  },
  async authorableGroups(cookie) {
    const [{ me: rawMe }, all] = await Promise.all([
      gatewayFetch(MeDocument, {}, "Me", { cookie }),
      categoryTree(cookie),
    ]);
    const authorable = new Set(rawMe.scopes.author);
    return all.filter((c) => authorable.has(c.name));
  },
  async authorableTemplates(ownerGroupId, cookie) {
    const data = await gatewayFetch(
      TemplatesDocument,
      { ownerCategoryId: ownerGroupId },
      "Templates",
      { cookie },
    );
    return data.templates;
  },
  async authoringAssist(input, cookie) {
    const data = await gatewayFetch(AuthoringAssistDocument, { input }, "AuthoringAssist", {
      cookie,
    });
    return data.authoringAssist;
  },
  async breakGlassReveal(policyId, reason, cookie) {
    const data = await gatewayFetch(
      BreakGlassRevealDocument,
      { policyId, reason },
      "BreakGlassReveal",
      { cookie },
    );
    return data.breakGlassReveal;
  },
  async categories(cookie) {
    const all = await categoryTree(cookie);
    const roots = all.filter((c) => !c.parentId);
    return roots.map((root) => ({
      id: root.id,
      name: root.name,
      slug: root.slug,
      subcategories: all.filter((c) => c.parentId === root.id).map((c) => c.name),
    }));
  },
  async categoryRuleset(categoryId, cookie) {
    const data = await gatewayFetch(CategoryRulesetDocument, { categoryId }, "CategoryRuleset", {
      cookie,
    });
    return data.categoryRuleset.rules;
  },
  async changeOrgProtocol(domain, protocol, config, secret, cookie) {
    const data = await gatewayFetch(
      ChangeOrgProtocolDocument,
      {
        clientSecret: secret?.clientSecret,
        config,
        domain,
        protocol,
        secretRef: secret?.secretRef,
      },
      "ChangeOrgProtocol",
      { cookie },
    );
    return data.changeOrgProtocol;
  },
  async closeCase(caseId, outcome, correctiveActions, closingMessage, cookie) {
    const data = await gatewayFetch(
      CloseCaseDocument,
      { caseId, closingMessage, correctiveActions, outcome },
      "CloseCase",
      { cookie },
    );
    return data.closeCase;
  },
  async completionReport(policyVersionId, groupId, cookie) {
    const data = await gatewayFetch(
      CompletionReportDocument,
      { groupId, policyVersionId },
      "CompletionReport",
      { cookie },
    );
    return data.completionReport;
  },
  async contactBlocks(includeArchived, cookie) {
    const data = await gatewayFetch(ContactBlocksDocument, { includeArchived }, "ContactBlocks", {
      cookie,
    });
    return data.contactBlocks;
  },
  async createContactBlock(block, cookie) {
    const data = await gatewayFetch(CreateContactBlockDocument, { block }, "CreateContactBlock", {
      cookie,
    });
    return data.createContactBlock;
  },
  async createDefinition(input, cookie) {
    const data = await gatewayFetch(CreateDefinitionDocument, { input }, "CreateDefinition", {
      cookie,
    });
    return data.createDefinition;
  },
  async createGroup(input, cookie) {
    const data = await gatewayFetch(CreateCategoryDocument, input, "CreateCategory", { cookie });
    return data.createCategory;
  },
  async createMagicLink(policyVersionId, sensitive, cookie) {
    const data = await gatewayFetch(
      CreateMagicLinkDocument,
      { policyVersionId, sensitive },
      "CreateMagicLink",
      { cookie },
    );
    return data.createMagicLink;
  },
  async createPlatformGroup(name, parentId, cookie) {
    const data = await gatewayFetch(
      CreatePlatformGroupDocument,
      { name, parentId },
      "CreatePlatformGroup",
      { cookie },
    );
    return data.createPlatformGroup;
  },
  async createPolicy(input, cookie) {
    const data = await gatewayFetch(
      CreatePolicyDocument,
      {
        documentType: input.documentType,
        homeCategoryId: input.homeGroupId,
        sensitivity: input.sensitivity,
        templateId: input.templateId,
        title: input.title,
      },
      "CreatePolicy",
      { cookie },
    );
    return policyView(data.createPolicy, cookie);
  },
  async createReference(input, cookie) {
    const data = await gatewayFetch(CreateReferenceDocument, { input }, "CreateReference", {
      cookie,
    });
    return data.createReference;
  },
  async createTemplate(name, ownerCategoryId, cookie) {
    const data = await gatewayFetch(
      CreateTemplateDocument,
      { name, ownerCategoryId },
      "CreateTemplate",
      { cookie },
    );
    return data.createTemplate;
  },
  async createTemplateVersion(templateId, sections, cookie) {
    const data = await gatewayFetch(
      CreateTemplateVersionDocument,
      { sections, templateId },
      "CreateTemplateVersion",
      { cookie },
    );
    return data.createTemplateVersion;
  },
  async createWorkflowDef(name, description, stages, cookie) {
    const data = await gatewayFetch(
      CreateWorkflowDefDocument,
      { description, name, stages },
      "CreateWorkflowDef",
      { cookie },
    );
    return data.createWorkflowDef;
  },
  async definitions(categoryId, includeArchived, cookie) {
    const data = await gatewayFetch(
      DefinitionsDocument,
      { categoryId, includeArchived },
      "Definitions",
      { cookie },
    );
    return data.definitions;
  },
  async deleteAppendix(id, cookie) {
    const data = await gatewayFetch(DeleteAppendixDocument, { id }, "DeleteAppendix", { cookie });
    return data.deleteAppendix;
  },
  async deleteDefinition(id, cookie) {
    const data = await gatewayFetch(DeleteDefinitionDocument, { id }, "DeleteDefinition", {
      cookie,
    });
    return data.deleteDefinition;
  },
  async deleteGroup(id, cookie) {
    const data = await gatewayFetch(DeleteCategoryDocument, { id }, "DeleteCategory", { cookie });
    return data.deleteCategory;
  },
  async deleteGroupMapping(mappingId, cookie) {
    const data = await gatewayFetch(
      DeleteGroupMappingDocument,
      { mappingId },
      "DeleteGroupMapping",
      { cookie },
    );
    return data.deleteGroupMapping;
  },
  async deleteOrganization(domain, cookie) {
    const data = await gatewayFetch(DeleteOrganizationDocument, { domain }, "DeleteOrganization", {
      cookie,
    });
    return data.deleteOrganization;
  },
  async deletePolicy(id, cookie) {
    const data = await gatewayFetch(DeletePolicyDocument, { id }, "DeletePolicy", { cookie });
    return data.deletePolicy;
  },
  async deleteReference(id, cookie) {
    const data = await gatewayFetch(DeleteReferenceDocument, { id }, "DeleteReference", {
      cookie,
    });
    return data.deleteReference;
  },
  async deleteTemplate(id, cookie) {
    const data = await gatewayFetch(DeleteTemplateDocument, { id }, "DeleteTemplate", { cookie });
    return data.deleteTemplate;
  },
  async deleteUser(userId, cookie) {
    const data = await gatewayFetch(DeleteUserDocument, { userId }, "DeleteUser", { cookie });
    return data.deleteUser;
  },
  async diagnostics(cookie) {
    const data = await gatewayFetch(DiagnosticsDocument, {}, "Diagnostics", { cookie });
    return data.diagnostics;
  },
  async disableOrganization(domain, cookie) {
    const data = await gatewayFetch(
      DisableOrganizationDocument,
      { domain },
      "DisableOrganization",
      { cookie },
    );
    return data.disableOrganization;
  },
  async disableUser(userId, cookie) {
    const data = await gatewayFetch(DisableUserDocument, { userId }, "DisableUser", { cookie });
    return data.disableUser;
  },
  async discardDraft(policyId, cookie) {
    const data = await gatewayFetch(DiscardDraftDocument, { policyId }, "DiscardDraft", {
      cookie,
    });
    return data.discardDraft;
  },
  async discardTemplateVersion(id, cookie) {
    const data = await gatewayFetch(
      DiscardTemplateVersionDocument,
      { id },
      "DiscardTemplateVersion",
      { cookie },
    );
    return data.discardTemplateVersion;
  },
  async draftVersion(policyId, cookie) {
    const { policy } = await gatewayFetch(PolicyDocument, { id: policyId }, "Policy", { cookie });
    if (!policy?.currentDraftVersionId) return null;
    const data = await gatewayFetch(
      PolicyVersionDocument,
      { id: policy.currentDraftVersionId },
      "PolicyVersion",
      { cookie },
    );
    return data.policyVersion ?? null;
  },

  async emailServiceConfig(cookie) {
    const data = await gatewayFetch(EmailServiceConfigDocument, {}, "EmailServiceConfig", {
      cookie,
    });
    return data.emailServiceConfig;
  },
  async enableUser(userId, cookie) {
    const data = await gatewayFetch(EnableUserDocument, { userId }, "EnableUser", { cookie });
    return data.enableUser;
  },
  async exportAcks(policyVersionId, format, cookie) {
    const data = await gatewayFetch(ExportAcksDocument, { format, policyVersionId }, "ExportAcks", {
      cookie,
    });
    return data.exportAcks;
  },
  extractDocument(file, cookie) {
    return gatewayRestUpload<{ content: string; title: string }>(
      "/documents/extract",
      file,
      "ExtractDocument",
      { cookie },
    );
  },
  async fetchIdpCert(url, cookie) {
    const body = await gatewayRestFetch<{ certificatePem: string }>(
      "/admin/idp/fetch-cert",
      { url },
      "FetchIdpCert",
      { cookie },
    );
    return body.certificatePem;
  },
  async forceRotateSpCertificate(cookie) {
    const data = await gatewayFetch(
      ForceRotateSpCertificateDocument,
      {},
      "ForceRotateSpCertificate",
      { cookie },
    );
    return data.forceRotateSpCertificate;
  },
  async globalSettings(cookie) {
    const data = await gatewayFetch(GlobalSettingsDocument, {}, "GlobalSettings", { cookie });
    return data.globalSettings;
  },
  async grantRole(userId, role, cookie) {
    const data = await gatewayFetch(GrantRoleDocument, { role, userId }, "GrantRole", { cookie });
    return data.grantRole;
  },
  async grantRoot(userId, otp, cookie) {
    const data = await gatewayFetch(GrantRootDocument, { otp, userId }, "GrantRoot", { cookie });
    return data.grantRoot;
  },
  async groupChildren(parentId, cookie) {
    return categoryChildren(parentId, cookie);
  },
  async groupMappings(connectionId, cookie) {
    const data = await gatewayFetch(GroupMappingsDocument, { connectionId }, "GroupMappings", {
      cookie,
    });
    return data.groupMappings;
  },
  async impersonationStatus(cookie) {
    const data = await gatewayFetch(ImpersonationStatusDocument, {}, "ImpersonationStatus", {
      cookie,
    });
    return data.impersonationStatus ?? null;
  },
  async importIdpMetadata(url, cookie) {
    return gatewayRestFetch("/admin/idp/import-metadata", { url }, "ImportIdpMetadata", { cookie });
  },
  async issueCollabToken(input, cookie) {
    const data = await gatewayFetch(
      IssueCollabTokenDocument,
      {
        draftId: input.draftId,
        policyId: input.policyId,
        templateVersionId: input.templateVersionId,
      },
      "IssueCollabToken",
      { cookie },
    );
    return data.issueCollabToken;
  },
  async latestTemplateVersion(templateId, cookie) {
    const data = await gatewayFetch(
      LatestTemplateVersionDocument,
      { templateId },
      "LatestTemplateVersion",
      { cookie },
    );
    return data.latestTemplateVersion ?? null;
  },
  async listUserSessions(userId, cookie) {
    const data = await gatewayFetch(ListUserSessionsDocument, { userId }, "ListUserSessions", {
      cookie,
    });
    return data.listUserSessions;
  },
  liveEvents(topics, cookie, onEvent, signal) {
    return watchLiveEvents(topics, cookie, onEvent, signal);
  },
  async managedGroupMembers(groupId, cookie) {
    const data = await gatewayFetch(
      ManagedGroupMembersDocument,
      { groupId },
      "ManagedGroupMembers",
      { cookie },
    );
    return data.managedGroupMembers;
  },
  async completeOnboarding(input, cookie) {
    const data = await gatewayFetch(
      CompleteOnboardingDocument,
      { acceptTerms: true, ...input },
      "CompleteOnboarding",
      { cookie },
    );
    return toMe(data.completeOnboarding);
  },
  async me(cookie) {
    try {
      const { me } = await gatewayFetch(MeDocument, {}, "Me", { cookie });
      return toMe(me);
    } catch (error) {
      if (isUnauthenticated(error)) return null;
      throw error;
    }
  },
  async mergeAccounts(sourceUserId, targetUserId, confirmPrivileged, idempotencyKey, cookie) {
    const data = await gatewayFetch(
      MergeAccountsDocument,
      {
        confirmPrivileged: confirmPrivileged ?? null,
        idempotencyKey: idempotencyKey ?? null,
        sourceUserId,
        targetUserId,
      },
      "MergeAccounts",
      { cookie },
    );
    return data.mergeAccounts;
  },
  async mintSsoTestLink(input, cookie) {
    return gatewayRestFetch(
      "/admin/sso/test-link",
      {
        alias: input.alias,
        connectionId: input.connectionId,
        returnPath: input.returnPath ?? "",
        tenant: input.tenant ?? "",
      },
      "MintSsoTestLink",
      { cookie },
    );
  },
  async moveGroup(groupId, newParentId, cookie) {
    const data = await gatewayFetch(
      MoveCategoryDocument,
      { categoryId: groupId, newParentId },
      "MoveCategory",
      { cookie },
    );
    return data.moveCategory;
  },
  async movePolicy(policyId, homeCategoryId, cookie) {
    const data = await gatewayFetch(
      MovePolicyDocument,
      { homeCategoryId, policyId },
      "MovePolicy",
      { cookie },
    );
    return data.movePolicy;
  },
  async myAckSummary(cookie) {
    const { myAckSummary } = await gatewayFetch(MyAckSummaryDocument, {}, "MyAckSummary", {
      cookie,
    });
    return { done: myAckSummary.done, required: myAckSummary.required };
  },
  async myDraftPolicies(cookie) {
    const [{ myDrafts }, index] = await Promise.all([
      gatewayFetch(MyDraftsDocument, {}, "MyDrafts", { cookie }),
      categoryIndex(cookie),
    ]);
    return Promise.all(myDrafts.map((p) => policyView(p, cookie, index)));
  },
  async myObligations(cookie) {
    const { myObligations } = await gatewayFetch(MyObligationsDocument, {}, "MyObligations", {
      cookie,
    });
    return myObligations.map(({ number, policyId, policyVersionId, title, version }) => ({
      number,
      policyId,
      policyVersionId,
      title,
      version,
    }));
  },
  async beginMyPasskeyRegistration(cookie) {
    const data = await gatewayFetch(WebauthnRegisterBeginDocument, {}, "WebauthnRegisterBegin", {
      cookie,
    });
    return data.webauthnRegisterBegin;
  },
  async beginMyTotpEnrolment(cookie) {
    const data = await gatewayFetch(EnrollTotpBeginDocument, {}, "EnrollTotpBegin", { cookie });
    return data.enrollTotpBegin;
  },
  async confirmMyTotpEnrolment(code, cookie) {
    const data = await gatewayFetch(EnrollTotpConfirmDocument, { code }, "EnrollTotpConfirm", {
      cookie,
    });
    return data.enrollTotpConfirm;
  },
  async finishMyPasskeyRegistration(sessionId, credentialJson, label, cookie) {
    const data = await gatewayFetch(
      WebauthnRegisterFinishDocument,
      { credentialJson, label: label ?? null, sessionId },
      "WebauthnRegisterFinish",
      { cookie },
    );
    return data.webauthnRegisterFinish;
  },
  async myPasskeys(cookie) {
    const data = await gatewayFetch(MyWebauthnCredentialsDocument, {}, "MyWebauthnCredentials", {
      cookie,
    });
    return data.myWebauthnCredentials;
  },
  async notificationPreferences(cookie) {
    const data = await gatewayFetch(NotificationSettingsDocument, {}, "NotificationSettings", {
      cookie,
    });
    return { catalog: data.notificationTypeCatalog, settings: data.notificationSettings };
  },
  async removeMyFactor(kind, cookie) {
    const data = await gatewayFetch(RemoveFactorDocument, { kind }, "RemoveFactor", { cookie });
    return data.removeFactor;
  },
  async removeMyPasskey(credentialId, cookie) {
    const data = await gatewayFetch(
      RemoveWebauthnCredentialDocument,
      { credentialId },
      "RemoveWebauthnCredential",
      { cookie },
    );
    return data.removeWebauthnCredential;
  },
  async renameMyMethod(methodId, label, cookie) {
    const data = await gatewayFetch(
      RenameMfaMethodDocument,
      { label, methodId },
      "RenameMfaMethod",
      { cookie },
    );
    return data.renameMfaMethod;
  },
  async revokeMySessions(cookie) {
    const data = await gatewayFetch(RevokeMySessionsDocument, {}, "RevokeMySessions", { cookie });
    return data.revokeMySessions;
  },
  async setCategoryCadence(category, cadence, cookie) {
    const data = await gatewayFetch(
      SetCategoryCadenceDocument,
      { cadence, category },
      "SetCategoryCadence",
      { cookie },
    );
    return data.setCategoryCadence;
  },
  async setDigestWindow(dailyHour, weeklyDow, cookie) {
    const data = await gatewayFetch(
      SetDigestWindowDocument,
      { dailyHour, weeklyDow },
      "SetDigestWindow",
      { cookie },
    );
    return data.setDigestWindow;
  },
  async setNotificationChannels(input, cookie) {
    const data = await gatewayFetch(
      SetNotificationChannelsDocument,
      { input },
      "SetNotificationChannels",
      { cookie },
    );
    return data.setNotificationChannels;
  },
  async setTypeCadence(kind, cadence, cookie) {
    const data = await gatewayFetch(SetTypeCadenceDocument, { cadence, kind }, "SetTypeCadence", {
      cookie,
    });
    return data.setTypeCadence;
  },
  async myFactors(cookie) {
    const data = await gatewayFetch(MyFactorsDocument, {}, "MyFactors", { cookie });
    return data.myFactors;
  },
  async myManagedGroups(cookie) {
    const data = await gatewayFetch(MyManagedGroupsDocument, {}, "MyManagedGroups", { cookie });
    return data.myManagedGroups;
  },
  async organizations(cookie) {
    const data = await gatewayFetch(OrganizationsDocument, {}, "Organizations", { cookie });
    return data.organizations;
  },
  async parseIdpMetadata(metadata, cookie) {
    return gatewayRestFetch("/admin/idp/parse-metadata", { metadata }, "ParseIdpMetadata", {
      cookie,
    });
  },
  async pdfDownloadLink(jobId, cookie) {
    const data = await gatewayFetch(PdfDownloadLinkDocument, { jobId }, "PdfDownloadLink", {
      cookie,
    });
    return data.pdfDownloadLink;
  },
  async pendingTasks(cookie) {
    const data = await gatewayFetch(PendingTasksDocument, {}, "PendingTasks", { cookie });
    return data.pendingTasks;
  },
  async platformGroups(parentId, cookie) {
    const data = await gatewayFetch(PlatformGroupsDocument, { parentId }, "PlatformGroups", {
      cookie,
    });
    return data.platformGroups;
  },
  async policies(documentType, cookie) {
    return catalog(documentType, await categoryIndex(cookie), cookie);
  },
  async policy(id, cookie) {
    const data = await gatewayFetch(PolicyDocument, { id }, "Policy", { cookie });
    return data.policy ? policyView(data.policy, cookie) : null;
  },
  async policyDetail(documentType, number, cookie) {
    // The gateway refuses a number the caller may not read with NotFound, the same as one
    // that doesn't exist; both answer null so the reader can't tell the two apart.
    const [index, found] = await Promise.all([
      categoryIndex(cookie),
      gatewayFetch(PolicyByNumberDocument, { number }, "PolicyByNumber", { cookie }).then(
        (data) => data.policyByNumber,
        (error: unknown) => {
          if (isNotFound(error)) return null;
          throw error;
        },
      ),
    ]);
    return found && found.documentType === documentType
      ? assembleDetail(found, index, cookie)
      : null;
  },
  async requestPdfExport(policyVersionId, cookie) {
    const data = await gatewayFetch(
      RequestPdfExportDocument,
      { policyVersionId },
      "RequestPdfExport",
      { cookie },
    );
    return data.requestPDFExport;
  },
  async retirePolicy(id, cookie) {
    const data = await gatewayFetch(RetirePolicyDocument, { id }, "RetirePolicy", { cookie });
    return data.retirePolicy;
  },
  async revokeMagicLink(token, cookie) {
    const data = await gatewayFetch(RevokeMagicLinkDocument, { token }, "RevokeMagicLink", {
      cookie,
    });
    return data.revokeMagicLink;
  },
  async setAiEnabled(enabled, cookie) {
    const data = await gatewayFetch(SetAiEnabledDocument, { enabled }, "SetAiEnabled", { cookie });
    return data.setAIEnabled;
  },
  async setAiProviderCredential(credential, cookie) {
    const data = await gatewayFetch(
      SetAiProviderCredentialDocument,
      { credential },
      "SetAiProviderCredential",
      { cookie },
    );
    return data.setAIProviderCredential;
  },
  async setAiRetrievalConfig(topK, cookie) {
    const data = await gatewayFetch(
      SetAiRetrievalConfigDocument,
      { topK },
      "SetAiRetrievalConfig",
      { cookie },
    );
    return data.setAIRetrievalConfig.topK;
  },
  async setPolicyOwner(policyId, ownerUserId, cookie) {
    const data = await gatewayFetch(
      SetPolicyOwnerDocument,
      { ownerUserId, policyId },
      "SetPolicyOwner",
      { cookie },
    );
    return data.setPolicyOwner;
  },
  async versionDocument(versionId, cookie) {
    const { policyVersion } = await gatewayFetch(
      PolicyVersionDocument,
      { id: versionId },
      "PolicyVersion",
      { cookie },
    );
    if (!policyVersion) return null;
    return {
      appendices: policyVersion.appendices.map((a) => ({
        id: a.id,
        letter: a.letter,
        text: appendixText(a.contentJson),
        title: a.title,
      })),
      blocks: documentBlocksFromContent(policyVersion.contentJson),
      version: semanticVersion(policyVersion.versionNo),
    };
  },
  async versionDiff(fromVersionId, toVersionId, cookie) {
    const data = await gatewayFetch(
      DiffVersionsDocument,
      { fromVersionId, toVersionId },
      "DiffVersions",
      { cookie },
    );
    return data.diffVersions;
  },
  async postCaseMessage(caseId, body, cookie) {
    const data = await gatewayFetch(PostCaseMessageDocument, { body, caseId }, "PostCaseMessage", {
      cookie,
    });
    return data.postCaseMessage;
  },
  async previewAccountMerge(sourceUserId, targetUserId, cookie) {
    const data = await gatewayFetch(
      PreviewAccountMergeDocument,
      { sourceUserId, targetUserId },
      "PreviewAccountMerge",
      { cookie },
    );
    return data.previewAccountMerge;
  },
  async previewUserDeletion(userId, cookie) {
    const data = await gatewayFetch(
      PreviewUserDeletionDocument,
      { userId },
      "PreviewUserDeletion",
      { cookie },
    );
    return data.previewUserDeletion;
  },
  async publishDraft(policyId, cookie) {
    const data = await gatewayFetch(PublishDraftDocument, { policyId }, "PublishDraft", {
      cookie,
    });
    return data.publishDraft;
  },
  async publishTemplateVersion(id, cookie) {
    const data = await gatewayFetch(
      PublishTemplateVersionDocument,
      { id },
      "PublishTemplateVersion",
      { cookie },
    );
    return data.publishTemplateVersion;
  },
  async reassignUserPolicies(fromUserId, toUserId, cookie) {
    const data = await gatewayFetch(
      ReassignUserPoliciesDocument,
      { fromUserId, toUserId },
      "ReassignUserPolicies",
      { cookie },
    );
    return data.reassignUserPolicies;
  },
  async recordRiskAssessment(caseId, factors, decision, reason, cookie) {
    const data = await gatewayFetch(
      RecordRiskAssessmentDocument,
      { caseId, decision, factors, reason },
      "RecordRiskAssessment",
      { cookie },
    );
    return data.recordRiskAssessment;
  },
  async references(includeArchived, cookie) {
    const data = await gatewayFetch(ReferencesDocument, { includeArchived }, "References", {
      cookie,
    });
    return data.references;
  },
  async removeUserFromGroup(userId, groupId, cookie) {
    const data = await gatewayFetch(
      RemoveUserFromGroupDocument,
      { groupId, userId },
      "RemoveUserFromGroup",
      { cookie },
    );
    return data.removeUserFromGroup;
  },
  async removeUserMfaFactor(userId, methodId, cookie) {
    const data = await gatewayFetch(
      RemoveUserMfaFactorDocument,
      { methodId, userId },
      "RemoveUserMfaFactor",
      { cookie },
    );
    return data.removeUserMfaFactor;
  },
  async renameGroup(id, name, slug, cookie) {
    const data = await gatewayFetch(RenameCategoryDocument, { id, name, slug }, "RenameCategory", {
      cookie,
    });
    return data.renameCategory;
  },
  async renameTemplate(id, name, cookie) {
    const data = await gatewayFetch(RenameTemplateDocument, { id, name }, "RenameTemplate", {
      cookie,
    });
    return data.renameTemplate;
  },
  async renameUserMfaFactor(userId, methodId, label, cookie) {
    const data = await gatewayFetch(
      RenameUserMfaFactorDocument,
      { label, methodId, userId },
      "RenameUserMfaFactor",
      { cookie },
    );
    return data.renameUserMfaFactor;
  },
  async reorderAppendices(policyVersionId, orderedIds, cookie) {
    const data = await gatewayFetch(
      ReorderAppendicesDocument,
      { orderedIds, policyVersionId },
      "ReorderAppendices",
      { cookie },
    );
    return data.reorderAppendices;
  },
  async reportCase(caseId, cookie) {
    const data = await gatewayFetch(ReportCaseDocument, { caseId }, "ReportCase", { cookie });
    return data.reportCase;
  },
  async reportCases(statuses, assigneeUserId, cookie) {
    const data = await gatewayFetch(
      ReportCasesDocument,
      { assigneeUserId, statuses },
      "ReportCases",
      { cookie },
    );
    return data.reportCases;
  },
  async requestStepUpOtp(cookie) {
    const data = await gatewayFetch(RequestStepUpOtpDocument, {}, "RequestStepUpOtp", { cookie });
    return data.requestStepUpOtp;
  },
  async resendWelcomeEmail(userId, cookie) {
    const data = await gatewayFetch(ResendWelcomeEmailDocument, { userId }, "ResendWelcomeEmail", {
      cookie,
    });
    return data.resendWelcomeEmail;
  },
  async resetUserPassword(userId, newPassword, cookie) {
    const data = await gatewayFetch(
      ResetUserPasswordDocument,
      { newPassword, userId },
      "ResetUserPassword",
      { cookie },
    );
    return data.resetUserPassword;
  },
  async resolveUserLabels(ids, cookie) {
    if (ids.length === 0) return [];
    const data = await gatewayFetch(
      ResolveUserLabelsDocument,
      { ids: [...ids] },
      "ResolveUserLabels",
      { cookie },
    );
    return data.resolveUserLabels;
  },
  async retireTemplate(id, cookie) {
    const data = await gatewayFetch(RetireTemplateDocument, { id }, "RetireTemplate", { cookie });
    return data.retireTemplate;
  },
  async revokeRole(userId, role, cookie) {
    const data = await gatewayFetch(RevokeRoleDocument, { role, userId }, "RevokeRole", {
      cookie,
    });
    return data.revokeRole;
  },
  async revokeUserSessions(userId, reason, cookie) {
    const data = await gatewayFetch(
      RevokeUserSessionsDocument,
      { reason, userId },
      "RevokeUserSessions",
      { cookie },
    );
    return data.revokeUserSessions;
  },
  async startDraft(policyId, cookie) {
    const { policy } = await gatewayFetch(PolicyDocument, { id: policyId }, "Policy", { cookie });
    if (!policy) return null;
    const sourceId = policy.currentDraftVersionId ?? policy.currentPublishedVersionId;
    if (!sourceId) return null;
    const { policyVersion } = await gatewayFetch(
      PolicyVersionDocument,
      { id: sourceId },
      "PolicyVersion",
      { cookie },
    );
    if (!policyVersion) return null;
    if (policy.currentDraftVersionId) return policyVersion;
    const saved = await gatewayFetch(
      SaveDraftDocument,
      {
        contentJson: policyVersion.contentJson,
        policyId,
        templateVersionId: policyVersion.templateVersionId || null,
      },
      "SaveDraft",
      { cookie },
    );
    return saved.saveDraft;
  },
  async saveDraft(policyId, contentJson, templateVersionId, cookie) {
    const data = await gatewayFetch(
      SaveDraftDocument,
      { contentJson, policyId, templateVersionId },
      "SaveDraft",
      { cookie },
    );
    return data.saveDraft;
  },
  async searchAndAnswer(question, cookie) {
    const data = await gatewayFetch(
      SearchAndAnswerDocument,
      { categoryId: null, question },
      "SearchAndAnswer",
      { cookie },
    );
    return data.searchAndAnswer;
  },
  async searchUsers(query, limit, cookie) {
    const data = await gatewayFetch(
      SearchUsersDocument,
      { limit: limit ?? null, query },
      "SearchUsers",
      { cookie },
    );
    return data.searchUsers;
  },
  async setCaseDiscoveryDate(caseId, discoveredOn, cookie) {
    const data = await gatewayFetch(
      SetCaseDiscoveryDateDocument,
      { caseId, discoveredOn },
      "SetCaseDiscoveryDate",
      { cookie },
    );
    return data.setCaseDiscoveryDate;
  },
  async setCaseStatus(caseId, status, cookie) {
    const data = await gatewayFetch(SetCaseStatusDocument, { caseId, status }, "SetCaseStatus", {
      cookie,
    });
    return data.setCaseStatus;
  },
  async setCategoryRuleset(categoryId, rules, cookie) {
    const data = await gatewayFetch(
      SetCategoryRulesetDocument,
      { categoryId, rules: [...rules] },
      "SetCategoryRuleset",
      { cookie },
    );
    return data.setCategoryRuleset.rules;
  },
  async setContactBlockArchived(id, archived, cookie) {
    const data = await gatewayFetch(
      SetContactBlockArchivedDocument,
      { archived, id },
      "SetContactBlockArchived",
      { cookie },
    );
    return data.setContactBlockArchived;
  },
  async setDefinitionArchived(id, archived, cookie) {
    const data = await gatewayFetch(
      SetDefinitionArchivedDocument,
      { archived, id },
      "SetDefinitionArchived",
      { cookie },
    );
    return data.setDefinitionArchived;
  },
  async setEmailServiceConfig(input, cookie) {
    const data = await gatewayFetch(
      SetEmailServiceConfigDocument,
      { input },
      "SetEmailServiceConfig",
      { cookie },
    );
    return data.setEmailServiceConfig;
  },
  async setGlobalSettings(input, cookie) {
    const data = await gatewayFetch(SetGlobalSettingsDocument, { input }, "SetGlobalSettings", {
      cookie,
    });
    return data.setGlobalSettings;
  },
  async setReferenceArchived(id, archived, cookie) {
    const data = await gatewayFetch(
      SetReferenceArchivedDocument,
      { archived, id },
      "SetReferenceArchived",
      { cookie },
    );
    return data.setReferenceArchived;
  },
  async setUserPolicyOverride(userId, policyNumber, effect, cookie) {
    const data = await gatewayFetch(
      SetUserPolicyOverrideDocument,
      { effect, policyNumber, userId },
      "SetUserPolicyOverride",
      { cookie },
    );
    return data.setUserPolicyOverride;
  },
  async signalWorkflow(policyVersionId, runId, taskId, signal, comment, cookie) {
    const data = await gatewayFetch(
      SignalWorkflowDocument,
      { comment, policyVersionId, runId, signal, taskId },
      "SignalWorkflow",
      { cookie },
    );
    return data.signalWorkflow;
  },
  async simulateCategory(categoryId, userId, draftRules, cookie) {
    const data = await gatewayFetch(
      SimulateCategoryDocument,
      { categoryId, draftRules: draftRules ? [...draftRules] : null, userId },
      "SimulateCategory",
      { cookie },
    );
    return data.simulateCategory;
  },
  async spCertificate(cookie) {
    const data = await gatewayFetch(SpCertificateDocument, {}, "SpCertificate", { cookie });
    return data.spCertificate;
  },
  async startDomainVerification(domain, rotate, cookie) {
    const data = await gatewayFetch(
      StartDomainVerificationDocument,
      { domain, rotate },
      "StartDomainVerification",
      { cookie },
    );
    return data.startDomainVerification;
  },
  async startImpersonation(userId, reason, cookie) {
    const data = await gatewayFetch(
      StartImpersonationDocument,
      { reason, userId },
      "StartImpersonation",
      { cookie },
    );
    return data.startImpersonation;
  },
  async stopImpersonation(cookie) {
    const data = await gatewayFetch(StopImpersonationDocument, {}, "StopImpersonation", {
      cookie,
    });
    return data.stopImpersonation;
  },
  async submitDraftGeneration(input, cookie) {
    const data = await gatewayFetch(
      SubmitDraftGenerationDocument,
      {
        input: {
          brief: input.brief,
          categoryId: input.homeGroupId,
          ...(input.referenceDocuments?.length
            ? { referenceDocuments: input.referenceDocuments }
            : {}),
          ...(input.referenceHints?.length ? { referenceHints: input.referenceHints } : {}),
          sections: input.sections,
          title: input.title,
        },
      },
      "SubmitDraftGeneration",
      { cookie },
    );
    return data.submitDraftGeneration;
  },
  async submitPolicyReview(input, cookie) {
    const data = await gatewayFetch(SubmitPolicyReviewDocument, { input }, "SubmitPolicyReview", {
      cookie,
    });
    return data.submitPolicyReview;
  },
  async submitPolicyRevision(input, cookie) {
    const data = await gatewayFetch(
      SubmitPolicyRevisionDocument,
      { input },
      "SubmitPolicyRevision",
      { cookie },
    );
    return data.submitPolicyRevision;
  },
  async submitWorkflow(policyVersionId, policyId, categoryId, cookie) {
    // ancestorCategoryIds stays empty: the gateway rebuilds the lineage from categoryId and
    // falls back to the client's list only when it finds none.
    const data = await gatewayFetch(
      SubmitWorkflowDocument,
      { ancestorCategoryIds: [], categoryId, policyId, policyVersionId },
      "SubmitWorkflow",
      { cookie },
    );
    return { runId: data.submitWorkflow.runId };
  },
  async templates(cookie) {
    const data = await gatewayFetch(TemplatesDocument, {}, "Templates", { cookie });
    return data.templates;
  },
  async templateVersions(templateId, cookie) {
    const data = await gatewayFetch(TemplateVersionsDocument, { templateId }, "TemplateVersions", {
      cookie,
    });
    return data.templateVersions;
  },
  async topPolicyQuestions(limit, cookie) {
    const data = await gatewayFetch(
      TopPolicyQuestionsDocument,
      { limit: limit ?? null },
      "TopPolicyQuestions",
      { cookie },
    );
    return data.topPolicyQuestions;
  },
  async upcomingApprovals(cookie) {
    const data = await gatewayFetch(UpcomingApprovalsDocument, {}, "UpcomingApprovals", {
      cookie,
    });
    return data.upcomingApprovals;
  },
  async updateAppendix(id, title, contentJson, cookie) {
    const data = await gatewayFetch(
      UpdateAppendixDocument,
      { contentJson, id, title },
      "UpdateAppendix",
      { cookie },
    );
    return data.updateAppendix;
  },
  async updateCaseNotice(caseId, noticeId, status, sentOn, cookie) {
    const data = await gatewayFetch(
      UpdateCaseNoticeDocument,
      { caseId, noticeId, sentOn, status },
      "UpdateCaseNotice",
      { cookie },
    );
    return data.updateCaseNotice;
  },
  async updateContactBlock(id, block, cookie) {
    const data = await gatewayFetch(
      UpdateContactBlockDocument,
      { block, id },
      "UpdateContactBlock",
      { cookie },
    );
    return data.updateContactBlock;
  },
  async updateDefinition(id, input, cookie) {
    const data = await gatewayFetch(UpdateDefinitionDocument, { id, input }, "UpdateDefinition", {
      cookie,
    });
    return data.updateDefinition;
  },
  async updateGroupSettings(input, cookie) {
    const { category } = await gatewayFetch(CategoryDocument, { id: input.id }, "Category", {
      cookie,
    });
    if (!category) {
      throw new GatewayError("UpdateGroupSettings", "category not found", { code: "NOT_FOUND" });
    }
    let current = category;
    if (
      input.defaultTemplateId !== undefined ||
      input.defaultTemplateNone !== undefined ||
      input.defaultWorkflowId !== undefined
    ) {
      const data = await gatewayFetch(
        SetCategoryDefaultsDocument,
        {
          defaultTemplateId:
            input.defaultTemplateId === undefined
              ? current.defaultTemplateId
              : input.defaultTemplateId,
          defaultTemplateNone: input.defaultTemplateNone ?? current.defaultTemplateNone,
          defaultWorkflowId:
            input.defaultWorkflowId === undefined
              ? current.defaultWorkflowId
              : input.defaultWorkflowId,
          id: input.id,
        },
        "SetCategoryDefaults",
        { cookie },
      );
      current = data.setCategoryDefaults;
    }
    if (
      input.ackEveryone !== undefined ||
      input.ackTriggers !== undefined ||
      input.exclusionGroupIds !== undefined ||
      input.idpGroupIds !== undefined ||
      input.owners !== undefined ||
      input.reviewCadence !== undefined ||
      input.reviewDate !== undefined
    ) {
      const data = await gatewayFetch(
        SetCategoryGovernanceDocument,
        {
          // An unset input keeps an inherited value inherited (null), rather than pinning the
          // category's own copy of it.
          ackEveryone: input.ackEveryone ?? (current.ackEveryoneSet ? current.ackEveryone : null),
          ackTriggers: input.ackTriggers ?? current.ackTriggers,
          exclusionGroupIds:
            input.exclusionGroupIds === undefined
              ? current.exclusionGroupIds
              : input.exclusionGroupIds,
          id: input.id,
          idpGroupIds: input.idpGroupIds === undefined ? current.idpGroupIds : input.idpGroupIds,
          owners: input.owners ?? current.owners,
          reviewCadence: input.reviewCadence ?? current.reviewCadence,
          reviewDate: input.reviewDate === undefined ? current.reviewDate : input.reviewDate,
        },
        "SetCategoryGovernance",
        { cookie },
      );
      current = data.setCategoryGovernance;
    }
    return current;
  },
  async updateIdPConnection(domain, toggles, cookie) {
    const data = await gatewayFetch(
      UpdateIdPConnectionDocument,
      {
        allowLocal: toggles.allowLocal,
        clientSecret: toggles.clientSecret,
        domain,
        jitEnabled: toggles.jitEnabled,
        secretRef: toggles.secretRef,
      },
      "UpdateIdPConnection",
      { cookie },
    );
    return data.updateIdPConnection;
  },
  async updateMyProfile(input, cookie) {
    const data = await gatewayFetch(UpdateMyProfileDocument, input, "UpdateMyProfile", { cookie });
    return toMe(data.updateMyProfile);
  },
  async updateReference(id, input, cookie) {
    const data = await gatewayFetch(UpdateReferenceDocument, { id, input }, "UpdateReference", {
      cookie,
    });
    return data.updateReference;
  },
  async updateTemplateVersionSections(id, sections, cookie) {
    const data = await gatewayFetch(
      UpdateTemplateVersionSectionsDocument,
      { id, sections },
      "UpdateTemplateVersionSections",
      { cookie },
    );
    return data.updateTemplateVersionSections;
  },
  async updateUserProfile(userId, name, email, cookie) {
    const data = await gatewayFetch(
      UpdateUserProfileDocument,
      { email, name, userId },
      "UpdateUserProfile",
      { cookie },
    );
    return data.updateUserProfile;
  },
  async updateWorkflowDef(id, name, description, stages, cookie) {
    const data = await gatewayFetch(
      UpdateWorkflowDefDocument,
      { description, id, name, stages },
      "UpdateWorkflowDef",
      { cookie },
    );
    return data.updateWorkflowDef;
  },
  async userFactors(userId, cookie) {
    const data = await gatewayFetch(UserFactorsDocument, { userId }, "UserFactors", { cookie });
    return data.userFactors;
  },
  async users(input, cookie) {
    const data = await gatewayFetch(UsersDocument, input, "Users", { cookie });
    return data.users;
  },
  validateReferenceUrl(url, cookie) {
    return gatewayRestFetch("/documents/validate-url", { url }, "ValidateReferenceUrl", { cookie });
  },
  async verifyAuditChain(fromRecordId, toRecordId, cookie) {
    const data = await gatewayFetch(
      VerifyAuditChainDocument,
      { fromRecordId, toRecordId },
      "VerifyAuditChain",
      { cookie },
    );
    return data.verifyAuditChain;
  },
  async verifyDomain(domain, cookie) {
    const data = await gatewayFetch(VerifyDomainDocument, { domain }, "VerifyDomain", { cookie });
    return data.verifyDomain;
  },
  async workflowDef(id, cookie) {
    const data = await gatewayFetch(WorkflowDefDocument, { id }, "WorkflowDef", { cookie });
    return data.workflowDef ?? null;
  },
  async workflowDefs(cookie) {
    const data = await gatewayFetch(WorkflowDefsDocument, {}, "WorkflowDefs", { cookie });
    return data.workflowDefs;
  },
  async workflows(cookie) {
    const data = await gatewayFetch(WorkflowDefsDocument, {}, "WorkflowDefs", { cookie });
    return data.workflowDefs;
  },
  async workflowStatus(policyVersionId, cookie) {
    const data = await gatewayFetch(WorkflowStatusDocument, { policyVersionId }, "WorkflowStatus", {
      cookie,
    });
    return data.workflowStatus;
  },
};

export default liveEdge;
