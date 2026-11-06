// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { mcpEnabled, reportingEnabled } from "./modules.server";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("reportingEnabled", () => {
  it("is on only for STEWARD_REPORTING=true", () => {
    vi.stubEnv("STEWARD_REPORTING", "true");
    expect(reportingEnabled()).toBe(true);
    vi.stubEnv("STEWARD_REPORTING", "1");
    expect(reportingEnabled()).toBe(false);
    vi.stubEnv("STEWARD_REPORTING", "");
    expect(reportingEnabled()).toBe(false);
  });
});

describe("mcpEnabled (#113)", () => {
  it("is off unless STEWARD_MCP=true, since the MCP server is not built yet", () => {
    expect(mcpEnabled()).toBe(false);
    vi.stubEnv("STEWARD_MCP", "true");
    expect(mcpEnabled()).toBe(true);
    vi.stubEnv("STEWARD_MCP", "yes");
    expect(mcpEnabled()).toBe(false);
  });
});
