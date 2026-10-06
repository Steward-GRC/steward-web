// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { IssueCollabTokenPayload } from "@steward-web/api-client";

import edge from "@steward-web/edge.server";

export const issueCollabToken = (
  request: Request,
  policyId: string,
  draftId: string,
  templateVersionId: null | string,
): Promise<IssueCollabTokenPayload> =>
  edge.issueCollabToken(
    { draftId, policyId, templateVersionId },
    request.headers.get("cookie") ?? undefined,
  );
