// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  Appendix,
  CaseNote,
  CaseNotice,
  Edge,
  Group,
  GroupMapping,
  Organization,
  Policy,
  PolicyVersion,
  ReportCase,
  RiskAssessment,
  ThreadMessage,
  User,
  UserDeletionPreview,
  WorkflowStatus,
} from "@steward-web/api-client";

import {
  AiJobPhase,
  ApprovalStatus,
  AssistOperation,
  BreachDecision,
  CaseStatus,
  DocumentType,
  GatewayError,
  MessageAuthor,
  NoticeRecipient,
  NoticeStatus,
  PolicyStatus,
  ReviewCadence,
  RiskSuggestion,
  SignalType,
} from "@steward-web/api-client";

import {
  mockAiConfig,
  mockAppendixLetter,
  mockAuditRecords,
  mockCategories,
  mockDiagnostics,
  mockGroupMappings,
  mockGroups,
  mockMe,
  mockOrganizations,
  mockPendingTasks,
  mockPolicies,
  mockPolicyDetails,
  mockPolicyVersions,
  mockReportCases,
  mockSessions,
  mockSpCertificate,
  mockTemplates,
  mockTemplateVersions,
  mockUpcomingApprovals,
  mockUserDeletionPreviews,
  mockUsers,
  mockWorkflows,
  mockWorkflowStatuses,
  nextMockAiJobId,
  nextMockAppendixId,
  nextMockCollabTokenId,
  nextMockPolicyId,
  nextMockPolicyVersionId,
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
let policies = [...mockPolicies];
let policyVersions = [...mockPolicyVersions];
let pendingTasks = [...mockPendingTasks];
let workflowStatuses = structuredClone(mockWorkflowStatuses);
let reportCases = structuredClone(mockReportCases);
let nextCaseNoteSeq = 2;
let nextCaseMessageSeq = 2;
let nextCaseNoticeSeq = 3;

/** How long a mock break-glass grant lasts, matching the real grant's order of magnitude. */
const BREAK_GLASS_GRANT_MS = 5 * 60 * 1000;

/** How long a mock collab token is valid, matching the real token's order of magnitude. */
const COLLAB_TOKEN_TTL_MS = 5 * 60 * 1000;

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

const requirePolicy = (operation: string, id: string): Policy => {
  const policy = policies.find((p) => p.id === id);
  if (!policy) throw new GatewayError(operation, `policy ${id} not found`, { code: "NOT_FOUND" });
  return policy;
};

const replacePolicy = (updated: Policy): Policy => {
  policies = policies.map((p) => (p.id === updated.id ? updated : p));
  return updated;
};

const replaceVersion = (updated: PolicyVersion): PolicyVersion => {
  policyVersions = policyVersions.map((v) => (v.id === updated.id ? updated : v));
  return updated;
};

const requireReportCase = (operation: string, caseId: string): ReportCase => {
  const found = reportCases.find((c) => c.id === caseId);
  if (!found) throw new GatewayError(operation, `case ${caseId} not found`, { code: "NOT_FOUND" });
  return found;
};

const replaceReportCase = (updated: ReportCase): ReportCase => {
  reportCases = reportCases.map((c) => (c.id === updated.id ? updated : c));
  return updated;
};

/** Adds `days` to an ISO `YYYY-MM-DD` date, as the real service would when a notice's
 *  deadline is set (or moved) from the case's discovery date. */
const addDaysISO = (dateIso: string, days: number): string => {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** The next unmet deadline across a case's notices, or null once every notice is sent or
 *  not needed — same shape as `CaseQueue.cases[].nextDeadline`. */
const nextDeadlineOf = (reportCase: ReportCase): null | string => {
  const open = reportCase.notices.filter(
    (n) => n.status !== NoticeStatus.Sent && n.status !== NoticeStatus.NotNeeded,
  );
  if (open.length === 0) return null;
  return open.map((n) => n.dueOn).toSorted()[0]!;
};

/** A one-line summary for the case queue: the reporter's own words, trimmed to a readable
 *  length — the mock's stand-in for whatever summarising the real service does. */
const caseSummaryOf = (reportCase: ReportCase): string => {
  const text = reportCase.details.whatHappened;
  return text.length > 96 ? `${text.slice(0, 95)}…` : text;
};

const DEFAULT_NOTICE_LABEL: Record<NoticeRecipient, string> = {
  AFFECTED_PEOPLE: "Affected people",
  MEDIA: "Media",
  OTHER: "Other",
  REGULATOR: "Regulator",
};

const DEFAULT_NOTICE_METHOD: Record<NoticeRecipient, string> = {
  AFFECTED_PEOPLE: "Email",
  MEDIA: "Press release",
  OTHER: "Letter",
  REGULATOR: "Letter",
};

/** Notice deadlines are counted from the discovery date; 60 days when none is set (the
 *  configured default — see the reporting service's notification tracker). */
const NOTICE_DAYS_ALLOWED = 60;

const requireDraftVersion = (operation: string, policyId: string): PolicyVersion => {
  const policy = requirePolicy(operation, policyId);
  const version = policy.currentDraftVersionId
    ? policyVersions.find((v) => v.id === policy.currentDraftVersionId)
    : undefined;
  if (!version) {
    throw new GatewayError(operation, `policy ${policyId} has no working draft`, {
      code: "NOT_FOUND",
    });
  }
  return version;
};

const requireVersion = (operation: string, policyVersionId: string): PolicyVersion => {
  const version = policyVersions.find((v) => v.id === policyVersionId);
  if (!version) {
    throw new GatewayError(operation, `policy version ${policyVersionId} not found`, {
      code: "NOT_FOUND",
    });
  }
  return version;
};

const requireAppendix = (
  operation: string,
  id: string,
): { appendix: Appendix; version: PolicyVersion } => {
  for (const version of policyVersions) {
    const appendix = version.appendices.find((a) => a.id === id);
    if (appendix) return { appendix, version };
  }
  throw new GatewayError(operation, `appendix ${id} not found`, { code: "NOT_FOUND" });
};

/** Parses a draft's `contentJson` (a JSON array of `{ sectionKey, title, text }`); an
 *  unparseable or absent value is treated as no sections, the safer outcome for the
 *  required-section gate below. */
const draftSections = (
  contentJson: string,
): { sectionKey: string; text: string; title: string }[] => {
  try {
    const parsed = JSON.parse(contentJson) as unknown;
    return Array.isArray(parsed)
      ? (parsed as { sectionKey: string; text: string; title: string }[])
      : [];
  } catch {
    return [];
  }
};

/** Titles of required template sections with no non-blank text yet, for `publishDraft`'s gate. */
const missingRequiredSections = (version: PolicyVersion): string[] => {
  if (!version.templateVersionId) return [];
  const templateVersion = mockTemplateVersions.find((t) => t.id === version.templateVersionId);
  if (!templateVersion) return [];
  const filled = new Set(
    draftSections(version.contentJson)
      .filter((s) => s.text.trim() !== "")
      .map((s) => s.sectionKey),
  );
  return templateVersion.sections
    .filter((s) => s.required && !filled.has(s.key))
    .map((s) => s.title);
};

interface MockAiJob {
  error: null | string;
  polls: number;
  resultJson: null | string;
}

// Every AI mutation below simulates the same async job framework: submit returns a jobId
// immediately, and the job "completes" after a couple of polls, so the editor's progress UI
// (queued -> running -> succeeded) has something real to show in mock mode.
const aiJobs = new Map<string, MockAiJob>();
const AI_JOB_POLLS_TO_SUCCEED = 2;

const aiJobPhase = (job: MockAiJob): AiJobPhase => {
  if (job.error) return AiJobPhase.AiJobPhaseFailed;
  if (job.polls === 0) return AiJobPhase.AiJobPhasePending;
  return job.polls < AI_JOB_POLLS_TO_SUCCEED
    ? AiJobPhase.AiJobPhaseRunning
    : AiJobPhase.AiJobPhaseSucceeded;
};

/** Matches the live gateway: no record for this version reads back as unspecified, not a refusal. */
const NO_WORKFLOW_STATUS: WorkflowStatus = {
  currentStageIdx: 0,
  runId: "",
  stageAssignees: [],
  stageNames: [],
  stageUnitProgress: [],
  status: ApprovalStatus.ApprovalStatusUnspecified,
};

/** Signals that require a non-empty comment, mirroring the workflow service's own gate. */
const SIGNALS_REQUIRING_COMMENT = new Set<SignalType>([
  SignalType.SignalTypeApprove,
  SignalType.SignalTypeReject,
]);

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
  addAppendix: async (policyVersionId, title, contentJson) => {
    const version = requireVersion("AddAppendix", policyVersionId);
    const orderIndex = version.appendices.length;
    const appendix: Appendix = {
      contentJson,
      id: nextMockAppendixId(),
      letter: mockAppendixLetter(orderIndex),
      orderIndex,
      policyVersionId,
      title,
    };
    replaceVersion({ ...version, appendices: [...version.appendices, appendix] });
    return appendix;
  },
  addCaseNote: async (caseId, body) => {
    const reportCase = requireReportCase("AddCaseNote", caseId);
    const note: CaseNote = {
      authorUserId: me.id,
      body,
      createdAt: new Date().toISOString(),
      id: mockId("case-note", nextCaseNoteSeq++),
    };
    replaceReportCase({ ...reportCase, notes: [...reportCase.notes, note] });
    return note;
  },
  addCaseNotice: async (caseId, recipient, label, method) => {
    const reportCase = requireReportCase("AddCaseNotice", caseId);
    const dueOn = addDaysISO(
      reportCase.discoveredOn ?? new Date().toISOString().slice(0, 10),
      NOTICE_DAYS_ALLOWED,
    );
    const notice: CaseNotice = {
      daysAllowed: NOTICE_DAYS_ALLOWED,
      dueOn,
      id: mockId("case-notice", nextCaseNoticeSeq++),
      label: label || DEFAULT_NOTICE_LABEL[recipient],
      method: method || DEFAULT_NOTICE_METHOD[recipient],
      recipient,
      sentOn: null,
      status: NoticeStatus.NotSent,
    };
    replaceReportCase({ ...reportCase, notices: [...reportCase.notices, notice] });
    return notice;
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
    const seq = nextConnectionSeq++;
    const created: Organization = {
      allowLocal: false,
      connectionAlias: mockId("connection-alias", seq),
      connectionId: mockId("connection", seq),
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
  aiHealth: () =>
    Promise.resolve(
      mockAiConfig.enabled
        ? { available: true, reason: null }
        : { available: false, reason: "disabled_by_admin" },
    ),
  aiJob: async (jobId) => {
    const job = aiJobs.get(jobId);
    if (!job) throw new GatewayError("AiJob", `AI job ${jobId} not found`, { code: "NOT_FOUND" });
    job.polls += 1;
    return {
      error: job.error,
      jobId,
      phase: aiJobPhase(job),
      resultRef: aiJobPhase(job) === AiJobPhase.AiJobPhaseSucceeded ? jobId : null,
    };
  },
  aiJobResultContent: async (resultRef) => {
    const job = aiJobs.get(resultRef);
    if (!job?.resultJson) {
      throw new GatewayError("AiJobResultContent", `no result for ${resultRef}`, {
        code: "NOT_FOUND",
      });
    }
    return { operation: "DRAFT", resultJson: job.resultJson };
  },
  assignCase: async (caseId, assigneeUserId) => {
    const reportCase = requireReportCase("AssignCase", caseId);
    return replaceReportCase({ ...reportCase, assigneeUserId: assigneeUserId ?? null });
  },
  auditLog: ({ actorUserId, groupId, pageSize, subject, tier } = {}) => {
    const filtered = mockAuditRecords
      .filter((r) => !tier || r.tier === tier)
      .filter((r) => !groupId || r.groupId === groupId)
      .filter((r) => !actorUserId || r.actorUserId === actorUserId)
      .filter((r) => !subject || r.subject.includes(subject));
    const records = pageSize == undefined ? filtered : filtered.slice(0, pageSize);
    return Promise.resolve({ nextPageToken: "", records });
  },
  authorableGroups: () => Promise.resolve(groups),
  authorableTemplates: () => Promise.resolve(mockTemplates),
  authoringAssist: async ({ editableContent, operation }) => {
    const suggestion =
      operation === AssistOperation.AssistOperationExpand
        ? `${editableContent} Expanded with additional context an author would review before keeping.`
        : operation === AssistOperation.AssistOperationSummarize
          ? `Summary: ${editableContent.slice(0, 120)}`
          : `Suggested text for this section, based on: ${editableContent || "(empty)"}`;
    return { operationId: nextMockAiJobId(), suggestion };
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
  closeCase: async (caseId, outcome, correctiveActions, closingMessage) => {
    const reportCase = requireReportCase("CloseCase", caseId);
    if (reportCase.status === CaseStatus.Closed) {
      throw new GatewayError("CloseCase", "this case is already closed", {
        code: "FAILED_PRECONDITION",
      });
    }
    const thread = closingMessage
      ? [
          ...reportCase.thread,
          {
            author: MessageAuthor.Officer,
            body: closingMessage,
            createdAt: new Date().toISOString(),
            id: mockId("case-message", nextCaseMessageSeq++),
            officerUserId: me.id,
          } satisfies ThreadMessage,
        ]
      : reportCase.thread;
    return replaceReportCase({
      ...reportCase,
      closedAt: new Date().toISOString(),
      correctiveActions: correctiveActions ? [...correctiveActions] : [],
      outcome,
      status: CaseStatus.Closed,
      thread,
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
  createPolicy: async ({ documentType, homeGroupId, sensitivity, templateId, title }) => {
    requireGroup("CreatePolicy", homeGroupId);
    const templateVersion = templateId
      ? mockTemplateVersions.find((t) => t.templateId === templateId)
      : undefined;
    const draftId = nextMockPolicyVersionId();
    const policyId = nextMockPolicyId();
    const sections = (templateVersion?.sections ?? [])
      .toSorted((a, b) => a.order - b.order)
      .map((s) => ({ sectionKey: s.key, text: "", title: s.title }));
    policyVersions = [
      ...policyVersions,
      {
        appendices: [],
        contentJson: JSON.stringify(sections),
        id: draftId,
        policyId,
        status: "DRAFT",
        templateVersionId: templateVersion?.id ?? "",
        versionNo: 1,
      },
    ];
    const created: Policy = {
      category: groups.find((g) => g.id === homeGroupId)?.name ?? "",
      currentDraftVersionId: draftId,
      currentPublishedVersionId: null,
      documentType: documentType ?? DocumentType.Policy,
      homeGroupId,
      id: policyId,
      number: `${documentType === DocumentType.Procedure ? "PRC" : "POL"}-NEW-${policyId.slice(-4)}`,
      ownerUserId: me.id,
      retiredAt: null,
      sensitivity,
      status: PolicyStatus.Draft,
      subcategory: "",
      templateId: templateId ?? null,
      templateNone: !templateId,
      title,
      updated: new Date().toISOString(),
      version: "0.0.0",
      viewerCan: {
        ack: false,
        approve: true,
        canBreakGlass: false,
        contentObfuscated: false,
        edit: true,
        read: true,
        submit: true,
      },
    };
    policies = [...policies, created];
    return created;
  },
  deleteAppendix: async (id) => {
    const { version } = requireAppendix("DeleteAppendix", id);
    replaceVersion({
      ...version,
      appendices: version.appendices
        .filter((a) => a.id !== id)
        .map((a, index) => ({ ...a, letter: mockAppendixLetter(index), orderIndex: index })),
    });
    return true;
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
    const revokedSessions = (sessions[userId] ?? []).filter((s) => s.active).length;
    sessions[userId] = (sessions[userId] ?? []).map((s) => ({ ...s, active: false }));
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
  discardDraft: async (policyId) => {
    const policy = requirePolicy("DiscardDraft", policyId);
    if (!policy.currentDraftVersionId) return true;
    policyVersions = policyVersions.filter((v) => v.id !== policy.currentDraftVersionId);
    replacePolicy({ ...policy, currentDraftVersionId: null });
    return true;
  },
  draftVersion: (policyId) => {
    const policy = policies.find((p) => p.id === policyId);
    const version = policy?.currentDraftVersionId
      ? policyVersions.find((v) => v.id === policy.currentDraftVersionId)
      : undefined;
    return Promise.resolve(version ?? null);
  },

  enableUser: async (userId) => {
    const user = requireUser("EnableUser", userId);
    return replaceUser({ ...user, enabled: true });
  },
  fetchIdpCert: () =>
    Promise.resolve("-----BEGIN CERTIFICATE-----\nMOCK-IDP-CERT\n-----END CERTIFICATE-----"),
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
  importIdpMetadata: () =>
    Promise.resolve({
      displayName: "Mock IdP",
      entityId: "https://idp.mock.example/metadata",
      signingCertificate: "-----BEGIN CERTIFICATE-----\nMOCK-IDP-CERT\n-----END CERTIFICATE-----",
      ssoUrl: "https://idp.mock.example/sso",
    }),
  issueCollabToken: async ({ draftId, policyId }) => {
    const policy = requirePolicy("IssueCollabToken", policyId);
    if (!policy.viewerCan.edit) {
      throw new GatewayError("IssueCollabToken", "edit access to this draft is required", {
        code: "PERMISSION_DENIED",
      });
    }
    // Matches the real gateway's wsUrl shape (steward-collab's WsPathPrefix), so the
    // provider's url-resolution code exercises the same path in mock mode as in a live
    // deployment. No relay actually answers at this path in mock mode: the session degrades
    // to `unavailable` on the failed connect, and authoring continues through the normal
    // save path.
    return {
      expiresAt: new Date(Date.now() + COLLAB_TOKEN_TTL_MS).toISOString(),
      token: nextMockCollabTokenId(),
      wsUrl: `/collab/ws/${encodeURIComponent(draftId)}`,
    };
  },
  latestTemplateVersion: (templateId) =>
    Promise.resolve(mockTemplateVersions.find((t) => t.templateId === templateId) ?? null),
  listUserSessions: (userId) => Promise.resolve(sessions[userId] ?? []),
  me: () => Promise.resolve(me),
  mintSsoTestLink: async (input) => {
    if (!organizations.some((o) => o.connectionId === input.connectionId)) {
      throw new GatewayError("MintSsoTestLink", `connection ${input.connectionId} not found`, {
        code: "NOT_FOUND",
      });
    }
    return {
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
      url: `https://gateway.mock.example/auth/sso/start?connection=${encodeURIComponent(
        input.alias,
      )}&mode=test&testToken=${mockId("sso-test-token", 1)}`,
    };
  },
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
  myDraftPolicies: () =>
    Promise.resolve(
      policies
        .filter((p) => p.ownerUserId === me.id && p.currentDraftVersionId)
        .toSorted((a, b) => (b.updated ?? "").localeCompare(a.updated ?? "")),
    ),
  organizations: () => Promise.resolve(organizations),
  parseIdpMetadata: () =>
    Promise.resolve({
      displayName: "Mock IdP",
      entityId: "https://idp.mock.example/metadata",
      signingCertificate: "-----BEGIN CERTIFICATE-----\nMOCK-IDP-CERT\n-----END CERTIFICATE-----",
      ssoUrl: "https://idp.mock.example/sso",
    }),
  pendingTasks: () => Promise.resolve(pendingTasks),
  policies: (documentType) =>
    Promise.resolve(policies.filter((p) => p.documentType === documentType)),
  policy: (id) => Promise.resolve(policies.find((p) => p.id === id) ?? null),
  policyDetail: (documentType, number) =>
    Promise.resolve(
      policyDetails.find((d) => d.documentType === documentType && d.number === number) ?? null,
    ),
  postCaseMessage: async (caseId, body) => {
    const reportCase = requireReportCase("PostCaseMessage", caseId);
    const message: ThreadMessage = {
      author: MessageAuthor.Officer,
      body,
      createdAt: new Date().toISOString(),
      id: mockId("case-message", nextCaseMessageSeq++),
      officerUserId: me.id,
    };
    replaceReportCase({ ...reportCase, thread: [...reportCase.thread, message] });
    return message;
  },
  previewUserDeletion: async (userId) => {
    const user = requireUser("PreviewUserDeletion", userId);
    const fallback: UserDeletionPreview = {
      blocksDelete: false,
      counts: {
        breakGlassGrants: 0,
        groupMemberships: 0,
        idpGroups: 0,
        managedGroups: 0,
        ownedPolicies: 0,
        pendingApprovals: 0,
        permissions: 0,
        policyOverrides: 0,
        raciGrants: 0,
        roles: 0,
      },
      items: [],
      locallyAuthenticable: user.localAccount,
      userId,
      warnings: [],
    };
    return mockUserDeletionPreviews[userId] ?? fallback;
  },
  publishDraft: async (policyId) => {
    const policy = requirePolicy("PublishDraft", policyId);
    const draft = requireDraftVersion("PublishDraft", policyId);
    const missing = missingRequiredSections(draft);
    if (missing.length > 0) {
      throw new GatewayError(
        "PublishDraft",
        `required sections are still empty: ${missing.join(", ")}`,
        { code: "FAILED_PRECONDITION" },
      );
    }
    const published = replaceVersion({ ...draft, status: "PUBLISHED" });
    replacePolicy({
      ...policy,
      currentDraftVersionId: null,
      currentPublishedVersionId: published.id,
      status: PolicyStatus.Published,
      updated: new Date().toISOString(),
    });
    return published;
  },
  recordRiskAssessment: async (caseId, factors, decision, reason) => {
    const reportCase = requireReportCase("RecordRiskAssessment", caseId);
    // The real suggestion weighs several factors; this mock approximates it from the
    // officer's own decision so the UI has something to render, not a faithful rule engine.
    const suggestion =
      decision === BreachDecision.Reportable
        ? RiskSuggestion.NotificationLikelyRequired
        : RiskSuggestion.LowProbabilityOfCompromise;
    const assessment: RiskAssessment = {
      decidedAt: new Date().toISOString(),
      decidedByUserId: me.id,
      decision,
      factors: { ...factors },
      reason,
      suggestion,
    };
    // Design rule: a reportable decision moves the case to "Notification due"; not
    // reportable moves it back to "In review".
    replaceReportCase({
      ...reportCase,
      assessment,
      status:
        decision === BreachDecision.Reportable ? CaseStatus.NotificationDue : CaseStatus.InReview,
    });
    return assessment;
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
  reorderAppendices: async (policyVersionId, orderedIds) => {
    const version = requireVersion("ReorderAppendices", policyVersionId);
    const byId = new Map(version.appendices.map((a) => [a.id, a]));
    const reordered = orderedIds.map((id, index) => {
      const appendix = byId.get(id);
      if (!appendix) {
        throw new GatewayError("ReorderAppendices", `appendix ${id} not found`, {
          code: "NOT_FOUND",
        });
      }
      return { ...appendix, letter: mockAppendixLetter(index), orderIndex: index };
    });
    replaceVersion({ ...version, appendices: reordered });
    return reordered;
  },
  reportCase: async (caseId) => requireReportCase("ReportCase", caseId),
  reportCases: (statuses, assigneeUserId) => {
    const filtered = reportCases.filter(
      (c) =>
        (!statuses || statuses.includes(c.status)) &&
        (!assigneeUserId || c.assigneeUserId === assigneeUserId),
    );
    const counts = Object.values(CaseStatus).map((status) => ({
      count: reportCases.filter((c) => c.status === status).length,
      status,
    }));
    return Promise.resolve({
      cases: filtered.map((c) => ({
        assigneeUserId: c.assigneeUserId,
        caseCode: c.caseCode,
        id: c.id,
        kind: c.kind,
        nextDeadline: nextDeadlineOf(c),
        receivedAt: c.receivedAt,
        status: c.status,
        summary: caseSummaryOf(c),
      })),
      counts,
    });
  },
  revokeRole: async (userId, role) => {
    const user = requireUser("RevokeRole", userId);
    return replaceUser({ ...user, roles: user.roles.filter((r) => r !== role) });
  },
  revokeUserSessions: async (userId, reason) => {
    const current = sessions[userId] ?? [];
    sessions[userId] = current.map((s) => ({ ...s, active: false }));
    void reason; // the mock audits nothing; the live gateway records it
    return current.filter((s) => s.active).length;
  },
  saveDraft: async (policyId, contentJson, templateVersionId) => {
    const policy = requirePolicy("SaveDraft", policyId);
    const existing = policy.currentDraftVersionId
      ? policyVersions.find((v) => v.id === policy.currentDraftVersionId)
      : undefined;
    if (existing) {
      return replaceVersion({
        ...existing,
        contentJson,
        templateVersionId: templateVersionId ?? "",
      });
    }
    const created: PolicyVersion = {
      appendices: [],
      contentJson,
      id: nextMockPolicyVersionId(),
      policyId,
      status: "DRAFT",
      templateVersionId: templateVersionId ?? "",
      versionNo: 1,
    };
    policyVersions = [...policyVersions, created];
    replacePolicy({ ...policy, currentDraftVersionId: created.id });
    return created;
  },
  setCaseDiscoveryDate: async (caseId, discoveredOn) => {
    const reportCase = requireReportCase("SetCaseDiscoveryDate", caseId);
    return replaceReportCase({ ...reportCase, discoveredOn });
  },
  setCaseStatus: async (caseId, status) => {
    const reportCase = requireReportCase("SetCaseStatus", caseId);
    if (status === CaseStatus.Closed) {
      throw new GatewayError("SetCaseStatus", "closing goes through closeCase", {
        code: "INVALID_ARGUMENT",
      });
    }
    return replaceReportCase({ ...reportCase, status });
  },
  signalWorkflow: async (policyVersionId, runId, taskId, signal, comment) => {
    if (SIGNALS_REQUIRING_COMMENT.has(signal) && comment.trim() === "") {
      throw new GatewayError("SignalWorkflow", "a comment is required for this decision", {
        code: "INVALID_ARGUMENT",
      });
    }
    const status = workflowStatuses[policyVersionId];
    if (!status) {
      // Matches the live gateway: a stale cached inbox row refuses, it never 404s.
      throw new GatewayError("SignalWorkflow", "refresh your inbox", {
        code: "FAILED_PRECONDITION",
      });
    }
    void runId; // advisory only; policyVersionId resolves the run, as the live gateway does
    const decidedAt = new Date().toISOString();
    const decidedState = signal === SignalType.SignalTypeApprove ? "approved" : "rejected";
    const stageAssignees = status.stageAssignees.map((stage, index) =>
      index === status.currentStageIdx
        ? stage.map((assignee) =>
            assignee.userId === mockMe.id
              ? { ...assignee, comment, decidedAt, state: decidedState }
              : assignee,
          )
        : stage,
    );
    workflowStatuses = { ...workflowStatuses, [policyVersionId]: { ...status, stageAssignees } };
    pendingTasks = pendingTasks.filter((t) => t.taskId !== taskId);
    return true;
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
  submitDraftGeneration: async ({ brief, sections }) => {
    const jobId = nextMockAiJobId();
    const content = sections
      .toSorted((a, b) => a.order - b.order)
      .map((s) => ({
        sectionKey: s.key,
        text: `Drafted from the brief: ${brief}`,
      }));
    aiJobs.set(jobId, {
      error: null,
      polls: 0,
      resultJson: JSON.stringify({ sections: content }),
    });
    return { jobId };
  },
  submitPolicyReview: async ({ sections }) => {
    const jobId = nextMockAiJobId();
    const findings = sections.map((s) => ({
      finding:
        s.content.trim() === ""
          ? "This section has no content yet."
          : "Looks consistent with the rest of the draft.",
      sectionKey: s.key,
      severity: s.content.trim() === "" ? "warning" : "note",
      suggestion: s.content.trim() === "" ? `Add content for ${s.title}.` : "",
    }));
    aiJobs.set(jobId, { error: null, polls: 0, resultJson: JSON.stringify({ findings }) });
    return { jobId };
  },
  templates: () => Promise.resolve(mockTemplates),
  upcomingApprovals: () => Promise.resolve(mockUpcomingApprovals),
  updateAppendix: async (id, title, contentJson) => {
    const { version } = requireAppendix("UpdateAppendix", id);
    const updated = { ...version.appendices.find((a) => a.id === id)!, contentJson, title };
    replaceVersion({
      ...version,
      appendices: version.appendices.map((a) => (a.id === id ? updated : a)),
    });
    return updated;
  },
  updateCaseNotice: async (caseId, noticeId, status, sentOn) => {
    const reportCase = requireReportCase("UpdateCaseNotice", caseId);
    const notice = reportCase.notices.find((n) => n.id === noticeId);
    if (!notice) {
      throw new GatewayError("UpdateCaseNotice", `notice ${noticeId} not found`, {
        code: "NOT_FOUND",
      });
    }
    if (status === NoticeStatus.Sent && !sentOn) {
      throw new GatewayError("UpdateCaseNotice", "sentOn is required with SENT", {
        code: "INVALID_ARGUMENT",
      });
    }
    const updated: CaseNotice = { ...notice, sentOn: sentOn ?? notice.sentOn, status };
    replaceReportCase({
      ...reportCase,
      notices: reportCase.notices.map((n) => (n.id === noticeId ? updated : n)),
    });
    return updated;
  },
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
  verifyAuditChain: async (fromRecordId, toRecordId) => {
    const byId = new Map(mockAuditRecords.map((r) => [r.id, r]));
    if (!byId.has(fromRecordId) || !byId.has(toRecordId)) {
      throw new GatewayError("VerifyAuditChain", "unknown record id", { code: "NOT_FOUND" });
    }
    const lo = Math.min(Number(fromRecordId), Number(toRecordId));
    const hi = Math.max(Number(fromRecordId), Number(toRecordId));
    const segment = mockAuditRecords
      .filter((r) => Number(r.id) >= lo && Number(r.id) <= hi)
      .toSorted((a, b) => Number(a.id) - Number(b.id));
    const errors = segment
      .slice(1)
      .filter((record, index) => record.prevHash !== segment[index]!.recordHash)
      .map((record) => `record ${record.id} does not chain from its predecessor`);
    return { errors, recordsChecked: segment.length, valid: errors.length === 0 };
  },
  verifyDomain: async (domain) => {
    const org = requireOrganization("VerifyDomain", domain);
    return replaceOrganization({ ...org, verified: true });
  },
  workflows: () => Promise.resolve(mockWorkflows),
  workflowStatus: (policyVersionId) =>
    Promise.resolve(workflowStatuses[policyVersionId] ?? NO_WORKFLOW_STATUS),
};

export default mockEdge;
