// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { GatewayError } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { deleteRefusalOf } from "./deleteRefusal";

const refusal = (code: string, counts?: Record<string, string>) =>
  new GatewayError("DeleteWorkflowDef", "refused", { code, counts, status: 200 });

describe("deleteRefusalOf", () => {
  it("reads the category count of WORKFLOW_DEF_IN_USE_BY_CATEGORY", () => {
    expect(
      deleteRefusalOf(refusal("WORKFLOW_DEF_IN_USE_BY_CATEGORY", { category_count: "3" })),
    ).toEqual({ count: 3, kind: "categories" });
  });

  it("adds the run and override counts of WORKFLOW_DEF_IN_USE", () => {
    expect(
      deleteRefusalOf(refusal("WORKFLOW_DEF_IN_USE", { override_count: "2", run_count: "4" })),
    ).toEqual({ count: 6, kind: "used" });
  });

  it("treats a missing count as zero and never as NaN", () => {
    expect(deleteRefusalOf(refusal("WORKFLOW_DEF_IN_USE"))).toEqual({ count: 0, kind: "used" });
    expect(
      deleteRefusalOf(refusal("WORKFLOW_DEF_IN_USE_BY_CATEGORY", { category_count: "x" })),
    ).toEqual({ count: 0, kind: "categories" });
  });

  it("recognises WORKFLOW_DEF_NOT_FOUND", () => {
    expect(deleteRefusalOf(refusal("WORKFLOW_DEF_NOT_FOUND"))).toEqual({ kind: "gone" });
  });

  it("leaves every other error alone", () => {
    expect(deleteRefusalOf(refusal("PERMISSION_DENIED"))).toBeNull();
    expect(deleteRefusalOf(new Error("boom"))).toBeNull();
    expect(deleteRefusalOf(null)).toBeNull();
  });
});
