// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  type Category,
  ComponentStatus,
  DeletionItemKind,
  type Diagnostics,
  DocumentType,
  type Group,
  type GroupMapping,
  type Me,
  type Organization,
  type Policy,
  type PolicyDetail,
  PolicyStatus,
  ReferenceKind,
  ReviewCadence,
  Sensitivity,
  type Session,
  type SpCertificate,
  type Template,
  type User,
  type UserDeletionPreview,
  type Workflow,
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

/** The group directory: a two-level hierarchy under one root, for exercising the admin
 *  groups area (rename, move, defaults, governance). */
export const mockGroups: Group[] = [
  {
    defaultTemplateId: null,
    defaultTemplateNone: false,
    defaultWorkflowId: null,
    id: mockId("group", 1),
    name: "Meridian Holdings",
    owners: [mockMe.id],
    parentId: null,
    reviewCadence: ReviewCadence.Annual,
    reviewDate: null,
    slug: "meridian-holdings",
  },
  {
    defaultTemplateId: mockId("template", 1),
    defaultTemplateNone: false,
    defaultWorkflowId: null,
    id: mockId("group", 2),
    name: "IT Security",
    owners: [mockId("user", 2)],
    parentId: mockId("group", 1),
    reviewCadence: ReviewCadence.Biennial,
    reviewDate: null,
    slug: "it-security",
  },
  {
    defaultTemplateId: null,
    defaultTemplateNone: true,
    defaultWorkflowId: null,
    id: mockId("group", 3),
    name: "Infrastructure",
    owners: [],
    parentId: mockId("group", 2),
    reviewCadence: ReviewCadence.None,
    reviewDate: null,
    slug: "infrastructure",
  },
];

/** The organisation SSO directory: one connection part-way through the two activation
 *  gates (domain verified, IdP test not yet passed), so the admin area's status badges
 *  and the activation gate are both exercisable locally. */
export const mockOrganizations: Organization[] = [
  {
    allowLocal: false,
    connectionId: mockId("connection", 1),
    displayName: "Partner",
    domain: "partner.example.net",
    enabled: false,
    jitEnabled: true,
    orgName: "Partner Example",
    protocol: "saml",
    testPassed: false,
    verified: true,
  },
];

/** The platform's one SP (service-provider) signing certificate. */
export const mockSpCertificate: SpCertificate = {
  active: true,
  certPem: "-----BEGIN CERTIFICATE-----\nMOCK\n-----END CERTIFICATE-----",
  notAfter: "2027-01-01T00:00:00Z",
  serial: mockId("sp-cert", 1),
  spMetadataXml: "<EntityDescriptor/>",
};

/** IdP-group-claim-to-platform-group mappings, keyed by connection id. */
export const mockGroupMappings: Record<string, GroupMapping[]> = {
  [mockId("connection", 1)]: [
    {
      connectionId: mockId("connection", 1),
      id: mockId("group-mapping", 1),
      idpGroupClaimValue: "engineering",
      targetGroupId: mockId("group", 2),
    },
  ],
};

export const mockTemplates: Template[] = [
  { id: mockId("template", 1), name: "Standard policy" },
  { id: mockId("template", 2), name: "Procedure runbook" },
];

