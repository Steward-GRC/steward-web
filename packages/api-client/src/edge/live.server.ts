// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

import { parse } from "graphql";

import type { Edge } from "../edge";
import type { Me, Policy, PolicyDetail, PolicySectionDiff, SuggestionOutcome } from "../views";

import { GatewayError, gatewayFetch } from "../gatewayFetch";
import { gatewayRestFetch, gatewayRestUpload } from "../gatewayRestFetch";
import {
  AckActivityDocument,
  AckRosterDocument,
  AckStatusDocument,
  ActivateOrganizationDocument,
  AddAppendixDocument,
  AddCaseNoteDocument,
  AddCaseNoticeDocument,
  AddGroupMappingDocument,
  AddOrganizationDocument,
  AddReviewThreadDocument,
  AddUserToGroupDocument,
  AiConfigDocument,
  AiHealthDocument,
  AiJobDocument,
  AiJobResultContentDocument,
  AppendixDiffDocument,
  ArchiveWorkflowDefDocument,
  AssignCaseDocument,
  AuditLogDocument,
  AuthoringAssistDocument,
  type AuthoringPolicyFieldsFragment,
  BreakGlassRevealDocument,
  CategoryChildrenDocument,
  CategoryDocument,
  CategoryDocumentCountsDocument,
  CategoryDocumentTypesAllDocument,
  type CategoryFieldsFragment,
  CategoryRulesetDocument,
  CategoryTemplateLocksDocument,
  CategoryTreeDocument,
  ChangeOrgProtocolDocument,
  CloseCaseDocument,
  CloseReviewSuggestionDocument,
  CompleteOnboardingDocument,
  CompletionReportDocument,
  ContactBlocksDocument,
  CounterReviewSuggestionDocument,
  CreateCategoryDocument,
  CreateContactBlockDocument,
  CreateDefinitionDocument,
  CreateMagicLinkDocument,
  CreatePlatformGroupDocument,
  CreatePolicyAppendixDocument,
  CreatePolicyDocument,
  CreateReferenceDocument,
  CreateTemplateDocument,
  CreateTemplateVersionDocument,
  CreateWorkflowDefDocument,
  DefinitionsDocument,
  DeleteAppendixDocument,
  DeleteCategoryDocument,
  DeleteDefinitionDocument,
  DeleteGroupMappingDocument,
  DeleteOrganizationDocument,
  DeletePolicyDocument,
  DeleteReferenceDocument,
  DeleteReviewThreadDocument,
  DeleteTemplateDocument,
  DeleteUserDocument,
  DiagnosticsDocument,
  DiffVersionsDocument,
  DisableOrganizationDocument,
  DisableUserDocument,
  DiscardDraftDocument,
  DiscardTemplateVersionDocument,
  EmailServiceConfigDocument,
  EnableUserDocument,
  EnrollTotpBeginDocument,
  EnrollTotpConfirmDocument,
  ExportAcksDocument,
  ForceRotateSpCertificateDocument,
  GlobalSettingsDocument,
  GrantRoleDocument,
  GroupMappingsDocument,
  ImpersonationStatusDocument,
  IssueAppendixCollabTokenDocument,
  IssueCollabTokenDocument,
  LatestTemplateVersionDocument,
  ListUserSessionsDocument,
  ManagedGroupMembersDocument,
  MarkVersionReviewedDocument,
  MeDocument,
  MergeAccountsDocument,
  MoveCategoryDocument,
  MovePoliciesDocument,
  MovePolicyDocument,
  MyAckSummaryDocument,
  MyDraftsDocument,
  MyFactorsDocument,
  MyManagedGroupsDocument,
  MyObligationsDocument,
  MyWebauthnCredentialsDocument,
  NotificationSettingsDocument,
  OrganizationsDocument,
  PdfDownloadLinkDocument,
  PendingTasksDocument,
  PlatformGroupsDocument,
  PoliciesDocument,
  PolicyAppendicesDocument,
  PolicyAttachmentsDocument,
  PolicyByNumberDocument,
  PolicyDocument,
  PolicyVersionDocument,
  PolicyVersionLinksDocument,
  PolicyVersionsDocument,
  PolicyVersionSummaryDocument,
  PostCaseMessageDocument,
  PreviewAccountMergeDocument,
  PreviewMovePoliciesDocument,
  PreviewUserDeletionDocument,
  PublishAppendixDocument,
  PublishDraftDocument,
  PublishTemplateVersionDocument,
  ReassignUserPoliciesDocument,
  RecordAckDocument,
  RecordRiskAssessmentDocument,
  ReferencesDocument,
  RelationshipTypesDocument,
  RemoveFactorDocument,
  RemoveUserFromGroupDocument,
  RemoveUserMfaFactorDocument,
  RemoveWebauthnCredentialDocument,
  RenameCategoryDocument,
  RenameMfaMethodDocument,
  RenameTemplateDocument,
  RenameUserMfaFactorDocument,
  ReorderAppendicesDocument,
  ReorderPolicyAppendicesDocument,
  ReplyReviewThreadDocument,
  ReportCaseDocument,
  ReportCasesDocument,
  RequestPdfExportDocument,
  RequestStepUpOtpDocument,
  ResendWelcomeEmailDocument,
  ResetUserPasswordDocument,
  ResolveUserLabelsDocument,
  RestoreAppendixDocument,
  RetireAppendixDocument,
  RetirePolicyDocument,
  RetireTemplateDocument,
  ReviewThreadsDocument,
  RevokeMagicLinkDocument,
  RevokeMySessionsDocument,
  RevokeRoleDocument,
  RevokeUserSessionsDocument,
  RunVetoesDocument,
  SaveAppendixDraftDocument,
  SaveDraftDocument,
  SearchAndAnswerDocument,
  SearchUsersDocument,
  SetAiEnabledDocument,
  SetAiProviderCredentialDocument,
  SetAiRetrievalConfigDocument,
  SetCaseDiscoveryDateDocument,
  SetCaseStatusDocument,
  SetCategoryCadenceDocument,
  SetCategoryDefaultsDocument,
  SetCategoryDocumentTypesDocument,
  SetCategoryGovernanceDocument,
  SetCategoryRulesetDocument,
  SetCategoryTemplateLockDocument,
  SetContactBlockArchivedDocument,
  SetDefinitionArchivedDocument,
  SetDigestWindowDocument,
  SetEmailServiceConfigDocument,
  SetGlobalSettingsDocument,
  SetNotificationChannelsDocument,
  SetPolicyOwnerDocument,
  SetPolicyTemplateDocument,
  SetReferenceArchivedDocument,
  SetReviewThreadResolvedDocument,
  SetTypeCadenceDocument,
  SetUserPolicyOverrideDocument,
  SetVersionContactsDocument,
  SetVersionDefinitionsDocument,
  SetVersionReferencesDocument,
  SetVersionRelatedDocument,
  SetWorkflowVetoEnabledDocument,
  SignalWorkflowDocument,
  SimulateCategoryDocument,
  SpCertificateDocument,
  StartDomainVerificationDocument,
  StartImpersonationDocument,
  StopImpersonationDocument,
  SubmitDraftGenerationDocument,
  SubmitPolicyReviewDocument,
  SubmitPolicyRevisionDocument,
  SubmitWorkflowDocument,
  TemplatesDocument,
  TemplateVersionsDocument,
  TopPolicyQuestionsDocument,
  TransferRootDocument,
  UpcomingApprovalsDocument,
  UpdateAppendixDocument,
  UpdateCaseNoticeDocument,
  UpdateContactBlockDocument,
  UpdateDefinitionDocument,
  UpdateIdPConnectionDocument,
  UpdateMyProfileDocument,
  UpdateReferenceDocument,
  UpdateTemplateVersionSectionsDocument,
  UpdateUserProfileDocument,
  UpdateWorkflowDefDocument,
  UserFactorsDocument,
  UsersDocument,
  VerifyAuditChainDocument,
  VerifyDomainDocument,
  VersionChangesSinceReviewDocument,
  WebauthnRegisterBeginDocument,
  WebauthnRegisterFinishDocument,
  WorkflowDefDocument,
  WorkflowDefsDocument,
  WorkflowStatusDocument,
  WorkflowVetoesDocument,
} from "../generated/graphql";
import {
  type CategoryDocumentTypes,
  DocumentType,
  SuggestionOutcome as WireOutcome,
} from "../generated/schema";
import { semanticVersion } from "../semanticVersion";
import { awaitAiJobResult } from "./aiJobResult.server";
import {
  appendixText,
  bodyTextFromContent,
  categoryNames,
  type CategoryNode,
  documentBlocksFromContent,
  historyFromAuditLog,
  historyFromVersions,
  isNotFound,
  isPermissionDenied,
  isUnauthenticated,
  nextReviewOf,
  policyStatusOf,
  readableContent,
  toPolicyView,
} from "./assemble";
import { watchLiveEvents } from "./liveEvents.server";

/** The view's outcome names, as the generated schema spells them. */
const WIRE_OUTCOME: Record<SuggestionOutcome, WireOutcome> = {
  AGREED: WireOutcome.Agreed,
  CHANGED: WireOutcome.Changed,
  NOT_AGREED: WireOutcome.NotAgreed,
  REMOVED: WireOutcome.Removed,
  WITHDRAWN: WireOutcome.Withdrawn,
};

