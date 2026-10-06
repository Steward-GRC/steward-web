// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Pure helpers for the case queue and detail screens: status vocabulary, sorting and
// filtering. No React or DOM, so the logic is unit-tested directly.

import type { BadgeTone } from "@steward-web/ui";

import { CaseStatus } from "@steward-web/api-client";

/** Every status but CLOSED; `setCaseStatus` refuses CLOSED (closing goes through `closeCase`). */
export const OPEN_SETTABLE_STATUSES: readonly CaseStatus[] = [
  CaseStatus.New,
  CaseStatus.InReview,
  CaseStatus.NeedsReporterReply,
  CaseStatus.RiskAssessment,
  CaseStatus.NotificationDue,
];

/** The i18n key under the `reporting` namespace's `status` group for a status. */
const STATUS_LABEL_KEYS: Record<CaseStatus, string> = {
  [CaseStatus.Closed]: "closed",
  [CaseStatus.InReview]: "inReview",
  [CaseStatus.NeedsReporterReply]: "needsReporterReply",
  [CaseStatus.New]: "new",
  [CaseStatus.NotificationDue]: "notificationDue",
  [CaseStatus.RiskAssessment]: "riskAssessment",
};

export const statusLabelKey = (status: CaseStatus): string => STATUS_LABEL_KEYS[status];

/** A badge never carries meaning by colour alone, but the tone still tracks urgency. */
const STATUS_TONES: Record<CaseStatus, BadgeTone> = {
  [CaseStatus.Closed]: "neutral",
  [CaseStatus.InReview]: "info",
  [CaseStatus.NeedsReporterReply]: "warn",
  [CaseStatus.New]: "info",
  [CaseStatus.NotificationDue]: "danger",
  [CaseStatus.RiskAssessment]: "warn",
};

export const statusTone = (status: CaseStatus): BadgeTone => STATUS_TONES[status];

export const isOpenStatus = (status: CaseStatus): boolean => status !== CaseStatus.Closed;

type QueueRow = { nextDeadline?: null | string; receivedAt: string };

/**
 * The queue's default order: the nearest unmet notification deadline first (a case with none
 * sorts after every case that has one), then the oldest-received case first within a tier.
 */
export const sortQueueByUrgency = <T extends QueueRow>(rows: readonly T[]): T[] =>
  rows.toSorted((a, b) => {
    if (a.nextDeadline && b.nextDeadline) return a.nextDeadline.localeCompare(b.nextDeadline);
    if (a.nextDeadline) return -1;
    if (b.nextDeadline) return 1;
    return a.receivedAt.localeCompare(b.receivedAt);
  });
