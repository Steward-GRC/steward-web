// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  Edge,
  Group,
  GroupMapping,
  Organization,
  User,
  UserDeletionPreview,
} from "@steward-web/api-client";

import { GatewayError, ReviewCadence } from "@steward-web/api-client";

import {
  mockCategories,
  mockDiagnostics,
  mockGroupMappings,
  mockGroups,
  mockMe,
  mockOrganizations,
  mockPolicies,
  mockPolicyDetails,
  mockSessions,
  mockSpCertificate,
  mockTemplates,
  mockUserDeletionPreviews,
  mockUsers,
  mockWorkflows,
} from "./fixtures";
import { mockId } from "./marker";

// Mutable so `updateMyProfile`, `acknowledgePolicy` and `breakGlassReveal` below can persist
// their effect across calls in the same process, the way the live gateway would. `fixtures.ts`
// still exports the starting values.
let me = mockMe;
let users = [...mockUsers];
let groups = [...mockGroups];
let nextGroupSeq = mockGroups.length + 1;
const sessions = structuredClone(mockSessions);
let policyDetails = mockPolicyDetails;
let organizations = [...mockOrganizations];
let nextConnectionSeq = mockOrganizations.length + 1;
let spCertificate = mockSpCertificate;
let nextSpCertSeq = 2;
const groupMappings = structuredClone(mockGroupMappings);
let nextGroupMappingSeq = Object.values(mockGroupMappings).flat().length + 1;

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

const requireGroup = (operation: string, id: string): Group => {
  const group = groups.find((g) => g.id === id);
  if (!group) throw new GatewayError(operation, `group ${id} not found`, { code: "NOT_FOUND" });
  return group;
};

const replaceGroup = (updated: Group): Group => {
  groups = groups.map((g) => (g.id === updated.id ? updated : g));
  return updated;
};

const requireOrganization = (operation: string, domain: string): Organization => {
  const org = organizations.find((o) => o.domain === domain);
  if (!org) {
    throw new GatewayError(operation, `organization ${domain} not found`, { code: "NOT_FOUND" });
  }
  return org;
};

const replaceOrganization = (updated: Organization): Organization => {
  organizations = organizations.map((o) => (o.domain === updated.domain ? updated : o));
  return updated;
};

// The maximum taxonomy depth the backend enforces (root = depth 1). Mirrors the original
// gateway's own guard so a move or create behaves the same in mock and live mode.
const MAX_GROUP_DEPTH = 3;

const depthOf = (groupId: string): number => {
  let depth = 0;
  let current: Group | undefined = groups.find((g) => g.id === groupId);
  while (current) {
    depth += 1;
    current = current.parentId ? groups.find((g) => g.id === current!.parentId) : undefined;
  }
  return depth;
};

const subtreeHeight = (groupId: string): number => {
  const children = groups.filter((g) => g.parentId === groupId);
  return children.length === 0 ? 1 : 1 + Math.max(...children.map((c) => subtreeHeight(c.id)));
};

