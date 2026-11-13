// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, PolicyStatus } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import {
  documentStatusOf,
  documentTypeBasePath,
  documentTypeCopy,
  isProcedure,
  libraryCategoryPath,
  policyPath,
} from "./policy";

describe("documentTypeCopy", () => {
  it("names a policy", () => {
    expect(documentTypeCopy(DocumentType.Policy)).toEqual({
      Noun: "Policy",
      noun: "policy",
      nounPlural: "policies",
    });
  });

  it("names a procedure", () => {
    expect(documentTypeCopy(DocumentType.Procedure)).toEqual({
      Noun: "Procedure",
      noun: "procedure",
      nounPlural: "procedures",
    });
  });
});

describe("documentTypeBasePath", () => {
  it("routes policies to /policies and procedures to /procedures", () => {
    expect(documentTypeBasePath(DocumentType.Policy)).toBe("/policies");
    expect(documentTypeBasePath(DocumentType.Procedure)).toBe("/procedures");
  });
});

describe("policyPath", () => {
  it("URL-encodes the policy number, never a backend id", () => {
    expect(policyPath({ documentType: DocumentType.Policy, number: "POL-FINANCE-001" })).toBe(
      "/policies/POL-FINANCE-001",
    );
  });

  it("encodes characters a number should never carry, defensively", () => {
    expect(policyPath({ documentType: DocumentType.Policy, number: "POL/1" })).toBe(
      "/policies/POL%2F1",
    );
  });

  it("routes a procedure to its own base path", () => {
    expect(policyPath({ documentType: DocumentType.Procedure, number: "PRC-OPS-001" })).toBe(
      "/procedures/PRC-OPS-001",
    );
  });

  it("defaults to the policy base path when the caller has no document type on hand", () => {
    expect(policyPath({ number: "POL-FINANCE-001" })).toBe("/policies/POL-FINANCE-001");
  });
});

describe("documentStatusOf", () => {
  it("maps the gateway's PolicyStatus onto the five status pills", () => {
    expect(documentStatusOf(PolicyStatus.Draft)).toBe("draft");
    expect(documentStatusOf(PolicyStatus.InReview)).toBe("in-review");
    expect(documentStatusOf(PolicyStatus.Published)).toBe("published");
  });

  it("gives no pill for the statuses that are history events only (4-components.s8)", () => {
    expect(documentStatusOf(PolicyStatus.Rejected)).toBeNull();
    expect(documentStatusOf(PolicyStatus.Superseded)).toBeNull();
    expect(documentStatusOf(PolicyStatus.Withdrawn)).toBeNull();
  });
});

describe("isProcedure", () => {
  it("is true only for PROCEDURE rows", () => {
    expect(isProcedure({ documentType: DocumentType.Procedure })).toBe(true);
    expect(isProcedure({ documentType: DocumentType.Policy })).toBe(false);
  });
});

describe("libraryCategoryPath (#378)", () => {
  it("is the library's own path with no category", () => {
    expect(libraryCategoryPath(DocumentType.Policy, [])).toBe("/policies");
    expect(libraryCategoryPath(DocumentType.Procedure)).toBe("/procedures");
  });

  it("puts the category slug, then the subcategory slug, in the path", () => {
    expect(libraryCategoryPath(DocumentType.Policy, ["it-security"])).toBe(
      "/policies/category/it-security",
    );
    expect(libraryCategoryPath(DocumentType.Procedure, ["it-security", "travel"])).toBe(
      "/procedures/category/it-security/travel",
    );
  });

  it("encodes each segment: spaces, slashes and unicode", () => {
    expect(libraryCategoryPath(DocumentType.Policy, ["a b", "x/y", "caf\u00E9"])).toBe(
      "/policies/category/a%20b/x%2Fy/caf%C3%A9",
    );
  });
});
