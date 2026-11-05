// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The approvals inbox's rows (U24): each task with its catalog number, version and link, the
// stage it waits at and where that sits in its run. Pure, so it's tested without the route.
import { matchPolicyForVersion } from "./approvalRows";

/** One row of the inbox, in any of its three groups. */
export interface InboxEntry {
  /** In progress: when you decided. */
  decidedAt?: null | string;
  /** In progress: what you decided. */
  decision?: "approved" | "rejected";
  dueAt?: null | string;
  href: string;
  key: string;
  /** The stage the run is at now. */
  nowAt?: string;
  number: string;
  /** How many stages the run has. */
  stageCount: number;
  /** The stage this row is about: yours to decide, or the one coming to you. */
  stageName: string;
  /** Its place in the run, from 1. */
  stageNumber: number;
  /** Who submitted the run and when; the gateway doesn't send them yet (gateway #52). */
  submittedAt?: null | string;
  submittedBy?: null | string;
  title: string;
  version: string;
}

interface CatalogRow {
  category: string;
  currentDraftVersionId?: null | string;
  currentPublishedVersionId?: null | string;
  number: string;
  title: string;
  version?: string;
}

interface Run {
  currentStageIdx: number;
  stageNames: readonly string[];
}

interface Task {
  dueAt?: null | string;
  policyTitle: string;
  policyVersionId: string;
  stageIndex: number;
  /** An upcoming approval names its own stage. */
  stageName?: string;
  taskId?: string;
}

/** A task as an inbox row, with its run's stages when the run could be read. */
export const inboxEntryOf = (task: Task, catalog: readonly CatalogRow[], run?: Run): InboxEntry => {
  const match = matchPolicyForVersion(catalog, task.policyVersionId);
  const number = match?.number ?? "";
  const stageNames = run?.stageNames ?? [];
  const stageName = stageNames[task.stageIndex] ?? task.stageName ?? "";
  return {
    ...(task.dueAt === undefined ? {} : { dueAt: task.dueAt }),
    href: `/approvals/${number || task.policyVersionId}`,
    key: task.taskId ?? `${task.policyVersionId}:${task.stageIndex}`,
    ...(run ? { nowAt: stageNames[run.currentStageIdx] ?? "" } : {}),
    number,
    stageCount: Math.max(stageNames.length, task.stageIndex + 1),
    stageName,
    stageNumber: task.stageIndex + 1,
    title: task.policyTitle || match?.title || "",
    version: match?.version ?? "",
  };
};

const DAY = 24 * 60 * 60 * 1000;

/** Whole days past due (at least 1 once it's past), or null when it isn't overdue. */
export const overdueDays = (dueAt: null | string | undefined, now: Date): null | number => {
  if (!dueAt) return null;
  const late = now.getTime() - new Date(dueAt).getTime();
  if (Number.isNaN(late) || late <= 0) return null;
  return Math.max(1, Math.floor(late / DAY));
};
