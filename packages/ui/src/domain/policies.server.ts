// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Category, DocumentType, Policy } from "@steward-web/api-client";

import edge from "@steward-web/edge.server";

/** The library's category tree, for a loader to pass straight to `PolicyLibrary`. */
export const listCategories = (cookie?: string): Promise<readonly Category[]> =>
  edge.categories(cookie);

/** The library catalog for one document type, for a loader to pass straight to `PolicyLibrary`. */
export const listPolicies = (
  documentType: DocumentType,
  cookie?: string,
): Promise<readonly Policy[]> => edge.policies(documentType, cookie);
