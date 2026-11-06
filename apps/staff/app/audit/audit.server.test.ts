// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { toRows } from "./audit.server";

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
  subject: "POL-1",
  subjectLabel: "Expenses policy",
  tier: "audit",
  ...over,
});

describe("toRows", () => {
  it("drops reporting-case records, so no actor on a case can be seen here", () => {
    const rows = toRows([
      record({ id: "1" }),
      record({ action: "case.note_added", id: "2" }),
      record({ id: "3", subject: "case:RC-9" }),
    ]);
    expect(rows.map((row) => row.id)).toEqual(["1"]);
  });

  it("shows the resolved actor name, falling back to a short id", () => {
    const [named, unnamed] = toRows([
      record({ id: "1" }),
      record({ actorName: null, actorUserId: "a-very-long-opaque-id", id: "2" }),
    ]);
    expect(named?.actor).toBe("Bob Author");
    expect(unnamed?.actor).toBe("a-very-long-…");
  });
});
