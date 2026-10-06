// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { PolicyStatus } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import {
  ackBannerState,
  groupHistoryByVersion,
  plainTextOf,
  redactionState,
  revisionNoticeOf,
} from "./policyReader";

describe("ackBannerState", () => {
  it("is hidden when the document carries no acknowledgement", () => {
    expect(ackBannerState(null)).toBe("hidden");
  });

  it("is hidden when this caller isn't in the ack audience", () => {
    expect(ackBannerState({ ackedAt: null, acknowledged: false, required: false })).toBe("hidden");
  });

  it("is pending until this caller acknowledges", () => {
    expect(ackBannerState({ ackedAt: null, acknowledged: false, required: true })).toBe("pending");
  });

  it("is done once this caller has acknowledged", () => {
    expect(
      ackBannerState({ ackedAt: "2026-08-01T00:00:00Z", acknowledged: true, required: true }),
    ).toBe("done");
  });
});

describe("redactionState", () => {
  it("is visible when the content isn't obfuscated", () => {
    expect(redactionState({ canBreakGlass: false, contentObfuscated: false })).toBe("visible");
  });

  it("offers a break-glass reveal when the caller can break glass", () => {
    expect(redactionState({ canBreakGlass: true, contentObfuscated: true })).toBe(
      "redacted-reveal",
    );
  });

  it("refuses a reveal when the caller cannot break glass", () => {
    expect(redactionState({ canBreakGlass: false, contentObfuscated: true })).toBe(
      "redacted-no-permission",
    );
  });
});

describe("revisionNoticeOf", () => {
  it("shows no notice for a draft or a published version", () => {
    expect(revisionNoticeOf(PolicyStatus.Draft)).toBeNull();
    expect(revisionNoticeOf(PolicyStatus.Published)).toBeNull();
  });

  it("maps every other status onto its own notice", () => {
    expect(revisionNoticeOf(PolicyStatus.InReview)).toBe("inReview");
    expect(revisionNoticeOf(PolicyStatus.Rejected)).toBe("rejected");
    expect(revisionNoticeOf(PolicyStatus.Superseded)).toBe("superseded");
    expect(revisionNoticeOf(PolicyStatus.Withdrawn)).toBe("withdrawn");
  });
});

describe("groupHistoryByVersion", () => {
  it("groups events by version, current version first", () => {
    const groups = groupHistoryByVersion([
      {
        actorName: null,
        at: "2026-01-01T00:00:00Z",
        comment: null,
        kind: "submitted",
        stage: null,
        versionLabel: "1.0.0",
      },
      {
        actorName: null,
        at: "2026-01-02T00:00:00Z",
        comment: null,
        kind: "published",
        stage: null,
        versionLabel: "1.0.0",
      },
      {
        actorName: null,
        at: "2026-02-01T00:00:00Z",
        comment: null,
        kind: "superseded",
        stage: null,
        versionLabel: "1.0.0",
      },
      {
        actorName: null,
        at: "2026-03-01T00:00:00Z",
        comment: null,
        kind: "submitted",
        stage: null,
        versionLabel: "2.0.0",
      },
    ]);

    expect(groups.map((g) => g.version)).toEqual(["2.0.0", "1.0.0"]);
    expect(groups[0]!.events).toHaveLength(1);
    expect(groups[1]!.events.map((event) => event.kind)).toEqual([
      "submitted",
      "published",
      "superseded",
    ]);
  });

  it("answers no groups for an empty history", () => {
    expect(groupHistoryByVersion([])).toEqual([]);
  });
});

describe("plainTextOf", () => {
  it("strips the diff's ins/del markup down to plain text", () => {
    expect(plainTextOf("Rates were <del>USD-only</del> <ins>reviewed per country</ins>.")).toBe(
      "Rates were USD-only reviewed per country.",
    );
  });

  it("leaves plain text alone", () => {
    expect(plainTextOf("No markup here")).toBe("No markup here");
  });
});
