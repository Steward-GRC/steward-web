// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { buildInboxRow, matchPolicyForVersion } from "./approvalRows";

const policies = [
  {
    category: "IT Security",
    currentDraftVersionId: null,
    currentPublishedVersionId: "version-1",
    number: "POL-ITSEC-011",
    title: "Data Classification",
  },
  {
    category: "Finance",
    currentDraftVersionId: "version-2",
    currentPublishedVersionId: null,
    number: "POL-FINANCE-001",
    title: "Expense Claims",
  },
];

describe("matchPolicyForVersion", () => {
  it("matches a version held as the published version", () => {
    expect(matchPolicyForVersion(policies, "version-1")?.number).toBe("POL-ITSEC-011");
  });

  it("matches a version held as the current draft", () => {
    expect(matchPolicyForVersion(policies, "version-2")?.number).toBe("POL-FINANCE-001");
  });

  it("returns undefined when no row carries the version", () => {
    expect(matchPolicyForVersion(policies, "version-unknown")).toBeUndefined();
  });
});

describe("buildInboxRow", () => {
  it("resolves the number and category from the catalog match", () => {
    const row = buildInboxRow({ policyTitle: "", policyVersionId: "version-1" }, policies);
    expect(row).toMatchObject({ category: "IT Security", number: "POL-ITSEC-011" });
  });

  it("prefers the task's own title over the catalog match", () => {
    const row = buildInboxRow(
      { policyTitle: "Task title wins", policyVersionId: "version-1" },
      policies,
    );
    expect(row.title).toBe("Task title wins");
  });

  it("falls back to the catalog title when the task carries none", () => {
    const row = buildInboxRow({ policyTitle: "", policyVersionId: "version-1" }, policies);
    expect(row.title).toBe("Data Classification");
  });

  it("leaves number and category blank when the catalog hasn't loaded the row", () => {
    const row = buildInboxRow({ policyTitle: "Untracked", policyVersionId: "version-x" }, policies);
    expect(row).toMatchObject({ category: "", number: "", title: "Untracked" });
  });
});
