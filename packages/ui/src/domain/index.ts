// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The policy/procedure domain surface, imported as `@steward-web/ui/domain`: client-safe
// components and logic both apps' library screens share. Server-only data fetching is the
// separate `@steward-web/ui/domain/server` entry (see index.server.ts).
export { AckBanner, type AckBannerProps } from "./AckBanner";
export { AiJobProgress, type AiJobProgressProps, type AiJobStage } from "./AiJobProgress";
export { AiSummaryCard, type AiSummaryCardProps } from "./AiSummaryCard";
export {
  ApprovalStepper,
  type ApprovalStepperProps,
  type StepperApprover,
  type StepperApproverState,
  type StepperGroup,
  type StepperRule,
  type StepperStage,
} from "./ApprovalStepper";
export { CompareVersions, type CompareVersionsProps, VERSION_DIFF_PATH } from "./CompareVersions";
export { DecisionPanel, type DecisionPanelProps } from "./DecisionPanel";
export { DocumentStatusPill } from "./DocumentStatusPill";
export { type FavoritesStore, useFavorites } from "./favorites";
export { OutlineCard, type OutlineCardProps, type OutlineItem } from "./OutlineCard";
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
export { PolicyDocument, type PolicyDocumentProps } from "./PolicyDocument";
export { PolicyLibrary, type PolicyLibraryProps } from "./PolicyLibrary";
export { PolicyReader, type PolicyReaderProps } from "./PolicyReader";
export { PolicyReaderHistory } from "./PolicyReaderHistory";
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
} from "./policyReaderModel";
export {
  type ReassignCandidate,
  type ReassignChoice,
  ReassignDialog,
  type ReassignDialogProps,
} from "./ReassignDialog";
export {
  DiffCounts,
  DiffLegend,
  type DiffRun,
  type DiffRunKind,
  type DiffSection,
  DiffView,
  type DiffViewProps,
  FoldedRun,
  parseWordDiff,
  WordDiff,
  type WordDiffProps,
  wordDiffRuns,
} from "./WordDiff";
