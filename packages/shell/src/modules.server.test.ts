// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { reportingEnabled } from "./modules.server";

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
