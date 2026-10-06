// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  AckStatus,
  BreakGlassGrant,
  DocumentType,
  PolicyDetail,
} from "@steward-web/api-client";

import edge from "@steward-web/edge.server";

/** The reader's full detail for one policy/procedure, for a loader to pass straight to `PolicyReader`. */
export const getPolicyDetail = (
  documentType: DocumentType,
  number: string,
  cookie?: string,
): Promise<null | PolicyDetail> => edge.policyDetail(documentType, number, cookie);

/** Records the calling user's acknowledgement, for the reader's acknowledge action. */
export const acknowledgePolicy = (policyVersionId: string, cookie?: string): Promise<AckStatus> =>
  edge.acknowledgePolicy(policyVersionId, cookie);

/** A site admin's time-boxed, audited reveal of a sensitive policy's real content. */
export const breakGlassReveal = (
  policyId: string,
  reason: string,
  cookie?: string,
): Promise<BreakGlassGrant> => edge.breakGlassReveal(policyId, reason, cookie);
