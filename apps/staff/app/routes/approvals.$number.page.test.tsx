// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDayMonth } from "@steward-web/i18n";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useActionData } from "react-router";
import { describe, expect, it, vi } from "vitest";

import ApprovalReviewRoute from "./approvals.$number";

const loaderData = {
  match: {
    category: "Finance",
    documentType: "POLICY",
    number: "POL-EXPENSES-000002",
    subcategory: "Expenses",
    title: "Expense Claims Policy",
    version: "3",
  },
  meId: "u-3",
  policyVersionId: "version-3",
  preview: null,
  review: {
    diff: [
      {
        changeType: "changed",
        sectionKey: "making-a-claim",
        sectionTitle: "2. Making a claim",
        wordDiffHtml: "File your claim within <del>60</del> <ins>30</ins> days.",
      },
    ],
    history: [
      {
        actorName: "Bob",
        at: "2026-10-01T10:00:00Z",
        comment: null,
        kind: "submitted",
        stage: null,
        versionLabel: "3",
      },
    ],
    upcoming: {
      appendices: [],
      blocks: [
        { depth: 1, kind: "heading", sectionKey: "making-a-claim", text: "Making a claim" },
        { kind: "paragraph", runs: [{ text: "File your claim within 30 days." }] },
      ],
      version: "3",
    },
  },
  task: { dueAt: "2026-10-04T00:00:00Z", runId: "run-1", taskId: "task-1" },
  workflow: {
    currentStageIdx: 1,
    runId: "run-1",
    stageAssignees: [
      [
        {
          comment: "Thirty days matches our month-end close.",
          decidedAt: "2026-10-02T10:00:00Z",
          name: "Dave",
          state: "approved",
          userId: "u-4",
        },
      ],
      [
        { name: "Carol", state: "pending", userId: "u-3" },
        { name: "Alice", state: "pending", userId: "u-1" },
      ],
    ],
    stageNames: ["Finance review", "Final approval"],
    stageUnitProgress: [[], []],
    status: "APPROVAL_STATUS_IN_REVIEW",
  },
};

type Props = Parameters<typeof ApprovalReviewRoute>[0];

const renderReview = (
  action: (form: FormData) => unknown,
  data: Record<string, unknown> = loaderData,
) => {
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => (await action(await request.formData())) ?? null,
      Component: () => {
        const actionData = useActionData();
        return <ApprovalReviewRoute {...({ actionData, loaderData: data } as unknown as Props)} />;
      },
      path: "/approvals/:number",
    },
    { Component: () => <p>Inbox</p>, path: "/approvals" },
  ]);
  render(<Stub initialEntries={["/approvals/POL-EXPENSES-000002"]} />);
};

describe("the approval review page (U25)", () => {
  it("shows the stepper with each stage's approvers, and you on the current one", () => {
    renderReview(() => {});
    const stepper = screen.getByRole("list", { name: "Approval stages" });
    expect(within(stepper).getByRole("listitem", { name: "Finance review" })).toHaveTextContent(
      "“Thirty days matches our month-end close.”",
    );
    const current = within(stepper).getByRole("listitem", { name: "Final approval" });
    expect(current).toHaveAttribute("aria-current", "step");
    expect(within(current).getByText("· you")).toBeInTheDocument();
  });

  it("keeps the decision off until there's a comment, then sends it with the task", async () => {
    const action = vi.fn();
    renderReview(action);
    const panel = screen.getByRole("region", { name: "Your decision" });
    const approve = within(panel).getByRole("button", { name: "Approve" });
    expect(approve).toBeDisabled();
    expect(within(panel).getByRole("button", { name: "Reject" })).toBeDisabled();
    await userEvent.type(within(panel).getByLabelText("Decision comment"), "Clear and fair.");
    await userEvent.click(approve);
    await vi.waitFor(() => expect(action).toHaveBeenCalledOnce());
    const form = action.mock.calls[0]![0] as FormData;
    expect([form.get("intent"), form.get("taskId"), form.get("runId")]).toEqual([
      "approve",
      "task-1",
      "run-1",
    ]);
  });
});

