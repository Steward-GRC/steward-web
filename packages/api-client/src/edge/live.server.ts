// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Edge } from "../edge";

import { gatewayFetch } from "../gatewayFetch";
import {
  AcknowledgePolicyDocument,
  ActivateOrganizationDocument,
  AddAppendixDocument,
  AddGroupMappingDocument,
  AddOrganizationDocument,
  AiHealthDocument,
  AiJobDocument,
  AiJobResultContentDocument,
  AuditLogDocument,
  AuthorableGroupsDocument,
  AuthorableTemplatesDocument,
  AuthoringAssistDocument,
  BreakGlassRevealDocument,
  CategoriesDocument,
  ChangeOrgProtocolDocument,
  CreateGroupDocument,
  CreatePolicyDocument,
  DeleteAppendixDocument,
  DeleteGroupDocument,
  DeleteGroupMappingDocument,
  DeleteOrganizationDocument,
  DeleteUserDocument,
  DiagnosticsDocument,
  DisableOrganizationDocument,
  DisableUserDocument,
  DiscardDraftDocument,
  DraftVersionDocument,
  EnableUserDocument,
  ForceRotateSpCertificateDocument,
  GrantRoleDocument,
  GroupChildrenDocument,
  GroupMappingsDocument,
  IssueCollabTokenDocument,
  LatestTemplateVersionDocument,
  ListUserSessionsDocument,
  MeDocument,
  MoveGroupDocument,
  MyDraftPoliciesDocument,
  OrganizationsDocument,
  PoliciesDocument,
  PolicyDetailDocument,
  PolicyDocument,
  PreviewUserDeletionDocument,
  PublishDraftDocument,
  RenameGroupDocument,
  ReorderAppendicesDocument,
  RevokeRoleDocument,
  RevokeUserSessionsDocument,
  SaveDraftDocument,
  SpCertificateDocument,
  StartDomainVerificationDocument,
  SubmitDraftGenerationDocument,
  SubmitPolicyReviewDocument,
  TemplatesDocument,
  UpdateAppendixDocument,
  UpdateGroupSettingsDocument,
  UpdateIdPConnectionDocument,
  UpdateMyProfileDocument,
  UpdateUserProfileDocument,
  UsersDocument,
  VerifyAuditChainDocument,
  VerifyDomainDocument,
  WorkflowsDocument,
} from "../generated/graphql";

