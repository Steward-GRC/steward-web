// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  Appendix,
  CreatePolicyInput,
  Group,
  Policy,
  PolicyVersion,
  Template,
  TemplateVersion,
} from "@steward-web/api-client";

import edge from "@steward-web/edge.server";

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

/** The calling author's own policies with a working draft. */
export const listMyDraftPolicies = (request: Request): Promise<readonly Policy[]> =>
  edge.myDraftPolicies(cookieOf(request));

/** One policy by backend id, for the editor route. */
export const getPolicy = (request: Request, id: string): Promise<null | Policy> =>
  edge.policy(id, cookieOf(request));

/** The working draft version of a policy's content. */
export const getDraftVersion = (
  request: Request,
  policyId: string,
): Promise<null | PolicyVersion> => edge.draftVersion(policyId, cookieOf(request));

export const createPolicy = (request: Request, input: CreatePolicyInput): Promise<Policy> =>
  edge.createPolicy(input, cookieOf(request));

export const saveDraft = (
  request: Request,
  policyId: string,
  contentJson: string,
  templateVersionId: null | string,
): Promise<PolicyVersion> =>
  edge.saveDraft(policyId, contentJson, templateVersionId, cookieOf(request));

export const publishDraft = (request: Request, policyId: string): Promise<PolicyVersion> =>
  edge.publishDraft(policyId, cookieOf(request));

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

export interface GroupPath {
  id: string;
  path: string;
}

/** Every group, depth-first, each with its full parent -> child display path (e.g.
 *  "Meridian Holdings › IT Security"), for the "new policy" group picker. Mirrors the
 *  admin groups area's own `orderedWithPaths` — kept local rather than shared, since the two
 *  apps' group screens otherwise have nothing else in common. */
export const orderedGroupPaths = (groups: readonly Group[]): GroupPath[] => {
  const byParent = new Map<null | string, Group[]>();
  for (const g of groups) {
    const key = g.parentId ?? null;
    byParent.set(key, [...(byParent.get(key) ?? []), g]);
  }
  const out: GroupPath[] = [];
  const walk = (parentId: null | string, prefix: string) => {
    for (const g of byParent.get(parentId) ?? []) {
      const path = prefix ? `${prefix} › ${g.name}` : g.name;
      out.push({ id: g.id, path });
      walk(g.id, path);
    }
  };
  walk(null, "");
  return out;
};
