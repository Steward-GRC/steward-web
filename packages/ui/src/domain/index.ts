// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The policy/procedure domain surface, imported as `@steward-web/ui/domain`: client-safe
// components and logic both apps' library screens share. Server-only data fetching is the
// separate `@steward-web/ui/domain/server` entry (see index.server.ts).
export { type FavoritesStore, useFavorites } from "./favorites";
export {
  type Category,
  DOCUMENT_TYPE_LABEL,
  documentStatusOf,
  DocumentType,
  documentTypeBasePath,
  documentTypeCopy,
  type DocumentTypeCopy,
  isProcedure,
  type Policy,
  policyPath,
  PolicyStatus,
  Sensitivity,
} from "./policy";
export { PolicyLibrary, type PolicyLibraryProps } from "./PolicyLibrary";
export {
  ackBannerState,
  type AckBannerState,
  type AckStatus,
  groupHistoryByVersion,
  type HistoryEntry,
  type HistoryVersionGroup,
  type PolicyAppendix,
  type PolicyContact,
  type PolicyDefinition,
  type PolicyDetail,
  type PolicyReference,
  type PolicySectionDiff,
  type PolicyVersionSummary,
  redactionState,
  type RedactionState,
  ReferenceKind,
  type RelatedPolicy,
  type RevisionNoticeKind,
  revisionNoticeOf,
} from "./policyReader";
export { PolicyReader, type PolicyReaderProps } from "./PolicyReader";
