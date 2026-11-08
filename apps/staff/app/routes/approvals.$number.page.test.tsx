// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDayMonth } from "@steward-web/i18n";
import { Toaster } from "@steward-web/ui";
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
    sinceReview: [],
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
        return (
          <>
            <ApprovalReviewRoute {...({ actionData, loaderData: data } as unknown as Props)} />
            <Toaster />
          </>
        );
      },
      path: "/approvals/:number",
    },
    { Component: () => <p>Inbox</p>, path: "/approvals" },
  ]);
  render(<Stub initialEntries={["/approvals/POL-EXPENSES-000002"]} />);
};

describe("the approval review page (U25)", () => {
  it("shows the approval flow, starting at Submitted, with each stage's approvers and you on the current one", () => {
    renderReview(() => {});
    const flow = screen.getByRole("list", { name: "Approval flow" });
    const items = within(flow).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Submitted");
    expect(items[1]).toHaveTextContent(
      /^Dave, Finance review, .*: Done\. “Thirty days matches our month-end close\.”$/,
    );
    expect(items[2]).toHaveTextContent(/^.* · you, Final approval.*: Waiting$/);
    expect(items[2]).toHaveAttribute("aria-current", "step");
    expect(items.at(-1)).toHaveTextContent("Publish");
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
  it("puts the Your decision box at the bottom of the page, below the tabs and the changes", () => {
    renderReview(vi.fn());
    const panel = screen.getByRole("region", { name: "Your decision" });
    const changes = screen.getByRole("tab", { name: /Changes/ });
    expect(changes.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(panel).toHaveClass("md:static");
    expect(panel).not.toHaveClass("md:sticky");
  });

  it("heads the page with the way back, the category, the serif title, number and stage", () => {
    renderReview(() => {});
    expect(screen.getByRole("link", { name: "Approvals" })).toHaveAttribute("href", "/approvals");
    const crumbs = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(crumbs.getAllByRole("link").map((a) => a.textContent)).toEqual([
      "Policies",
      "Finance",
      "Expenses",
      "Expense Claims Policy",
    ]);
    expect(crumbs.getByText("Approval")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { level: 1, name: "Expense Claims Policy" })).toHaveClass(
      "font-serif",
    );
    expect(screen.getByText("POL-EXPENSES-000002 · v3")).toHaveClass("font-mono");
    expect(screen.queryByText(/in review · stage/)).toBeNull();
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

  it("lays the review tabs out in equal-width columns", () => {
    renderReview(() => {});
    expect(screen.getByRole("tablist")).toHaveClass("grid-flow-col", "auto-cols-fr");
  });

  it("marks the active tab with the amber accent underline", () => {
    renderReview(() => {});
    expect(screen.getByRole("tab", { selected: true }).className).toContain(
      "data-[state=active]:shadow-[inset_0_-3px_var(--accent)]",
    );
  });

  it("shows the version under review, and its history, on their own tabs", async () => {
    renderReview(() => {});
    await userEvent.click(screen.getByRole("tab", { name: "Upcoming version (under review)" }));
    expect(screen.getByRole("heading", { level: 2, name: "1. Making a claim" })).toBeVisible();
    await userEvent.click(screen.getByRole("tab", { name: "History" }));
    expect(screen.getByRole("heading", { name: "History & approvals" })).toBeVisible();
  });

  it("leaves out the changes tab when there are no changes to show, even if the version isn't known to be first", () => {
    renderReview(() => {}, {
      ...loaderData,
      review: { ...loaderData.review, diff: null, first: false },
    });
    expect(
      screen.queryByRole("tab", { name: "Changes vs the current published version" }),
    ).toBeNull();
    expect(screen.getByRole("tab", { name: "History" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Upcoming version (under review)" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("leaves out the history tab when there is no history yet", () => {
    renderReview(() => {}, {
      ...loaderData,
      review: { ...loaderData.review, first: false, history: [] },
    });
    expect(screen.queryByRole("tab", { name: "History" })).toBeNull();
    expect(
      screen.getByRole("tab", { name: "Changes vs the current published version" }),
    ).toBeInTheDocument();
  });

  it("is one tab, Proposed Publish, for a first publish", () => {
    renderReview(() => {}, {
      ...loaderData,
      review: { ...loaderData.review, diff: null, first: true },
    });
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual(["Proposed Publish"]);
    expect(screen.getByRole("tab", { name: "Proposed Publish" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("keeps the decision panel with a first publish, so the reviewer can still answer", () => {
    renderReview(() => {}, {
      ...loaderData,
      review: { ...loaderData.review, diff: null, first: true },
    });
    const panel = screen.getByRole("region", { name: "Your decision" });
    expect(within(panel).getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("keeps the changes tab, and says so, when the comparison could not be loaded", async () => {
    renderReview(() => {}, {
      ...loaderData,
      review: { ...loaderData.review, diff: null, diffFailed: true, first: false },
    });
    const tab = screen.getByRole("tab", { name: "Changes vs the current published version" });
    expect(tab).toBeInTheDocument();
    await userEvent.click(tab);
    expect(
      screen.getByText("The comparison with the published version couldn't be loaded."),
    ).toBeVisible();
  });

  it("shows the changes and the version under review for a later version of a published policy", () => {
    renderReview(() => {}, { ...loaderData, review: { ...loaderData.review, first: false } });
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Changes vs the current published version",
      "Upcoming version (under review)",
      "History",
    ]);
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

describe("sending comments from the review page", () => {
  it("says the comments went, and keeps the decision panel", async () => {
    renderReview(() => ({ sent: true }));
    const panel = screen.getByRole("region", { name: "Your decision" });
    await userEvent.type(within(panel).getByLabelText("Decision comment"), "See my comments.");
    await userEvent.click(within(panel).getByRole("button", { name: "Send comments" }));
    expect(await screen.findByText("Your comments were sent to the author.")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Your decision" })).toBeInTheDocument();
  });
});

const openReview = (data: Record<string, unknown>) => {
  const reviewed = vi.fn();
  const Stub = createRoutesStub([
    {
      Component: () => (
        <ApprovalReviewRoute
          {...({ actionData: undefined, loaderData: data } as unknown as Props)}
        />
      ),
      path: "/approvals/:number",
    },
    {
      action: async ({ request }) => {
        reviewed(Object.fromEntries(await request.formData()));
        return null;
      },
      path: "/resources/review-threads",
    },
  ]);
  render(<Stub initialEntries={["/approvals/POL-EXPENSES-000002"]} />);
  return reviewed;
};

describe("what changed since the approver last reviewed", () => {
  const since = [
    {
      changeType: "changed",
      sectionKey: "making-a-claim",
      sectionTitle: "2. Making a claim",
      wordDiffHtml: "File your claim within <del>30</del> <ins>21</ins> days.",
    },
    { changeType: "unchanged", sectionKey: "scope", sectionTitle: "1. Scope", wordDiffHtml: "" },
  ];
  const withChanges = { ...loaderData, review: { ...loaderData.review, sinceReview: since } };

  it("opens on it, as its own tab, when something changed", () => {
    openReview(withChanges);
    const tab = screen.getByRole("tab", { name: "Changes since you last reviewed" });
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("21")).toBeVisible();
    // an unchanged section is not shown
    expect(screen.queryByText("1. Scope")).toBeNull();
  });

  it("is not a tab when nothing changed since", () => {
    openReview(loaderData);
    expect(screen.queryByRole("tab", { name: "Changes since you last reviewed" })).toBeNull();
  });

  it("marks the version reviewed", async () => {
    const posted = openReview(withChanges);
    await userEvent.click(screen.getByRole("button", { name: "Mark as reviewed" }));
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith({ intent: "reviewed", policyVersionId: "version-3" }),
    );
  });
});
