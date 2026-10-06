// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Edge } from "../edge";

import { gatewayFetch } from "../gatewayFetch";
import {
  AcknowledgePolicyDocument,
  BreakGlassRevealDocument,
  CategoriesDocument,
  CreateGroupDocument,
  DeleteGroupDocument,
  DeleteUserDocument,
  DiagnosticsDocument,
  DisableUserDocument,
  EnableUserDocument,
  GrantRoleDocument,
  GroupChildrenDocument,
  ListUserSessionsDocument,
  MeDocument,
  MoveGroupDocument,
  PoliciesDocument,
  PolicyDetailDocument,
  PreviewUserDeletionDocument,
  RenameGroupDocument,
  RevokeRoleDocument,
  RevokeUserSessionsDocument,
  TemplatesDocument,
  UpdateGroupSettingsDocument,
  UpdateMyProfileDocument,
  UpdateUserProfileDocument,
  UsersDocument,
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
  async createGroup(input, cookie) {
    const data = await gatewayFetch(CreateGroupDocument, input, "CreateGroup", { cookie });
    return data.createGroup;
  },
  async deleteGroup(id, cookie) {
    const data = await gatewayFetch(DeleteGroupDocument, { id }, "DeleteGroup", { cookie });
    return data.deleteGroup;
  },
  async deleteUser(userId, cookie) {
    const data = await gatewayFetch(DeleteUserDocument, { userId }, "DeleteUser", { cookie });
    return data.deleteUser;
  },
  async diagnostics(cookie) {
    const data = await gatewayFetch(DiagnosticsDocument, {}, "Diagnostics", { cookie });
    return data.diagnostics;
  },
  async disableUser(userId, cookie) {
    const data = await gatewayFetch(DisableUserDocument, { userId }, "DisableUser", { cookie });
    return data.disableUser;
  },

  async enableUser(userId, cookie) {
    const data = await gatewayFetch(EnableUserDocument, { userId }, "EnableUser", { cookie });
    return data.enableUser;
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
  async policies(documentType, cookie) {
    const data = await gatewayFetch(PoliciesDocument, { documentType }, "Policies", { cookie });
    return data.policies;
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
  async renameGroup(id, name, slug, cookie) {
    const data = await gatewayFetch(RenameGroupDocument, { id, name, slug }, "RenameGroup", {
      cookie,
    });
    return data.renameGroup;
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
  async templates(cookie) {
    const data = await gatewayFetch(TemplatesDocument, {}, "Templates", { cookie });
    return data.templates;
  },
  async updateGroupSettings(input, cookie) {
    const data = await gatewayFetch(UpdateGroupSettingsDocument, input, "UpdateGroupSettings", {
      cookie,
    });
    return data.updateGroupSettings;
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
  async workflows(cookie) {
    const data = await gatewayFetch(WorkflowsDocument, {}, "Workflows", { cookie });
    return data.workflows;
  },
};

export default liveEdge;
