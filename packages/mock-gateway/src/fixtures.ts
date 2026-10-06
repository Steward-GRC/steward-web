// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  type Category,
  ComponentStatus,
  DeletionItemKind,
  type Diagnostics,
  DocumentType,
  type Me,
  type Policy,
  PolicyStatus,
  Sensitivity,
  type Session,
  type User,
  type UserDeletionPreview,
} from "@steward-web/api-client";
import { permissionsForRoles } from "@steward-web/auth";

import { mockId } from "./marker";

const MOCK_VERSION = "mock";
const MOCK_COMMIT = "mock";

/** One signed-in persona for local and demo use: a site admin, so every screen is reachable. */
export const mockMe: Me = {
  email: "demo@example.com",
  firstName: "Demo",
  id: mockId("user", 1),
  lastName: "Admin",
  name: "Demo Admin",
  permissions: permissionsForRoles(["site-admin"]),
  roles: ["site-admin"],
  username: "demo-admin",
};

/** The admin directory: the signed-in persona plus a spread of account shapes to exercise
 *  the Users area (enabled/disabled, local/federated, deleted, merged). */
export const mockUsers: User[] = [
  {
    adGroups: [],
    deletedAt: null,
    email: mockMe.email,
    enabled: true,
    firstName: mockMe.firstName,
    isRoot: true,
    lastName: mockMe.lastName,
    localAccount: false,
    mergedIntoUserId: null,
    name: mockMe.name,
    roles: mockMe.roles,
    userId: mockMe.id,
    username: mockMe.username,
  },
  {
    adGroups: ["platform-engineering"],
    deletedAt: null,
    email: "grace.hopper@example.com",
    enabled: true,
    firstName: "Grace",
    isRoot: false,
    lastName: "Hopper",
    localAccount: false,
    mergedIntoUserId: null,
    name: "Grace Hopper",
    roles: [],
    userId: mockId("user", 2),
    username: "ghopper",
  },
  {
    adGroups: [],
    deletedAt: null,
    email: "ada.lovelace@example.com",
    enabled: true,
    firstName: "Ada",
    isRoot: false,
    lastName: "Lovelace",
    localAccount: true,
    mergedIntoUserId: null,
    name: "Ada Lovelace",
    roles: ["site-admin"],
    userId: mockId("user", 3),
    username: "alovelace",
  },
  {
    adGroups: ["contractors"],
    deletedAt: null,
    email: "margaret.hamilton@example.com",
    enabled: false,
    firstName: "Margaret",
    isRoot: false,
    lastName: "Hamilton",
    localAccount: false,
    mergedIntoUserId: null,
    name: "Margaret Hamilton",
    roles: [],
    userId: mockId("user", 4),
    username: "mhamilton",
  },
  {
    adGroups: [],
    deletedAt: "2025-11-02T09:00:00Z",
    email: "katherine.johnson@example.com",
    enabled: false,
    firstName: "Katherine",
    isRoot: false,
    lastName: "Johnson",
    localAccount: true,
    mergedIntoUserId: null,
    name: "Katherine Johnson",
    roles: [],
    userId: mockId("user", 5),
    username: "kjohnson",
  },
  {
    adGroups: [],
    deletedAt: "2025-10-20T14:00:00Z",
    email: "hedy.lamarr@example.com",
    enabled: false,
    firstName: "Hedy",
    isRoot: false,
    lastName: "Lamarr",
    localAccount: true,
    mergedIntoUserId: mockId("user", 3),
    name: "Hedy Lamarr",
    roles: [],
    userId: mockId("user", 6),
    username: "hlamarr",
  },
];

export const mockSessions: Record<string, Session[]> = {
  [mockId("user", 3)]: [
    {
      clientIp: "203.0.113.10",
      expiresAt: "2026-01-02T00:00:00Z",
      issuedAt: "2026-01-01T08:00:00Z",
      lastSeenAt: "2026-01-01T09:30:00Z",
      revokedAt: null,
      sessionId: mockId("session", 1),
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    },
  ],
};

/** Deletion previews keyed by userId. Ada (who owns a pending approval in this fixture set)
 *  demonstrates the blocked path; everyone else previews clean. */
