// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AckExport,
  AckRoster,
  AckRosterEntry,
  Appendix,
  CaseNote,
  CaseNotice,
  CompletionReport,
  ContactBlock,
  DefinitionEntry,
  Edge,
  Group,
  GroupMapping,
  Organization,
  OverdueEntry,
  Policy,
  PolicyVersion,
  Reference,
  ReportCase,
  RiskAssessment,
  SectionInput,
  Template,
  TemplateVersion,
  ThreadMessage,
  User,
  UserDeletionPreview,
  WorkflowDef,
  WorkflowStageInput,
  WorkflowStatus,
} from "@steward-web/api-client";

import {
  AckTrigger,
  AiJobPhase,
  ApprovalStatus,
  AssistOperation,
  BreachDecision,
  CaseStatus,
  DocumentType,
  GatewayError,
  MergeStatus,
  MessageAuthor,
  NoticeRecipient,
  NoticeStatus,
  PolicyStatus,
  ReviewCadence,
  RiskSuggestion,
  SignalType,
} from "@steward-web/api-client";
import {
  missingRequiredSections as missingSectionsInDocument,
  parseDocument,
  scaffoldFromTemplate,
  serializeDocument,
} from "@steward-web/editor-steward/document";

import {
  mockAiConfig,
  mockAppendixLetter,
  mockAuditRecords,
  mockCategories,
  mockContactBlocks,
  mockDefinitions,
  mockDiagnostics,
  mockEmailServiceConfig,
  mockGlobalSettings,
  mockGroupMappings,
  mockGroups,
  mockMe,
  mockOrganizations,
  mockPendingTasks,
  mockPolicies,
  mockPolicyDetails,
  mockPolicyVersions,
  mockReferences,
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
let templates = [...mockTemplates];
let nextTemplateSeq = mockTemplates.length + 1;
let templateVersionList = [...mockTemplateVersions];
let nextTemplateVersionSeq = mockTemplateVersions.length + 1;
let workflowDefs = [...mockWorkflows];
let nextWorkflowSeq = mockWorkflows.length + 1;
let nextWorkflowStageSeq = mockWorkflows.flatMap((w) => w.stages).length + 1;
let pendingTasks = [...mockPendingTasks];
let workflowStatuses = structuredClone(mockWorkflowStatuses);
let reportCases = structuredClone(mockReportCases);
let nextCaseNoteSeq = 2;
let nextCaseMessageSeq = 2;
let nextCaseNoticeSeq = 3;
let contactBlocks = [...mockContactBlocks];
let nextContactBlockSeq = mockContactBlocks.length + 1;
let definitions = [...mockDefinitions];
let nextDefinitionSeq = mockDefinitions.length + 1;
let references = [...mockReferences];
let nextReferenceSeq = mockReferences.length + 1;
let globalSettings = mockGlobalSettings;
let emailServiceConfig = mockEmailServiceConfig;

/** How long a mock break-glass grant lasts, matching the real grant's order of magnitude. */
const BREAK_GLASS_GRANT_MS = 5 * 60 * 1000;

/** How long a mock collab token is valid, matching the real token's order of magnitude. */
const COLLAB_TOKEN_TTL_MS = 5 * 60 * 1000;

/** A small, stable string hash (no crypto): same input always gives the same number, so the
 *  acked/pending split below is deterministic per (policyVersionId, userId) pair without
 *  persisting any mock ack state. */
const HASH_MODULUS = 1_000_000_007;
const stableHash = (s: string): number => {
  let h = 0;
  for (let index = 0; index < s.length; index++) {
    h = (h * 31 + (s.codePointAt(index) ?? 0)) % HASH_MODULUS;
  }
  return h;
};

/**
 * The acknowledgement roster for a policy version: every non-deleted user, split
 * acked/pending by `stableHash`, four in five acked. `groupId` is accepted but not applied —
 * the real gateway resolves ack-audience membership server-side; the mock has no group
 * membership model to filter by, so it always returns the whole directory's roster.
 */
const rosterFor = (policyVersionId: string): AckRoster => {
  const acked: AckRosterEntry[] = [];
  const pending: AckRosterEntry[] = [];
  for (const user of users.filter((u) => !u.deletedAt)) {
    const entry: AckRosterEntry = {
      ackedAt: null,
      email: user.email,
      userId: user.userId,
      userName: user.name,
    };
    if (stableHash(`${policyVersionId}:${user.userId}`) % 5 === 0) {
      pending.push(entry);
    } else {
      acked.push({ ...entry, ackedAt: "2026-09-15T00:00:00Z" });
    }
  }
  return { acked, pending };
};

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

const requireTemplate = (operation: string, id: string): Template => {
  const template = templates.find((t) => t.id === id);
  if (!template) {
    throw new GatewayError(operation, `template ${id} not found`, { code: "NOT_FOUND" });
  }
  return template;
};

const replaceTemplate = (updated: Template): Template => {
  templates = templates.map((t) => (t.id === updated.id ? updated : t));
  return updated;
};

const requireTemplateVersion = (operation: string, id: string): TemplateVersion => {
  const version = templateVersionList.find((t) => t.id === id);
  if (!version) {
    throw new GatewayError(operation, `template version ${id} not found`, { code: "NOT_FOUND" });
  }
  return version;
};

const replaceTemplateVersion = (updated: TemplateVersion): TemplateVersion => {
  templateVersionList = templateVersionList.map((t) => (t.id === updated.id ? updated : t));
  return updated;
};

const requireContactBlock = (operation: string, id: string): ContactBlock => {
  const block = contactBlocks.find((b) => b.id === id);
  if (!block) {
    throw new GatewayError(operation, `contact block ${id} not found`, { code: "NOT_FOUND" });
  }
  return block;
};

const replaceContactBlock = (updated: ContactBlock): ContactBlock => {
  contactBlocks = contactBlocks.map((b) => (b.id === updated.id ? updated : b));
  return updated;
};

const requireDefinition = (operation: string, id: string): DefinitionEntry => {
  const entry = definitions.find((d) => d.id === id);
  if (!entry) {
    throw new GatewayError(operation, `definition ${id} not found`, { code: "NOT_FOUND" });
  }
  return entry;
};

const replaceDefinition = (updated: DefinitionEntry): DefinitionEntry => {
  definitions = definitions.map((d) => (d.id === updated.id ? updated : d));
  return updated;
};

const requireReference = (operation: string, id: string): Reference => {
  const ref = references.find((r) => r.id === id);
  if (!ref) {
    throw new GatewayError(operation, `reference ${id} not found`, { code: "NOT_FOUND" });
  }
  return ref;
};

const replaceReference = (updated: Reference): Reference => {
  references = references.map((r) => (r.id === updated.id ? updated : r));
  return updated;
};

/** Applies the schema's SectionInput defaults (level 1, not required) the same way the live
 *  gateway would, so a mock-stored section always has every field a `TemplateVersion` carries. */
const normalizeSections = (sections: readonly SectionInput[]): TemplateVersion["sections"] =>
  sections.map((s) => ({
    blocks: s.blocks.map((b) => ({ contentJson: b.contentJson ?? null, type: b.type })),
    key: s.key,
    level: s.level ?? 1,
    order: s.order,
    required: s.required ?? false,
    title: s.title,
  }));

/** Applies the schema's WorkflowStageInput defaults (no SLA, not reject-on-breach, not
 *  pinned-last, no category/group overrides) and mints a stage id for a newly added stage. */
const normalizeStages = (stages: readonly WorkflowStageInput[]): WorkflowDef["stages"] =>
  stages.map((s) => ({
    approvers: [...s.approvers],
    approversByCategory: (s.approversByCategory ?? []).map((c) => ({
      approverIds: [...c.approverIds],
      categoryId: c.categoryId,
    })),
    groupUnits: (s.groupUnits ?? []).map((g) => ({
      groupId: g.groupId,
      internalQuorum: g.internalQuorum,
      memberUserIds: [...g.memberUserIds],
    })),
    id: s.id ?? mockId("workflow-stage", nextWorkflowStageSeq++),
    name: s.name,
    pinnedLast: s.pinnedLast ?? false,
    quorum: s.quorum,
    rejectOnSlaBreach: s.rejectOnSlaBreach ?? false,
    slaDays: s.slaDays ?? null,
  }));

/** The newest version of a template by `versionNo`, optionally restricted to published ones
 *  (the one offered when creating a new policy). */
const latestTemplateVersionFor = (
  templateId: string,
  publishedOnly = false,
): TemplateVersion | undefined =>
  templateVersionList
    .filter((v) => v.templateId === templateId && (!publishedOnly || v.status === "published"))
    .toSorted((a, b) => b.versionNo - a.versionNo)[0];

const requireWorkflowDef = (operation: string, id: string): WorkflowDef => {
  const workflowDef = workflowDefs.find((w) => w.id === id);
  if (!workflowDef) {
    throw new GatewayError(operation, `workflow ${id} not found`, { code: "NOT_FOUND" });
  }
  return workflowDef;
};

const replaceWorkflowDef = (updated: WorkflowDef): WorkflowDef => {
  workflowDefs = workflowDefs.map((w) => (w.id === updated.id ? updated : w));
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

/** Titles of required template sections with no text yet, for `publishDraft`'s gate: the
 *  same check the gateway makes, read off the draft's Lexical tree. */
const missingRequiredSections = (version: PolicyVersion): string[] => {
  if (!version.templateVersionId) return [];
  const templateVersion = templateVersionList.find((t) => t.id === version.templateVersionId);
  if (!templateVersion) return [];
  return missingSectionsInDocument(parseDocument(version.contentJson), templateVersion.sections);
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
  ackRoster: (policyVersionId) => Promise.resolve(rosterFor(policyVersionId)),
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
  addUserToGroup: async (userId, groupId) => {
    const user = requireUser("AddUserToGroup", userId);
    requireGroup("AddUserToGroup", groupId);
    if (user.memberships.some((m) => m.groupId === groupId)) return user;
    return replaceUser({
      ...user,
      memberships: [...user.memberships, { groupId, source: "manual" }],
    });
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
  aiJobResult: async (jobId) => {
    const job = aiJobs.get(jobId);
    if (!job) {
      throw new GatewayError("AiJobResult", `AI job ${jobId} not found`, { code: "NOT_FOUND" });
    }
    // The real subscription carries only the job's terminal outcome, never an intermediate
    // phase, so — unlike aiJob() above — there is no polls count to advance: the mock job is
    // already fully resolved the moment it was submitted.
    const phase = job.error ? AiJobPhase.AiJobPhaseFailed : AiJobPhase.AiJobPhaseSucceeded;
    return {
      error: job.error,
      finishedAt: new Date().toISOString(),
      jobId,
      phase,
      resultRef: phase === AiJobPhase.AiJobPhaseSucceeded ? jobId : null,
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
  archiveWorkflowDef: async (id) => {
    requireWorkflowDef("ArchiveWorkflowDef", id);
    workflowDefs = workflowDefs.filter((w) => w.id !== id);
    return true;
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
  // The demo persona is a site admin whose author scope covers every category, so there is
  // nothing to filter here the way the live edge filters by `me.scopes.author`.
  authorableGroups: () => Promise.resolve(groups),
  authorableTemplates: () => Promise.resolve(templates.filter((t) => !t.retiredAt)),
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
  completionReport: (policyVersionId) => {
    const { acked, pending } = rosterFor(policyVersionId);
    const totalAudience = acked.length + pending.length;
    const totalAcked = acked.length;
    const completionPct = totalAudience === 0 ? 0 : Math.round((totalAcked / totalAudience) * 100);
    // A deterministic third of pending users are overdue; the rest are merely "not yet".
    const overdue: OverdueEntry[] = pending
      .slice(0, Math.floor(pending.length / 3))
      .map(({ email, userId, userName }) => ({ email, userId, userName }));
    const report: CompletionReport = {
      avgDaysToAck: 3.2,
      completionPct,
      overdue,
      totalAcked,
      totalAudience,
      viewedNotAckedCount: Math.floor(pending.length / 2),
    };
    return Promise.resolve(report);
  },
  contactBlocks: (includeArchived) =>
    Promise.resolve(includeArchived ? contactBlocks : contactBlocks.filter((b) => !b.archived)),
  createContactBlock: async (block) => {
    const created: ContactBlock = {
      archived: false,
      department: block.department ?? null,
      email: block.email ?? null,
      hours: block.hours ?? null,
      id: mockId("contact-block", nextContactBlockSeq++),
      label: block.label,
      name: block.name ?? null,
      notes: block.notes ?? null,
      phone: block.phone ?? null,
      role: block.role ?? null,
      usedByCount: 0,
    };
    contactBlocks = [...contactBlocks, created];
    return created;
  },
  createDefinition: async (input) => {
    requireGroup("CreateDefinition", input.categoryId);
    const created: DefinitionEntry = {
      archived: false,
      categoryId: input.categoryId,
      createdByUserId: me.id,
      definition: input.definition,
      id: mockId("definition", nextDefinitionSeq++),
      term: input.term,
      usedByCount: 0,
    };
    definitions = [...definitions, created];
    return created;
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
      ackEveryone: false,
      ackEveryoneSet: false,
      ackTriggers: AckTrigger.None,
      defaultTemplateId: null,
      defaultTemplateNone: false,
      defaultWorkflowId: null,
      exclusionGroupIds: null,
      id: mockId("group", nextGroupSeq++),
      idpGroupIds: null,
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
  // The mock keeps one group list for both categories and platform groups (memberships in
  // fixtures.ts name it), so a platform group made here also shows as a category.
  createPlatformGroup: async (name, parentId) => {
    if (parentId) requireGroup("CreatePlatformGroup", parentId);
    const trimmed = name.trim();
    if (trimmed === "") {
      throw new GatewayError("CreatePlatformGroup", "a platform group needs a name", {
        code: "INVALID_ARGUMENT",
      });
    }
    const created: Group = {
      ackEveryone: false,
      ackEveryoneSet: false,
      ackTriggers: AckTrigger.None,
      defaultTemplateId: null,
      defaultTemplateNone: false,
      defaultWorkflowId: null,
      exclusionGroupIds: null,
      id: mockId("group", nextGroupSeq++),
      idpGroupIds: null,
      name: trimmed,
      owners: [],
      parentId,
      reviewCadence: ReviewCadence.None,
      reviewDate: null,
      slug: trimmed.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),
    };
    groups = [...groups, created];
    return { id: created.id, name: created.name, parentId: created.parentId };
  },
  createPolicy: async ({ documentType, homeGroupId, sensitivity, templateId, title }) => {
    requireGroup("CreatePolicy", homeGroupId);
    const templateVersion = templateId ? latestTemplateVersionFor(templateId, true) : undefined;
    const draftId = nextMockPolicyVersionId();
    const policyId = nextMockPolicyId();
    const scaffold = scaffoldFromTemplate(templateVersion?.sections ?? []);
    policyVersions = [
      ...policyVersions,
      {
        appendices: [],
        contentJson: serializeDocument(scaffold),
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
  createReference: async (input) => {
    const created: Reference = {
      archived: false,
      body: input.body ?? null,
      clause: input.clause ?? null,
      createdByUserId: me.id,
      id: mockId("reference", nextReferenceSeq++),
      kind: input.kind,
      label: input.label,
      url: input.url ?? null,
      usedByCount: 0,
    };
    references = [...references, created];
    return created;
  },
  createTemplate: async (name, ownerCategoryId) => {
    const created: Template = {
      code: `TPL-${String(nextTemplateSeq).padStart(3, "0")}`,
      id: mockId("template", nextTemplateSeq++),
      name,
      ownerCategoryId: ownerCategoryId ?? null,
      retiredAt: null,
    };
    templates = [...templates, created];
    return created;
  },
  createTemplateVersion: async (templateId, sections) => {
    requireTemplate("CreateTemplateVersion", templateId);
    const versionNo = (latestTemplateVersionFor(templateId)?.versionNo ?? 0) + 1;
    const created: TemplateVersion = {
      id: mockId("template-version", nextTemplateVersionSeq++),
      sections: normalizeSections(sections),
      status: "draft",
      templateId,
      versionNo,
    };
    templateVersionList = [...templateVersionList, created];
    return created;
  },
  createWorkflowDef: async (name, description, stages) => {
    const created: WorkflowDef = {
      description: description ?? null,
      id: mockId("workflow", nextWorkflowSeq++),
      name,
      stages: normalizeStages(stages),
      version: 1,
    };
    workflowDefs = [...workflowDefs, created];
    return created;
  },
  definitions: (categoryId, includeArchived) => {
    const scoped = categoryId
      ? definitions.filter((d) => d.categoryId === categoryId)
      : definitions;
    return Promise.resolve(includeArchived ? scoped : scoped.filter((d) => !d.archived));
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
  deleteDefinition: async (id) => {
    const entry = requireDefinition("DeleteDefinition", id);
    if (entry.usedByCount > 0) {
      throw new GatewayError("DeleteDefinition", "in use — archive instead of deleting", {
        code: "FAILED_PRECONDITION",
      });
    }
    definitions = definitions.filter((d) => d.id !== id);
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
  deleteReference: async (id) => {
    const ref = requireReference("DeleteReference", id);
    if (ref.usedByCount > 0) {
      throw new GatewayError("DeleteReference", "in use — archive instead of deleting", {
        code: "FAILED_PRECONDITION",
      });
    }
    references = references.filter((r) => r.id !== id);
    return true;
  },
  deleteTemplate: async (id) => {
    requireTemplate("DeleteTemplate", id);
    if (policies.some((p) => p.templateId === id)) {
      throw new GatewayError("DeleteTemplate", "a policy still references this template", {
        code: "FAILED_PRECONDITION",
      });
    }
    templates = templates.filter((t) => t.id !== id);
    templateVersionList = templateVersionList.filter((v) => v.templateId !== id);
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
  discardTemplateVersion: async (id) => {
    const version = requireTemplateVersion("DiscardTemplateVersion", id);
    if (version.status !== "draft") {
      throw new GatewayError("DiscardTemplateVersion", "only a draft version can be discarded", {
        code: "FAILED_PRECONDITION",
      });
    }
    templateVersionList = templateVersionList.filter((v) => v.id !== id);
    return true;
  },
  draftVersion: (policyId) => {
    const policy = policies.find((p) => p.id === policyId);
    const version = policy?.currentDraftVersionId
      ? policyVersions.find((v) => v.id === policy.currentDraftVersionId)
      : undefined;
    return Promise.resolve(version ?? null);
  },
  emailServiceConfig: () => Promise.resolve(emailServiceConfig),

  enableUser: async (userId) => {
    const user = requireUser("EnableUser", userId);
    return replaceUser({ ...user, enabled: true });
  },
  exportAcks: (policyVersionId, format) => {
    const { acked, pending } = rosterFor(policyVersionId);
    const rows = [
      "userId,email,userName,ackedAt",
      ...[...acked, ...pending].map(
        (r) => `${r.userId},${r.email},${r.userName ?? ""},${r.ackedAt ?? ""}`,
      ),
    ];
    const content: AckExport = {
      contentType: format === "csv" ? "text/csv" : "application/octet-stream",
      data: Buffer.from(rows.join("\n"), "utf8").toString("base64"),
    };
    return Promise.resolve(content);
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
  globalSettings: () => Promise.resolve(globalSettings),
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
    Promise.resolve(latestTemplateVersionFor(templateId) ?? null),
  listUserSessions: (userId) => Promise.resolve(sessions[userId] ?? []),
  managedGroupMembers: (groupId) => {
    requireGroup("ManagedGroupMembers", groupId);
    return Promise.resolve(users.filter((u) => u.memberships.some((m) => m.groupId === groupId)));
  },
  me: () => Promise.resolve(me),
  mergeAccounts: async (sourceUserId, targetUserId) => {
    const source = requireUser("MergeAccounts", sourceUserId);
    requireUser("MergeAccounts", targetUserId);
    replaceUser({
      ...source,
      deletedAt: new Date().toISOString(),
      enabled: false,
      mergedIntoUserId: targetUserId,
    });
    return {
      counts: {
        acknowledgmentsDeduped: 0,
        acknowledgmentsMoved: 0,
        policiesOwned: 0,
        preferences: 0,
        raciGrants: 0,
        workflowItems: 0,
      },
      mergeOperationId: mockId("merge-operation", 1),
      status: MergeStatus.Completed,
      steps: [],
    };
  },
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
  myManagedGroups: () =>
    Promise.resolve(
      groups
        .filter((g) => me.managedGroupIds.includes(g.id))
        .map((g) => ({ id: g.id, name: g.name, parentId: g.parentId }))
        .toSorted((a, b) => a.name.localeCompare(b.name)),
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
  platformGroups: (parentId) =>
    Promise.resolve(
      groups
        .filter((g) => g.parentId === parentId)
        .map((g) => ({ id: g.id, name: g.name, parentId: g.parentId })),
    ),
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
  previewAccountMerge: (sourceUserId, targetUserId) => {
    requireUser("PreviewAccountMerge", sourceUserId);
    requireUser("PreviewAccountMerge", targetUserId);
    return Promise.resolve({
      counts: {
        acknowledgmentsDeduped: 0,
        acknowledgmentsMoved: 0,
        policiesOwned: 0,
        preferences: 0,
        raciGrants: 0,
        workflowItems: 0,
      },
      items: [],
      requiresPrivilegedConfirm: false,
      sourceUserId,
      targetUserId,
      warnings: [],
    });
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
  publishTemplateVersion: async (id) => {
    const version = requireTemplateVersion("PublishTemplateVersion", id);
    return replaceTemplateVersion({ ...version, status: "published" });
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
  references: (includeArchived) =>
    Promise.resolve(includeArchived ? references : references.filter((r) => !r.archived)),
  removeUserFromGroup: async (userId, groupId) => {
    const user = requireUser("RemoveUserFromGroup", userId);
    const membership = user.memberships.find((m) => m.groupId === groupId);
    if (membership?.source === "idp-sync") {
      throw new GatewayError(
        "RemoveUserFromGroup",
        "a membership synced from the identity provider can't be removed here",
        { code: "FAILED_PRECONDITION" },
      );
    }
    return replaceUser({
      ...user,
      memberships: user.memberships.filter((m) => m.groupId !== groupId),
    });
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
  renameTemplate: async (id, name) => {
    const template = requireTemplate("RenameTemplate", id);
    return replaceTemplate({ ...template, name });
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
  retireTemplate: async (id) => {
    const template = requireTemplate("RetireTemplate", id);
    return replaceTemplate({ ...template, retiredAt: new Date().toISOString() });
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
  searchUsers: (query, limit) => {
    const needle = query.trim().toLowerCase();
    const matches = users.filter((u) => u.email.toLowerCase().includes(needle));
    return Promise.resolve(
      matches.slice(0, limit ?? 20).map((u) => ({ email: u.email, id: u.userId, name: u.name })),
    );
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
  setContactBlockArchived: async (id, archived) => {
    const block = requireContactBlock("SetContactBlockArchived", id);
    return replaceContactBlock({ ...block, archived });
  },
  setDefinitionArchived: async (id, archived) => {
    const entry = requireDefinition("SetDefinitionArchived", id);
    return replaceDefinition({ ...entry, archived });
  },
  setEmailServiceConfig: (input) => {
    emailServiceConfig = {
      apiKeySet: input.apiKey ? input.apiKey.length > 0 : emailServiceConfig.apiKeySet,
      domain: input.domain,
      enabled: input.enabled,
      fromAddress: input.fromAddress,
      provider: input.provider,
      region: input.region,
    };
    return Promise.resolve(emailServiceConfig);
  },
  setGlobalSettings: (input) => {
    globalSettings = { announcement: input.announcement, maintenance: input.maintenance };
    return Promise.resolve(globalSettings);
  },
  setReferenceArchived: async (id, archived) => {
    const ref = requireReference("SetReferenceArchived", id);
    return replaceReference({ ...ref, archived });
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
  templates: () => Promise.resolve(templates),
  templateVersions: (templateId) =>
    Promise.resolve(
      templateVersionList
        .filter((v) => v.templateId === templateId)
        .toSorted((a, b) => b.versionNo - a.versionNo),
    ),
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
  updateContactBlock: async (id, block) => {
    const existing = requireContactBlock("UpdateContactBlock", id);
    return replaceContactBlock({
      ...existing,
      department: block.department ?? null,
      email: block.email ?? null,
      hours: block.hours ?? null,
      label: block.label,
      name: block.name ?? null,
      notes: block.notes ?? null,
      phone: block.phone ?? null,
      role: block.role ?? null,
    });
  },
  updateDefinition: async (id, input) => {
    const existing = requireDefinition("UpdateDefinition", id);
    return replaceDefinition({
      ...existing,
      definition: input.definition,
      term: input.term,
    });
  },
  updateGroupSettings: async ({
    ackEveryone,
    ackTriggers,
    defaultTemplateId,
    defaultTemplateNone,
    defaultWorkflowId,
    exclusionGroupIds,
    id,
    idpGroupIds,
    owners,
    reviewCadence,
    reviewDate,
  }) => {
    const group = requireGroup("UpdateGroupSettings", id);
    return replaceGroup({
      ...group,
      ackEveryone: ackEveryone ?? group.ackEveryone,
      ackEveryoneSet: ackEveryone === undefined ? group.ackEveryoneSet : true,
      ackTriggers: ackTriggers ?? group.ackTriggers,
      defaultTemplateId:
        defaultTemplateId === undefined ? group.defaultTemplateId : defaultTemplateId,
      defaultTemplateNone: defaultTemplateNone ?? group.defaultTemplateNone,
      defaultWorkflowId:
        defaultWorkflowId === undefined ? group.defaultWorkflowId : defaultWorkflowId,
      exclusionGroupIds:
        exclusionGroupIds === undefined ? group.exclusionGroupIds : exclusionGroupIds,
      idpGroupIds: idpGroupIds === undefined ? group.idpGroupIds : idpGroupIds,
      owners: owners === undefined ? group.owners : [...owners],
      reviewCadence: reviewCadence ?? group.reviewCadence,
      reviewDate: reviewDate === undefined ? group.reviewDate : reviewDate,
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
  updateReference: async (id, input) => {
    const existing = requireReference("UpdateReference", id);
    return replaceReference({
      ...existing,
      body: input.body ?? null,
      clause: input.clause ?? null,
      kind: input.kind,
      label: input.label,
      url: input.url ?? null,
    });
  },
  updateTemplateVersionSections: async (id, sections) => {
    const version = requireTemplateVersion("UpdateTemplateVersionSections", id);
    if (version.status !== "draft") {
      throw new GatewayError(
        "UpdateTemplateVersionSections",
        "only a draft version's sections can be changed",
        { code: "FAILED_PRECONDITION" },
      );
    }
    return replaceTemplateVersion({ ...version, sections: normalizeSections(sections) });
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
  updateWorkflowDef: async (id, name, description, stages) => {
    const current = requireWorkflowDef("UpdateWorkflowDef", id);
    return replaceWorkflowDef({
      ...current,
      description: description ?? null,
      name,
      stages: normalizeStages(stages),
      version: current.version + 1,
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
  workflowDef: (id) => Promise.resolve(workflowDefs.find((w) => w.id === id) ?? null),
  workflowDefs: () => Promise.resolve(workflowDefs),
  workflows: () => Promise.resolve(workflowDefs),
  workflowStatus: (policyVersionId) =>
    Promise.resolve(workflowStatuses[policyVersionId] ?? NO_WORKFLOW_STATUS),
};

export default mockEdge;
