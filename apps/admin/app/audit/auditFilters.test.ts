// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import {
  AUDIT_SUBJECT_TYPES,
  auditChips,
  auditFilterParameters,
  auditFiltersFrom,
  keepMatching,
} from "./auditFilters";

describe("auditFiltersFrom (#106)", () => {
  it("reads actor, group, subject, subject type and several actions from the address", () => {
    const filters = auditFiltersFrom(
      new URLSearchParams(
        "actor=u-1&actorName=Jane+Smith&group=g-1&groupName=Finance&subject=policy%3Ap-1&subjectName=POL-1&type=policy&action=policy.published&action=role.granted",
      ),
    );
    expect(filters).toEqual({
      actions: ["policy.published", "role.granted"],
      actor: { id: "u-1", label: "Jane Smith" },
      group: { id: "g-1", label: "Finance" },
      subject: { id: "policy:p-1", label: "POL-1" },
      subjectType: "policy",
    });
  });

  it("reads nothing as no filters, and ignores an unknown subject type", () => {
    expect(auditFiltersFrom(new URLSearchParams(""))).toEqual({ actions: [] });
    expect(auditFiltersFrom(new URLSearchParams("type=banana"))).toEqual({ actions: [] });
  });

  it("falls back to the id when a label was not given", () => {
    expect(auditFiltersFrom(new URLSearchParams("actor=u-1")).actor).toEqual({
      id: "u-1",
      label: "u-1",
    });
  });
});

describe("auditFilterParameters", () => {
  it("writes the filters back into an address that reads the same", () => {
    const filters = auditFiltersFrom(
      new URLSearchParams("actor=u-1&actorName=Jane&type=user&action=a.b&action=c.d"),
    );
    expect(auditFiltersFrom(auditFilterParameters(filters))).toEqual(filters);
  });
});

describe("auditChips", () => {
  it("has one removable chip per filter, and one per action", () => {
    const filters = auditFiltersFrom(
      new URLSearchParams(
        "actor=u-1&actorName=Jane&type=policy&action=policy.published&action=role.granted",
      ),
    );
    const chips = auditChips(filters);
    expect(chips.map((chip) => chip.key)).toEqual([
      "actor",
      "type",
      "action:policy.published",
      "action:role.granted",
    ]);
    expect(chips[0]?.label).toBe("Actor: Jane");
    const withoutActor = chips[0]!.without(filters);
    expect(withoutActor.actor).toBeUndefined();
    expect(withoutActor.subjectType).toBe("policy");
    expect(chips[2]!.without(filters).actions).toEqual(["role.granted"]);
  });
});

describe("keepMatching", () => {
  const records = [
    { action: "policy.published", subject: "policy:p-1" },
    { action: "role.granted", subject: "user:u-2" },
    { action: "policy.published", subject: "template:t-1" },
  ];

  it("keeps the records of the chosen actions, exactly", () => {
    expect(keepMatching(records, { actions: ["role.granted"] })).toEqual([records[1]]);
    expect(keepMatching(records, { actions: [] })).toHaveLength(3);
  });

  it("keeps the records whose subject is of the chosen type", () => {
    expect(keepMatching(records, { actions: [], subjectType: "policy" })).toEqual([records[0]]);
  });

  it("lists the subject types the log can name", () => {
    expect(AUDIT_SUBJECT_TYPES).toEqual([
      "policy",
      "procedure",
      "category",
      "user",
      "group",
      "template",
    ]);
  });
});
