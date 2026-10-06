// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { buildInfo, buildInfoDefines, chooseEdge, isMockRun, MOCK_MODE } from "./index";

describe("chooseEdge", () => {
  it("picks the live edge for every mode but mock", () => {
    for (const mode of ["production", "development", "test"]) {
      expect(chooseEdge(mode, {}).mock).toBe(false);
    }
  });

  it("picks the mock edge for --mode mock only", () => {
    const edge = chooseEdge(MOCK_MODE, {});
    expect(edge.mock).toBe(true);
    expect(edge.module).toMatch(/mock-gateway/);
  });

  it("refuses STEWARD_MOCK on a live build, so a variable can't turn mock on", () => {
    expect(() => chooseEdge("production", { STEWARD_MOCK: "true" })).toThrow(/--mode mock/);
    expect(() => chooseEdge("production", { STEWARD_MOCK: "1" })).toThrow(/--mode mock/);
  });

  it("accepts an empty or false STEWARD_MOCK on a live build", () => {
    expect(chooseEdge("production", { STEWARD_MOCK: "" }).mock).toBe(false);
    expect(chooseEdge("production", { STEWARD_MOCK: "false" }).mock).toBe(false);
  });
});

describe("isMockRun", () => {
  it("reads --mode mock from the command line", () => {
    expect(isMockRun(["node", "react-router", "build", "--mode", "mock"])).toBe(true);
    expect(isMockRun(["node", "react-router", "build"])).toBe(false);
    expect(isMockRun(["node", "react-router", "build", "--mode", "production"])).toBe(false);
  });
});

describe("buildInfo", () => {
  it("takes the version and commit from the VERSION and COMMIT build arguments", () => {
    expect(buildInfo({ COMMIT: "0123456789abcdef", VERSION: "v0.1.0" })).toEqual({
      commit: "0123456789abcdef",
      version: "v0.1.0",
    });
  });

  it("reports dev and unknown when the build isn't stamped", () => {
    expect(buildInfo({})).toEqual({ commit: "unknown", version: "dev" });
    expect(buildInfo({ COMMIT: " ", VERSION: "" })).toEqual({ commit: "unknown", version: "dev" });
  });

  it("defines both as string constants for the bundle", () => {
    expect(buildInfoDefines({ COMMIT: "abc", VERSION: "v1.2.3" })).toEqual({
      __STEWARD_COMMIT__: JSON.stringify("abc"),
      __STEWARD_VERSION__: JSON.stringify("v1.2.3"),
    });
  });
});
