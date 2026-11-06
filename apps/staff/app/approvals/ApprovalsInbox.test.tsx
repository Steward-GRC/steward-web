// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate, formatDayMonth } from "@steward-web/i18n";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import type { InboxEntry } from "./inbox";

import { ApprovalsInbox, type ApprovalsInboxProps } from "./ApprovalsInbox";

const now = new Date("2026-10-06T09:00:00Z");

const expense: InboxEntry = {
  dueAt: "2026-10-08T00:00:00Z",
  href: "/approvals/POL-EXPENSES-000002",
  key: "task-1",
  nowAt: "Final approval",
  number: "POL-EXPENSES-000002",
  stageCount: 2,
  stageName: "Final approval",
  stageNumber: 2,
  submittedAt: "2026-10-01T10:00:00Z",
  submittedBy: "Bob",
  title: "Expense Claims Policy",
  version: "3",
};

const travel: InboxEntry = {
  dueAt: "2026-10-04T00:00:00Z",
  href: "/approvals/PRC-TRAVEL-000003",
  key: "task-2",
  nowAt: "Finance sign-off",
  number: "PRC-TRAVEL-000003",
  stageCount: 1,
  stageName: "Finance sign-off",
  stageNumber: 1,
  title: "Travel Booking Procedure",
  version: "2",
};

const visitor: InboxEntry = {
  href: "/approvals/POL-FACILITIES-000004",
  key: "version-4:1",
  nowAt: "Facilities review",
  number: "POL-FACILITIES-000004",
  stageCount: 2,
  stageName: "Final approval",
  stageNumber: 2,
  title: "Visitor Sign-in Policy",
  version: "1",
};

const devices = {
  ...visitor,
  decidedAt: "2026-09-30T10:00:00Z",
  decision: "approved" as const,
  href: "/approvals/PRC-DEVICES-000001",
  key: "run-9",
  number: "PRC-DEVICES-000001",
  stageCount: 3,
  stageNumber: 2,
  title: "Lost Device Procedure",
};

const renderInbox = (props: Partial<ApprovalsInboxProps>) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <ApprovalsInbox inProgress={[]} now={now} pending={[]} upcoming={[]} {...props} />
      ),
      path: "/approvals",
    },
  ]);
  render(<Stub initialEntries={["/approvals"]} />);
};

