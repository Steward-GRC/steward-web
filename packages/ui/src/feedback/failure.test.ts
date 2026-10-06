// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { toFailure } from "./failure";

describe("toFailure", () => {
  it("keeps only the allow-listed fields", () => {
    const failure = toFailure({
      code: "PERMISSION_DENIED",
      detail: "Expense Claims is not yours",
      metadata: { title: "Expense Claims" },
      operation: "PublishPolicy",
      reason: "NOT_AUTHOR",
      requestId: "req-1",
      status: 403,
      traceId: "trace-1",
    } as never);
    expect(failure).toEqual({
      code: "PERMISSION_DENIED",
      operation: "PublishPolicy",
      reason: "NOT_AUTHOR",
      requestId: "req-1",
      status: 403,
      traceId: "trace-1",
    });
    expect(JSON.stringify(failure)).not.toContain("Expense Claims");
  });

  it("drops empty and mistyped values", () => {
    expect(toFailure({ code: "", status: Number.NaN, traceId: 7 as never })).toEqual({});
  });
});
