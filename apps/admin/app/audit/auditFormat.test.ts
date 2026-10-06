// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AuditRecord } from "@steward-web/api-client";

import { describe, expect, it } from "vitest";

import { actionLabel, auditChainRange, displayLabel, shortId } from "./auditFormat";

const makeRecord = (overrides: Partial<AuditRecord> & Pick<AuditRecord, "id">): AuditRecord => ({
  action: "group.created",
  actorName: "Admin",
  actorUserId: "u-admin",
  groupId: "g-1",
  groupName: "Root",
  legalBasisExempt: false,
  occurredAt: "2026-01-01T00:00:00Z",
  prevHash: "0",
  recordHash: "1",
  recordUuid: `uuid-${overrides.id}`,
  subject: "group:g-1",
  subjectLabel: "Root",
  tier: "audit",
  ...overrides,
});

describe("actionLabel", () => {
  it("resolves a known action from the map", () => {
    expect(actionLabel("policy.published")).toBe("Policy published");
  });

  it("falls back to a generic sentence-cased transform for an unknown action", () => {
    expect(actionLabel("foo.bar_baz")).toBe("Foo bar baz");
  });
});

describe("shortId / displayLabel", () => {
  it("shortens an id longer than 12 characters with an ellipsis", () => {
    expect(shortId("short")).toBe("short");
    expect(shortId("a-very-long-opaque-id")).toBe("a-very-long-…");
  });

  it("prefers the resolved label, falling back to the shortened id on a miss", () => {
    expect(displayLabel("Ada Lovelace", "u-3")).toBe("Ada Lovelace");
    expect(displayLabel(null, "a-very-long-opaque-id")).toBe("a-very-long-…");
  });
});

describe("auditChainRange", () => {
  it("is undefined for an empty list", () => {
    expect(auditChainRange([])).toBeUndefined();
  });

  it("finds the min and max id by 64-bit value, not lexical or Number comparison", () => {
    const records = [
      makeRecord({ id: "9" }),
      makeRecord({ id: "10" }),
      makeRecord({ id: "9007199254740993" }), // > Number.MAX_SAFE_INTEGER
    ];
    expect(auditChainRange(records)).toEqual({
      fromRecordId: "9",
      toRecordId: "9007199254740993",
    });
  });
});
