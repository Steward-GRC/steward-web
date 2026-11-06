// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { auditResumePath, olderThan, resumeFrom } from "./resume";

const record = (id: string, occurredAt: string) => ({ id, occurredAt });
const log = [
  record("r5", "2026-11-05T10:05:00Z"),
  record("r4", "2026-11-05T10:04:00Z"),
  record("r3", "2026-11-05T10:03:00Z"),
  record("r2", "2026-11-05T10:02:00Z"),
  record("r1", "2026-11-05T10:01:00Z"),
];

describe("auditResumePath", () => {
  it("opens the audit log after the last entry shown, with the same filters", () => {
    expect(auditResumePath({ actions: [] }, log[2]!)).toBe(
      "/audit?after=r3&at=2026-11-05T10%3A03%3A00Z",
    );
    expect(
      auditResumePath(
        { actions: ["policy.published"], actor: { id: "u-1", label: "Jane" } },
        log[2]!,
      ),
    ).toBe(
      "/audit?actor=u-1&actorName=Jane&action=policy.published&after=r3&at=2026-11-05T10%3A03%3A00Z",
    );
  });
});

describe("resumeFrom", () => {
  it("starts at exactly the entry after the cursor", () => {
    expect(resumeFrom(log, { after: "r3", at: "2026-11-05T10:03:00Z" }).map((r) => r.id)).toEqual([
      "r2",
      "r1",
    ]);
  });

  it("falls back to the time when the entry is not in the list", () => {
    expect(resumeFrom(log, { after: "gone", at: "2026-11-05T10:03:30Z" }).map((r) => r.id)).toEqual(
      ["r3", "r2", "r1"],
    );
  });

  it("returns everything with no cursor", () => {
    expect(resumeFrom(log, {})).toHaveLength(5);
  });
});

describe("olderThan", () => {
  it("reads the cursor from the address", () => {
    expect(olderThan(new URLSearchParams("after=r3&at=2026-11-05T10:03:00Z"))).toEqual({
      after: "r3",
      at: "2026-11-05T10:03:00Z",
    });
    expect(olderThan(new URLSearchParams(""))).toEqual({});
  });
});
