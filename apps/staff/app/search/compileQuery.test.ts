// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { compileQuery } from "./compileQuery";

const rec = (text: string, fields: Record<string, string> = {}) => ({ text, ...fields });

describe("compileQuery", () => {
  it("matches everything on empty or whitespace input", () => {
    expect(compileQuery("")(rec("anything"))).toBe(true);
    expect(compileQuery("   ")(rec("anything"))).toBe(true);
  });

  it("matches a bare word as a substring of text, case-insensitively", () => {
    const pred = compileQuery("Security");
    expect(pred(rec("IT Security Policy"))).toBe(true);
    expect(pred(rec("HR Onboarding"))).toBe(false);
  });

  it("ANDs adjacent bare words implicitly", () => {
    const pred = compileQuery("security policy");
    expect(pred(rec("it security policy"))).toBe(true);
    expect(pred(rec("it security handbook"))).toBe(false);
  });

  it("matches a quoted phrase as an exact substring", () => {
    const pred = compileQuery('"IT Security"'.toLowerCase());
    expect(pred(rec("it security policy"))).toBe(true);
    expect(pred(rec("it and security policy"))).toBe(false);
  });

  it("excludes with a leading minus or NOT", () => {
    expect(compileQuery("-draft")(rec("published policy"))).toBe(true);
    expect(compileQuery("-draft")(rec("draft policy"))).toBe(false);
    expect(compileQuery("NOT draft")(rec("draft policy"))).toBe(false);
  });

  it("ORs two branches, binding looser than AND", () => {
    const pred = compileQuery("security OR onboarding");
    expect(pred(rec("it security policy"))).toBe(true);
    expect(pred(rec("hr onboarding"))).toBe(true);
    expect(pred(rec("finance policy"))).toBe(false);
  });

  it("scopes field:value to the named field only", () => {
    const pred = compileQuery('category:"it security" status:draft');
    expect(pred(rec("policy", { category: "it security", status: "draft" }))).toBe(true);
    expect(pred(rec("policy", { category: "it security", status: "published" }))).toBe(false);
  });

  it("groups with parentheses", () => {
    const pred = compileQuery("(security OR onboarding) -draft");
    expect(pred(rec("it security policy"))).toBe(true);
    expect(pred(rec("it security draft"))).toBe(false);
  });

  it("degrades gracefully on malformed input instead of throwing", () => {
    expect(() => compileQuery("(((security")(rec("it security policy"))).not.toThrow();
    expect(() => compileQuery("security OR")(rec("it security policy"))).not.toThrow();
  });
});
