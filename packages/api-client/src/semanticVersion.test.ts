// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { nextVersion, semanticVersion } from "./semanticVersion";

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

describe("nextVersion (#156)", () => {
  it("raises the part the author picked and resets the parts after it", () => {
    expect(nextVersion("1.2.3", "major")).toBe("2.0.0");
    expect(nextVersion("1.2.3", "minor")).toBe("1.3.0");
    expect(nextVersion("1.2.3", "fix")).toBe("1.2.4");
  });

  it("reads the service's plain number and a leading v", () => {
    expect(nextVersion("3", "minor")).toBe("3.1.0");
    expect(nextVersion("v2.0.0", "fix")).toBe("2.0.1");
  });

  it("is 1.0.0 for a first publish, whatever was picked", () => {
    expect(nextVersion(undefined, "fix")).toBe("1.0.0");
    expect(nextVersion("", "major")).toBe("1.0.0");
  });
});
