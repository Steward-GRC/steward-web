// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { RaciGrant, RaciSubjectKind } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { differs, record, redo, startHistory, undo } from "./accessHistory";
import { draftOf, setGrant } from "./accessModel";

const rule = (subjectRef: string) => ({
  ack: RaciGrant.Blank,
  approve: RaciGrant.Blank,
  author: RaciGrant.Blank,
  read: RaciGrant.Allow,
  subjectKind: RaciSubjectKind.Group,
  subjectRef,
});

const saved = draftOf([rule("Finance team"), rule("All staff")]);

describe("the draft history", () => {
  it("starts at the given draft with nothing to undo or redo", () => {
    const h = startHistory(saved);
    expect(h.present).toBe(saved);
    expect(h.past).toHaveLength(0);
    expect(h.future).toHaveLength(0);
  });

  it("undoes each change one step at a time, back to the start", () => {
    const one = saved.filter((r) => r.subjectRef !== "All staff");
    const two = setGrant(one, one[0]!.key, "approve", RaciGrant.Deny);
    let h = record(record(startHistory(saved), one), two);
    h = undo(h);
    expect(h.present).toBe(one);
    h = undo(h);
    expect(h.present).toBe(saved);
    expect(undo(h)).toBe(h);
  });

  it("redoes what was undone, and a new change drops the redo steps", () => {
    const one = saved.slice(0, 1);
    const other = saved.slice(1);
    let h = undo(record(startHistory(saved), one));
    expect(redo(h).present).toBe(one);
    h = record(h, other);
    expect(h.future).toHaveLength(0);
    expect(redo(h)).toBe(h);
  });

  it("does not record a change that leaves the draft as it was", () => {
    const h = startHistory(saved);
    expect(record(h, saved)).toBe(h);
  });
});

describe("whether the draft differs from the saved rules", () => {
  it("is false for the same rules, even with new keys and moved marks", () => {
    const again = draftOf([rule("Finance team"), rule("All staff")]).map((r) => ({
      ...r,
      moved: "up" as const,
    }));
    expect(differs(again, saved)).toBe(false);
  });

  it("is true for a removed, changed or reordered rule", () => {
    expect(differs(saved.slice(0, 1), saved)).toBe(true);
    expect(differs(setGrant(saved, saved[0]!.key, "read", RaciGrant.Deny), saved)).toBe(true);
    expect(differs([saved[1]!, saved[0]!], saved)).toBe(true);
  });
});
