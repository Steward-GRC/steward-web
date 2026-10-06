// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  ApprovalStatus,
  type AuditRecord,
  BreachDecision,
  CaseStatus,
  type Category,
  ComponentStatus,
  DeletionItemKind,
  type Diagnostics,
  DocumentType,
  type Group,
  type GroupMapping,
  InformationKind,
  type Me,
  MessageAuthor,
  NoticeRecipient,
  NoticeStatus,
  type Organization,
  type PendingTask,
  type Policy,
  type PolicyDetail,
  PolicyStatus,
  type PolicyVersion,
  ReferenceKind,
  ReportAnswer,
  type ReportCase,
  ReportKind,
  ReviewCadence,
  RiskMitigation,
  RiskRecipient,
  RiskSuggestion,
  RiskViewed,
  Sensitivity,
  type Session,
  type SpCertificate,
  type Template,
  type TemplateVersion,
  type UpcomingApproval,
  type User,
  type UserDeletionPreview,
  type Workflow,
  type WorkflowStatus,
} from "@steward-web/api-client";
import { permissionsForRoles } from "@steward-web/auth";
import {
  emptyParagraph,
  paragraphsFromText,
  type SerializedNode,
  serializeDocument,
  wrapRoot,
} from "@steward-web/editor-steward/document";

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
    deletedAt: null,
    email: mockMe.email,
    enabled: true,
    firstName: mockMe.firstName,
    idpGroups: [],
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
    deletedAt: null,
    email: "grace.hopper@example.com",
    enabled: true,
    firstName: "Grace",
    idpGroups: ["platform-engineering"],
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
    deletedAt: null,
    email: "ada.lovelace@example.com",
    enabled: true,
    firstName: "Ada",
    idpGroups: [],
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
    deletedAt: null,
    email: "margaret.hamilton@example.com",
    enabled: false,
    firstName: "Margaret",
    idpGroups: ["contractors"],
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
    deletedAt: "2025-11-02T09:00:00Z",
    email: "katherine.johnson@example.com",
    enabled: false,
    firstName: "Katherine",
    idpGroups: [],
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
    deletedAt: "2025-10-20T14:00:00Z",
    email: "hedy.lamarr@example.com",
    enabled: false,
    firstName: "Hedy",
    idpGroups: [],
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
      active: true,
      authenticatedAt: "2026-01-01T08:00:00Z",
      clientIp: "203.0.113.42",
      expiresAt: "2026-01-02T00:00:00Z",
      issuedAt: "2026-01-01T08:00:00Z",
      sessionId: mockId("session", 1),
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      userId: mockId("user", 3),
    },
  ],
};

/** Deletion previews keyed by userId. Ada (who owns a pending approval in this fixture set)
 *  demonstrates the blocked path; everyone else previews clean. */
