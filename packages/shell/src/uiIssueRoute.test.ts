// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { pathPattern, stringParameters } from "./uiIssueRoute";

describe("stringParameters", () => {
  it("keeps params react-router resolved", () => {
    expect(stringParameters({ number: "42" })).toEqual({ number: "42" });
  });

  it("drops a param react-router left undefined", () => {
    expect(stringParameters({ caseId: "abc-1", number: undefined })).toEqual({ caseId: "abc-1" });
  });

  it("returns an empty object for no params", () => {
    expect(stringParameters({})).toEqual({});
  });
});

describe("pathPattern", () => {
  it("swaps a single param's value back for its placeholder", () => {
    expect(pathPattern("/policies/42", { number: "42" })).toBe("/policies/:number");
  });

  it("swaps every param across nested segments", () => {
    expect(pathPattern("/reporting/cases/abc-1", { caseId: "abc-1" })).toBe(
      "/reporting/cases/:caseId",
    );
  });

  it("leaves a route with no params untouched", () => {
    expect(pathPattern("/policies", {})).toBe("/policies");
  });

  it("ignores a param react-router left undefined", () => {
    expect(pathPattern("/policies/42", { missing: undefined, number: "42" })).toBe(
      "/policies/:number",
    );
  });
});