const subtreeIds = (groupId: string): Set<string> => {
  const ids = new Set<string>([groupId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const g of groups) {
      if (g.parentId && ids.has(g.parentId) && !ids.has(g.id)) {
        ids.add(g.id);
        grew = true;
      }
    }
  }
  return ids;
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
  activateOrganization: async (domain) => {
    const org = requireOrganization("ActivateOrganization", domain);
    if (!org.verified || !org.testPassed) {
      throw new GatewayError(
        "ActivateOrganization",
        "both the domain and the IdP test must pass before activation",
        { code: "FAILED_PRECONDITION" },
      );
    }
    return replaceOrganization({ ...org, enabled: true });
  },
  addGroupMapping: async (connectionId, idpGroupClaimValue, targetGroupId) => {
    const mapping: GroupMapping = {
      connectionId,
      id: mockId("group-mapping", nextGroupMappingSeq++),
      idpGroupClaimValue,
      targetGroupId,
    };
    groupMappings[connectionId] = [...(groupMappings[connectionId] ?? []), mapping];
    return mapping;
  },
  addOrganization: async ({ displayName, domain, orgName, protocol }) => {
    if (organizations.some((o) => o.domain === domain)) {
      throw new GatewayError("AddOrganization", `an organization for ${domain} already exists`, {
        code: "ALREADY_EXISTS",
      });
    }
    const created: Organization = {
      allowLocal: false,
      connectionId: mockId("connection", nextConnectionSeq++),
      displayName: displayName ?? orgName,
      domain,
      enabled: false,
      jitEnabled: true,
      orgName,
      protocol,
      testPassed: false,
      verified: false,
    };
    organizations = [...organizations, created];
    return created;
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
  changeOrgProtocol: async (domain, protocol, config) => {
    const org = requireOrganization("ChangeOrgProtocol", domain);
    void config; // the mock stores no connection config; only the gate-reset matters here
    return replaceOrganization({
      ...org,
      enabled: false,
      protocol,
      testPassed: false,
      verified: false,
    });
  },
  createGroup: async ({ name, parentId, slug }) => {
    if (groups.some((g) => g.parentId === parentId && g.slug === slug)) {
      throw new GatewayError(
        "CreateGroup",
        `a group with slug "${slug}" already exists under this parent`,
        {
          code: "ALREADY_EXISTS",
        },
      );
    }
    const created: Group = {
      defaultTemplateId: null,
      defaultTemplateNone: false,
      defaultWorkflowId: null,
      id: mockId("group", nextGroupSeq++),
      name,
      owners: [],
      parentId,
      reviewCadence: ReviewCadence.None,
      reviewDate: null,
      slug,
    };
    groups = [...groups, created];
    return created;
  },
  deleteGroup: async (id) => {
    requireGroup("DeleteGroup", id);
    groups = groups.filter((g) => !subtreeIds(id).has(g.id));
    return true;
  },
  deleteGroupMapping: async (mappingId) => {
    for (const connectionId of Object.keys(groupMappings)) {
      groupMappings[connectionId] = (groupMappings[connectionId] ?? []).filter(
        (m) => m.id !== mappingId,
      );
    }
    return true;
  },
  deleteOrganization: async (domain) => {
    requireOrganization("DeleteOrganization", domain);
    organizations = organizations.filter((o) => o.domain !== domain);
    return true;
  },
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
  disableOrganization: async (domain) => {
    const org = requireOrganization("DisableOrganization", domain);
    return replaceOrganization({ ...org, enabled: false });
  },
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
  forceRotateSpCertificate: () => {
    spCertificate = {
      active: true,
      certPem: "-----BEGIN CERTIFICATE-----\nMOCK-ROTATED\n-----END CERTIFICATE-----",
      notAfter: "2028-01-01T00:00:00Z",
      serial: mockId("sp-cert", nextSpCertSeq++),
      spMetadataXml: spCertificate.spMetadataXml,
    };
    return Promise.resolve(spCertificate);
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
  groupChildren: (parentId) => Promise.resolve(groups.filter((g) => g.parentId === parentId)),
  groupMappings: (connectionId) => Promise.resolve(groupMappings[connectionId] ?? []),
  listUserSessions: (userId) => Promise.resolve(sessions[userId] ?? []),
  me: () => Promise.resolve(me),
  moveGroup: async (groupId, newParentId) => {
    const group = requireGroup("MoveGroup", groupId);
    if (newParentId !== null) {
      requireGroup("MoveGroup", newParentId);
      if (subtreeIds(groupId).has(newParentId)) {
        throw new GatewayError("MoveGroup", "a group can't be moved under itself or a descendant", {
          code: "INVALID_ARGUMENT",
        });
      }
    }
    const resultDepth = (newParentId === null ? 0 : depthOf(newParentId)) + subtreeHeight(groupId);
    if (resultDepth > MAX_GROUP_DEPTH) {
      throw new GatewayError(
        "MoveGroup",
        `that move would exceed the maximum depth of ${MAX_GROUP_DEPTH}`,
        {
          code: "FAILED_PRECONDITION",
        },
      );
    }
    return replaceGroup({ ...group, parentId: newParentId });
  },
  organizations: () => Promise.resolve(organizations),
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
  renameGroup: async (id, name, slug) => {
    const group = requireGroup("RenameGroup", id);
    if (groups.some((g) => g.id !== id && g.parentId === group.parentId && g.slug === slug)) {
      throw new GatewayError(
        "RenameGroup",
        `a group with slug "${slug}" already exists under this parent`,
        {
          code: "ALREADY_EXISTS",
        },
      );
    }
    return replaceGroup({ ...group, name, slug });
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
  spCertificate: () => Promise.resolve(spCertificate),
  startDomainVerification: async (domain, rotate) => {
    const org = requireOrganization("StartDomainVerification", domain);
    const token = rotate ? mockId("verify-token", Date.now()) : mockId("verify-token", 1);
    if (rotate) replaceOrganization({ ...org, verified: false });
    return {
      dnsRecordName: `_steward-verify.${domain}`,
      dnsRecordValue: `steward-verify=${token}`,
      instructions: `Add a TXT record named _steward-verify.${domain} with value steward-verify=${token}, then verify.`,
      token,
    };
  },
  templates: () => Promise.resolve(mockTemplates),
  updateGroupSettings: async ({
    defaultTemplateId = null,
    defaultTemplateNone = false,
    defaultWorkflowId = null,
    id,
    owners = [],
    reviewCadence = ReviewCadence.None,
    reviewDate = null,
  }) => {
    const group = requireGroup("UpdateGroupSettings", id);
    return replaceGroup({
      ...group,
      defaultTemplateId,
      defaultTemplateNone,
      defaultWorkflowId,
      owners: [...owners],
      reviewCadence,
      reviewDate,
    });
  },
  updateIdPConnection: async (domain, toggles) => {
    const org = requireOrganization("UpdateIdPConnection", domain);
    return replaceOrganization({
      ...org,
      allowLocal: toggles.allowLocal ?? org.allowLocal,
      jitEnabled: toggles.jitEnabled ?? org.jitEnabled,
    });
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
  verifyDomain: async (domain) => {
    const org = requireOrganization("VerifyDomain", domain);
    return replaceOrganization({ ...org, verified: true });
  },
  workflows: () => Promise.resolve(mockWorkflows),
};

export default mockEdge;
