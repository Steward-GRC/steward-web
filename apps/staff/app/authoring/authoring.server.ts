// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  ApprovalStatus,
  type ChangePick,
  changeTypeFrom,
  type CreatePolicyInput,
  DocumentType,
  GatewayError,
  type Group,
  isLowering,
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
 *
 * `pick` is what the author chose in the dialog (#390). Core suggests the change type; a pick is
 * sent only when it differs from the suggestion, because leaving it out keeps the suggestion.
 * A first version has no suggestion and takes no pick. A pick below the suggestion needs a
 * reason and is refused here without one, before the gateway is called.
 */
export const submitDraftForReview = async (
  request: Request,
  policyId: string,
  pick?: { change: ChangePick["change"] | null; reason: string },
): Promise<{ runId: string }> => {
  const policy = await edge.policy(policyId, cookieOf(request));
  if (!policy?.currentDraftVersionId) throw new Response("Not Found", { status: 404 });
  let send: ChangePick | undefined;
  if (pick?.change) {
    const draft = await edge.draftVersion(policy.id, cookieOf(request));
    const suggested = changeTypeFrom(draft?.suggestedChangeType);
    if (suggested && pick.change !== suggested) {
      const reason = pick.reason.trim();
      if (isLowering(pick.change, suggested)) {
        if (reason === "") {
          throw new GatewayError(
            "SubmitWorkflow",
            "a change type below the suggestion needs a reason",
            { code: "INVALID_ARGUMENT" },
          );
        }
        send = { change: pick.change, reason };
      } else {
        send = { change: pick.change };
      }
    }
  }
  return edge.submitWorkflow(
    policy.currentDraftVersionId,
    policy.id,
    policy.homeGroupId,
    cookieOf(request),
    send,
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

/** An approver the author can write to: someone with a seat on the step the run is at. */
export interface ReviewApprover {
  id: string;
  name: string;
}

/**
 * The approvers on the step the draft's run is at, each once, for the author to write to one of
 * them. Nobody when the run can't be read or is not in review.
 */
export const reviewApprovers = async (
  request: Request,
  draft: PolicyVersion,
): Promise<ReviewApprover[]> => {
  try {
    const run = await edge.workflowStatus(draft.id, cookieOf(request));
    if (run.status !== ApprovalStatus.ApprovalStatusInReview) return [];
    const seats = run.stageAssignees[run.currentStageIdx] ?? [];
    const seen = new Set<string>();
    return seats.flatMap((seat) => {
      if (seen.has(seat.userId)) return [];
      seen.add(seat.userId);
      return [{ id: seat.userId, name: seat.name ?? seat.userId }];
    });
  } catch {
    return [];
  }
};

export const discardDraft = (request: Request, policyId: string): Promise<boolean> =>
  edge.discardDraft(policyId, cookieOf(request));

/** A policy's appendices with their drafts and history, retired ones included. */
export const listAppendices = (request: Request, policyId: string) =>
  edge.policyAppendices(policyId, true, cookieOf(request));

export const createAppendixDraft = (
  request: Request,
  policyId: string,
  title: string,
  contentJson: string,
) => edge.createAppendix(policyId, title, contentJson, cookieOf(request));

export const saveAppendix = (request: Request, id: string, title: string, contentJson: string) =>
  edge.saveAppendixDraft(id, title, contentJson, cookieOf(request));

export const publishAppendix = (request: Request, id: string) =>
  edge.publishAppendix(id, cookieOf(request));

export const retireAppendix = (request: Request, id: string) =>
  edge.retireAppendix(id, cookieOf(request));

export const restoreAppendix = (request: Request, id: string) =>
  edge.restoreAppendix(id, cookieOf(request));

export const reorderPolicyAppendices = (
  request: Request,
  policyId: string,
  orderedIds: readonly string[],
) => edge.reorderPolicyAppendices(policyId, orderedIds, cookieOf(request));

/** A token for the appendix's own co-editing room. */
export const issueAppendixToken = (request: Request, appendixId: string) =>
  edge.issueAppendixCollabToken(appendixId, cookieOf(request));

/**
 * What a version links to from the libraries, the libraries to pick from and the relationship
 * types. Each part reads on its own: one that fails leaves the others, and the panel is left out
 * only when the links themselves can't be read.
 */
export const getVersionLinkState = async (request: Request, versionId: string) => {
  const cookie = cookieOf(request);
  const [links, relationshipTypes, definitions, references, contacts, policies] = await Promise.all(
    [
      edge.policyVersionLinks(versionId, cookie).catch(() => null),
      edge.relationshipTypes(cookie).catch(() => []),
      edge.definitions(null, false, cookie).catch(() => []),
      edge.references(false, cookie).catch(() => []),
      edge.contactBlocks(false, cookie).catch(() => []),
      // policies and procedures both can be related
      Promise.all([
        edge.policies(DocumentType.Policy, cookie),
        edge.policies(DocumentType.Procedure, cookie),
      ])
        .then((lists) => lists.flat())
        .catch(() => []),
    ],
  );
  if (!links) return null;
  return {
    library: {
      contacts,
      definitions,
      policies: policies.map((policy) => ({
        id: policy.id,
        number: policy.number,
        title: policy.title,
      })),
      references,
    },
    links,
    relationshipTypes,
  };
};

export const setVersionDefinitions = (request: Request, versionId: string, ids: string[]) =>
  edge.setVersionDefinitions(versionId, ids, cookieOf(request));

export const setVersionRelated = (
  request: Request,
  versionId: string,
  links: { policyId: string; type: string }[],
) => edge.setVersionRelated(versionId, links, cookieOf(request));

export const setVersionReferences = (request: Request, versionId: string, ids: string[]) =>
  edge.setVersionReferences(versionId, ids, cookieOf(request));

export const setVersionContacts = (request: Request, versionId: string, ids: string[]) =>
  edge.setVersionContacts(versionId, ids, cookieOf(request));
