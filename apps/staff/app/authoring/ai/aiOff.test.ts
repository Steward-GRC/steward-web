// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { aiRefusalKey } from "./aiOff";

describe("the text for a refused AI start (bug log 260)", () => {
  it("says AI is unavailable when the service did not answer", () => {
    expect(aiRefusalKey({ code: "INTERNAL" })).toBe("refusedUnavailable");
    expect(aiRefusalKey({ status: 502 })).toBe("refusedUnavailable");
  });

  it("keeps the generic line for anything else", () => {
    expect(aiRefusalKey({ code: "PERMISSION_DENIED", status: 403 })).toBe("refused");
    expect(aiRefusalKey()).toBe("refused");
  });
});
