// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import ApprovalReviewRoute from "./approvals.$number";

const loaderData = {
  match: {
    category: "Finance",
    documentType: "POLICY",
    number: "POL-EXPENSES-000002",
    title: "Expense Claims Policy",
  },
  meId: "u-3",
  policyVersionId: "version-3",
  task: { runId: "run-1", taskId: "task-1" },
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

const renderReview = (action: (form: FormData) => void) => {
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        action(await request.formData());
        return null;
      },
      Component: () => <ApprovalReviewRoute {...({ loaderData } as unknown as Props)} />,
      path: "/approvals/:number",
    },
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
