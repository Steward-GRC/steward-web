// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { RaciGrant, RaciSubjectKind } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { draftOf, moveRule, nextGrant, parseReason, rulesInputOf, setGrant } from "./accessModel";

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

describe("the gateway's reasons", () => {
  it("reads a rule in this category", () => {
    expect(parseReason("rule #2 deny user u-erin")).toEqual({
      category: null,
      effect: "deny",
      kind: "rule",
      name: "u-erin",
      number: 2,
      subjectKind: RaciSubjectKind.User,
    });
  });

  it("reads a rule an ancestor passed down", () => {
    expect(parseReason("↳ Finance #1 allow everyone")).toEqual({
      category: "Finance",
      effect: "allow",
      kind: "rule",
      name: "",
      number: 1,
      subjectKind: RaciSubjectKind.Everyone,
    });
    expect(parseReason("↳ Shared services #3 allow group Finance team")).toMatchObject({
      category: "Shared services",
      name: "Finance team",
    });
  });

  it("reads the built-in outcomes", () => {
    expect(parseReason("owner (auto read/approve/author)")).toEqual({ kind: "owner" });
    expect(parseReason("no rule → default deny")).toEqual({ kind: "defaultDeny" });
    expect(parseReason("site-admin reads all")).toEqual({ kind: "siteAdmin" });
    expect(parseReason("author implies read")).toEqual({ kind: "authorImpliesRead" });
    expect(parseReason("approver implies read")).toEqual({ kind: "approverImpliesRead" });
    expect(parseReason("requires read")).toEqual({ kind: "requiresRead" });
  });

  it("keeps a reason it doesn't know as it came", () => {
    expect(parseReason("something new")).toEqual({ kind: "other", text: "something new" });
  });
});
