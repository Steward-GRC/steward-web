// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDateTime } from "@steward-web/i18n";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { HistoryEntry } from "./policyReaderModel";

import { PolicyReaderHistory } from "./PolicyReaderHistory";

// The kinds the history can carry: one per audit action the services write about a policy
// (see historyFromAuditLog's tests in @steward-web/api-client for the action each comes from).
const KINDS = [
  "ackConfigUpdated",
  "ackRecorded",
  "ackRequired",
  "ackTransferred",
  "approved",
  "breakGlassRead",
  "breakGlassRevealed",
  "changesRequested",
  "created",
  "definitionsChanged",
  "deleted",
  "draftContentUpdated",
  "draftDiscarded",
  "draftSaved",
  "moved",
  "ownerChanged",
  "published",
  "referencesChanged",
  "reindexed",
  "rejected",
  "renameStaged",
  "renamed",
  "retired",
  "sensitivityChanged",
  "statusSet",
  "submitted",
  "templateChanged",
  "withdrawn",
  "workflowAssignmentSwapped",
  "workflowAssignmentSwappedOutOfEligibility",
  "workflowRunPaused",
  "workflowRunResumed",
  "workflowSignalApprove",
  "workflowSignalReject",
  "workflowSignalRetire",
  "workflowSignalWithdraw",
  "workflowStageEscalated",
  "workflowStageMisconfigured",
  "workflowStageUnstaffed",
  "workflowSubmitNoWorkflow",
  "workflowUserReassigned",
];

const entry = (kind: string): HistoryEntry => ({
  actorName: "Charlie Approver",
  at: "2026-08-05T11:05:00Z",
  comment: null,
  kind,
  stage: null,
  versionLabel: "1.0.0",
});

describe("PolicyReaderHistory", () => {
  it.each(KINDS)("labels the %s event in words", (kind) => {
    render(<PolicyReaderHistory history={[entry(kind)]} />);
    const label = screen.getByTestId("history-event-title");
    expect(label.textContent).not.toMatch(/reader\.history|\{\{|^\s|\s$/);
    expect(label.textContent).not.toBe(kind);
  });

  it("labels an approval without a stage as plain Approved", () => {
    render(<PolicyReaderHistory history={[entry("approved")]} />);
    expect(screen.getByTestId("history-event-title")).toHaveTextContent("Approved");
  });

  it("spells out an event it has no label for instead of showing a key", () => {
    render(<PolicyReaderHistory history={[entry("workflowStageSplitLater")]} />);
    expect(screen.getByText("Workflow stage split later")).toBeInTheDocument();
  });
});

describe("the history timeline (U18)", () => {
  const history: HistoryEntry[] = [
    { ...entry("submitted"), actorName: "Bob", at: "2026-09-28T16:41:00Z", versionLabel: "0.9.0" },
    { ...entry("withdrawn"), actorName: "Bob", at: "2026-09-28T17:00:00Z", versionLabel: "0.9.0" },
    { ...entry("submitted"), actorName: "Bob", at: "2026-09-28T16:41:00Z", versionLabel: "1.0.0" },
    {
      ...entry("decided"),
      actorName: "Carol",
      at: "2026-10-02T13:58:00Z",
      comment: "Clear and ready.",
      stage: "Final approval",
      versionLabel: "1.0.0",
    },
    { ...entry("published"), actorName: null, at: "2026-10-02T14:02:00Z", versionLabel: "1.0.0" },
  ];

  it("sits in its own card, one group per version, the current one first and open", () => {
    render(<PolicyReaderHistory history={history} />);
    expect(screen.getByRole("heading", { name: "History & approvals" })).toBeInTheDocument();
    const toggles = screen.getAllByRole("button");
    expect(toggles.map((b) => b.textContent)).toEqual([
      "v1.0.0Published· current",
      "v0.9.0Withdrawn",
    ]);
    expect(toggles[0]).toHaveAttribute("aria-expanded", "true");
    expect(toggles[1]).toHaveAttribute("aria-expanded", "false");
  });

  it("lists the newest event first, with a status dot, the detail and a mono time", () => {
    render(<PolicyReaderHistory history={history} />);
    const events = within(screen.getByRole("list", { name: "v1.0.0" })).getAllByRole("listitem");
    expect(
      events.map((event) => within(event).getByTestId("history-event-title").textContent),
    ).toEqual(["Published v1.0.0", "Final approval approved", "Submitted for approval"]);
    expect(events[0]).toHaveAttribute("data-tone", "published");
    expect(events[1]).toHaveAttribute("data-tone", "ok");
    expect(events[2]).toHaveAttribute("data-tone", "neutral");
    expect(within(events[1]!).getByText("Carol · “Clear and ready.”")).toBeInTheDocument();
    expect(within(events[1]!).getByText(formatDateTime("2026-10-02T13:58:00Z"))).toHaveClass(
      "font-mono",
    );
  });

  it("opens an older version on request", async () => {
    render(<PolicyReaderHistory history={history} />);
    await userEvent.click(screen.getByRole("button", { name: /v0\.9\.0/ }));
    const events = within(screen.getByRole("list", { name: "v0.9.0" })).getAllByRole("listitem");
    expect(events[0]).toHaveAttribute("data-tone", "withdrawn");
  });

  it("says when there's no activity yet", () => {
    render(<PolicyReaderHistory history={[]} />);
    expect(screen.getByText("No approval activity yet.")).toBeInTheDocument();
  });
});