export const mockUserDeletionPreviews: Record<string, UserDeletionPreview> = {
  [mockId("user", 3)]: {
    blocksDelete: true,
    counts: { accessRows: 1, ownedPolicies: 0, pendingApprovals: 1, raciGrants: 0, roles: 1 },
    items: [
      {
        blocksDelete: true,
        detail: "Awaiting Ada's approval on the Q1 access review.",
        kind: DeletionItemKind.PendingApproval,
        label: "Q1 access review",
        refId: mockId("approval", 1),
      },
    ],
    locallyAuthenticable: true,
    userId: mockId("user", 3),
    warnings: [],
  },
};

export const mockDiagnostics: Diagnostics = {
  actor: { actingAs: null, id: mockMe.id, roles: mockMe.roles, username: mockMe.username },
  appliance: null,
  gateway: {
    commit: MOCK_COMMIT,
    name: "gateway",
    status: ComponentStatus.Ok,
    version: MOCK_VERSION,
  },
  generatedAt: "2026-01-01T00:00:00Z",
  release: null,
  services: [],
  thirdParty: [],
  traceId: mockId("trace", 1),
};

/** The library's category tree: a few generic business categories, each with subcategories. */
export const mockCategories: Category[] = [
  {
    id: mockId("category", 1),
    name: "Finance",
    slug: "finance",
    subcategories: ["Reimbursement"],
  },
  {
    id: mockId("category", 2),
    name: "Human Resources",
    slug: "human-resources",
    subcategories: ["Workplace", "Ethics"],
  },
  {
    id: mockId("category", 3),
    name: "IT Security",
    slug: "it-security",
    subcategories: ["Usage", "Data Governance", "Operations"],
  },
  {
    id: mockId("category", 4),
    name: "Procurement",
    slug: "procurement",
    subcategories: ["Due Diligence"],
  },
];

/** The library catalog: policies and procedures across every category, status and sensitivity. */
export const mockPolicies: Policy[] = [
  {
    category: "Finance",
    documentType: DocumentType.Policy,
    id: mockId("policy", 1),
    number: "POL-FINANCE-001",
    sensitivity: Sensitivity.Standard,
    status: PolicyStatus.Published,
    subcategory: "Reimbursement",
    title: "Expense Claims",
    updated: "2026-08-12T00:00:00Z",
    version: "2.0.0",
  },
  {
    category: "IT Security",
    documentType: DocumentType.Policy,
    id: mockId("policy", 2),
    number: "POL-ITSEC-004",
    sensitivity: Sensitivity.Sensitive,
    status: PolicyStatus.Draft,
    subcategory: "Usage",
    title: "Acceptable Use",
    updated: "2026-09-02T00:00:00Z",
    version: "1.0.0",
  },
  {
    category: "IT Security",
    documentType: DocumentType.Policy,
    id: mockId("policy", 3),
    number: "POL-ITSEC-011",
    sensitivity: Sensitivity.Sensitive,
    status: PolicyStatus.InReview,
    subcategory: "Data Governance",
    title: "Data Classification",
    updated: "2026-09-20T00:00:00Z",
    version: "3.1.0",
  },
  {
    category: "Human Resources",
    documentType: DocumentType.Policy,
    id: mockId("policy", 4),
    number: "POL-HR-002",
    sensitivity: Sensitivity.Standard,
    status: PolicyStatus.Superseded,
    subcategory: "Workplace",
    title: "Remote Work",
    updated: "2026-05-01T00:00:00Z",
    version: "1.0.0",
  },
  {
    category: "Procurement",
    documentType: DocumentType.Policy,
    id: mockId("policy", 5),
    number: "POL-PROC-007",
    sensitivity: Sensitivity.Standard,
    status: PolicyStatus.Withdrawn,
    subcategory: "Due Diligence",
    title: "Vendor Onboarding",
    updated: "2026-03-18T00:00:00Z",
    version: "1.1.0",
  },
  {
    category: "IT Security",
    documentType: DocumentType.Procedure,
    id: mockId("policy", 6),
    number: "PRC-ITSEC-002",
    sensitivity: Sensitivity.Standard,
    status: PolicyStatus.Published,
    subcategory: "Operations",
    title: "Incident Response Runbook",
    updated: "2026-09-28T00:00:00Z",
    version: "4.0.0",
  },
  {
    category: "Human Resources",
    documentType: DocumentType.Procedure,
    id: mockId("policy", 7),
    number: "PRC-HR-003",
    sensitivity: Sensitivity.Standard,
    status: PolicyStatus.Rejected,
    subcategory: "Ethics",
    title: "Gift Disclosure",
    updated: "2026-07-09T00:00:00Z",
    version: "1.0.0",
  },
];
