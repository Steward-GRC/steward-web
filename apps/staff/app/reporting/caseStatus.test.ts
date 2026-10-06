// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { CaseStatus } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import {
  isOpenStatus,
  OPEN_SETTABLE_STATUSES,
  sortQueueByUrgency,
  statusLabelKey,
  statusTone,
} from "./caseStatus";

describe("statusLabelKey", () => {
  it("maps every status to a distinct key", () => {
    const keys = Object.values(CaseStatus).map((status) => statusLabelKey(status));
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).not.toContain(undefined);
  });
});

describe("statusTone", () => {
  it("gives the notification deadline status the most urgent tone", () => {
    expect(statusTone(CaseStatus.NotificationDue)).toBe("danger");
  });

  it("gives a closed case a neutral tone", () => {
    expect(statusTone(CaseStatus.Closed)).toBe("neutral");
  });
});

describe("isOpenStatus", () => {
  it("is false only for CLOSED", () => {
    expect(isOpenStatus(CaseStatus.Closed)).toBe(false);
    for (const status of OPEN_SETTABLE_STATUSES) expect(isOpenStatus(status)).toBe(true);
  });
});

describe("OPEN_SETTABLE_STATUSES", () => {
  it("excludes CLOSED (closing goes through closeCase, not setCaseStatus)", () => {
    expect(OPEN_SETTABLE_STATUSES).not.toContain(CaseStatus.Closed);
  });
});

const row = (id: string, nextDeadline: null | string, receivedAt: string) => ({
  id,
  nextDeadline,
  receivedAt,
});

describe("sortQueueByUrgency", () => {
  it("sorts cases with a deadline before cases with none", () => {
    const rows = [
      row("no-deadline", null, "2026-01-01T00:00:00Z"),
      row("has-deadline", "2026-05-01", "2026-04-01T00:00:00Z"),
    ];
    expect(sortQueueByUrgency(rows).map((r) => r.id)).toEqual(["has-deadline", "no-deadline"]);
  });

  it("orders cases that both have a deadline by the nearest one", () => {
    const rows = [
      row("later", "2026-06-01", "2026-01-01T00:00:00Z"),
      row("sooner", "2026-05-01", "2026-01-01T00:00:00Z"),
    ];
    expect(sortQueueByUrgency(rows).map((r) => r.id)).toEqual(["sooner", "later"]);
  });

  it("falls back to the oldest received case first when neither has a deadline", () => {
    const rows = [
      row("newer", null, "2026-04-01T00:00:00Z"),
      row("older", null, "2026-01-01T00:00:00Z"),
    ];
    expect(sortQueueByUrgency(rows).map((r) => r.id)).toEqual(["older", "newer"]);
  });

  it("does not mutate the input array", () => {
    const rows = [row("b", null, "2026-02-01T00:00:00Z"), row("a", null, "2026-01-01T00:00:00Z")];
    const original = [...rows];
    sortQueueByUrgency(rows);
    expect(rows).toEqual(original);
  });
});