describe("the review page's head and tabs (U25)", () => {
  it("heads the page with the way back, the category, the serif title, number and stage", () => {
    renderReview(() => {});
    expect(screen.getByRole("link", { name: "Approvals" })).toHaveAttribute("href", "/approvals");
    expect(screen.getByText("Finance · Expenses")).toBeVisible();
    expect(screen.getByRole("heading", { level: 1, name: "Expense Claims Policy" })).toHaveClass(
      "font-serif",
    );
    expect(screen.getByText("POL-EXPENSES-000002 · v3")).toHaveClass("font-mono");
    expect(screen.getByText("in review · stage 2 of 2")).toBeVisible();
    expect(
      screen.getByText(`Due ${formatDayMonth("2026-10-04T00:00:00Z")} · Final approval`),
    ).toBeVisible();
  });

  it("opens on the changes against the published version, word by word", () => {
    renderReview(() => {});
    expect(
      screen.getByRole("tab", { name: "Changes vs the current published version" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("30").tagName).toBe("INS");
    expect(screen.getByText("60").tagName).toBe("DEL");
  });

  it("shows the version under review, and its history, on their own tabs", async () => {
    renderReview(() => {});
    await userEvent.click(screen.getByRole("tab", { name: "Upcoming version (under review)" }));
    expect(screen.getByRole("heading", { level: 2, name: "1. Making a claim" })).toBeVisible();
    await userEvent.click(screen.getByRole("tab", { name: "History" }));
    expect(screen.getByRole("heading", { name: "History & approvals" })).toBeVisible();
  });

  it("says why there are no changes to show when the published version isn't known", () => {
    renderReview(() => {}, {
      ...loaderData,
      review: { ...loaderData.review, diff: null, first: false },
    });
    expect(
      screen.getByText("The changes can't be shown: this draft isn't listed in your library."),
    ).toBeVisible();
  });

  it("says there's nothing to compare for a first version", () => {
    renderReview(() => {}, {
      ...loaderData,
      review: { ...loaderData.review, diff: null, first: true },
    });
    expect(
      screen.getByText("This is the first version, so there's nothing to compare yet."),
    ).toBeVisible();
  });
});

describe("the review page's other states (U25o)", () => {
  const noTask = { ...loaderData, task: null };

  it("previews a run that comes to you later, in place of the decision", () => {
    // The run is still at its first stage; this approver's turn is the second.
    renderReview(() => {}, {
      ...noTask,
      preview: { stageNumber: 2 },
      workflow: { ...loaderData.workflow, currentStageIdx: 0 },
    });
    expect(screen.queryByRole("region", { name: "Your decision" })).toBeNull();
    const note = screen.getByRole("note");
    expect(note).toHaveTextContent("Preview · you decide at stage 2");
    expect(note).toHaveTextContent(
      "Finance review is still deciding. You'll be notified when it's your turn.",
    );
  });

  it("says when the reader isn't an approver on this run", () => {
    renderReview(() => {}, noTask);
    expect(screen.getByRole("note")).toHaveTextContent(
      "Not in your approval scopeYou can read this draft, but you're not an approver on its workflow.",
    );
  });

  it("says when there's nothing left to decide", () => {
    renderReview(() => {}, {
      ...noTask,
      workflow: { ...loaderData.workflow, status: "APPROVAL_STATUS_PUBLISHED" },
    });
    expect(screen.getByRole("note")).toHaveTextContent(
      "No longer in reviewThere is nothing to decide.",
    );
  });

  it("confirms the decision once it's recorded", async () => {
    renderReview(() => ({ decided: "approved" }));
    const panel = screen.getByRole("region", { name: "Your decision" });
    await userEvent.type(within(panel).getByLabelText("Decision comment"), "Clear and fair.");
    await userEvent.click(within(panel).getByRole("button", { name: "Approve" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Approved. Your decision and comment are recorded, and the run moves on.",
    );
    expect(screen.queryByRole("region", { name: "Your decision" })).toBeNull();
  });
});
