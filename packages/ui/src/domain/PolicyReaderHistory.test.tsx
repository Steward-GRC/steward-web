// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
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
    const label = screen.getByText(
      (_, element) => element?.tagName === "P" && element.classList.contains("text-ink"),
    );
    expect(label.textContent).not.toMatch(/reader\.history|\{\{|^\s|\s$/);
    expect(label.textContent).not.toBe(kind);
  });

  it("labels an approval without a stage as plain Approved", () => {
    render(<PolicyReaderHistory history={[entry("approved")]} />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("spells out an event it has no label for instead of showing a key", () => {
    render(<PolicyReaderHistory history={[entry("workflowStageSplitLater")]} />);
    expect(screen.getByText("Workflow stage split later")).toBeInTheDocument();
  });
});
