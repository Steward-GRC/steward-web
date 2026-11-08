// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  type Appendix,
  ApprovalStatus,
  type CreatePolicyInput,
  DocumentType,
  type Group,
  type Policy,
  type PolicyVersion,
  SignalType,
  type Template,
  type TemplateVersion,
} from "@steward-web/api-client";
import edge from "@steward-web/edge.server";

import { mergeWorkingDrafts } from "./myDrafts";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

/** The groups a signed-in author may create a policy under. */
export const listAuthorableGroups = (request: Request): Promise<readonly Group[]> =>
  edge.authorableGroups(cookieOf(request));

/** The templates selectable when creating a policy. */
export const listAuthorableTemplates = (request: Request): Promise<readonly Template[]> =>
  edge.authorableTemplates(null, cookieOf(request));

/** A template's current section outline, for the scaffold and the required-section gate. */
export const getLatestTemplateVersion = (
  request: Request,
  templateId: string,
): Promise<null | TemplateVersion> => edge.latestTemplateVersion(templateId, cookieOf(request));

/**
 * The documents with a saved working draft that this person can pick up: the ones they own
 * and every library document with a draft they can edit (the draft is shared, #75). A library
 * that can't be read leaves just the owned ones.
 */
export const workingDraftsFor = async (cookie?: string): Promise<readonly Policy[]> => {
  const [owned, policies, procedures] = await Promise.all([
    edge.myDraftPolicies(cookie),
    edge.policies(DocumentType.Policy, cookie).catch(() => []),
    edge.policies(DocumentType.Procedure, cookie).catch(() => []),
  ]);
  return mergeWorkingDrafts(owned, [...policies, ...procedures]);
};

export const listMyDraftPolicies = (request: Request): Promise<readonly Policy[]> =>
  workingDraftsFor(cookieOf(request));

/** One policy by backend id, for the editor route. */
export const getPolicy = (request: Request, id: string): Promise<null | Policy> =>
  edge.policy(id, cookieOf(request));

/** One policy or procedure by its record number (the address of its draft pages). */
export const getPolicyByNumber = (request: Request, number: string): Promise<null | Policy> =>
  edge.policyByNumber(number, cookieOf(request));

/** The backend id behind a record number; a 404 when there is no such record for this caller. */
export const policyIdOfNumber = async (request: Request, number: string): Promise<string> => {
  const policy = await getPolicyByNumber(request, number);
  if (!policy) throw new Response("Not Found", { status: 404 });
  return policy.id;
};

/** The working draft version of a policy's content. */
export const getDraftVersion = (
  request: Request,
  policyId: string,
): Promise<null | PolicyVersion> => edge.draftVersion(policyId, cookieOf(request));

export const createPolicy = (request: Request, input: CreatePolicyInput): Promise<Policy> =>
  edge.createPolicy(input, cookieOf(request));

/** The policy's working draft, started from its published version when it has none. */
export const startDraft = (request: Request, policyId: string): Promise<null | PolicyVersion> =>
  edge.startDraft(policyId, cookieOf(request));

export const saveDraft = (
  request: Request,
  policyId: string,
  contentJson: string,
  templateVersionId: null | string,
): Promise<PolicyVersion> =>
  edge.saveDraft(policyId, contentJson, templateVersionId, cookieOf(request));

/**
 * Sends the policy's working draft for review (#110): the gateway's `submitWorkflow` starts
 * the approval run of the workflow its home category carries or inherits. The gateway decides
 * whether one applies and refuses when none does; this only names the draft and the category.
 */
export const submitDraftForReview = async (
  request: Request,
  policyId: string,
): Promise<{ runId: string }> => {
  const policy = await edge.policy(policyId, cookieOf(request));
  if (!policy?.currentDraftVersionId) throw new Response("Not Found", { status: 404 });
  return edge.submitWorkflow(
    policy.currentDraftVersionId,
    policy.id,
    policy.homeGroupId,
    cookieOf(request),
  );
};

/**
 * Takes the submission back from review: the draft stays as it is and goes back to Draft. The run
 * is the one the version is in; the author needs no task to withdraw.
 */
export const withdrawFromReview = async (request: Request, policyId: string): Promise<boolean> => {
  const policy = await edge.policy(policyId, cookieOf(request));
  if (!policy?.currentDraftVersionId) throw new Response("Not Found", { status: 404 });
  const run = await edge.workflowStatus(policy.currentDraftVersionId, cookieOf(request));
  return edge.signalWorkflow(
    policy.currentDraftVersionId,
    run.runId,
    "",
    SignalType.SignalTypeWithdraw,
    "",
    cookieOf(request),
  );
};

/**
 * Whether the working draft is with its approvers. steward-workflow keeps the run's status on
 * the run, not on the version (core's version stays a draft), so the run is read first; the
 * version's own status answers when the run can't be read.
 */
export const isDraftInReview = async (request: Request, draft: PolicyVersion): Promise<boolean> => {
  const byVersion = draft.status.toUpperCase() === "IN_REVIEW";
  try {
    const run = await edge.workflowStatus(draft.id, cookieOf(request));
    return run.status === ApprovalStatus.ApprovalStatusInReview || byVersion;
  } catch {
    return byVersion;
  }
};

export const discardDraft = (request: Request, policyId: string): Promise<boolean> =>
  edge.discardDraft(policyId, cookieOf(request));

export const addAppendix = (
  request: Request,
  policyVersionId: string,
  title: string,
  contentJson: string,
): Promise<Appendix> => edge.addAppendix(policyVersionId, title, contentJson, cookieOf(request));

export const updateAppendix = (
  request: Request,
  id: string,
  title: string,
  contentJson: string,
): Promise<Appendix> => edge.updateAppendix(id, title, contentJson, cookieOf(request));

export const deleteAppendix = (request: Request, id: string): Promise<boolean> =>
  edge.deleteAppendix(id, cookieOf(request));

export const reorderAppendices = (
  request: Request,
  policyVersionId: string,
  orderedIds: readonly string[],
): Promise<readonly Appendix[]> =>
  edge.reorderAppendices(policyVersionId, orderedIds, cookieOf(request));
