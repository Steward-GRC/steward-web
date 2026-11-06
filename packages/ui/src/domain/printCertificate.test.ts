// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import type { HistoryEntry } from "./policyReaderModel";

import { certificateOf } from "./printCertificate";

const event = (kind: string, at: string, extra: Partial<HistoryEntry> = {}): HistoryEntry => ({
  actorName: "Ann",
  at,
  kind,
  versionLabel: "2",
  ...extra,
});

describe("certificateOf", () => {
  it("lists the sign-off steps of one version, oldest first, and nothing else", () => {
    const rows = certificateOf(
      [
        event("published", "2026-10-02T14:02:00Z", { actorName: null }),
        event("created", "2026-09-27T09:00:00Z", { actorName: "Dave" }),
        event("draftSaved", "2026-09-27T09:30:00Z"),
        event("submitted", "2026-09-28T16:41:00Z", { actorName: "Bob" }),
        event("decided", "2026-09-30T10:00:00Z", { actorName: "Carol", stage: "Legal" }),
        event("approved", "2026-10-02T13:58:00Z", { comment: "Ready." }),
        event("published", "2026-08-01T00:00:00Z", { versionLabel: "1" }),
      ],
      "v2",
    );
    expect(rows.map((row) => row.role)).toEqual([
      "drafted",
      "submitted",
      "reviewed",
      "approved",
      "published",
    ]);
    expect(rows[0]).toMatchObject({ actorName: "Dave" });
    expect(rows[2]).toMatchObject({ actorName: "Carol", stage: "Legal" });
    expect(rows[3]?.comment).toBe("Ready.");
  });

  it("keeps only the first drafted event", () => {
    const rows = certificateOf(
      [event("created", "2026-09-27T09:00:00Z"), event("created", "2026-09-28T09:00:00Z")],
      "2",
    );
    expect(rows).toHaveLength(1);
  });
});
