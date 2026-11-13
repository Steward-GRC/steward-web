// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Policy, PolicyDetail } from "@steward-web/api-client";

import { DocumentType, PolicyStatus } from "@steward-web/api-client";

import type { DocumentStatus } from "#ui/components/Badges";

export type { Category, Policy } from "@steward-web/api-client";
export { DocumentType, PolicyStatus, Sensitivity } from "@steward-web/api-client";

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  POLICY: "Policy",
  PROCEDURE: "Procedure",
};

export type DocumentTypeCopy = { Noun: string; noun: string; nounPlural: string };

/**
 * Document-type-aware user-facing nouns (originally ui#161): copy that names the document
 * type must adapt to POLICY vs PROCEDURE. Never hardcode "policy"/"policies" in a library
 * screen; derive it here from the `documentType` the route is showing.
 */
export const documentTypeCopy = (documentType: DocumentType): DocumentTypeCopy => {
  const procedure = documentType === "PROCEDURE";
  return {
    Noun: DOCUMENT_TYPE_LABEL[documentType],
    noun: procedure ? "procedure" : "policy",
    nounPlural: procedure ? "procedures" : "policies",
  };
};

/** The library's browse base path for a document type: policies and procedures each have their own. */
export const documentTypeBasePath = (documentType: DocumentType): string =>
  documentType === "PROCEDURE" ? "/procedures" : "/policies";

/**
 * The library filtered to a category, by slug: `/policies/category/it-security` and, for a
 * subcategory, `/policies/category/it-security/travel`. Each slug is one encoded path segment.
 * No slugs gives the library's own path.
 */
export const libraryCategoryPath = (
  documentType: DocumentType,
  slugs: readonly string[] = [],
): string => {
  const base = documentTypeBasePath(documentType);
  if (slugs.length === 0) return base;
  return `${base}/category/${slugs.map((slug) => encodeURIComponent(slug)).join("/")}`;
};

/**
 * A policy's canonical detail-page path: always the human-readable number, URL-encoded, never
 * a backend id, under its document type's own base path. `documentType` is optional (defaults
 * to POLICY) for a caller that only has a number on hand, such as a related-policy reference.
 */
export const policyPath = (
  policy: Partial<Pick<Policy, "documentType">> & Pick<Policy, "number">,
): string =>
  `${documentTypeBasePath(policy.documentType ?? DocumentType.Policy)}/${encodeURIComponent(policy.number)}`;

const STATUS_TO_DOCUMENT_STATUS: Record<PolicyStatus, DocumentStatus | null> = {
  DRAFT: "draft",
  IN_REVIEW: "in-review",
  PUBLISHED: "published",
  REJECTED: null,
  SUPERSEDED: null,
  WITHDRAWN: null,
};

/**
 * Maps the gateway's `PolicyStatus` onto the five status pills. Rejected, superseded and
 * withdrawn are history events (4-components.s8), so they get no pill: null.
 */
export const documentStatusOf = (status: PolicyStatus): DocumentStatus | null =>
  STATUS_TO_DOCUMENT_STATUS[status];

/**
 * True when the document has a saved working draft: a newer revision being drafted beside the
 * published version, or a document that has only ever been a draft. One draft is shared by
 * everyone who can edit the document.
 */
export const hasWorkingDraft = (detail: Pick<PolicyDetail, "revision" | "status">): boolean =>
  detail.revision?.status === PolicyStatus.Draft || detail.status === PolicyStatus.Draft;

/** True when a row is a Procedure: drives the PRC- number label and ack-UI suppression. */
export const isProcedure = (policy: Pick<Policy, "documentType">): boolean =>
  policy.documentType === "PROCEDURE";
