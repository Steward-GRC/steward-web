// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Pure phase -> stage -> percent mapping for an in-flight AI job. The async job framework
// reports only four coarse phases end to end (pending/running/succeeded/failed — see the
// schema's `AIJobPhase`); a bare spinner tells the author nothing, so this maps that phase
// onto an ordered stage reference (queued -> retrieving -> generating -> finalizing -> done)
// and derives a percent from the stage ordinal, the same way the original's aiJobStage.ts did.

export type AiStage = "done" | "failed" | "finalizing" | "generating" | "queued" | "retrieving";

/** The four working stages, in progress order (excludes the terminal done/failed). */
export const AI_STAGE_WORKING_ORDER: AiStage[] = [
  "queued",
  "retrieving",
  "generating",
  "finalizing",
];

const AI_STAGE_PERCENT: Record<AiStage, number> = {
  done: 100,
  failed: 100,
  finalizing: 90,
  generating: 70,
  queued: 10,
  retrieving: 35,
};

const normalizePhase = (rawPhase: null | string | undefined): string =>
  (rawPhase ?? "")
    .trim()
    .toUpperCase()
    .replace(/^AI_JOB_PHASE_/, "");

/** Maps a raw `AIJobStatus.phase` string onto the ordered stage reference. An unrecognized
 *  non-terminal value falls through to `generating` so a live job's bar never sticks at the
 *  start — only an explicit failure reads as failed. */
export const phaseToStage = (rawPhase?: null | string): AiStage => {
  switch (normalizePhase(rawPhase)) {
    case "":
    case "PENDING": {
      return "queued";
    }
    case "FAILED": {
      return "failed";
    }
    case "SUCCEEDED": {
      return "done";
    }
    default: {
      return "generating";
    }
  }
};

/** Percent [0..100] for a stage — the value handed straight to the Progress bar. */
export const stageToPercent = (stage: AiStage): number => AI_STAGE_PERCENT[stage];

/** Percent straight from a raw phase string. */
export const phaseToPercent = (rawPhase?: null | string): number =>
  stageToPercent(phaseToStage(rawPhase));

/** A stage is terminal when the job has stopped — succeeded (`done`) or errored (`failed`). */
export const isTerminalStage = (stage: AiStage): boolean => stage === "done" || stage === "failed";