/** The live edge: every call is a real POST to `GATEWAY_URL`, cookie forwarded. */
export const liveEdge: Edge = {
  async acknowledgePolicy(policyVersionId, cookie) {
    const data = await gatewayFetch(
      AcknowledgePolicyDocument,
      { policyVersionId },
      "AcknowledgePolicy",
      { cookie },
    );
    return data.acknowledgePolicy;
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
  async aiHealth(cookie) {
    const data = await gatewayFetch(AiHealthDocument, {}, "AiHealth", { cookie });
    return data.aiHealth;
  },
  async aiJob(jobId, cookie) {
    const data = await gatewayFetch(AiJobDocument, { jobId }, "AiJob", { cookie });
    return data.aiJob;
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
  async auditLog(filters, cookie) {
    const data = await gatewayFetch(AuditLogDocument, { ...filters }, "AuditLog", { cookie });
    return data.auditLog;
  },
  async authorableGroups(cookie) {
    const data = await gatewayFetch(AuthorableGroupsDocument, {}, "AuthorableGroups", { cookie });
    return data.authorableGroups;
  },
  async authorableTemplates(ownerGroupId, cookie) {
    const data = await gatewayFetch(
      AuthorableTemplatesDocument,
      { ownerGroupId },
      "AuthorableTemplates",
      { cookie },
    );
    return data.authorableTemplates;
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
    const data = await gatewayFetch(CategoriesDocument, {}, "Categories", { cookie });
    return data.categories;
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
  async createGroup(input, cookie) {
    const data = await gatewayFetch(CreateGroupDocument, input, "CreateGroup", { cookie });
    return data.createGroup;
  },
  async createPolicy(input, cookie) {
    const data = await gatewayFetch(
      CreatePolicyDocument,
      {
        documentType: input.documentType,
        homeGroupId: input.homeGroupId,
        sensitivity: input.sensitivity,
        templateId: input.templateId,
        title: input.title,
      },
      "CreatePolicy",
      { cookie },
    );
    return data.createPolicy;
  },
  async deleteAppendix(id, cookie) {
    const data = await gatewayFetch(DeleteAppendixDocument, { id }, "DeleteAppendix", { cookie });
    return data.deleteAppendix;
  },
  async deleteGroup(id, cookie) {
    const data = await gatewayFetch(DeleteGroupDocument, { id }, "DeleteGroup", { cookie });
    return data.deleteGroup;
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
  async draftVersion(policyId, cookie) {
    const data = await gatewayFetch(DraftVersionDocument, { policyId }, "DraftVersion", {
      cookie,
    });
    return data.draftVersion ?? null;
  },

  async enableUser(userId, cookie) {
    const data = await gatewayFetch(EnableUserDocument, { userId }, "EnableUser", { cookie });
    return data.enableUser;
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
    const data = await gatewayFetch(GroupChildrenDocument, { parentId }, "GroupChildren", {
      cookie,
    });
    return data.groupChildren;
  },
  async groupMappings(connectionId, cookie) {
    const data = await gatewayFetch(GroupMappingsDocument, { connectionId }, "GroupMappings", {
      cookie,
    });
    return data.groupMappings;
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
  async me(cookie) {
    const data = await gatewayFetch(MeDocument, {}, "Me", { cookie });
    return data.me ?? null; // scrub:allow=fqdn
  },
  async moveGroup(groupId, newParentId, cookie) {
    const data = await gatewayFetch(MoveGroupDocument, { groupId, newParentId }, "MoveGroup", {
      cookie,
    });
    return data.moveGroup;
  },
  async myDraftPolicies(cookie) {
    const data = await gatewayFetch(MyDraftPoliciesDocument, {}, "MyDraftPolicies", { cookie });
    return data.myDraftPolicies;
  },
  async organizations(cookie) {
    const data = await gatewayFetch(OrganizationsDocument, {}, "Organizations", { cookie });
    return data.organizations;
  },
  async policies(documentType, cookie) {
    const data = await gatewayFetch(PoliciesDocument, { documentType }, "Policies", { cookie });
    return data.policies;
  },
  async policy(id, cookie) {
    const data = await gatewayFetch(PolicyDocument, { id }, "Policy", { cookie });
    return data.policy ?? null;
  },
  async policyDetail(documentType, number, cookie) {
    const data = await gatewayFetch(
      PolicyDetailDocument,
      { documentType, number },
      "PolicyDetail",
      { cookie },
    );
    return data.policyDetail ?? null;
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
  async renameGroup(id, name, slug, cookie) {
    const data = await gatewayFetch(RenameGroupDocument, { id, name, slug }, "RenameGroup", {
      cookie,
    });
    return data.renameGroup;
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
      { input },
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
  async updateAppendix(id, title, contentJson, cookie) {
    const data = await gatewayFetch(
      UpdateAppendixDocument,
      { contentJson, id, title },
      "UpdateAppendix",
      { cookie },
    );
    return data.updateAppendix;
  },
  async updateGroupSettings(input, cookie) {
    const data = await gatewayFetch(UpdateGroupSettingsDocument, input, "UpdateGroupSettings", {
      cookie,
    });
    return data.updateGroupSettings;
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
    return data.updateMyProfile;
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
    const data = await gatewayFetch(WorkflowsDocument, {}, "Workflows", { cookie });
    return data.workflows;
  },
};

export default liveEdge;
