// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Edge } from "../edge";
import type { Me, Policy, PolicyDetail, PolicySectionDiff } from "../views";

import { GatewayError, gatewayFetch } from "../gatewayFetch";
import { gatewayRestFetch } from "../gatewayRestFetch";
import {
  AckStatusDocument,
  ActivateOrganizationDocument,
  AddAppendixDocument,
  AddCaseNoteDocument,
  AddCaseNoticeDocument,
  AddGroupMappingDocument,
  AddOrganizationDocument,
  AddUserToGroupDocument,
  AiHealthDocument,
  AiJobDocument,
  AiJobResultContentDocument,
  AssignCaseDocument,
  AuditLogDocument,
  AuthoringAssistDocument,
  type AuthoringPolicyFieldsFragment,
  BreakGlassRevealDocument,
  CategoryChildrenDocument,
  CategoryDocument,
  type CategoryFieldsFragment,
  CategoryTreeDocument,
  ChangeOrgProtocolDocument,
  CloseCaseDocument,
  CreateCategoryDocument,
  CreatePolicyDocument,
  CreateTemplateDocument,
  CreateTemplateVersionDocument,
  DeleteAppendixDocument,
  DeleteCategoryDocument,
  DeleteGroupMappingDocument,
  DeleteOrganizationDocument,
  DeleteTemplateDocument,
  DeleteUserDocument,
  DiagnosticsDocument,
  DiffVersionsDocument,
  DisableOrganizationDocument,
  DisableUserDocument,
  DiscardDraftDocument,
  DiscardTemplateVersionDocument,
  EnableUserDocument,
  ForceRotateSpCertificateDocument,
  GrantRoleDocument,
  GroupMappingsDocument,
  IssueCollabTokenDocument,
  LatestTemplateVersionDocument,
  ListUserSessionsDocument,
  ManagedGroupMembersDocument,
  MeDocument,
  MergeAccountsDocument,
  MoveCategoryDocument,
  MyDraftsDocument,
  OrganizationsDocument,
  PendingTasksDocument,
  PoliciesDocument,
  PolicyAttachmentsDocument,
  PolicyByNumberDocument,
  PolicyDocument,
  PolicyVersionDocument,
  PolicyVersionsDocument,
  PostCaseMessageDocument,
  PreviewAccountMergeDocument,
  PreviewUserDeletionDocument,
  PublishDraftDocument,
  PublishTemplateVersionDocument,
  RecordAckDocument,
  RecordRiskAssessmentDocument,
  RemoveUserFromGroupDocument,
  RenameCategoryDocument,
  RenameTemplateDocument,
  ReorderAppendicesDocument,
  ReportCaseDocument,
  ReportCasesDocument,
  RetireTemplateDocument,
  RevokeRoleDocument,
  RevokeUserSessionsDocument,
  SaveDraftDocument,
  SearchUsersDocument,
  SetCaseDiscoveryDateDocument,
  SetCaseStatusDocument,
  SetCategoryDefaultsDocument,
  SetCategoryGovernanceDocument,
  SignalWorkflowDocument,
  SpCertificateDocument,
  StartDomainVerificationDocument,
  SubmitDraftGenerationDocument,
  SubmitPolicyReviewDocument,
  TemplatesDocument,
  TemplateVersionsDocument,
  UpcomingApprovalsDocument,
  UpdateAppendixDocument,
  UpdateCaseNoticeDocument,
  UpdateIdPConnectionDocument,
  UpdateMyProfileDocument,
  UpdateTemplateVersionSectionsDocument,
  UpdateUserProfileDocument,
  UsersDocument,
  VerifyAuditChainDocument,
  VerifyDomainDocument,
  WorkflowDefsDocument,
  WorkflowStatusDocument,
} from "../generated/graphql";
import { DocumentType } from "../generated/schema";
import { awaitAiJobResult } from "./aiJobResult.server";
import {
  appendixText,
  bodyTextFromContent,
  categoryNames,
  type CategoryNode,
  historyFromAuditLog,
  isUnauthenticated,
  policyStatusOf,
  toPolicyView,
} from "./assemble";

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
  managedGroupIds: readonly string[];
  name: string;
  permissions: readonly string[];
  roles: readonly string[];
  userId: string;
  username: string;
}): Me => ({
  email: user.email,
  firstName: user.firstName,
  id: user.userId,
  lastName: user.lastName,
  managedGroupIds: user.managedGroupIds,
  name: user.name,
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
  const [version, attachments, versions, ack, auditPage] = await Promise.all([
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
    gatewayFetch(AuditLogDocument, { subject: `policy:${policy.id}` }, "AuditLog", { cookie }),
  ]);
  const history = historyFromAuditLog(
    auditPage.auditLog.records,
    version ? String(version.versionNo) : "",
  );

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

  return {
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
    bodyText: version ? bodyTextFromContent(version.contentJson) : "",
    canBreakGlass: policy.viewerCan.canBreakGlass,
    category: names.category,
    contacts: attachments.policyContactBlocks,
    contentObfuscated: policy.viewerCan.contentObfuscated,
    currentVersionId: publishedId,
    definitions: attachments.policyDefinitionEntries,
    documentType: policy.documentType,
    history,
    id: policy.id,
    number: policy.number,
    ownerName: policy.ownerName ?? null,
    priorVersion: prior ? { diff, version: String(prior.versionNo) } : null,
    published: publishedId ? (version?.publishedAt ?? null) : null,
    references: attachments.policyReferences,
    related: attachments.relatedPolicies,
    sensitivity: policy.sensitivity,
    status: policyStatusOf(publishedId !== null, version?.status),
    subcategory: names.subcategory,
    title: policy.title,
    updated: policy.updatedAt,
    version: version ? String(version.versionNo) : "",
  };
};

/** The live edge: every call is a real POST to `GATEWAY_URL`, cookie forwarded. */
export const liveEdge: Edge = {
  async acknowledgePolicy(policyVersionId, cookie) {
    const data = await gatewayFetch(RecordAckDocument, { policyVersionId }, "RecordAck", {
      cookie,
    });
    return { ackedAt: data.recordAck.ackedAt, acknowledged: true, required: true };
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
  async changeOrgProtocol(domain, protocol, config, secretRef, cookie) {
    const data = await gatewayFetch(
      ChangeOrgProtocolDocument,
      { config, domain, protocol, secretRef },
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
  async createGroup(input, cookie) {
    const data = await gatewayFetch(CreateCategoryDocument, input, "CreateCategory", { cookie });
    return data.createCategory;
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
  async deleteAppendix(id, cookie) {
    const data = await gatewayFetch(DeleteAppendixDocument, { id }, "DeleteAppendix", { cookie });
    return data.deleteAppendix;
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

  async enableUser(userId, cookie) {
    const data = await gatewayFetch(EnableUserDocument, { userId }, "EnableUser", { cookie });
    return data.enableUser;
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
  async grantRole(userId, role, cookie) {
    const data = await gatewayFetch(GrantRoleDocument, { role, userId }, "GrantRole", { cookie });
    return data.grantRole;
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
  async managedGroupMembers(groupId, cookie) {
    const data = await gatewayFetch(
      ManagedGroupMembersDocument,
      { groupId },
      "ManagedGroupMembers",
      { cookie },
    );
    return data.managedGroupMembers;
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
  async myDraftPolicies(cookie) {
    const [{ myDrafts }, index] = await Promise.all([
      gatewayFetch(MyDraftsDocument, {}, "MyDrafts", { cookie }),
      categoryIndex(cookie),
    ]);
    return Promise.all(myDrafts.map((p) => policyView(p, cookie, index)));
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
  async pendingTasks(cookie) {
    const data = await gatewayFetch(PendingTasksDocument, {}, "PendingTasks", { cookie });
    return data.pendingTasks;
  },
  async policies(documentType, cookie) {
    return catalog(documentType, await categoryIndex(cookie), cookie);
  },
  async policy(id, cookie) {
    const data = await gatewayFetch(PolicyDocument, { id }, "Policy", { cookie });
    return data.policy ? policyView(data.policy, cookie) : null;
  },
  async policyDetail(documentType, number, cookie) {
    const [index, { policyByNumber: found }] = await Promise.all([
      categoryIndex(cookie),
      gatewayFetch(PolicyByNumberDocument, { number }, "PolicyByNumber", { cookie }),
    ]);
    return found && found.documentType === documentType
      ? assembleDetail(found, index, cookie)
      : null;
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
  async recordRiskAssessment(caseId, factors, decision, reason, cookie) {
    const data = await gatewayFetch(
      RecordRiskAssessmentDocument,
      { caseId, decision, factors, reason },
      "RecordRiskAssessment",
      { cookie },
    );
    return data.recordRiskAssessment;
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
  async saveDraft(policyId, contentJson, templateVersionId, cookie) {
    const data = await gatewayFetch(
      SaveDraftDocument,
      { contentJson, policyId, templateVersionId },
      "SaveDraft",
      { cookie },
    );
    return data.saveDraft;
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
  async signalWorkflow(policyVersionId, runId, taskId, signal, comment, cookie) {
    const data = await gatewayFetch(
      SignalWorkflowDocument,
      { comment, policyVersionId, runId, signal, taskId },
      "SignalWorkflow",
      { cookie },
    );
    return data.signalWorkflow;
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
  async submitDraftGeneration(input, cookie) {
    const data = await gatewayFetch(
      SubmitDraftGenerationDocument,
      {
        input: {
          brief: input.brief,
          categoryId: input.homeGroupId,
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
      input.owners !== undefined ||
      input.reviewCadence !== undefined ||
      input.reviewDate !== undefined
    ) {
      const data = await gatewayFetch(
        SetCategoryGovernanceDocument,
        {
          ackTriggers: current.ackTriggers,
          id: input.id,
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
      { allowLocal: toggles.allowLocal, domain, jitEnabled: toggles.jitEnabled },
      "UpdateIdPConnection",
      { cookie },
    );
    return data.updateIdPConnection;
  },
  async updateMyProfile(input, cookie) {
    const data = await gatewayFetch(UpdateMyProfileDocument, input, "UpdateMyProfile", { cookie });
    return toMe(data.updateMyProfile);
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
  async users(input, cookie) {
    const data = await gatewayFetch(UsersDocument, input, "Users", { cookie });
    return data.users;
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
