// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AuthoringPolicyFieldsFragment } from "../generated/graphql";

import { GatewayError } from "../gatewayFetch";
import { type Policy, PolicyStatus } from "../views";

/** The part of a gateway `Category` the library's names are built from. */
export interface CategoryNode {
  readonly id: string;
  readonly name: string;
  readonly parentId?: null | string;
}

interface StoredSection {
  text?: unknown;
  title?: unknown;
}

/**
 * A version's `contentJson` (the editor's JSON array of `{ sectionKey, title, text }`) as
 * the reader's plain-text body: each section with text, titled, in stored order.
 */
export const bodyTextFromContent = (contentJson: string): string => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contentJson);
  } catch {
    return "";
  }
  if (!Array.isArray(parsed)) return "";
  return (parsed as StoredSection[])
    .filter((s) => typeof s.text === "string" && s.text.trim() !== "")
    .map((s) => `${typeof s.title === "string" ? s.title : ""}\n\n${String(s.text)}`)
    .join("\n\n");
};

/** An appendix's `contentJson` (the editor's `{ text }`) as plain text. */
export const appendixText = (contentJson: string): string => {
  try {
    const parsed = JSON.parse(contentJson) as unknown;
    if (parsed && typeof parsed === "object" && "text" in parsed) {
      const { text } = parsed as { text: unknown };
      return typeof text === "string" ? text : "";
    }
  } catch {
    return "";
  }
  return "";
};

/** The library's category (root ancestor) and subcategory (the level below it) names. */
export const categoryNames = (
  index: ReadonlyMap<string, CategoryNode>,
  homeCategoryId: string,
): { category: string; subcategory: string } => {
  const chain: CategoryNode[] = [];
  let node = index.get(homeCategoryId);
  while (node && chain.length <= index.size) {
    chain.unshift(node);
    node = node.parentId ? index.get(node.parentId) : undefined;
  }
  return { category: chain[0]?.name ?? "", subcategory: chain[1]?.name ?? "" };
};

const statuses = new Set<string>(Object.values(PolicyStatus));

/** A policy row's status: published once any version is, else its working draft's own. */
export const policyStatusOf = (hasPublished: boolean, versionStatus?: string): PolicyStatus => {
  if (hasPublished) return PolicyStatus.Published;
  const upper = versionStatus?.toUpperCase() ?? "";
  return statuses.has(upper) ? (upper as PolicyStatus) : PolicyStatus.Draft;
};

/** The gateway policy, its current version and its category names as the library row. */
export const toPolicyView = (
  policy: Omit<AuthoringPolicyFieldsFragment, "ownerName">,
  version: { status: string; versionNo: number } | null,
  names: { category: string; subcategory: string },
): Policy => ({
  category: names.category,
  currentDraftVersionId: policy.currentDraftVersionId,
  currentPublishedVersionId: policy.currentPublishedVersionId,
  documentType: policy.documentType,
  homeGroupId: policy.homeCategoryId,
  id: policy.id,
  number: policy.number,
  ownerUserId: policy.ownerUserId,
  retiredAt: policy.retiredAt,
  sensitivity: policy.sensitivity,
  status: policyStatusOf(Boolean(policy.currentPublishedVersionId), version?.status),
  subcategory: names.subcategory,
  templateId: policy.templateId,
  templateNone: policy.templateNone,
  title: policy.title,
  updated: null,
  version: version ? String(version.versionNo) : "",
  viewerCan: policy.viewerCan,
});

/** True for the gateway's signed-out refusal, by code or by HTTP status. */
export const isUnauthenticated = (error: unknown): boolean =>
  error instanceof GatewayError &&
  (error.status === 401 || error.code?.toUpperCase() === "UNAUTHENTICATED");
