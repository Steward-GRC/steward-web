// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { type InboxNotice, InboxPanel } from "./InboxPanel";

const notices: InboxNotice[] = [
  {
    at: "2026-10-06T09:02:00Z",
    body: "Expense Claims Policy · Final approval",
    href: "/approvals/POL-EXPENSES-000002",
    id: "n-1",
    needsAction: true,
    read: false,
    title: "Your approval is needed",
  },
  {
    at: "2026-10-02T14:02:00Z",
    body: "v1 · Fix",
    href: "/policies/POL-FACILITIES-000001",
    id: "n-2",
    needsAction: false,
    read: true,
    title: "Desk Booking Policy published",
  },
];

const openPanel = (list: InboxNotice[], onMarkAllRead = vi.fn()) => {
  const Stub = createRoutesStub([
    {
      Component: () => <InboxPanel notices={list} onMarkAllRead={onMarkAllRead} />,
      path: "/inbox",
    },
  ]);
  render(<Stub initialEntries={["/inbox"]} />);
  return onMarkAllRead;
};

describe("the in-app inbox (U36)", () => {
  it("counts what's unread, and marks it all read", async () => {
    const onMarkAllRead = openPanel(notices);
    const panel = await screen.findByRole("region", { name: "Notifications" });
    expect(within(panel).getByLabelText("1 unread")).toHaveTextContent("1");
    await userEvent.click(within(panel).getByRole("button", { name: "Mark all read" }));
    expect(onMarkAllRead).toHaveBeenCalledOnce();
  });

  it("marks an unread notice with a dot and bold weight, and links each to its subject", async () => {
    openPanel(notices);
    const unread = await screen.findByRole("link", { name: /Your approval is needed/ });
    expect(unread).toHaveAttribute("href", "/approvals/POL-EXPENSES-000002");
    expect(within(unread).getByText("Your approval is needed")).toHaveClass("font-bold");
    expect(within(unread).getByText("Unread")).toHaveClass("sr-only");
  });

  it("filters to what needs action, and to updates", async () => {
    openPanel(notices);
    await userEvent.click(await screen.findByRole("tab", { name: "Needs action" }));
    expect(screen.queryByText("Desk Booking Policy published")).toBeNull();
    await userEvent.click(screen.getByRole("tab", { name: "Updates" }));
    expect(screen.queryByText("Your approval is needed")).toBeNull();
    expect(screen.getByText("Desk Booking Policy published")).toBeVisible();
  });

  it("leads to the settings, and says when there's nothing", async () => {
    openPanel([]);
    expect(await screen.findByText("No notifications")).toBeVisible();
    expect(screen.getByText("When something needs you, it shows up here.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Notification settings" })).toHaveAttribute(
      "href",
      "/profile/notifications",
    );
  });
});
