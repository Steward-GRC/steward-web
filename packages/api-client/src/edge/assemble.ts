// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AuthoringPolicyFieldsFragment } from "../generated/graphql";

import { GatewayError } from "../gatewayFetch";
import { type HistoryEntry, type Policy, PolicyStatus } from "../views";

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

/** The gateway policy and its category names as the library row; the current version's
 *  number and status come straight off the policy row, with no extra version read. */
export const toPolicyView = (
  policy: Omit<AuthoringPolicyFieldsFragment, "ownerName">,
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
  status: policyStatusOf(
    Boolean(policy.currentPublishedVersionId),
    policy.currentVersionStatus ?? undefined,
  ),
  subcategory: names.subcategory,
  templateId: policy.templateId,
  templateNone: policy.templateNone,
  title: policy.title,
  updated: policy.updatedAt,
  version: policy.currentVersionNo === null ? "" : String(policy.currentVersionNo),
  viewerCan: policy.viewerCan,
});

/** True for the gateway's signed-out refusal, by code or by HTTP status. */
export const isUnauthenticated = (error: unknown): boolean =>
  error instanceof GatewayError &&
  (error.status === 401 || error.code?.toUpperCase() === "UNAUTHENTICATED");

/** One audit action's `type.verb` prefix the reader's history strips to a bare lifecycle
 *  kind (e.g. "policy.published" -> "published"), matching the short tokens the reader's
 *  event badges and translations key off. Any other action is kept as-is. */
const POLICY_ACTION_PREFIX = "policy.";
const historyKindOf = (action: string): string =>
  action.startsWith(POLICY_ACTION_PREFIX) ? action.slice(POLICY_ACTION_PREFIX.length) : action;

/**
 * A policy's audit records as the reader's history: oldest first (the gateway's own
 * `auditLog` reads newest first), each attributed to `versionLabel` since the audit trail
 * carries no per-event version number. `comment` and `stage` are null for the same reason:
 * the audit record has neither.
 */
export const historyFromAuditLog = (
  records: readonly { action: string; actorName?: null | string; occurredAt: string }[],
  versionLabel: string,
): HistoryEntry[] =>
  records.toReversed().map((r) => ({
    actorName: r.actorName ?? null,
    at: r.occurredAt,
    comment: null,
    kind: historyKindOf(r.action),
    stage: null,
    versionLabel,
  }));
