// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Edge } from "../edge";

import { gatewayFetch } from "../gatewayFetch";
import {
  AcknowledgePolicyDocument,
  BreakGlassRevealDocument,
  CategoriesDocument,
  DeleteUserDocument,
  DiagnosticsDocument,
  DisableUserDocument,
  EnableUserDocument,
  GrantRoleDocument,
  ListUserSessionsDocument,
  MeDocument,
  PoliciesDocument,
  PolicyDetailDocument,
  PreviewUserDeletionDocument,
  RevokeRoleDocument,
  RevokeUserSessionsDocument,
  UpdateMyProfileDocument,
  UpdateUserProfileDocument,
  UsersDocument,
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
};

export default liveEdge;
