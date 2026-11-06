// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Policy } from "@steward-web/api-client";

/**
 * The one place an address for a policy, procedure, draft or approval is built. Every link and
 * redirect uses these so an address always carries the readable record number (POL-EXPENSES-000002)
 * and never a backend id.
 */

/** Static `/drafts/<word>` routes. A record number is never one of these, so they cannot collide. */
const RESERVED_DRAFT_SEGMENTS: ReadonlySet<string> = new Set(["import", "new"]);

/** True for a word the drafts area keeps for its own pages. */
export const isReservedDraftSegment = (segment: string): boolean =>
  RESERVED_DRAFT_SEGMENTS.has(segment.toLowerCase());

/** The published page of a policy or procedure, by record number. */
export { policyPath as recordPath } from "./policy";

/** The draft editor for a record, or one of its pages (`generate`, `revise`). */
export const draftPath = (number: string, page?: "generate" | "revise"): string => {
  if (!number) throw new Error("A draft address needs the record number");
  if (isReservedDraftSegment(number)) {
    throw new Error(`"${number}" is reserved by the drafts area and is not a record number`);
  }
  const base = `/drafts/${encodeURIComponent(number)}`;
  return page ? `${base}/${page}` : base;
};

/** The approval review for a record, by record number. */
export const approvalPath = (number: string): string => {
  if (!number) throw new Error("An approval address needs the record number");
  return `/approvals/${encodeURIComponent(number)}`;
};

export type RecordRef = Pick<Policy, "documentType" | "number">;
