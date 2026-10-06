// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Pure helpers for the approvals inbox: resolving a pending/upcoming task's number and
// category from the already-loaded library catalog, matching on the version id the way the
// library itself links a row — never a backend id. No React or DOM, so the matching is
// unit-tested directly.

type CatalogRow = {
  category: string;
  currentDraftVersionId?: null | string;
  currentPublishedVersionId?: null | string;
  number: string;
  title: string;
};

/** The catalog row whose published or current draft version is the given id, or undefined
 *  when the catalog hasn't loaded it (e.g. a version the viewer can't otherwise see). */
export const matchPolicyForVersion = (
  policies: readonly CatalogRow[],
  versionId: string,
): CatalogRow | undefined =>
  policies.find(
    (p) => p.currentPublishedVersionId === versionId || p.currentDraftVersionId === versionId,
  );

export type InboxRow<T> = { category: string; number: string; title: string } & T;

/**
 * A pending/upcoming approval task, with its catalog number and category resolved for the
 * inbox table. The task's own `policyTitle` (the workflow read-model's own copy) wins over the
 * catalog title; the catalog is the fallback, not the source — the task always carries one.
 */
export const buildInboxRow = <T extends { policyTitle: string; policyVersionId: string }>(
  task: T,
  policies: readonly CatalogRow[],
): InboxRow<T> => {
  const match = matchPolicyForVersion(policies, task.policyVersionId);
  return {
    ...task,
    category: match?.category ?? "",
    number: match?.number ?? "",
    title: task.policyTitle || match?.title || "",
  };
};