export const mockUserDeletionPreviews: Record<string, UserDeletionPreview> = {
  [mockId("user", 3)]: {
    blocksDelete: true,
    counts: {
      breakGlassGrants: 0,
      groupMemberships: 0,
      idpGroups: 0,
      managedGroups: 0,
      ownedPolicies: 0,
      pendingApprovals: 1,
      permissions: 1,
      policyOverrides: 0,
      raciGrants: 0,
      roles: 1,
    },
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
    connectionAlias: mockId("connection-alias", 1),
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
/** The fields every library fixture shares once authoring (viewerCan, the backend-id fields)
 *  extended `Policy`; `rawPolicies` below only states what actually varies row to row.
 *  `homeGroupId` points at the root group — this fixture set predates the admin group
 *  directory and doesn't attempt to line up categories with groups 1:1. */
const authoringDefaultsFor = (
  policy: { canBreakGlass?: boolean; contentObfuscated?: boolean } & Pick<Policy, "id" | "status">,
  n: number,
): Pick<
  Policy,
  | "currentDraftVersionId"
  | "currentPublishedVersionId"
  | "homeGroupId"
  | "ownerUserId"
  | "retiredAt"
  | "templateId"
  | "templateNone"
  | "viewerCan"
> => ({
  currentDraftVersionId: policy.status === PolicyStatus.Draft ? mockId("policy-version", n) : null,
  currentPublishedVersionId:
    policy.status === PolicyStatus.Draft ? null : mockId("policy-version", n),
  homeGroupId: mockGroups[0]!.id,
  ownerUserId: mockMe.id,
  retiredAt: null,
  templateId: null,
  templateNone: true,
  viewerCan: {
    ack: true,
    approve: true,
    canBreakGlass: policy.canBreakGlass ?? false,
    contentObfuscated: policy.contentObfuscated ?? false,
    edit: true,
    read: true,
    submit: true,
  },
});

type RawPolicy = Omit<
  Policy,
  | "currentDraftVersionId"
  | "currentPublishedVersionId"
  | "homeGroupId"
  | "ownerUserId"
  | "retiredAt"
  | "templateId"
  | "templateNone"
  | "viewerCan"
>;

const rawPolicies: RawPolicy[] = [
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

/** Index among `rawPolicies` (1-based, matching `mockId("policy", n)`) that is sensitive and
 *  currently redacted, exercising the break-glass path the reader fixtures already cover. */
const REDACTED_POLICY_SEQ = 2;

export const mockPolicies: Policy[] = rawPolicies.map((p, index) => ({
  ...p,
  ...authoringDefaultsFor(
    {
      canBreakGlass: index + 1 === REDACTED_POLICY_SEQ,
      contentObfuscated: index + 1 === REDACTED_POLICY_SEQ,
      id: p.id,
      status: p.status,
    },
    index + 1,
  ),
}));

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

/** Each template's current (newest) version outline, for the "new policy" scaffold and the
 *  editor's required-section gate. */
export const mockTemplateVersions: TemplateVersion[] = [
  {
    id: mockId("template-version", 1),
    sections: [
      { key: "purpose", level: 1, order: 0, required: true, title: "Purpose" },
      { key: "scope", level: 1, order: 1, required: true, title: "Scope" },
      { key: "policy-statement", level: 1, order: 2, required: true, title: "Policy statement" },
    ],
    templateId: mockId("template", 1),
    versionNo: 1,
  },
  {
    id: mockId("template-version", 2),
    sections: [
      { key: "steps", level: 1, order: 0, required: true, title: "Steps" },
      { key: "rollback", level: 1, order: 1, required: false, title: "Rollback" },
    ],
    templateId: mockId("template", 2),
    versionNo: 1,
  },
];

/** The working draft for POL-ITSEC-004 (`mockPolicies[1]`, the one DRAFT-status fixture row):
 *  a freeform draft with one section filled and an appendix, for the editor to open. Its
 *  content is a Lexical editor state, a heading per section. */
const heading = (title: string): SerializedNode => ({
  children: [
    { detail: 0, format: 0, mode: "normal", style: "", text: title, type: "text", version: 1 },
  ],
  direction: null,
  format: "",
  indent: 0,
  tag: "h1",
  type: "heading",
  version: 1,
});

export const mockPolicyVersions: PolicyVersion[] = [
  {
    appendices: [
      {
        contentJson: JSON.stringify({ text: "Reviewed annually by IT Security." }),
        id: mockId("appendix", 2),
        letter: "A",
        orderIndex: 0,
        policyVersionId: mockId("policy-version", 2),
        title: "Review notes",
      },
    ],
    contentJson: serializeDocument(
      wrapRoot([
        heading("Purpose"),
        ...paragraphsFromText("This policy sets out how organisation-owned systems may be used."),
        heading("Scope"),
        emptyParagraph(),
      ]),
    ),
    id: mockId("policy-version", 2),
    policyId: mockId("policy", 2),
    status: "DRAFT",
    templateVersionId: "",
    versionNo: 1,
  },
];

let nextAppendixSeq = 3;
let nextPolicyVersionSeq = 100;
let nextPolicySeq = 100;
let nextAiJobSeq = 1;
let nextCollabTokenSeq = 1;

/** Mutable fixture-state helpers: kept here (not in `edge.server.ts`) so a test can seed or
 *  reset them directly, the same way `mockPolicies`/`mockPolicyDetails` are consumed. */
export const nextMockAppendixId = (): string => mockId("appendix", nextAppendixSeq++);
export const nextMockPolicyVersionId = (): string =>
  mockId("policy-version", nextPolicyVersionSeq++);
export const nextMockPolicyId = (): string => mockId("policy", nextPolicySeq++);
export const nextMockAiJobId = (): string => mockId("ai-job", nextAiJobSeq++);
export const nextMockCollabTokenId = (): string => mockId("collab-token", nextCollabTokenSeq++);

export const mockAppendixLetter = (orderIndex: number): string =>
  String.fromCodePoint(65 + orderIndex);

/** Starting config for the mock AI module: on, no admin kill switch engaged. */
export interface MockAiConfig {
  enabled: boolean;
}

export const mockAiConfig: MockAiConfig = { enabled: true };

/** A record's hash: not cryptographic, just enough that a broken link in the chain (if a
 *  record were edited in place) would visibly fail to match. */
const AUDIT_HASH_MULTIPLIER = 2_654_435_769; // 0x9e3779b9, the golden-ratio hash constant
const auditHash = (seed: number): string =>
  (seed * AUDIT_HASH_MULTIPLIER).toString(16).padStart(16, "0");

type AuditSeed = Omit<AuditRecord, "id" | "prevHash" | "recordHash" | "recordUuid">;

// Oldest first; ids/hashes are assigned below in this order, then the array is reversed so
// queryAudit-style callers see newest first, matching the real gateway's ordering.
const AUDIT_SEEDS: AuditSeed[] = [
  {
    action: "group.created",
    actorName: mockMe.name,
    actorUserId: mockMe.id,
    groupId: mockId("group", 1),
    groupName: "Meridian Holdings",
    legalBasisExempt: false,
    occurredAt: "2026-01-05T09:00:00Z",
    subject: `group:${mockId("group", 1)}`,
    subjectLabel: "Meridian Holdings",
    tier: "audit",
  },
  {
    action: "group.created",
    actorName: mockMe.name,
    actorUserId: mockMe.id,
    groupId: mockId("group", 2),
    groupName: "IT Security",
    legalBasisExempt: false,
    occurredAt: "2026-01-06T10:30:00Z",
    subject: `group:${mockId("group", 2)}`,
    subjectLabel: "IT Security",
    tier: "audit",
  },
  {
    action: "role.granted",
    actorName: mockMe.name,
    actorUserId: mockMe.id,
    groupId: mockId("group", 1),
    groupName: "Meridian Holdings",
    legalBasisExempt: false,
    occurredAt: "2026-01-10T14:05:00Z",
    subject: `user:${mockId("user", 3)}`,
    // Unresolved on purpose: exercises the UI's fallback to the raw id when the server
    // can't (or hasn't yet) enriched a label.
    subjectLabel: null,
    tier: "audit",
  },
  {
    action: "session.login",
    actorName: "Ada Lovelace",
    actorUserId: mockId("user", 3),
    groupId: mockId("group", 1),
    groupName: "Meridian Holdings",
    legalBasisExempt: false,
    occurredAt: "2026-01-11T08:00:00Z",
    subject: `user:${mockId("user", 3)}`,
    subjectLabel: "Ada Lovelace",
    tier: "activity",
  },
  {
    action: "user.disabled",
    actorName: "Ada Lovelace",
    actorUserId: mockId("user", 3),
    groupId: mockId("group", 2),
    groupName: "IT Security",
    legalBasisExempt: false,
    occurredAt: "2026-02-01T16:45:00Z",
    subject: `user:${mockId("user", 4)}`,
    subjectLabel: "Margaret Hamilton",
    tier: "audit",
  },
  {
    action: "session.revoked",
    actorName: "Ada Lovelace",
    actorUserId: mockId("user", 3),
    groupId: mockId("group", 2),
    groupName: "IT Security",
    legalBasisExempt: false,
    occurredAt: "2026-02-01T16:46:00Z",
    subject: `user:${mockId("user", 4)}`,
    subjectLabel: "Margaret Hamilton",
    tier: "audit",
  },
  {
    action: "policy.published",
    actorName: mockMe.name,
    actorUserId: mockMe.id,
    groupId: mockId("group", 2),
    groupName: "IT Security",
    legalBasisExempt: false,
    occurredAt: "2026-03-15T11:20:00Z",
    subject: mockPolicies[2]?.id ?? "policy:unknown",
    subjectLabel: mockPolicies[2]?.title ?? null,
    tier: "audit",
  },
  {
    action: "organization.activated",
    actorName: mockMe.name,
    actorUserId: mockMe.id,
    groupId: mockId("group", 1),
    groupName: "Meridian Holdings",
    legalBasisExempt: false,
    occurredAt: "2026-04-02T13:00:00Z",
    subject: "organization:partner.example.net",
    subjectLabel: "Partner Example",
    tier: "audit",
  },
];

export const mockAuditRecords: AuditRecord[] = AUDIT_SEEDS.map((seed, index) => ({
  ...seed,
  id: String(index + 1),
  prevHash: index === 0 ? "0".repeat(16) : auditHash(index - 1),
  recordHash: auditHash(index),
  recordUuid: mockId("audit-record", index + 1),
})).toReversed();

/**
 * The approval run backing `mockPolicies[2]` (POL-ITSEC-011, status IN_REVIEW): a single
 * stage awaiting the signed-in persona's decision, matching that policy's own
 * `mockPolicyDetails` history entry ("Data Governance review").
 */
const MOCK_APPROVAL_RUN_ID = mockId("workflow-run", 1);
const MOCK_APPROVAL_STAGE_NAME = "Data Governance review";
const MOCK_APPROVAL_POLICY_VERSION_ID = mockId("policy-version", 3);

export const mockWorkflowStatuses: Record<string, WorkflowStatus> = {
  [MOCK_APPROVAL_POLICY_VERSION_ID]: {
    currentStageIdx: 0,
    runId: MOCK_APPROVAL_RUN_ID,
    stageAssignees: [
      [{ comment: null, decidedAt: null, name: mockMe.name, state: "pending", userId: mockMe.id }],
    ],
    stageNames: [MOCK_APPROVAL_STAGE_NAME],
    stageUnitProgress: [[]],
    status: ApprovalStatus.ApprovalStatusInReview,
  },
};

export const mockPendingTasks: PendingTask[] = [
  {
    dueAt: null,
    policyTitle: "Data Classification",
    policyVersionId: MOCK_APPROVAL_POLICY_VERSION_ID,
    runId: MOCK_APPROVAL_RUN_ID,
    stageIndex: 0,
    taskId: mockId("approval-task", 1),
  },
];

/** No future-stage approvals in the fixture set: the "coming to you" section stays empty. */
export const mockUpcomingApprovals: UpcomingApproval[] = [];

/**
 * Three cases spanning the queue's statuses: a fresh anonymous report with nothing recorded
 * yet, a named report an officer is actively working (thread, note, assignee), and a case
 * that has been through the risk assessment with notices now tracking the notification
 * deadlines. Officer actions (post message, add note, assign, change status, record the
 * assessment, add/update a notice, close) mutate these in place for the lifetime of the mock
 * process, the way the live gateway would.
 */
export const mockReportCases: ReportCase[] = [
  {
    assigneeUserId: null,
    attachments: [],
    caseCode: mockId("case-code", 1),
    closedAt: null,
    correctiveActions: [],
    details: {
      informationKinds: [InformationKind.Contact],
      location: "Finance, 3rd floor",
      occurred: "yesterday afternoon",
      stillHappening: ReportAnswer.NotSure,
      whatHappened: "A shared drive folder with client contact lists looked open to everyone.",
    },
    discoveredOn: null,
    id: mockId("case", 1),
    kind: ReportKind.Anonymous,
    notes: [],
    notices: [],
    outcome: null,
    receivedAt: "2026-04-01T09:00:00Z",
    reporterUserId: null,
    status: CaseStatus.New,
    thread: [],
  },
  {
    assigneeUserId: mockMe.id,
    attachments: [],
    caseCode: mockId("case-code", 2),
    closedAt: null,
    correctiveActions: [],
    details: {
      informationKinds: [InformationKind.Health],
      location: "HR office",
      occurred: "this morning",
      stillHappening: ReportAnswer.No,
      whatHappened:
        "An email with an employee's medical leave details was sent to the whole team by mistake.",
    },
    discoveredOn: "2026-04-05",
    id: mockId("case", 2),
    kind: ReportKind.Named,
    notes: [
      {
        authorUserId: mockMe.id,
        body: "Confirmed the email reached 14 people; asking IT whether it can still be recalled.",
        createdAt: "2026-04-05T10:05:00Z",
        id: mockId("case-note", 1),
      },
    ],
    notices: [],
    outcome: null,
    receivedAt: "2026-04-05T09:40:00Z",
    reporterUserId: mockUsers[1]?.userId ?? mockId("user", 2),
    status: CaseStatus.InReview,
    thread: [
      {
        author: MessageAuthor.Officer,
        body: "Thank you for the report. Could you tell us roughly how many people received the email?",
        createdAt: "2026-04-05T10:00:00Z",
        id: mockId("case-message", 1),
        officerUserId: mockMe.id,
      },
    ],
  },
  {
    assessment: {
      decidedAt: "2026-03-21T11:00:00Z",
      decidedByUserId: mockMe.id,
      decision: BreachDecision.Reportable,
      factors: {
        information: [InformationKind.Financial, InformationKind.Contact],
        mitigation: RiskMitigation.NotAtAll,
        recipient: RiskRecipient.UnknownPeople,
        viewed: RiskViewed.Probably,
      },
      reason: "The laptop was unencrypted and not recovered; a vendor payment list is sensitive.",
      suggestion: RiskSuggestion.NotificationLikelyRequired,
    },
    assigneeUserId: mockMe.id,
    attachments: [],
    caseCode: mockId("case-code", 3),
    closedAt: null,
    correctiveActions: [],
    details: {
      informationKinds: [InformationKind.Financial, InformationKind.Contact],
      location: "Remote — a lost laptop",
      occurred: "last week",
      stillHappening: ReportAnswer.No,
      whatHappened: "An unencrypted laptop holding a vendor payment list was lost in transit.",
    },
    discoveredOn: "2026-03-20",
    id: mockId("case", 3),
    kind: ReportKind.Anonymous,
    notes: [],
    notices: [
      {
        daysAllowed: 60,
        dueOn: "2026-05-19",
        id: mockId("case-notice", 1),
        label: "Affected people",
        method: "Email",
        recipient: NoticeRecipient.AffectedPeople,
        sentOn: null,
        status: NoticeStatus.NotSent,
      },
      {
        daysAllowed: 60,
        dueOn: "2026-05-19",
        id: mockId("case-notice", 2),
        label: "Regulator",
        method: "Letter",
        recipient: NoticeRecipient.Regulator,
        sentOn: null,
        status: NoticeStatus.Draft,
      },
    ],
    outcome: null,
    receivedAt: "2026-03-20T14:00:00Z",
    reporterUserId: null,
    status: CaseStatus.NotificationDue,
    thread: [],
  },
];