describe("the approvals inbox (U24)", () => {
  it("heads the page: Workflow, Approvals, and what it holds", async () => {
    renderInbox({ pending: [expense] });
    expect(await screen.findByRole("heading", { level: 1, name: "Approvals" })).toBeVisible();
    expect(screen.getByText("Workflow")).toBeVisible();
    expect(screen.getByText("Drafts awaiting your decision.")).toBeVisible();
  });

  it("lists what's pending with its stage as 'N of M', the submitter, the due date and Review", async () => {
    renderInbox({ pending: [expense] });
    const pending = await screen.findByRole("region", { name: "Pending" });
    const row = within(pending).getByRole("row", { name: /Expense Claims Policy/ });
    expect(row).toHaveTextContent("POL-EXPENSES-000002 · v3");
    expect(row).toHaveTextContent("Final approval · 2 of 2");
    expect(row).toHaveTextContent(`Bob · ${formatDate("2026-10-01T10:00:00Z")}`);
    expect(row).toHaveTextContent(formatDayMonth("2026-10-08T00:00:00Z"));
    expect(within(row).getByRole("link", { name: "Review" })).toHaveAttribute(
      "href",
      "/approvals/POL-EXPENSES-000002",
    );
  });

  it("marks an overdue approval with a pill", async () => {
    renderInbox({ pending: [travel] });
    const row = within(await screen.findByRole("region", { name: "Pending" })).getByRole("row", {
      name: /Travel Booking Procedure/,
    });
    expect(within(row).getByText("Overdue 2 days")).toBeVisible();
  });

  it("leaves the Submitted column out while no row knows who submitted it", async () => {
    renderInbox({ pending: [travel] });
    const pending = await screen.findByRole("region", { name: "Pending" });
    expect(within(pending).queryByRole("columnheader", { name: "Submitted" })).toBeNull();
  });

  it("previews what's coming to you, with the Upcoming badge and where the run is now", async () => {
    renderInbox({ upcoming: [visitor] });
    const coming = await screen.findByRole("region", { name: "Coming to you" });
    expect(coming).toHaveTextContent(
      "You're an approver on a later stage. Preview it now — you'll be notified when it's your turn to decide.",
    );
    const row = within(coming).getByRole("row", { name: /Visitor Sign-in Policy/ });
    expect(row).toHaveTextContent("UpcomingStage 2 of 2");
    expect(row).toHaveTextContent("Facilities review");
    expect(within(row).getByRole("link", { name: "Preview" })).toHaveAttribute(
      "href",
      "/approvals/POL-FACILITIES-000004",
    );
  });

  it("lists runs you've already decided that are still moving", async () => {
    renderInbox({ inProgress: [devices] });
    const moving = await screen.findByRole("region", { name: "In progress" });
    expect(moving).toHaveTextContent(
      "You've already decided — these runs are still moving through their remaining stages.",
    );
    const row = within(moving).getByRole("row", { name: /Lost Device Procedure/ });
    expect(row).toHaveTextContent("Stage 2 of 3");
    expect(row).toHaveTextContent(`You approved · ${formatDayMonth("2026-09-30T10:00:00Z")}`);
    expect(within(row).getByRole("link", { name: "View" })).toBeInTheDocument();
  });

  it("leaves out a group with nothing in it", async () => {
    renderInbox({ pending: [expense] });
    await screen.findByRole("region", { name: "Pending" });
    expect(screen.queryByRole("region", { name: "Coming to you" })).toBeNull();
    expect(screen.queryByRole("region", { name: "In progress" })).toBeNull();
  });

  it("says when nothing is pending", async () => {
    renderInbox({ upcoming: [visitor] });
    expect(await screen.findByText("No pending approvals")).toBeVisible();
    expect(
      screen.getByText("When a draft is submitted for approval, it will appear here."),
    ).toBeVisible();
    expect(screen.queryByRole("region", { name: "Pending" })).toBeNull();
  });

  it("turns each row into a card on a phone, counting each group (U24m)", async () => {
    renderInbox({ pending: [expense, travel] });
    const cards = await screen.findByRole("list", { name: "Pending · 2" });
    const card = within(cards).getAllByRole("listitem")[0]!;
    expect(card).toHaveTextContent("Final approval · 2 of 2 · due");
    expect(within(card).getByRole("link", { name: "Review" })).toBeInTheDocument();
  });
});

const pendingTitles = () =>
  within(screen.getByRole("table", { name: "Pending" }))
    .getAllByRole("row")
    .slice(1)
    .map((row) => row.getAttribute("aria-label"));

describe("sorting the inbox's groups from their column headers", () => {
  it("sorts a group by policy, by stage and by due date, both ways", async () => {
    renderInbox({ pending: [expense, travel, visitor] });
    expect(pendingTitles()).toEqual([
      "Expense Claims Policy",
      "Travel Booking Procedure",
      "Visitor Sign-in Policy",
    ]);
    const table = screen.getByRole("table", { name: "Pending" });
    const policy = within(table).getByRole("columnheader", { name: /Policy/ });
    await userEvent.click(within(policy).getByRole("button"));
    expect(policy).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(within(policy).getByRole("button"));
    expect(policy).toHaveAttribute("aria-sort", "descending");
    expect(pendingTitles()[0]).toBe("Visitor Sign-in Policy");

    const due = within(table).getByRole("columnheader", { name: /Due/ });
    await userEvent.click(within(due).getByRole("button"));
    // Soonest first; a policy with no due date goes last.
    expect(pendingTitles()).toEqual([
      "Travel Booking Procedure",
      "Expense Claims Policy",
      "Visitor Sign-in Policy",
    ]);

    const stage = within(table).getByRole("columnheader", { name: /Stage/ });
    await userEvent.click(within(stage).getByRole("button"));
    expect(pendingTitles()[0]).toBe("Travel Booking Procedure");
  });

  it("keeps each group's sort to itself", async () => {
    renderInbox({ inProgress: [devices, visitor], pending: [expense, travel] });
    const pending = screen.getByRole("table", { name: "Pending" });
    await userEvent.click(
      within(within(pending).getByRole("columnheader", { name: /Policy/ })).getByRole("button"),
    );
    const progress = screen.getAllByRole("table").find((table) => table !== pending)!;
    expect(within(progress).getByRole("columnheader", { name: /Policy/ })).not.toHaveAttribute(
      "aria-sort",
    );
  });
});