/**
 * What each category holds (#87), from its own query so a gateway without the field
 * (steward-gateway#80) leaves every other category read working: a refusal reads as "none
 * known", and a category with no entry holds both. Reads that overlap share one call.
 */
const typesInFlight = new Map<string, Promise<ReadonlyMap<string, CategoryDocumentTypes>>>();
const categoryDocumentTypes = (cookie?: string) => {
  const key = cookie ?? "";
  const running = typesInFlight.get(key);
  if (running) return running;
  const started = gatewayFetch(CategoryDocumentTypesAllDocument, {}, "CategoryDocumentTypesAll", {
    cookie,
  })
    .then(
      (data): ReadonlyMap<string, CategoryDocumentTypes> =>
        new Map(data.categoryTree.map((c) => [c.id, c.documentTypes])),
    )
    .catch((): ReadonlyMap<string, CategoryDocumentTypes> => new Map())
    .finally(() => {
      typesInFlight.delete(key);
    });
  typesInFlight.set(key, started);
  return started;
};

/**
 * Which categories lock their default template (steward-web#262), from its own query for the same
 * reason: a gateway without the field reads as "nothing is locked".
 */
const locksInFlight = new Map<string, Promise<ReadonlySet<string>>>();
const categoryTemplateLocks = (cookie?: string) => {
  const key = cookie ?? "";
  const running = locksInFlight.get(key);
  if (running) return running;
  const started = gatewayFetch(CategoryTemplateLocksDocument, {}, "CategoryTemplateLocks", {
    cookie,
  })
    .then(
      (data): ReadonlySet<string> =>
        new Set(data.categoryTree.filter((c) => c.defaultTemplateLocked).map((c) => c.id)),
    )
    .catch((): ReadonlySet<string> => new Set())
    .finally(() => {
      locksInFlight.delete(key);
    });
  locksInFlight.set(key, started);
  return started;
};

/** What the side queries add to a category. */
interface CategoryExtras {
  defaultTemplateLocked?: boolean;
  documentTypes?: CategoryDocumentTypes;
}

/** The categories with what each holds and whether its template is locked, where the gateway says. */
const withDocumentTypes = async <T extends { id: string }>(
  categories: readonly T[],
  cookie?: string,
): Promise<(CategoryExtras & T)[]> => {
  const [types, locks] = await Promise.all([
    categoryDocumentTypes(cookie),
    categoryTemplateLocks(cookie),
  ]);
  return categories.map((c) => {
    const documentTypes = types.get(c.id);
    return {
      ...c,
      ...(documentTypes ? { documentTypes } : {}),
      ...(locks.has(c.id) ? { defaultTemplateLocked: true } : {}),
    };
  });
};

const categoryChildren = async (
  parentId: null | string,
  cookie?: string,
): Promise<readonly (CategoryExtras & CategoryFieldsFragment)[]> => {
  const data = await gatewayFetch(CategoryChildrenDocument, { parentId }, "CategoryChildren", {
    cookie,
  });
  return withDocumentTypes(data.categoryChildren, cookie);
};

/** Every category, parents before children, in one call. */
const plainCategoryTree = async (cookie?: string): Promise<readonly CategoryFieldsFragment[]> => {
  const data = await gatewayFetch(CategoryTreeDocument, { rootId: null }, "CategoryTree", {
    cookie,
  });
  return data.categoryTree;
};

const categoryTree = async (
  cookie?: string,
): Promise<readonly (CategoryExtras & CategoryFieldsFragment)[]> =>
  withDocumentTypes(await plainCategoryTree(cookie), cookie);

const categoryIndex = async (cookie?: string): Promise<Map<string, CategoryNode>> => {
  const all = await categoryTree(cookie);
  return new Map(all.map((c) => [c.id, c]));
};

/** One document type's policies across every root category, each listed once. */
const catalogPolicies = async (
  documentType: DocumentType,
  index: ReadonlyMap<string, CategoryNode>,
  cookie?: string,
): Promise<AuthoringPolicyFieldsFragment[]> => {
  const roots = [...index.values()].filter((c) => !c.parentId);
  const lists = await Promise.all(
    roots.map(async (root) => {
      const data = await gatewayFetch(
        PoliciesDocument,
        { categoryId: root.id, documentType },
        "Policies",
        { cookie },
      );
      return data.policies;
    }),
  );
  const byId = new Map(lists.flat().map((p) => [p.id, p]));
  return [...byId.values()];
};

const policyView = async (
  policy: AuthoringPolicyFieldsFragment,
  cookie?: string,
  index?: ReadonlyMap<string, CategoryNode>,
): Promise<Policy> => {
  const names = await (index ?? categoryIndex(cookie));
  return toPolicyView(policy, categoryNames(names, policy.homeCategoryId));
};

const catalog = async (
  documentType: DocumentType,
  index: ReadonlyMap<string, CategoryNode>,
  cookie?: string,
): Promise<Policy[]> => {
  const policies = await catalogPolicies(documentType, index, cookie);
  return Promise.all(policies.map((p) => policyView(p, cookie, index)));
};

const toMe = (user: {
  email: string;
  firstName: string;
  lastName: string;
  locale?: null | string;
  managedGroupIds: readonly string[];
  name: string;
  needsOnboarding?: boolean;
  permissions: readonly string[];
  roles: readonly string[];
  userId: string;
  username: string;
}): Me => ({
  email: user.email,
  firstName: user.firstName,
  id: user.userId,
  lastName: user.lastName,
  ...(user.locale === undefined || user.locale === null ? {} : { locale: user.locale }),
  managedGroupIds: user.managedGroupIds,
  name: user.name,
  needsOnboarding: user.needsOnboarding ?? false,
  permissions: user.permissions,
  roles: user.roles,
  username: user.username,
});

/**
 * The reader's detail, assembled from the gateway's separate reads: the current version's
 * content, the attachments, the version list and diff, and the caller's acknowledgement.
 */
const assembleDetail = async (
  policy: AuthoringPolicyFieldsFragment,
  index: ReadonlyMap<string, CategoryNode>,
  cookie?: string,
): Promise<PolicyDetail> => {
  const publishedId = policy.currentPublishedVersionId ?? null;
  // The reader shows the latest published version, never one that is only a draft or in review
  // (bug log 215); someone who can edit finds that version through `revision`.
  const versionId = publishedId;
  const acks = policy.documentType === DocumentType.Policy && publishedId !== null;
  const [version, attachments, versions, ack, auditPage, summary, ai, versionLinks] =
    await Promise.all([
      versionId
        ? gatewayFetch(PolicyVersionDocument, { id: versionId }, "PolicyVersion", { cookie }).then(
            (d) => d.policyVersion ?? null,
          )
        : null,
      gatewayFetch(PolicyAttachmentsDocument, { policyId: policy.id }, "PolicyAttachments", {
        cookie,
      }),
      gatewayFetch(PolicyVersionsDocument, { policyId: policy.id }, "PolicyVersions", {
        cookie,
      }).then((d) => d.policyVersions),
      acks && policy.viewerCan.ack
        ? gatewayFetch(AckStatusDocument, { policyVersionId: publishedId }, "AckStatus", {
            cookie,
          }).then((d) => d.ackStatus)
        : null,
      // The audit log is gated on audit.read (or managing a group); a plain reader is refused,
      // and reads the history off the published versions instead.
      gatewayFetch(AuditLogDocument, { subject: `policy:${policy.id}` }, "AuditLog", {
        cookie,
      }).catch((error: unknown) => {
        if (isPermissionDenied(error)) return null;
        throw error;
      }),
      // A missing or unreadable summary just leaves the AI summary toggle out.
      publishedId
        ? gatewayFetch(
            PolicyVersionSummaryDocument,
            { versionId: publishedId },
            "PolicyVersionSummary",
            { cookie },
          ).then(
            (d) => d.policyVersionSummary ?? null,
            () => null,
          )
        : null,
      // aiHealth answers a down service as unavailable rather than failing; a failed call reads
      // the same way, so the reader's AI pieces say so instead of breaking the page.
      gatewayFetch(AiHealthDocument, {}, "AiHealth", { cookie }).then(
        (d) => ({ available: d.aiHealth.available, reason: d.aiHealth.reason ?? null }),
        () => ({ available: false, reason: "ai_service_unavailable" }),
      ),
      // What the published version links to, for how each related policy relates (bug log 227);
      // a failed read leaves the plain related list.
      publishedId
        ? gatewayFetch(
            PolicyVersionLinksDocument,
            { policyVersionId: publishedId },
            "PolicyVersionLinks",
            { cookie },
          ).then(
            (d) => d.policyVersionLinks,
            () => null,
          )
        : null,
    ]);
  const related = versionLinks
    ? versionLinks.related.map((link) => ({
        label: link.label,
        number: link.number,
        policyId: link.policyId,
        title: link.title,
      }))
    : attachments.relatedPolicies;
  const history = auditPage
    ? historyFromAuditLog(
        auditPage.auditLog.records,
        version ? semanticVersion(version.versionNo) : "",
      )
    : historyFromVersions(versions);

  const at = publishedId ? versions.findIndex((v) => v.id === publishedId) : -1;
  const prior = at > 0 ? versions[at - 1] : undefined;
  let diff: readonly PolicySectionDiff[] = [];
  if (prior && publishedId) {
    // Only the change list needs it: a version saved without a pinned template can't be
    // compared, and the gateway refuses with an internal fault. The record still shows, without
    // the list (bug log 245).
    diff = await gatewayFetch(
      DiffVersionsDocument,
      { fromVersionId: prior.id, toVersionId: publishedId },
      "DiffVersions",
      { cookie },
    ).then(
      (data) => data.diffVersions,
      () => [],
    );
  }
  const names = categoryNames(index, policy.homeCategoryId);
  const draftId = policy.currentDraftVersionId ?? null;
  const draft =
    policy.viewerCan.edit && draftId && draftId !== publishedId
      ? versions.find((v) => v.id === draftId)
      : undefined;
  const body = version ? documentBlocksFromContent(version.contentJson) : [];

  return {
    ai,
    ack: acks
      ? {
          ackedAt: ack?.ackedAt ?? null,
          acknowledged: ack?.acknowledged ?? false,
          required: policy.viewerCan.ack,
        }
      : null,
    appendices: (version?.appendices ?? []).map((a) => {
      const blocks = documentBlocksFromContent(a.contentJson);
      return {
        ...(blocks.length > 0 ? { blocks } : {}),
        id: a.id,
        letter: a.letter,
        text: appendixText(a.contentJson),
        title: a.title,
      };
    }),
    body,
    bodyText: version ? bodyTextFromContent(version.contentJson) : "",
    bodyUnreadable: version ? !readableContent(version.contentJson) : false,
    canBreakGlass: policy.viewerCan.canBreakGlass,
    canEdit: policy.viewerCan.edit,
    category: names.category,
    contacts: attachments.policyContactBlocks,
    contentObfuscated: policy.viewerCan.contentObfuscated,
    currentVersionId: publishedId,
    definitions: attachments.policyDefinitionEntries,
    documentType: policy.documentType,
    history,
    id: policy.id,
    nextReview: nextReviewOf(index, policy.homeCategoryId),
    number: policy.number,
    ownerName: policy.ownerName ?? null,
    priorVersion:
      prior && publishedId
        ? {
            diff,
            fromVersionId: prior.id,
            toVersionId: publishedId,
            version: semanticVersion(prior.versionNo),
          }
        : null,
    published: publishedId ? (version?.publishedAt ?? null) : null,
    references: attachments.policyReferences,
    related,
    revision: draft
      ? { status: policyStatusOf(false, draft.status), version: semanticVersion(draft.versionNo) }
      : null,
    sensitivity: policy.sensitivity,
    status: policyStatusOf(publishedId !== null, version?.status ?? draft?.status),
    subcategory: names.subcategory,
    summary: summary ? { generatedAt: summary.generatedAt, text: summary.summaryText } : null,
    title: policy.title,
    updated: policy.updatedAt,
    version: version ? semanticVersion(version.versionNo) : "",
    versions: versions.map((v) => ({
      id: v.id,
      status: v.status,
      version: semanticVersion(v.versionNo),
    })),
  };
};

