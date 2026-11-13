// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { ChangeType } from "./generated/schema";
import {
  changeTypeFrom,
  changeTypeToGateway,
  isLowering,
  nextVersion,
  semanticVersion,
  versionOf,
} from "./semanticVersion";

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

describe("versionOf (#390)", () => {
  it("shows the semantic version the service stored", () => {
    expect(versionOf({ semanticVersion: "2.1.0", versionNo: 4 })).toBe("2.1.0");
  });

  it("falls back to the ordinal alone when the service has no semantic version", () => {
    expect(versionOf({ semanticVersion: null, versionNo: 4 })).toBe("4.0.0");
    expect(versionOf({ versionNo: 4 })).toBe("4.0.0");
    expect(versionOf({ semanticVersion: "", versionNo: 2 })).toBe("2.0.0");
  });
});

describe("change types (#390)", () => {
  it("reads the gateway's enum as the app's lowercase type", () => {
    expect(changeTypeFrom(ChangeType.Major)).toBe("major");
    expect(changeTypeFrom(ChangeType.Minor)).toBe("minor");
    expect(changeTypeFrom(ChangeType.Fix)).toBe("fix");
    expect(changeTypeFrom(null)).toBeNull();
    expect(changeTypeFrom()).toBeNull();
  });

  it("writes the app's type back as the gateway's enum", () => {
    expect(changeTypeToGateway("major")).toBe(ChangeType.Major);
    expect(changeTypeToGateway("fix")).toBe(ChangeType.Fix);
  });

  it("calls a pick below the suggestion a lowering, and no other", () => {
    expect(isLowering("minor", "major")).toBe(true);
    expect(isLowering("fix", "major")).toBe(true);
    expect(isLowering("fix", "minor")).toBe(true);
    expect(isLowering("minor", "minor")).toBe(false);
    expect(isLowering("major", "minor")).toBe(false);
    expect(isLowering("fix", null)).toBe(false);
  });
});
