// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { semanticVersion } from "./semanticVersion";

describe("semanticVersion (#150)", () => {
  it("writes the service's plain version number as major.minor.patch", () => {
    expect(semanticVersion(1)).toBe("1.0.0");
    expect(semanticVersion(12)).toBe("12.0.0");
    expect(semanticVersion("3")).toBe("3.0.0");
  });

  it("keeps a version that is already semantic, with or without a leading v", () => {
    expect(semanticVersion("1.0.1")).toBe("1.0.1");
    expect(semanticVersion("v2.1.0")).toBe("2.1.0");
    expect(semanticVersion("2.1")).toBe("2.1.0");
  });

  it("is empty when there is no version yet", () => {
    expect(semanticVersion(null)).toBe("");
    expect(semanticVersion()).toBe("");
    expect(semanticVersion("")).toBe("");
  });
});
