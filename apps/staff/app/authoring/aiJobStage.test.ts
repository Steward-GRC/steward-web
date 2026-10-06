// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { isTerminalStage, phaseToPercent, phaseToStage, stageToPercent } from "./aiJobStage";

describe("phaseToStage", () => {
  it("maps the four schema phases", () => {
    expect(phaseToStage("AI_JOB_PHASE_PENDING")).toBe("queued");
    expect(phaseToStage("AI_JOB_PHASE_RUNNING")).toBe("generating");
    expect(phaseToStage("AI_JOB_PHASE_SUCCEEDED")).toBe("done");
    expect(phaseToStage("AI_JOB_PHASE_FAILED")).toBe("failed");
  });

  it("treats a missing phase as queued, and an unknown one as generating", () => {
    expect(phaseToStage()).toBe("queued");
    expect(phaseToStage(null)).toBe("queued");
    expect(phaseToStage("something-new")).toBe("generating");
  });
});

describe("stageToPercent / phaseToPercent", () => {
  it("never reads 0 for a live job", () => {
    expect(stageToPercent("queued")).toBeGreaterThan(0);
  });

  it("fills the track on both terminals", () => {
    expect(phaseToPercent("AI_JOB_PHASE_SUCCEEDED")).toBe(100);
    expect(phaseToPercent("AI_JOB_PHASE_FAILED")).toBe(100);
  });
});

describe("isTerminalStage", () => {
  it("is true only for done or failed", () => {
    expect(isTerminalStage("done")).toBe(true);
    expect(isTerminalStage("failed")).toBe(true);
    expect(isTerminalStage("queued")).toBe(false);
    expect(isTerminalStage("generating")).toBe(false);
  });
});
