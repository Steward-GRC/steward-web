// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Edge, User, UserDeletionPreview } from "@steward-web/api-client";

import { GatewayError } from "@steward-web/api-client";

import {
  mockCategories,
  mockDiagnostics,
  mockMe,
  mockPolicies,
  mockPolicyDetails,
  mockSessions,
  mockUserDeletionPreviews,
  mockUsers,
} from "./fixtures";

// Mutable so `updateMyProfile`, `acknowledgePolicy` and `breakGlassReveal` below can persist
// their effect across calls in the same process, the way the live gateway would. `fixtures.ts`
// still exports the starting values.
let me = mockMe;
let users = [...mockUsers];
const sessions = structuredClone(mockSessions);
let policyDetails = mockPolicyDetails;

/** How long a mock break-glass grant lasts, matching the real grant's order of magnitude. */
const BREAK_GLASS_GRANT_MS = 5 * 60 * 1000;

const requireUser = (operation: string, userId: string): User => {
  const user = users.find((u) => u.userId === userId);
  if (!user) throw new GatewayError(operation, `user ${userId} not found`, { code: "NOT_FOUND" });
  return user;
};

const replaceUser = (updated: User): User => {
  users = users.map((u) => (u.userId === updated.userId ? updated : u));
  return updated;
};

/**
 * The mock edge: every call answers from the fixtures, no network, no cookie check. Swapped
 * in for `edge/live.server.ts` only on a `--mode mock` build (`@steward-web/vite-config`'s
 * `chooseEdge`); a live build never imports this module.
 */
export const mockEdge: Edge = {
  acknowledgePolicy: async (policyVersionId) => {
    const detail = policyDetails.find((d) => d.currentVersionId === policyVersionId);
    if (!detail?.ack) {
      throw new GatewayError("AcknowledgePolicy", "Unknown policy version.", {
        code: "NOT_FOUND",
      });
    }
    const ackedAt = new Date().toISOString();
    const ack = { ackedAt, acknowledged: true, required: true };
    policyDetails = policyDetails.map((d) => (d === detail ? { ...d, ack } : d));
    return ack;
  },
  breakGlassReveal: async (policyId, reason) => {
    if (!reason.trim()) {
      throw new GatewayError("BreakGlassReveal", "A reason is required.", {
        code: "INVALID_ARGUMENT",
      });
    }
    policyDetails = policyDetails.map((d) =>
      d.id === policyId ? { ...d, contentObfuscated: false } : d,
    );
    return { grantedUntil: new Date(Date.now() + BREAK_GLASS_GRANT_MS).toISOString() };
  },
  categories: () => Promise.resolve(mockCategories),
  deleteUser: async (userId) => {
    const user = requireUser("DeleteUser", userId);
    const preview = mockUserDeletionPreviews[userId];
    if (preview?.blocksDelete) {
      throw new GatewayError("DeleteUser", "this user can't be deleted yet", {
        code: "DELETE_BLOCKED",
      });
    }
    const revokedSessions = (sessions[userId] ?? []).filter((s) => !s.revokedAt).length;
    sessions[userId] = (sessions[userId] ?? []).map((s) => ({
      ...s,
      revokedAt: s.revokedAt ?? new Date().toISOString(),
    }));
    replaceUser({ ...user, deletedAt: new Date().toISOString() });
    return { revokedSessions, userId };
  },
  diagnostics: () => Promise.resolve(mockDiagnostics),
  disableUser: async (userId) => {
    const user = requireUser("DisableUser", userId);
    if (user.isRoot) {
      throw new GatewayError("DisableUser", "the root site-admin can't be disabled", {
        code: "ROOT_PROTECTED",
      });
    }
    return replaceUser({ ...user, enabled: false });
  },

  enableUser: async (userId) => {
    const user = requireUser("EnableUser", userId);
    return replaceUser({ ...user, enabled: true });
  },
  // Every handler below that can refuse is `async`, even where nothing is awaited: inside an
  // async function a `throw` becomes the returned promise's rejection, matching the live edge
  // (and the `Edge` interface's own `Promise`-returning shape) instead of throwing synchronously
  // at the call site.
  grantRole: async (userId, role) => {
    const user = requireUser("GrantRole", userId);
    const roles = user.roles.includes(role) ? user.roles : [...user.roles, role];
    return replaceUser({ ...user, roles });
  },
  listUserSessions: (userId) => Promise.resolve(sessions[userId] ?? []),
  me: () => Promise.resolve(me),
  policies: (documentType) =>
    Promise.resolve(mockPolicies.filter((p) => p.documentType === documentType)),
  policyDetail: (documentType, number) =>
    Promise.resolve(
      policyDetails.find((d) => d.documentType === documentType && d.number === number) ?? null,
    ),
  previewUserDeletion: async (userId) => {
    const user = requireUser("PreviewUserDeletion", userId);
    const fallback: UserDeletionPreview = {
      blocksDelete: false,
      counts: { accessRows: 0, ownedPolicies: 0, pendingApprovals: 0, raciGrants: 0, roles: 0 },
      items: [],
      locallyAuthenticable: user.localAccount,
      userId,
      warnings: [],
    };
    return mockUserDeletionPreviews[userId] ?? fallback;
  },
  revokeRole: async (userId, role) => {
    const user = requireUser("RevokeRole", userId);
    return replaceUser({ ...user, roles: user.roles.filter((r) => r !== role) });
  },
  revokeUserSessions: async (userId, reason) => {
    const current = sessions[userId] ?? [];
    const revokedAt = new Date().toISOString();
    sessions[userId] = current.map((s) => (s.revokedAt ? s : { ...s, revokedAt }));
    void reason; // the mock audits nothing; the live gateway records it
    return current.filter((s) => !s.revokedAt).length;
  },
  updateMyProfile: ({ firstName, lastName }) => {
    me = { ...me, firstName, lastName, name: `${firstName} ${lastName}`.trim() };
    users = users.map((u) =>
      u.userId === me.id ? { ...u, firstName, lastName, name: me.name } : u,
    );
    return Promise.resolve(me);
  },
  updateUserProfile: async (userId, name, email) => {
    const user = requireUser("UpdateUserProfile", userId);
    const [firstName, ...rest] = name.split(" ");
    return replaceUser({
      ...user,
      email,
      firstName: firstName ?? "",
      lastName: rest.join(" "),
      name,
    });
  },
  users: ({ includeDeleted, search } = {}) => {
    const needle = search?.trim().toLowerCase();
    const filtered = users
      .filter((u) => includeDeleted || !u.deletedAt)
      .filter((u) => !needle || u.email.toLowerCase().includes(needle));
    return Promise.resolve({ nextPageToken: "", users: filtered });
  },
};

export default mockEdge;