export const mockWorkflows: Workflow[] = [
  { id: mockId("workflow", 1), name: "Single approver" },
  { id: mockId("workflow", 2), name: "Security review board" },
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

/** The shared defaults every reader fixture starts from, before its own overrides. */
const readerDefaultsFor = (policy: Policy, n: number): PolicyDetail => ({
  ack:
    policy.documentType === DocumentType.Procedure
      ? null
      : { ackedAt: null, acknowledged: false, required: false },
  appendices: [],
  bodyText: `This is the current published text of ${policy.title}. It sets out what the organisation expects and who it applies to.`,
  canBreakGlass: false,
  category: policy.category,
  contacts: [],
  contentObfuscated: false,
  currentVersionId: mockId("policy-version", n),
  definitions: [],
  documentType: policy.documentType,
  history: [],
  id: policy.id,
  number: policy.number,
  ownerName: mockMe.name,
  priorVersion: null,
  published: policy.status === PolicyStatus.Published ? policy.updated : null,
  references: [],
  related: [],
  sensitivity: policy.sensitivity,
  status: policy.status,
  subcategory: policy.subcategory,
  title: policy.title,
  updated: policy.updated,
  version: policy.version,
});

/**
 * The reader's full detail for every row in `mockPolicies`, one entry each, covering the
 * states the reader has to render: an acknowledgement pending and one already given, a
 * sensitive document redacted and one not, every lifecycle status's history notice, and a
 * version with a diff against the one it superseded and one without (its first version).
 */
export const mockPolicyDetails: PolicyDetail[] = [
  {
    ...readerDefaultsFor(mockPolicies[0]!, 1),
    ack: { ackedAt: null, acknowledged: false, required: true },
    appendices: [
      {
        id: mockId("appendix", 1),
        letter: "A",
        text: "Per-diem rates by country, reviewed annually by Finance.",
        title: "Per-diem rates",
      },
    ],
    contacts: [
      {
        department: "Finance",
        email: "finance@example.org",
        hours: "Mon-Fri, 9am-5pm",
        id: mockId("contact", 1),
        label: "Expense queries",
        name: null,
        notes: null,
        phone: null,
        role: "Finance help desk",
      },
    ],
    definitions: [
      {
        definition: "A cost incurred for official organisation business, not personal use.",
        id: mockId("definition", 1),
        term: "Business expense",
      },
    ],
    history: [
      {
        actorName: mockMe.name,
        at: "2026-07-29T09:15:00Z",
        comment: null,
        kind: "submitted",
        stage: null,
        versionLabel: "2.0.0",
      },
      {
        actorName: mockMe.name,
        at: "2026-08-05T11:05:00Z",
        comment: "Looks right.",
        kind: "decided",
        stage: "Finance review",
        versionLabel: "2.0.0",
      },
      {
        actorName: mockMe.name,
        at: "2026-08-12T00:00:00Z",
        comment: null,
        kind: "published",
        stage: null,
        versionLabel: "2.0.0",
      },
    ],
    priorVersion: {
      diff: [
        {
          changeType: "modified",
          sectionKey: "per-diem",
          sectionTitle: "Per-diem rates",
          wordDiffHtml: "Rates were <del>USD-only</del> <ins>reviewed per country</ins>.",
        },
      ],
      version: "1.0.0",
    },
    references: [
      {
        body: null,
        clause: "4.2",
        id: mockId("reference", 1),
        kind: ReferenceKind.Standard,
        label: "ISO 37301",
        url: null,
      },
      {
        body: null,
        clause: null,
        id: mockId("reference", 2),
        kind: ReferenceKind.Link,
        label: "Travel booking portal",
        url: "https://example.org/travel",
      },
    ],
    related: [{ number: "PRC-HR-003", policyId: mockId("policy", 7), title: "Gift Disclosure" }],
  },
  {
    ...readerDefaultsFor(mockPolicies[1]!, 2),
    ack: { ackedAt: null, acknowledged: false, required: false },
    bodyText: "Sensitive content is hidden",
    canBreakGlass: true,
    contentObfuscated: true,
    history: [
      {
        actorName: mockMe.name,
        at: "2026-09-02T00:00:00Z",
        comment: null,
        kind: "submitted",
        stage: null,
        versionLabel: "1.0.0",
      },
    ],
  },
  {
    ...readerDefaultsFor(mockPolicies[2]!, 3),
    ack: { ackedAt: null, acknowledged: false, required: false },
    history: [
      {
        actorName: mockMe.name,
        at: "2026-09-13T14:30:00Z",
        comment: null,
        kind: "submitted",
        stage: null,
        versionLabel: "3.1.0",
      },
      {
        actorName: null,
        at: "2026-09-20T00:00:00Z",
        comment: null,
        kind: "inReview",
        stage: "Data Governance review",
        versionLabel: "3.1.0",
      },
    ],
  },
  {
    ...readerDefaultsFor(mockPolicies[3]!, 4),
    ack: { ackedAt: "2026-05-03T10:00:00Z", acknowledged: true, required: true },
    history: [
      {
        actorName: mockMe.name,
        at: "2026-04-20T09:15:00Z",
        comment: null,
        kind: "submitted",
        stage: null,
        versionLabel: "1.0.0",
      },
      {
        actorName: mockMe.name,
        at: "2026-05-01T00:00:00Z",
        comment: null,
        kind: "published",
        stage: null,
        versionLabel: "1.0.0",
      },
      {
        actorName: null,
        at: "2026-09-01T00:00:00Z",
        comment: "Replaced by the hybrid-work update.",
        kind: "superseded",
        stage: null,
        versionLabel: "1.0.0",
      },
    ],
  },
  {
    ...readerDefaultsFor(mockPolicies[4]!, 5),
    ack: { ackedAt: null, acknowledged: false, required: false },
    history: [
      {
        actorName: null,
        at: "2026-03-18T00:00:00Z",
        comment: "No longer needed; vendor onboarding moved to Procurement's own tool.",
        kind: "withdrawn",
        stage: null,
        versionLabel: "1.1.0",
      },
    ],
  },
  {
    ...readerDefaultsFor(mockPolicies[5]!, 6),
    history: [
      {
        actorName: mockMe.name,
        at: "2026-09-28T00:00:00Z",
        comment: null,
        kind: "published",
        stage: null,
        versionLabel: "4.0.0",
      },
    ],
  },
  {
    ...readerDefaultsFor(mockPolicies[6]!, 7),
    history: [
      {
        actorName: mockMe.name,
        at: "2026-06-25T09:15:00Z",
        comment: null,
        kind: "submitted",
        stage: null,
        versionLabel: "1.0.0",
      },
      {
        actorName: null,
        at: "2026-07-09T00:00:00Z",
        comment: "Needs the disclosure threshold spelled out.",
        kind: "changesRequested",
        stage: "Ethics review",
        versionLabel: "1.0.0",
      },
    ],
  },
];
