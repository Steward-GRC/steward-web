// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Policy } from "@steward-web/api-client";

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
 * A policy's canonical detail-page path: always the human-readable number, URL-encoded, never
 * a backend id, under its document type's own base path. `documentType` is optional (defaults
 * to POLICY) for a caller that only has a number on hand, such as a related-policy reference.
 */
export const policyPath = (
  policy: Partial<Pick<Policy, "documentType">> & Pick<Policy, "number">,
): string =>
  `${documentTypeBasePath(policy.documentType ?? DocumentType.Policy)}/${encodeURIComponent(policy.number)}`;

const STATUS_TO_DOCUMENT_STATUS: Record<PolicyStatus, DocumentStatus> = {
  DRAFT: "draft",
  IN_REVIEW: "in-review",
  PUBLISHED: "published",
  REJECTED: "rejected",
  SUPERSEDED: "superseded",
  WITHDRAWN: "withdrawn",
};

/** Maps the gateway's `PolicyStatus` onto the kit's one status-pill vocabulary. */
export const documentStatusOf = (status: PolicyStatus): DocumentStatus =>
  STATUS_TO_DOCUMENT_STATUS[status];

/** True when a row is a Procedure: drives the PRC- number label and ack-UI suppression. */
export const isProcedure = (policy: Pick<Policy, "documentType">): boolean =>
  policy.documentType === "PROCEDURE";
