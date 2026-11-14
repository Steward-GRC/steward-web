// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { RaciAction, RaciGrant, RaciSubjectKind, RaciVerdictCode } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { draftOf, moveRule, nextGrant, reasonOf, rulesInputOf, setGrant } from "./accessModel";

const rule = (subjectRef: string, read = RaciGrant.Allow) => ({
  ack: RaciGrant.Blank,
  approve: RaciGrant.Blank,
  author: RaciGrant.Blank,
  manage: RaciGrant.Blank,
  read,
  subjectKind: RaciSubjectKind.Group,
  subjectRef,
});

describe("a cell's grant", () => {
  it("cycles blank, then allow, then deny, then blank again", () => {
    expect(nextGrant(RaciGrant.Blank)).toBe(RaciGrant.Allow);
    expect(nextGrant(RaciGrant.Allow)).toBe(RaciGrant.Deny);
    expect(nextGrant(RaciGrant.Deny)).toBe(RaciGrant.Blank);
  });

  it("changes only the one rule and action it names", () => {
    const draft = draftOf([rule("Finance team"), rule("All staff")]);
    const next = setGrant(draft, draft[1]!.key, "approve", RaciGrant.Deny);
    expect(next[1]!.approve).toBe(RaciGrant.Deny);
    expect(next[0]).toBe(draft[0]);
  });
});

describe("reordering", () => {
  it("moves a rule up one place and marks it until it's saved", () => {
    const draft = draftOf([rule("Finance team"), rule("Erin"), rule("All staff")]);
    const next = moveRule(draft, draft[1]!.key, -1);
    expect(next.map((r) => r.subjectRef)).toEqual(["Erin", "Finance team", "All staff"]);
    expect(next[0]!.moved).toBe("up");
    expect(next[1]!.moved).toBeUndefined();
  });

  it("moves a rule down and leaves the first and last rows where they are at the ends", () => {
    const draft = draftOf([rule("Finance team"), rule("All staff")]);
    expect(moveRule(draft, draft[0]!.key, 1)[1]!.moved).toBe("down");
    expect(moveRule(draft, draft[0]!.key, -1)).toBe(draft);
    expect(moveRule(draft, draft[1]!.key, 1)).toBe(draft);
  });

  it("carries a stored Manage grant through, so saving the rules never clears it", () => {
    const stored = { ...rule("A"), manage: RaciGrant.Allow };
    expect(rulesInputOf(draftOf([stored]))).toEqual([stored]);
  });

  it("sends the rules back without the editor's own fields", () => {
    const draft = moveRule(draftOf([rule("A"), rule("B")]), "rule-1", -1);
    expect(rulesInputOf(draft)).toEqual([rule("B"), rule("A")]);
  });
});

const verdictRule = (over: Partial<{ categoryName: string; depth: number }> = {}) => ({
  action: RaciAction.Read,
  categoryId: "c1",
  categoryName: over.categoryName ?? "Finance",
  depth: over.depth ?? 0,
  ruleNumber: 2,
  subjectKind: RaciSubjectKind.User,
  subjectRef: "u-erin",
});

describe("the gateway's verdicts", () => {
  it("reads a rule in this category", () => {
    expect(reasonOf({ code: RaciVerdictCode.RuleDeny, rule: verdictRule() })).toEqual({
      category: null,
      effect: "deny",
      kind: "rule",
      name: "u-erin",
      number: 2,
      subjectKind: RaciSubjectKind.User,
    });
  });

  it("reads a rule an ancestor passed down", () => {
    expect(
      reasonOf({
        code: RaciVerdictCode.RuleAllow,
        rule: verdictRule({ categoryName: "Shared", depth: 1 }),
      }),
    ).toMatchObject({ category: "Shared", effect: "allow", kind: "rule" });
  });

  it("reads the built-in outcomes", () => {
    expect(reasonOf({ code: RaciVerdictCode.Owner })).toEqual({ kind: "owner" });
    expect(reasonOf({ code: RaciVerdictCode.DefaultDeny })).toEqual({ kind: "defaultDeny" });
    expect(reasonOf({ code: RaciVerdictCode.SiteAdminManage })).toEqual({ kind: "siteAdmin" });
    expect(reasonOf({ code: RaciVerdictCode.AuthorImpliesRead, rule: verdictRule() })).toEqual({
      kind: "authorImpliesRead",
    });
    expect(reasonOf({ code: RaciVerdictCode.ManageImpliesRead, rule: verdictRule() })).toEqual({
      kind: "manageImpliesRead",
    });
    expect(reasonOf({ code: RaciVerdictCode.RequiresRead })).toEqual({ kind: "requiresRead" });
  });
});
