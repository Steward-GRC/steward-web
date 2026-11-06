// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { approvalPath, draftPath, isReservedDraftSegment, recordPath } from "./routes";

describe("draftPath", () => {
  it("uses the record number, never an internal id", () => {
    expect(draftPath("POL-EXPENSES-000002")).toBe("/drafts/POL-EXPENSES-000002");
  });

  it("adds a sub-page after the number", () => {
    expect(draftPath("POL-EXPENSES-000002", "generate")).toBe(
      "/drafts/POL-EXPENSES-000002/generate",
    );
    expect(draftPath("PRC-TRAVEL-000003", "revise")).toBe("/drafts/PRC-TRAVEL-000003/revise");
  });

  it("encodes the number", () => {
    expect(draftPath("POL A/1")).toBe("/drafts/POL%20A%2F1");
  });

  it.each(["new", "NEW", "import", "Import"])("refuses the reserved word %s", (word) => {
    expect(() => draftPath(word)).toThrow(/reserved/);
  });

  it("refuses an empty number", () => {
    expect(() => draftPath("")).toThrow();
  });
});

describe("isReservedDraftSegment", () => {
  it("flags the static draft routes, ignoring case", () => {
    expect(isReservedDraftSegment("new")).toBe(true);
    expect(isReservedDraftSegment("Import")).toBe(true);
    expect(isReservedDraftSegment("POL-EXPENSES-000002")).toBe(false);
  });
});

describe("approvalPath", () => {
  it("uses the record number", () => {
    expect(approvalPath("POL-EXPENSES-000002")).toBe("/approvals/POL-EXPENSES-000002");
    expect(approvalPath("PRC-TRAVEL-000003")).toBe("/approvals/PRC-TRAVEL-000003");
  });
});

describe("recordPath", () => {
  it("routes a policy and a procedure to their own base path", () => {
    expect(recordPath({ documentType: DocumentType.Policy, number: "POL-A-000001" })).toBe(
      "/policies/POL-A-000001",
    );
    expect(recordPath({ documentType: DocumentType.Procedure, number: "PRC-A-000001" })).toBe(
      "/procedures/PRC-A-000001",
    );
  });
});
