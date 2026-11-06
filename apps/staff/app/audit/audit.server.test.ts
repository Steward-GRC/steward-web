// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { toRows } from "./audit.server";

const NUMBERS = new Map([["policy-1", "POL-EXPENSES-000002"]]);

const record = (over: object) => ({
  action: "policy.published",
  actorName: "Bob Author",
  actorUserId: "user-bob",
  groupId: "g1",
  groupName: "All staff",
  id: "1",
  legalBasisExempt: false,
  occurredAt: "2026-11-05T14:30:00Z",
  prevHash: "0",
  recordHash: "1",
  recordUuid: "u1",
  subject: "policy:policy-1",
  subjectLabel: "Expenses policy",
  tier: "audit",
  ...over,
});

describe("toRows", () => {
  it("drops reporting-case records, so no actor on a case can be seen here", () => {
    const rows = toRows(NUMBERS, [
      record({ id: "1" }),
      record({ action: "case.note_added", id: "2" }),
      record({ id: "3", subject: "case:RC-9" }),
    ]);
    expect(rows.map((row) => row.id)).toEqual(["1"]);
  });

  it("shows the resolved actor name, falling back to a short id", () => {
    const [named, unnamed] = toRows(NUMBERS, [
      record({ id: "1" }),
      record({ actorName: null, actorUserId: "a-very-long-opaque-id", id: "2" }),
    ]);
    expect(named?.actor).toBe("Bob Author");
    expect(unnamed?.actor).toBe("a-very-long-…");
  });

  it("keeps policy and approval actions only, not logins, role grants or settings", () => {
    const rows = toRows(NUMBERS, [
      record({ id: "1", subject: "policy:policy-1" }),
      record({ action: "workflow.submitted", id: "2", subject: "policy_version:version-4" }),
      record({ action: "approval.decided", id: "3", subject: "approval:PRC-1" }),
      record({ action: "session.login", id: "4", subject: "user:user-bob" }),
      record({ action: "role.granted", id: "5", subject: "user:user-bob" }),
      record({ action: "settings.updated", id: "6", subject: "settings:global" }),
    ]);
    expect(rows.map((row) => row.id)).toEqual(["1", "2", "3"]);
  });

  it("shows the policy number for a policy and a dash where the subject has none", () => {
    const rows = toRows(NUMBERS, [
      record({ id: "1", subject: "policy:policy-1" }),
      record({ action: "workflow.submitted", id: "2", subject: "policy_version:version-4" }),
      record({ id: "3", subject: "policy:policy-unknown" }),
    ]);
    expect(rows.map((row) => row.number)).toEqual(["POL-EXPENSES-000002", "—", "—"]);
  });
});
