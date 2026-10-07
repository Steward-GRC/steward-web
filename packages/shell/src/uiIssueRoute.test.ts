// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import {
  idParameters,
  pathPattern,
  resolveUiIssueRoute,
  stringParameters,
  UNMATCHED_ROUTE,
} from "./uiIssueRoute";

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

const ULID = "01ARZ3NDEKTSV4RRFFQ69G5FAV";
const UUID = "123e4567-e89b-42d3-a456-426614174000";

describe("idParameters", () => {
  it("keeps only values shaped like a ULID or a UUID, dropping everything else", () => {
    expect(
      idParameters({
        caseId: ULID,
        number: "42",
        policyId: UUID,
        serial: "123456789012",
        slug: "hr-001",
        user: "j_smith",
      }),
    ).toEqual({ caseId: ULID, policyId: UUID });
  });
});

describe("pathPattern with an encoded value", () => {
  it("swaps a param whose value is URL-encoded in the pathname", () => {
    expect(pathPattern("/policies/HR%20001", { number: "HR 001" })).toBe("/policies/:number");
  });
});

describe("resolveUiIssueRoute", () => {
  it("reports a location no route matched as route and path *, never the pathname", () => {
    const resolved = resolveUiIssueRoute(
      [{ id: "root", params: {}, pathname: "/" }],
      "/people/j_smith/serial/123456789012",
    );
    expect(resolved).toEqual({ params: {}, path: UNMATCHED_ROUTE, route: UNMATCHED_ROUTE });
    expect(JSON.stringify(resolved)).not.toContain("j_smith");
  });

  it("never leaves a raw param value in path, even when it is URL-encoded in the pathname", () => {
    const resolved = resolveUiIssueRoute(
      [{ id: "routes/policy", params: { number: "HR 001" }, pathname: "/policies/HR 001" }],
      "/policies/HR%20001",
    );
    expect(resolved).toEqual({ params: {}, path: "/policies/:number", route: "routes/policy" });
  });

  it("keeps the route id, pattern and id-shaped params of a matched route", () => {
    expect(
      resolveUiIssueRoute(
        [
          { id: "root", params: { caseId: ULID }, pathname: "/" },
          {
            id: "routes/reporting.cases.$caseId",
            params: { caseId: ULID },
            pathname: `/reporting/cases/${ULID}`,
          },
        ],
        `/reporting/cases/${ULID}/`,
      ),
    ).toEqual({
      params: { caseId: ULID },
      path: "/reporting/cases/:caseId",
      route: "routes/reporting.cases.$caseId",
    });
  });
});