/** The live edge: every call is a real POST to `GATEWAY_URL`, cookie forwarded. */
const RecordPolicyExportDocument =
  parse(`mutation RecordPolicyExport($policyId: ID!, $kind: PolicyExportKind!, $includeHistory: Boolean!) {
  recordPolicyExport(policyId: $policyId, kind: $kind, includeHistory: $includeHistory)
}`) as TypedDocumentNode<
    { recordPolicyExport: boolean },
    { includeHistory: boolean; kind: string; policyId: string }
  >;

/** Set once the gateway answers that it has no `recordPolicyExport` (steward-gateway#78). */
let exportAuditMissing = false;

export const liveEdge: Edge = {
  async ackActivity(policyVersionId, groupId, days, cookie) {
    const data = await gatewayFetch(
      AckActivityDocument,
      { days, groupId, policyVersionId },
      "AckActivity",
      { cookie },
    );
    return data.ackActivity;
  },
  async acknowledgePolicy(policyVersionId, cookie) {
    const data = await gatewayFetch(RecordAckDocument, { policyVersionId }, "RecordAck", {
      cookie,
    });
    return { ackedAt: data.recordAck.ackedAt, acknowledged: true, required: true };
  },
  async ackRoster(policyVersionId, groupId, cookie) {
    const data = await gatewayFetch(AckRosterDocument, { groupId, policyVersionId }, "AckRoster", {
      cookie,
    });
    return data.ackRoster;
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
  async appendixDiff(id, cookie) {
    const data = await gatewayFetch(AppendixDiffDocument, { id }, "AppendixDiff", { cookie });
    return data.appendixDiff;
  },
  async createAppendix(policyId, title, contentJson, cookie) {
    const data = await gatewayFetch(
      CreatePolicyAppendixDocument,
      { contentJson, policyId, title },
      "CreatePolicyAppendix",
      { cookie },
    );
    return data.createPolicyAppendix;
  },
  async policyVersionLinks(policyVersionId, cookie) {
    const data = await gatewayFetch(
      PolicyVersionLinksDocument,
      { policyVersionId },
      "PolicyVersionLinks",
      { cookie },
    );
    return data.policyVersionLinks;
  },
  async relationshipTypes(cookie) {
    const data = await gatewayFetch(RelationshipTypesDocument, {}, "RelationshipTypes", {
      cookie,
    });
    return data.relationshipTypes;
  },
  async setVersionContacts(policyVersionId, contactBlockIds, cookie) {
    const data = await gatewayFetch(
      SetVersionContactsDocument,
      { contactBlockIds: [...contactBlockIds], policyVersionId },
      "SetVersionContacts",
      { cookie },
    );
    return data.setVersionContacts;
  },
  async setVersionDefinitions(policyVersionId, definitionIds, cookie) {
    const data = await gatewayFetch(
      SetVersionDefinitionsDocument,
      { definitionIds: [...definitionIds], policyVersionId },
      "SetVersionDefinitions",
      { cookie },
    );
    return data.setVersionDefinitions;
  },
  async setVersionReferences(policyVersionId, referenceIds, cookie) {
    const data = await gatewayFetch(
      SetVersionReferencesDocument,
      { policyVersionId, referenceIds: [...referenceIds] },
      "SetVersionReferences",
      { cookie },
    );
    return data.setVersionReferences;
  },
  async setVersionRelated(policyVersionId, links, cookie) {
    const data = await gatewayFetch(
      SetVersionRelatedDocument,
      {
        links: links.map((link) => ({ policyId: link.policyId, type: link.type })),
        policyVersionId,
      },
      "SetVersionRelated",
      { cookie },
    );
    return data.setVersionRelated;
  },
  async policyAppendices(policyId, includeRetired, cookie) {
    const data = await gatewayFetch(
      PolicyAppendicesDocument,
      { includeRetired, policyId },
      "PolicyAppendices",
      { cookie },
    );
    return data.policyAppendices;
  },
  async publishAppendix(id, cookie) {
    const data = await gatewayFetch(PublishAppendixDocument, { id }, "PublishAppendix", {
      cookie,
    });
    return data.publishAppendix;
  },
  async reorderPolicyAppendices(policyId, orderedIds, cookie) {
    const data = await gatewayFetch(
      ReorderPolicyAppendicesDocument,
      { orderedIds: [...orderedIds], policyId },
      "ReorderPolicyAppendices",
      { cookie },
    );
    return data.reorderPolicyAppendices;
  },
  async restoreAppendix(id, cookie) {
    const data = await gatewayFetch(RestoreAppendixDocument, { id }, "RestoreAppendix", {
      cookie,
    });
    return data.restoreAppendix;
  },
  async retireAppendix(id, cookie) {
    const data = await gatewayFetch(RetireAppendixDocument, { id }, "RetireAppendix", { cookie });
    return data.retireAppendix;
  },
  async saveAppendixDraft(id, title, contentJson, cookie) {
    const data = await gatewayFetch(
      SaveAppendixDraftDocument,
      { contentJson, id, title },
      "SaveAppendixDraft",
      { cookie },
    );
    return data.saveAppendixDraft;
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
  async closeReviewSuggestion(threadId, outcome, reason, cookie) {
    const data = await gatewayFetch(
      CloseReviewSuggestionDocument,
      { outcome: WIRE_OUTCOME[outcome], reason, threadId },
      "CloseReviewSuggestion",
      { cookie },
    );
    return data.closeReviewSuggestion;
  },
  async counterReviewSuggestion(threadId, text, cookie) {
    const data = await gatewayFetch(
      CounterReviewSuggestionDocument,
      { text, threadId },
      "CounterReviewSuggestion",
      { cookie },
    );
    return data.counterReviewSuggestion;
  },
  async addReviewThread(policyVersionId, quote, occurrence, body, suggestedText, toUserId, cookie) {
    const data = await gatewayFetch(
      AddReviewThreadDocument,
      { body, occurrence, policyVersionId, quote, suggestedText, toUserId },
      "AddReviewThread",
      { cookie },
    );
    return data.addReviewThread;
  },
  async deleteReviewThread(threadId, cookie) {
    const data = await gatewayFetch(
      DeleteReviewThreadDocument,
      { threadId },
      "DeleteReviewThread",
      {
        cookie,
      },
    );
    return data.deleteReviewThread;
  },
  async replyReviewThread(threadId, body, cookie) {
    const data = await gatewayFetch(
      ReplyReviewThreadDocument,
      { body, threadId },
      "ReplyReviewThread",
      { cookie },
    );
    return data.replyReviewThread;
  },
  async reviewThreads(policyVersionId, cookie) {
    const data = await gatewayFetch(ReviewThreadsDocument, { policyVersionId }, "ReviewThreads", {
      cookie,
    });
    return data.reviewThreads;
  },
  async setReviewThreadResolved(threadId, resolved, cookie) {
    const data = await gatewayFetch(
      SetReviewThreadResolvedDocument,
      { resolved, threadId },
      "SetReviewThreadResolved",
      { cookie },
    );
    return data.setReviewThreadResolved;
  },
  async addCaseNote(caseId, body, cookie) {
    const data = await gatewayFetch(AddCaseNoteDocument, { body, caseId }, "AddCaseNote", {
      cookie,
    });
    return data.addCaseNote;
  },
  async addCaseNotice(caseId, recipient, label, method, cookie) {
    const data = await gatewayFetch(
      AddCaseNoticeDocument,
      { caseId, label, method, recipient },
      "AddCaseNotice",
      { cookie },
    );
    return data.addCaseNotice;
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
  async addUserToGroup(userId, groupId, cookie) {
    const data = await gatewayFetch(AddUserToGroupDocument, { groupId, userId }, "AddUserToGroup", {
      cookie,
    });
    return data.addUserToGroup;
  },
  async aiConfig(cookie) {
    const data = await gatewayFetch(AiConfigDocument, {}, "AiConfig", { cookie });
    return { ...data.aiConfig, provider: data.aiConfig.provider ?? null };
  },
  async aiHealth(cookie) {
    const data = await gatewayFetch(AiHealthDocument, {}, "AiHealth", { cookie });
    return data.aiHealth;
  },
  async aiJob(jobId, cookie) {
    const data = await gatewayFetch(AiJobDocument, { jobId }, "AiJob", { cookie });
    return data.aiJob;
  },
  aiJobResult(jobId, cookie, signal) {
    return awaitAiJobResult(jobId, cookie, signal);
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
  async archiveWorkflowDef(id, cookie) {
    const data = await gatewayFetch(ArchiveWorkflowDefDocument, { id }, "ArchiveWorkflowDef", {
      cookie,
    });
    return data.archiveWorkflowDef;
  },
  async assignCase(caseId, assigneeUserId, cookie) {
    const data = await gatewayFetch(AssignCaseDocument, { assigneeUserId, caseId }, "AssignCase", {
      cookie,
    });
    return data.assignCase;
  },
  async auditLog(filters, cookie) {
    const data = await gatewayFetch(AuditLogDocument, { ...filters }, "AuditLog", { cookie });
    return data.auditLog;
  },
  async authorableGroups(cookie) {
    const [{ me: rawMe }, all] = await Promise.all([
      gatewayFetch(MeDocument, {}, "Me", { cookie }),
      categoryTree(cookie),
    ]);
    // A grant on a category covers everything under it (the gateway authorizes down the chain),
    // but `scopes.author` lists only the categories granted, so walk up from each one
    // (bug log 234).
    const granted = new Set(rawMe.scopes.author);
    const byId = new Map(all.map((c) => [c.id, c]));
    const covered = (category: (typeof all)[number]): boolean => {
      for (
        let at: (typeof all)[number] | undefined = category, steps = 0;
        at && steps <= all.length;
        at = at.parentId ? byId.get(at.parentId) : undefined, steps++
      ) {
        if (granted.has(at.name)) return true;
      }
      return false;
    };
    return all.filter((c) => covered(c));
  },
  async authorableTemplates(ownerGroupId, cookie) {
    const data = await gatewayFetch(
      TemplatesDocument,
      { ownerCategoryId: ownerGroupId },
      "Templates",
      { cookie },
    );
    return data.templates;
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
    const all = await plainCategoryTree(cookie);
    const roots = all.filter((c) => !c.parentId);
    return roots.map((root) => ({
      id: root.id,
      name: root.name,
      slug: root.slug,
      subcategories: all.filter((c) => c.parentId === root.id).map((c) => c.name),
    }));
  },
  async categoryDocumentCounts(categoryId, cookie) {
    const data = await gatewayFetch(
      CategoryDocumentCountsDocument,
      { categoryId },
      "CategoryDocumentCounts",
      { cookie },
    );
    return data.categoryDocumentCounts;
  },
  async categoryRuleset(categoryId, cookie) {
    const data = await gatewayFetch(CategoryRulesetDocument, { categoryId }, "CategoryRuleset", {
      cookie,
    });
    return data.categoryRuleset.rules;
  },
  async changeOrgProtocol(domain, protocol, config, secret, cookie) {
    const data = await gatewayFetch(
      ChangeOrgProtocolDocument,
      {
        clientSecret: secret?.clientSecret,
        config,
        domain,
        protocol,
        secretRef: secret?.secretRef,
      },
      "ChangeOrgProtocol",
      { cookie },
    );
    return data.changeOrgProtocol;
  },
  async closeCase(caseId, outcome, correctiveActions, closingMessage, cookie) {
    const data = await gatewayFetch(
      CloseCaseDocument,
      { caseId, closingMessage, correctiveActions, outcome },
      "CloseCase",
      { cookie },
    );
    return data.closeCase;
  },
  async completionReport(policyVersionId, groupId, cookie) {
    const data = await gatewayFetch(
      CompletionReportDocument,
      { groupId, policyVersionId },
      "CompletionReport",
      { cookie },
    );
    return data.completionReport;
  },
  async contactBlocks(includeArchived, cookie) {
    const data = await gatewayFetch(ContactBlocksDocument, { includeArchived }, "ContactBlocks", {
      cookie,
    });
    return data.contactBlocks;
  },
  async createContactBlock(block, cookie) {
    const data = await gatewayFetch(CreateContactBlockDocument, { block }, "CreateContactBlock", {
      cookie,
    });
    return data.createContactBlock;
  },
  async createDefinition(input, cookie) {
    const data = await gatewayFetch(CreateDefinitionDocument, { input }, "CreateDefinition", {
      cookie,
    });
    return data.createDefinition;
  },
  async createGroup(input, cookie) {
    const data = await gatewayFetch(CreateCategoryDocument, input, "CreateCategory", { cookie });
    return data.createCategory;
  },
  async createMagicLink(policyVersionId, sensitive, cookie) {
    const data = await gatewayFetch(
      CreateMagicLinkDocument,
      { policyVersionId, sensitive },
      "CreateMagicLink",
      { cookie },
    );
    return data.createMagicLink;
  },
  async createPlatformGroup(name, parentId, cookie) {
    const data = await gatewayFetch(
      CreatePlatformGroupDocument,
      { name, parentId },
      "CreatePlatformGroup",
      { cookie },
    );
    return data.createPlatformGroup;
  },
  async createPolicy(input, cookie) {
    const data = await gatewayFetch(
      CreatePolicyDocument,
      {
        documentType: input.documentType,
        homeCategoryId: input.homeGroupId,
        sensitivity: input.sensitivity,
        templateId: input.templateId,
        title: input.title,
      },
      "CreatePolicy",
      { cookie },
    );
    // Freeform is blank: creating without a template takes the category's default, so a freeform
    // policy is set to no template straight after, which starts its untouched draft again, empty.
    if (input.freeform) {
      const freeform = await gatewayFetch(
        SetPolicyTemplateDocument,
        { none: true, policyId: data.createPolicy.id },
        "SetPolicyTemplate",
        { cookie },
      );
      return policyView(freeform.setPolicyTemplate, cookie);
    }
    return policyView(data.createPolicy, cookie);
  },
  async createReference(input, cookie) {
    const data = await gatewayFetch(CreateReferenceDocument, { input }, "CreateReference", {
      cookie,
    });
    return data.createReference;
  },
  async createTemplate(name, ownerCategoryId, cookie) {
    const data = await gatewayFetch(
      CreateTemplateDocument,
      { name, ownerCategoryId },
      "CreateTemplate",
      { cookie },
    );
    return data.createTemplate;
  },
  async createTemplateVersion(templateId, sections, cookie) {
    const data = await gatewayFetch(
      CreateTemplateVersionDocument,
      { sections, templateId },
      "CreateTemplateVersion",
      { cookie },
    );
    return data.createTemplateVersion;
  },
  async createWorkflowDef(name, description, stages, cookie) {
    const data = await gatewayFetch(
      CreateWorkflowDefDocument,
      { description, name, stages },
      "CreateWorkflowDef",
      { cookie },
    );
    return data.createWorkflowDef;
  },
  async definitions(categoryId, includeArchived, cookie) {
    const data = await gatewayFetch(
      DefinitionsDocument,
      { categoryId, includeArchived },
      "Definitions",
      { cookie },
    );
    return data.definitions;
  },
  async deleteAppendix(id, cookie) {
    const data = await gatewayFetch(DeleteAppendixDocument, { id }, "DeleteAppendix", { cookie });
    return data.deleteAppendix;
  },
  async deleteDefinition(id, cookie) {
    const data = await gatewayFetch(DeleteDefinitionDocument, { id }, "DeleteDefinition", {
      cookie,
    });
    return data.deleteDefinition;
  },
  async deleteGroup(id, cookie) {
    const data = await gatewayFetch(DeleteCategoryDocument, { id }, "DeleteCategory", { cookie });
    return data.deleteCategory;
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
  async deletePolicy(id, cookie) {
    const data = await gatewayFetch(DeletePolicyDocument, { id }, "DeletePolicy", { cookie });
    return data.deletePolicy;
  },
  async deleteReference(id, cookie) {
    const data = await gatewayFetch(DeleteReferenceDocument, { id }, "DeleteReference", {
      cookie,
    });
    return data.deleteReference;
  },
  async deleteTemplate(id, cookie) {
    const data = await gatewayFetch(DeleteTemplateDocument, { id }, "DeleteTemplate", { cookie });
    return data.deleteTemplate;
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
  async discardTemplateVersion(id, cookie) {
    const data = await gatewayFetch(
      DiscardTemplateVersionDocument,
      { id },
      "DiscardTemplateVersion",
      { cookie },
    );
    return data.discardTemplateVersion;
  },
  async draftVersion(policyId, cookie) {
    const { policy } = await gatewayFetch(PolicyDocument, { id: policyId }, "Policy", { cookie });
    if (!policy?.currentDraftVersionId) return null;
    const data = await gatewayFetch(
      PolicyVersionDocument,
      { id: policy.currentDraftVersionId },
      "PolicyVersion",
      { cookie },
    );
    return data.policyVersion ?? null;
  },

  async emailServiceConfig(cookie) {
    const data = await gatewayFetch(EmailServiceConfigDocument, {}, "EmailServiceConfig", {
      cookie,
    });
    return data.emailServiceConfig;
  },
  async enableUser(userId, cookie) {
    const data = await gatewayFetch(EnableUserDocument, { userId }, "EnableUser", { cookie });
    return data.enableUser;
  },
  async exportAcks(policyVersionId, format, cookie) {
    const data = await gatewayFetch(ExportAcksDocument, { format, policyVersionId }, "ExportAcks", {
      cookie,
    });
    return data.exportAcks;
  },
  extractDocument(file, cookie) {
    return gatewayRestUpload<{ content: string; title: string }>(
      "/documents/extract",
      file,
      "ExtractDocument",
      { cookie },
    );
  },
  async fetchIdpCert(url, cookie) {
    const body = await gatewayRestFetch<{ certificatePem: string }>(
      "/admin/idp/fetch-cert",
      { url },
      "FetchIdpCert",
      { cookie },
    );
    return body.certificatePem;
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
  async globalSettings(cookie) {
    const data = await gatewayFetch(GlobalSettingsDocument, {}, "GlobalSettings", { cookie });
    return data.globalSettings;
  },
  async grantRole(userId, role, cookie) {
    const data = await gatewayFetch(GrantRoleDocument, { role, userId }, "GrantRole", { cookie });
    return data.grantRole;
  },
  async groupChildren(parentId, cookie) {
    return categoryChildren(parentId, cookie);
  },
  async groupMappings(connectionId, cookie) {
    const data = await gatewayFetch(GroupMappingsDocument, { connectionId }, "GroupMappings", {
      cookie,
    });
    return data.groupMappings;
  },
  async impersonationStatus(cookie) {
    const data = await gatewayFetch(ImpersonationStatusDocument, {}, "ImpersonationStatus", {
      cookie,
    });
    return data.impersonationStatus ?? null;
  },
  async importIdpMetadata(url, cookie) {
    return gatewayRestFetch("/admin/idp/import-metadata", { url }, "ImportIdpMetadata", { cookie });
  },
  async issueAppendixCollabToken(appendixId, cookie) {
    const data = await gatewayFetch(
      IssueAppendixCollabTokenDocument,
      { appendixId },
      "IssueAppendixCollabToken",
      { cookie },
    );
    return data.issueAppendixCollabToken;
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
  liveEvents(topics, cookie, onEvent, signal) {
    return watchLiveEvents(topics, cookie, onEvent, signal);
  },
  async managedGroupMembers(groupId, cookie) {
    const data = await gatewayFetch(
      ManagedGroupMembersDocument,
      { groupId },
      "ManagedGroupMembers",
      { cookie },
    );
    return data.managedGroupMembers;
  },
  async completeOnboarding(input, cookie) {
    const data = await gatewayFetch(
      CompleteOnboardingDocument,
      { acceptTerms: true, ...input },
      "CompleteOnboarding",
      { cookie },
    );
    return toMe(data.completeOnboarding);
  },
  async me(cookie) {
    try {
      const { me } = await gatewayFetch(MeDocument, {}, "Me", { cookie });
      return toMe(me);
    } catch (error) {
      if (isUnauthenticated(error)) return null;
      throw error;
    }
  },
  async mergeAccounts(sourceUserId, targetUserId, confirmPrivileged, idempotencyKey, cookie) {
    const data = await gatewayFetch(
      MergeAccountsDocument,
      {
        confirmPrivileged: confirmPrivileged ?? null,
        idempotencyKey: idempotencyKey ?? null,
        sourceUserId,
        targetUserId,
      },
      "MergeAccounts",
      { cookie },
    );
    return data.mergeAccounts;
  },
  async mintSsoTestLink(input, cookie) {
    return gatewayRestFetch(
      "/admin/sso/test-link",
      {
        alias: input.alias,
        connectionId: input.connectionId,
        returnPath: input.returnPath ?? "",
        tenant: input.tenant ?? "",
      },
      "MintSsoTestLink",
      { cookie },
    );
  },
  async moveGroup(groupId, newParentId, cookie) {
    const data = await gatewayFetch(
      MoveCategoryDocument,
      { categoryId: groupId, newParentId },
      "MoveCategory",
      { cookie },
    );
    return data.moveCategory;
  },
  async movePolicies(policyIds, homeCategoryId, cookie) {
    const data = await gatewayFetch(
      MovePoliciesDocument,
      { homeCategoryId, policyIds: [...policyIds] },
      "MovePolicies",
      { cookie },
    );
    return data.movePolicies.moved;
  },
  async movePolicy(policyId, homeCategoryId, cookie) {
    const data = await gatewayFetch(
      MovePolicyDocument,
      { homeCategoryId, policyId },
      "MovePolicy",
      { cookie },
    );
    return data.movePolicy;
  },
  async previewMovePolicies(policyIds, homeCategoryId, cookie) {
    const data = await gatewayFetch(
      PreviewMovePoliciesDocument,
      { homeCategoryId, policyIds: [...policyIds] },
      "PreviewMovePolicies",
      { cookie },
    );
    return data.previewMovePolicies.items;
  },
  async myAckSummary(cookie) {
    const { myAckSummary } = await gatewayFetch(MyAckSummaryDocument, {}, "MyAckSummary", {
      cookie,
    });
    return { done: myAckSummary.done, required: myAckSummary.required };
  },
  async myDraftPolicies(cookie) {
    const [{ myDrafts }, index] = await Promise.all([
      gatewayFetch(MyDraftsDocument, {}, "MyDrafts", { cookie }),
      categoryIndex(cookie),
    ]);
    return Promise.all(myDrafts.map((p) => policyView(p, cookie, index)));
  },
  async myObligations(cookie) {
    const { myObligations } = await gatewayFetch(MyObligationsDocument, {}, "MyObligations", {
      cookie,
    });
    return myObligations.map(({ number, policyId, policyVersionId, title, version }) => ({
      number,
      policyId,
      policyVersionId,
      title,
      version,
    }));
  },
  async beginMyPasskeyRegistration(cookie) {
    const data = await gatewayFetch(WebauthnRegisterBeginDocument, {}, "WebauthnRegisterBegin", {
      cookie,
    });
    return data.webauthnRegisterBegin;
  },
  async beginMyTotpEnrolment(cookie) {
    const data = await gatewayFetch(EnrollTotpBeginDocument, {}, "EnrollTotpBegin", { cookie });
    return data.enrollTotpBegin;
  },
  async confirmMyTotpEnrolment(code, cookie) {
    const data = await gatewayFetch(EnrollTotpConfirmDocument, { code }, "EnrollTotpConfirm", {
      cookie,
    });
    return data.enrollTotpConfirm;
  },
  async finishMyPasskeyRegistration(sessionId, credentialJson, label, cookie) {
    const data = await gatewayFetch(
      WebauthnRegisterFinishDocument,
      { credentialJson, label: label ?? null, sessionId },
      "WebauthnRegisterFinish",
      { cookie },
    );
    return data.webauthnRegisterFinish;
  },
  async myPasskeys(cookie) {
    const data = await gatewayFetch(MyWebauthnCredentialsDocument, {}, "MyWebauthnCredentials", {
      cookie,
    });
    return data.myWebauthnCredentials;
  },
  async notificationPreferences(cookie) {
    const data = await gatewayFetch(NotificationSettingsDocument, {}, "NotificationSettings", {
      cookie,
    });
    return { catalog: data.notificationTypeCatalog, settings: data.notificationSettings };
  },
  async removeMyFactor(kind, cookie) {
    const data = await gatewayFetch(RemoveFactorDocument, { kind }, "RemoveFactor", { cookie });
    return data.removeFactor;
  },
  async removeMyPasskey(credentialId, cookie) {
    const data = await gatewayFetch(
      RemoveWebauthnCredentialDocument,
      { credentialId },
      "RemoveWebauthnCredential",
      { cookie },
    );
    return data.removeWebauthnCredential;
  },
  async renameMyMethod(methodId, label, cookie) {
    const data = await gatewayFetch(
      RenameMfaMethodDocument,
      { label, methodId },
      "RenameMfaMethod",
      { cookie },
    );
    return data.renameMfaMethod;
  },
  async revokeMySessions(cookie) {
    const data = await gatewayFetch(RevokeMySessionsDocument, {}, "RevokeMySessions", { cookie });
    return data.revokeMySessions;
  },
  async setCategoryCadence(category, cadence, cookie) {
    const data = await gatewayFetch(
      SetCategoryCadenceDocument,
      { cadence, category },
      "SetCategoryCadence",
      { cookie },
    );
    return data.setCategoryCadence;
  },
  async setDigestWindow(dailyHour, weeklyDow, cookie) {
    const data = await gatewayFetch(
      SetDigestWindowDocument,
      { dailyHour, weeklyDow },
      "SetDigestWindow",
      { cookie },
    );
    return data.setDigestWindow;
  },
  async setNotificationChannels(input, cookie) {
    const data = await gatewayFetch(
      SetNotificationChannelsDocument,
      { input },
      "SetNotificationChannels",
      { cookie },
    );
    return data.setNotificationChannels;
  },
  async setTypeCadence(kind, cadence, cookie) {
    const data = await gatewayFetch(SetTypeCadenceDocument, { cadence, kind }, "SetTypeCadence", {
      cookie,
    });
    return data.setTypeCadence;
  },
  async myFactors(cookie) {
    const data = await gatewayFetch(MyFactorsDocument, {}, "MyFactors", { cookie });
    return data.myFactors;
  },
  async myManagedGroups(cookie) {
    const data = await gatewayFetch(MyManagedGroupsDocument, {}, "MyManagedGroups", { cookie });
    return data.myManagedGroups;
  },
  async organizations(cookie) {
    const data = await gatewayFetch(OrganizationsDocument, {}, "Organizations", { cookie });
    return data.organizations;
  },
  async parseIdpMetadata(metadata, cookie) {
    return gatewayRestFetch("/admin/idp/parse-metadata", { metadata }, "ParseIdpMetadata", {
      cookie,
    });
  },
  async pdfDownloadLink(jobId, cookie) {
    const data = await gatewayFetch(PdfDownloadLinkDocument, { jobId }, "PdfDownloadLink", {
      cookie,
    });
    return data.pdfDownloadLink;
  },
  async pendingTasks(cookie) {
    const data = await gatewayFetch(PendingTasksDocument, {}, "PendingTasks", { cookie });
    return data.pendingTasks;
  },
  async platformGroups(parentId, cookie) {
    const data = await gatewayFetch(PlatformGroupsDocument, { parentId }, "PlatformGroups", {
      cookie,
    });
    return data.platformGroups;
  },
  async policies(documentType, cookie) {
    return catalog(documentType, await categoryIndex(cookie), cookie);
  },
  async policy(id, cookie) {
    const data = await gatewayFetch(PolicyDocument, { id }, "Policy", { cookie });
    return data.policy ? policyView(data.policy, cookie) : null;
  },
  async policyByNumber(number, cookie) {
    const found = await gatewayFetch(PolicyByNumberDocument, { number }, "PolicyByNumber", {
      cookie,
    }).then(
      (data) => data.policyByNumber,
      (error: unknown) => {
        if (isNotFound(error)) return null;
        throw error;
      },
    );
    return found ? policyView(found, cookie) : null;
  },
  async policyDetail(documentType, number, cookie) {
    // The gateway refuses a number the caller may not read with NotFound, the same as one
    // that doesn't exist; both answer null so the reader can't tell the two apart.
    const [index, found] = await Promise.all([
      categoryIndex(cookie),
      gatewayFetch(PolicyByNumberDocument, { number }, "PolicyByNumber", { cookie }).then(
        (data) => data.policyByNumber,
        (error: unknown) => {
          if (isNotFound(error)) return null;
          throw error;
        },
      ),
    ]);
    // A policy nobody has published is not for readers: only someone who can edit it finds it.
    const readable =
      found?.documentType === documentType &&
      (Boolean(found.currentPublishedVersionId) || found.viewerCan.edit);
    return found && readable ? assembleDetail(found, index, cookie) : null;
  },
  async recordPolicyExport(policyId, kind, includeHistory, cookie) {
    if (exportAuditMissing) return false;
    try {
      const data = await gatewayFetch(
        RecordPolicyExportDocument,
        { includeHistory, kind, policyId },
        "RecordPolicyExport",
        { cookie },
      );
      return data.recordPolicyExport;
    } catch (error) {
      if (error instanceof GatewayError && /Cannot query field|Unknown type/i.test(error.message)) {
        exportAuditMissing = true;
        return false;
      }
      throw error;
    }
  },
  async requestPdfExport(policyVersionId, cookie) {
    const data = await gatewayFetch(
      RequestPdfExportDocument,
      { policyVersionId },
      "RequestPdfExport",
      { cookie },
    );
    return data.requestPDFExport;
  },
  async retirePolicy(id, cookie) {
    const data = await gatewayFetch(RetirePolicyDocument, { id }, "RetirePolicy", { cookie });
    return data.retirePolicy;
  },
  async revokeMagicLink(token, cookie) {
    const data = await gatewayFetch(RevokeMagicLinkDocument, { token }, "RevokeMagicLink", {
      cookie,
    });
    return data.revokeMagicLink;
  },
  async setCategoryTemplateLock(id, locked, cookie) {
    const data = await gatewayFetch(
      SetCategoryTemplateLockDocument,
      { id, locked },
      "SetCategoryTemplateLock",
      { cookie },
    );
    return data.setCategoryTemplateLock.defaultTemplateLocked;
  },
  async setAiEnabled(enabled, cookie) {
    const data = await gatewayFetch(SetAiEnabledDocument, { enabled }, "SetAiEnabled", { cookie });
    return data.setAIEnabled;
  },
  async setAiProviderCredential(credential, cookie) {
    const data = await gatewayFetch(
      SetAiProviderCredentialDocument,
      { credential },
      "SetAiProviderCredential",
      { cookie },
    );
    return data.setAIProviderCredential;
  },
  async setAiRetrievalConfig(topK, cookie) {
    const data = await gatewayFetch(
      SetAiRetrievalConfigDocument,
      { topK },
      "SetAiRetrievalConfig",
      { cookie },
    );
    return data.setAIRetrievalConfig.topK;
  },
  async setPolicyOwner(policyId, ownerUserId, cookie) {
    const data = await gatewayFetch(
      SetPolicyOwnerDocument,
      { ownerUserId, policyId },
      "SetPolicyOwner",
      { cookie },
    );
    return data.setPolicyOwner;
  },
  async versionDocument(versionId, cookie) {
    const { policyVersion } = await gatewayFetch(
      PolicyVersionDocument,
      { id: versionId },
      "PolicyVersion",
      { cookie },
    );
    if (!policyVersion) return null;
    return {
      appendices: policyVersion.appendices.map((a) => ({
        id: a.id,
        letter: a.letter,
        text: appendixText(a.contentJson),
        title: a.title,
      })),
      blocks: documentBlocksFromContent(policyVersion.contentJson),
      contentJson: policyVersion.contentJson,
      version: semanticVersion(policyVersion.versionNo),
    };
  },
  async markVersionReviewed(policyVersionId, cookie) {
    const data = await gatewayFetch(
      MarkVersionReviewedDocument,
      { policyVersionId },
      "MarkVersionReviewed",
      { cookie },
    );
    return data.markVersionReviewed;
  },
  async versionChangesSinceReview(policyVersionId, cookie) {
    const data = await gatewayFetch(
      VersionChangesSinceReviewDocument,
      { policyVersionId },
      "VersionChangesSinceReview",
      { cookie },
    );
    return data.versionChangesSinceReview;
  },
  async versionDiff(fromVersionId, toVersionId, cookie) {
    const data = await gatewayFetch(
      DiffVersionsDocument,
      { fromVersionId, toVersionId },
      "DiffVersions",
      { cookie },
    );
    return data.diffVersions;
  },
  async postCaseMessage(caseId, body, cookie) {
    const data = await gatewayFetch(PostCaseMessageDocument, { body, caseId }, "PostCaseMessage", {
      cookie,
    });
    return data.postCaseMessage;
  },
  async previewAccountMerge(sourceUserId, targetUserId, cookie) {
    const data = await gatewayFetch(
      PreviewAccountMergeDocument,
      { sourceUserId, targetUserId },
      "PreviewAccountMerge",
      { cookie },
    );
    return data.previewAccountMerge;
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
  async publishTemplateVersion(id, cookie) {
    const data = await gatewayFetch(
      PublishTemplateVersionDocument,
      { id },
      "PublishTemplateVersion",
      { cookie },
    );
    return data.publishTemplateVersion;
  },
  async reassignUserPolicies(fromUserId, toUserId, cookie) {
    const data = await gatewayFetch(
      ReassignUserPoliciesDocument,
      { fromUserId, toUserId },
      "ReassignUserPolicies",
      { cookie },
    );
    return data.reassignUserPolicies;
  },
  async recordRiskAssessment(caseId, factors, decision, reason, cookie) {
    const data = await gatewayFetch(
      RecordRiskAssessmentDocument,
      { caseId, decision, factors, reason },
      "RecordRiskAssessment",
      { cookie },
    );
    return data.recordRiskAssessment;
  },
  async references(includeArchived, cookie) {
    const data = await gatewayFetch(ReferencesDocument, { includeArchived }, "References", {
      cookie,
    });
    return data.references;
  },
  async removeUserFromGroup(userId, groupId, cookie) {
    const data = await gatewayFetch(
      RemoveUserFromGroupDocument,
      { groupId, userId },
      "RemoveUserFromGroup",
      { cookie },
    );
    return data.removeUserFromGroup;
  },
  async removeUserMfaFactor(userId, methodId, cookie) {
    const data = await gatewayFetch(
      RemoveUserMfaFactorDocument,
      { methodId, userId },
      "RemoveUserMfaFactor",
      { cookie },
    );
    return data.removeUserMfaFactor;
  },
  async renameGroup(id, name, slug, cookie) {
    const data = await gatewayFetch(RenameCategoryDocument, { id, name, slug }, "RenameCategory", {
      cookie,
    });
    return data.renameCategory;
  },
  async renameTemplate(id, name, cookie) {
    const data = await gatewayFetch(RenameTemplateDocument, { id, name }, "RenameTemplate", {
      cookie,
    });
    return data.renameTemplate;
  },
  async renameUserMfaFactor(userId, methodId, label, cookie) {
    const data = await gatewayFetch(
      RenameUserMfaFactorDocument,
      { label, methodId, userId },
      "RenameUserMfaFactor",
      { cookie },
    );
    return data.renameUserMfaFactor;
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
  async reportCase(caseId, cookie) {
    const data = await gatewayFetch(ReportCaseDocument, { caseId }, "ReportCase", { cookie });
    return data.reportCase;
  },
  async reportCases(statuses, assigneeUserId, cookie) {
    const data = await gatewayFetch(
      ReportCasesDocument,
      { assigneeUserId, statuses },
      "ReportCases",
      { cookie },
    );
    return data.reportCases;
  },
  async requestStepUpOtp(cookie) {
    const data = await gatewayFetch(RequestStepUpOtpDocument, {}, "RequestStepUpOtp", { cookie });
    return data.requestStepUpOtp;
  },
  async resendWelcomeEmail(userId, cookie) {
    const data = await gatewayFetch(ResendWelcomeEmailDocument, { userId }, "ResendWelcomeEmail", {
      cookie,
    });
    return data.resendWelcomeEmail;
  },
  async resetUserPassword(userId, newPassword, cookie) {
    const data = await gatewayFetch(
      ResetUserPasswordDocument,
      { newPassword, userId },
      "ResetUserPassword",
      { cookie },
    );
    return data.resetUserPassword;
  },
  async resolveUserLabels(ids, cookie) {
    if (ids.length === 0) return [];
    const data = await gatewayFetch(
      ResolveUserLabelsDocument,
      { ids: [...ids] },
      "ResolveUserLabels",
      { cookie },
    );
    return data.resolveUserLabels;
  },
  async retireTemplate(id, cookie) {
    const data = await gatewayFetch(RetireTemplateDocument, { id }, "RetireTemplate", { cookie });
    return data.retireTemplate;
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
  async startDraft(policyId, cookie) {
    const { policy } = await gatewayFetch(PolicyDocument, { id: policyId }, "Policy", { cookie });
    if (!policy) return null;
    const sourceId = policy.currentDraftVersionId ?? policy.currentPublishedVersionId;
    if (!sourceId) return null;
    const { policyVersion } = await gatewayFetch(
      PolicyVersionDocument,
      { id: sourceId },
      "PolicyVersion",
      { cookie },
    );
    if (!policyVersion) return null;
    if (policy.currentDraftVersionId) return policyVersion;
    const saved = await gatewayFetch(
      SaveDraftDocument,
      {
        contentJson: policyVersion.contentJson,
        policyId,
        templateVersionId: policyVersion.templateVersionId || null,
      },
      "SaveDraft",
      { cookie },
    );
    return saved.saveDraft;
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
  async searchAndAnswer(question, cookie) {
    const data = await gatewayFetch(
      SearchAndAnswerDocument,
      { categoryId: null, question },
      "SearchAndAnswer",
      { cookie },
    );
    return data.searchAndAnswer;
  },
  async searchUsers(query, limit, cookie) {
    const data = await gatewayFetch(
      SearchUsersDocument,
      { limit: limit ?? null, query },
      "SearchUsers",
      { cookie },
    );
    return data.searchUsers;
  },
  async setCaseDiscoveryDate(caseId, discoveredOn, cookie) {
    const data = await gatewayFetch(
      SetCaseDiscoveryDateDocument,
      { caseId, discoveredOn },
      "SetCaseDiscoveryDate",
      { cookie },
    );
    return data.setCaseDiscoveryDate;
  },
  async setCaseStatus(caseId, status, cookie) {
    const data = await gatewayFetch(SetCaseStatusDocument, { caseId, status }, "SetCaseStatus", {
      cookie,
    });
    return data.setCaseStatus;
  },
  async setCategoryRuleset(categoryId, rules, cookie) {
    const data = await gatewayFetch(
      SetCategoryRulesetDocument,
      { categoryId, rules: [...rules] },
      "SetCategoryRuleset",
      { cookie },
    );
    return data.setCategoryRuleset.rules;
  },
  async setContactBlockArchived(id, archived, cookie) {
    const data = await gatewayFetch(
      SetContactBlockArchivedDocument,
      { archived, id },
      "SetContactBlockArchived",
      { cookie },
    );
    return data.setContactBlockArchived;
  },
  async setDefinitionArchived(id, archived, cookie) {
    const data = await gatewayFetch(
      SetDefinitionArchivedDocument,
      { archived, id },
      "SetDefinitionArchived",
      { cookie },
    );
    return data.setDefinitionArchived;
  },
  async setEmailServiceConfig(input, cookie) {
    const data = await gatewayFetch(
      SetEmailServiceConfigDocument,
      { input },
      "SetEmailServiceConfig",
      { cookie },
    );
    return data.setEmailServiceConfig;
  },
  async setGlobalSettings(input, cookie) {
    const data = await gatewayFetch(SetGlobalSettingsDocument, { input }, "SetGlobalSettings", {
      cookie,
    });
    return data.setGlobalSettings;
  },
  async setReferenceArchived(id, archived, cookie) {
    const data = await gatewayFetch(
      SetReferenceArchivedDocument,
      { archived, id },
      "SetReferenceArchived",
      { cookie },
    );
    return data.setReferenceArchived;
  },
  async setUserPolicyOverride(userId, policyNumber, effect, cookie) {
    const data = await gatewayFetch(
      SetUserPolicyOverrideDocument,
      { effect, policyNumber, userId },
      "SetUserPolicyOverride",
      { cookie },
    );
    return data.setUserPolicyOverride;
  },
  async signalWorkflow(policyVersionId, runId, taskId, signal, comment, cookie) {
    const data = await gatewayFetch(
      SignalWorkflowDocument,
      { comment, policyVersionId, runId, signal, taskId },
      "SignalWorkflow",
      { cookie },
    );
    return data.signalWorkflow;
  },
  async simulateCategory(categoryId, userId, draftRules, cookie) {
    const data = await gatewayFetch(
      SimulateCategoryDocument,
      { categoryId, draftRules: draftRules ? [...draftRules] : null, userId },
      "SimulateCategory",
      { cookie },
    );
    return data.simulateCategory;
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
  async startImpersonation(userId, reason, cookie) {
    const data = await gatewayFetch(
      StartImpersonationDocument,
      { reason, userId },
      "StartImpersonation",
      { cookie },
    );
    return data.startImpersonation;
  },
  async stopImpersonation(cookie) {
    const data = await gatewayFetch(StopImpersonationDocument, {}, "StopImpersonation", {
      cookie,
    });
    return data.stopImpersonation;
  },
  async submitDraftGeneration(input, cookie) {
    const data = await gatewayFetch(
      SubmitDraftGenerationDocument,
      {
        input: {
          brief: input.brief,
          categoryId: input.homeGroupId,
          ...(input.referenceDocuments?.length
            ? { referenceDocuments: input.referenceDocuments }
            : {}),
          ...(input.referenceHints?.length ? { referenceHints: input.referenceHints } : {}),
          sections: input.sections,
          title: input.title,
        },
      },
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
  async submitPolicyRevision(input, cookie) {
    const data = await gatewayFetch(
      SubmitPolicyRevisionDocument,
      { input },
      "SubmitPolicyRevision",
      { cookie },
    );
    return data.submitPolicyRevision;
  },
  async submitWorkflow(policyVersionId, policyId, categoryId, cookie) {
    // ancestorCategoryIds stays empty: the gateway rebuilds the lineage from categoryId and
    // falls back to the client's list only when it finds none.
    const data = await gatewayFetch(
      SubmitWorkflowDocument,
      { ancestorCategoryIds: [], categoryId, policyId, policyVersionId },
      "SubmitWorkflow",
      { cookie },
    );
    return { runId: data.submitWorkflow.runId };
  },
  async templates(cookie) {
    const data = await gatewayFetch(TemplatesDocument, {}, "Templates", { cookie });
    return data.templates;
  },
  async templateVersions(templateId, cookie) {
    const data = await gatewayFetch(TemplateVersionsDocument, { templateId }, "TemplateVersions", {
      cookie,
    });
    return data.templateVersions;
  },
  async topPolicyQuestions(limit, cookie) {
    const data = await gatewayFetch(
      TopPolicyQuestionsDocument,
      { limit: limit ?? null },
      "TopPolicyQuestions",
      { cookie },
    );
    return data.topPolicyQuestions;
  },
  async transferRoot(userId, otp, cookie) {
    const data = await gatewayFetch(TransferRootDocument, { otp, userId }, "TransferRoot", {
      cookie,
    });
    return data.transferRoot;
  },
  async upcomingApprovals(cookie) {
    const data = await gatewayFetch(UpcomingApprovalsDocument, {}, "UpcomingApprovals", {
      cookie,
    });
    return data.upcomingApprovals;
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
  async updateCaseNotice(caseId, noticeId, status, sentOn, cookie) {
    const data = await gatewayFetch(
      UpdateCaseNoticeDocument,
      { caseId, noticeId, sentOn, status },
      "UpdateCaseNotice",
      { cookie },
    );
    return data.updateCaseNotice;
  },
  async updateContactBlock(id, block, cookie) {
    const data = await gatewayFetch(
      UpdateContactBlockDocument,
      { block, id },
      "UpdateContactBlock",
      { cookie },
    );
    return data.updateContactBlock;
  },
  async updateDefinition(id, input, cookie) {
    const data = await gatewayFetch(UpdateDefinitionDocument, { id, input }, "UpdateDefinition", {
      cookie,
    });
    return data.updateDefinition;
  },
  async updateGroupSettings(input, cookie) {
    const { category } = await gatewayFetch(CategoryDocument, { id: input.id }, "Category", {
      cookie,
    });
    if (!category) {
      throw new GatewayError("UpdateGroupSettings", "category not found", { code: "NOT_FOUND" });
    }
    // the lock is only read when the caller sets it, to compare
    const lockedIds =
      input.defaultTemplateLocked === undefined
        ? new Set<string>()
        : await categoryTemplateLocks(cookie);
    const locked = lockedIds.has(input.id);
    let current: CategoryExtras & CategoryFieldsFragment = {
      ...category,
      ...(locked ? { defaultTemplateLocked: true } : {}),
    };
    if (
      input.defaultTemplateId !== undefined ||
      input.defaultTemplateNone !== undefined ||
      input.defaultWorkflowId !== undefined
    ) {
      const data = await gatewayFetch(
        SetCategoryDefaultsDocument,
        {
          defaultTemplateId:
            input.defaultTemplateId === undefined
              ? current.defaultTemplateId
              : input.defaultTemplateId,
          defaultTemplateNone: input.defaultTemplateNone ?? current.defaultTemplateNone,
          defaultWorkflowId:
            input.defaultWorkflowId === undefined
              ? current.defaultWorkflowId
              : input.defaultWorkflowId,
          id: input.id,
        },
        "SetCategoryDefaults",
        { cookie },
      );
      current = data.setCategoryDefaults;
    }
    if (
      input.defaultTemplateLocked !== undefined &&
      input.defaultTemplateLocked !== (current.defaultTemplateLocked ?? false)
    ) {
      const data = await gatewayFetch(
        SetCategoryTemplateLockDocument,
        { id: input.id, locked: input.defaultTemplateLocked },
        "SetCategoryTemplateLock",
        { cookie },
      );
      current = {
        ...current,
        defaultTemplateLocked: data.setCategoryTemplateLock.defaultTemplateLocked,
      };
    }
    if (input.documentTypes !== undefined) {
      const data = await gatewayFetch(
        SetCategoryDocumentTypesDocument,
        { documentTypes: input.documentTypes, id: input.id },
        "SetCategoryDocumentTypes",
        { cookie },
      );
      current = { ...current, documentTypes: data.setCategoryDocumentTypes.documentTypes };
    }
    if (
      input.ackEveryone !== undefined ||
      input.ackTriggers !== undefined ||
      input.exclusionGroupIds !== undefined ||
      input.idpGroupIds !== undefined ||
      input.owners !== undefined ||
      input.reviewCadence !== undefined ||
      input.reviewDate !== undefined
    ) {
      const data = await gatewayFetch(
        SetCategoryGovernanceDocument,
        {
          // An unset input keeps an inherited value inherited (null), rather than pinning the
          // category's own copy of it.
          ackEveryone: input.ackEveryone ?? (current.ackEveryoneSet ? current.ackEveryone : null),
          ackTriggers: input.ackTriggers ?? current.ackTriggers,
          exclusionGroupIds:
            input.exclusionGroupIds === undefined
              ? current.exclusionGroupIds
              : input.exclusionGroupIds,
          id: input.id,
          idpGroupIds: input.idpGroupIds === undefined ? current.idpGroupIds : input.idpGroupIds,
          owners: input.owners ?? current.owners,
          reviewCadence: input.reviewCadence ?? current.reviewCadence,
          reviewDate: input.reviewDate === undefined ? current.reviewDate : input.reviewDate,
        },
        "SetCategoryGovernance",
        { cookie },
      );
      current = data.setCategoryGovernance;
    }
    return current;
  },
  async updateIdPConnection(domain, toggles, cookie) {
    const data = await gatewayFetch(
      UpdateIdPConnectionDocument,
      {
        allowLocal: toggles.allowLocal,
        clientSecret: toggles.clientSecret,
        domain,
        jitEnabled: toggles.jitEnabled,
        secretRef: toggles.secretRef,
      },
      "UpdateIdPConnection",
      { cookie },
    );
    return data.updateIdPConnection;
  },
  async updateMyProfile(input, cookie) {
    const data = await gatewayFetch(UpdateMyProfileDocument, input, "UpdateMyProfile", { cookie });
    return toMe(data.updateMyProfile);
  },
  async updateReference(id, input, cookie) {
    const data = await gatewayFetch(UpdateReferenceDocument, { id, input }, "UpdateReference", {
      cookie,
    });
    return data.updateReference;
  },
  async updateTemplateVersionSections(id, sections, cookie) {
    const data = await gatewayFetch(
      UpdateTemplateVersionSectionsDocument,
      { id, sections },
      "UpdateTemplateVersionSections",
      { cookie },
    );
    return data.updateTemplateVersionSections;
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
  async updateWorkflowDef(id, name, description, stages, cookie) {
    const data = await gatewayFetch(
      UpdateWorkflowDefDocument,
      { description, id, name, stages },
      "UpdateWorkflowDef",
      { cookie },
    );
    return data.updateWorkflowDef;
  },
  async userFactors(userId, cookie) {
    const data = await gatewayFetch(UserFactorsDocument, { userId }, "UserFactors", { cookie });
    return data.userFactors;
  },
  async users(input, cookie) {
    const data = await gatewayFetch(UsersDocument, input, "Users", { cookie });
    return data.users;
  },
  validateReferenceUrl(url, cookie) {
    return gatewayRestFetch("/documents/validate-url", { url }, "ValidateReferenceUrl", { cookie });
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
  async runVetoes(policyVersionId, cookie) {
    try {
      const data = await gatewayFetch(RunVetoesDocument, { policyVersionId }, "RunVetoes", {
        cookie,
      });
      return data.workflowStatus.stageAssignees.map((seats) =>
        seats.filter((seat) => seat.veto).map((seat) => seat.userId),
      );
    } catch {
      return [];
    }
  },
  async setWorkflowVetoEnabled(id, enabled, cookie) {
    const data = await gatewayFetch(
      SetWorkflowVetoEnabledDocument,
      { enabled, id },
      "SetWorkflowVetoEnabled",
      { cookie },
    );
    return data.setWorkflowVetoEnabled.vetoEnabled;
  },
  async workflowVetoes(cookie) {
    try {
      const data = await gatewayFetch(WorkflowVetoesDocument, {}, "WorkflowVetoes", { cookie });
      return data.workflowDefs;
    } catch {
      return [];
    }
  },
  async workflowDef(id, cookie) {
    const data = await gatewayFetch(WorkflowDefDocument, { id }, "WorkflowDef", { cookie });
    return data.workflowDef ?? null;
  },
  async workflowDefs(cookie) {
    const data = await gatewayFetch(WorkflowDefsDocument, {}, "WorkflowDefs", { cookie });
    return data.workflowDefs;
  },
  async workflows(cookie) {
    const data = await gatewayFetch(WorkflowDefsDocument, {}, "WorkflowDefs", { cookie });
    return data.workflowDefs;
  },
  async workflowStatus(policyVersionId, cookie) {
    const data = await gatewayFetch(WorkflowStatusDocument, { policyVersionId }, "WorkflowStatus", {
      cookie,
    });
    return data.workflowStatus;
  },
};

export default liveEdge;
