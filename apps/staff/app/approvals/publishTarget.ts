// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// What an approval run publishes, and whether the next approval is the last one (steward-web#401).
// Pure, so the mapping is unit-tested without the route.

export type PublishChange = "fix" | "major" | "minor";

interface Progress {
  currentStageIdx: number;
  stageNames: readonly string[];
  stageProgress?: readonly { approvals: number; required: number }[];
  stageUnitProgress: readonly (readonly unknown[])[];
  status: string;
}

interface Target {
  targetChangeType?: null | string;
  targetSemanticVersion?: null | string;
}

const CHANGES = new Set<string>(["fix", "major", "minor"]);

/** The version the run publishes as, with its change type; null when the gateway has no version. */
export const publishTargetOf = (
  run: Target,
): { changeType: null | PublishChange; version: string } | null => {
  const version = run.targetSemanticVersion;
  if (!version) return null;
  const change = run.targetChangeType?.toLowerCase() ?? "";
  return { changeType: CHANGES.has(change) ? (change as PublishChange) : null, version };
};

/**
 * One approval on the last stage is all that is left. A stage with group units keeps its own
 * tally per group, so it never counts as the final approval here.
 */
export const isFinalApproval = (run: Progress): boolean => {
  if (!run.status.endsWith("IN_REVIEW")) return false;
  if (run.currentStageIdx !== run.stageNames.length - 1) return false;
  if ((run.stageUnitProgress[run.currentStageIdx] ?? []).length > 0) return false;
  const progress = run.stageProgress?.[run.currentStageIdx];
  return progress !== undefined && progress.required - progress.approvals === 1;
};
