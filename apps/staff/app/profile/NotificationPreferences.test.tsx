// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { NotificationPreferences as Preferences } from "@steward-web/api-client";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { NotificationPreferences } from "./NotificationPreferences";

const preferences = {
  catalog: [
    {
      category: "COMPLIANCE",
      delivery: "REMINDER_SCHEDULE",
      kind: "ack_reminder",
      mandatory: true,
    },
    {
      category: "WORKFLOW",
      delivery: "IMMEDIATE_OR_DIGEST",
      kind: "approval_needed",
      mandatory: false,
    },
  ],
  settings: {
    categories: [
      { cadence: "IMMEDIATE", category: "COMPLIANCE", mandatory: true },
      { cadence: "IMMEDIATE", category: "WORKFLOW", mandatory: false },
      { cadence: "WEEKLY", category: "INFORMATIONAL", mandatory: false },
    ],
    channels: { email: true, inApp: true, push: false },
    digest: { dailyHour: 8, weeklyDow: 1 },
    overrides: [
      {
        cadence: "DAILY",
        category: "WORKFLOW",
        delivery: "IMMEDIATE_OR_DIGEST",
        kind: "approval_needed",
        mandatory: false,
      },
    ],
  },
} as unknown as Preferences;

const openPreferences = (value: null | Preferences = preferences) => {
  const posted: FormData[] = [];
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        posted.push(await request.formData());
        return null;
      },
      Component: () => <NotificationPreferences preferences={value} />,
      path: "/profile/notifications",
    },
  ]);
  render(<Stub initialEntries={["/profile/notifications"]} />);
  return posted;
};

describe("notification preferences (U35)", () => {
  it("says what it's for, and that some notices can't be turned off", async () => {
    openPreferences();
    expect(await screen.findByRole("heading", { name: "Notifications" })).toBeVisible();
    expect(
      screen.getByText(
        "Choose how often you hear from Steward. Some notices are required for auditability and can’t be turned off.",
      ),
    ).toBeVisible();
  });

  it("shows how you're reached, and when the digests go out", async () => {
    openPreferences();
    const reached = await screen.findByRole("region", { name: "How you’re reached" });
    expect(within(reached).getByRole("switch", { name: "Email" })).toBeChecked();
    expect(within(reached).getByRole("switch", { name: "Push" })).not.toBeChecked();
    expect(reached).toHaveTextContent("Daily digest at 08:00 · Weekly digest on Monday");
  });

  it("turns a channel on, keeping the others", async () => {
    const posted = openPreferences();
    await userEvent.click(await screen.findByRole("switch", { name: "Push" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(Object.fromEntries(posted[0]!)).toEqual({
      email: "true",
      inApp: "true",
      intent: "set-channels",
      push: "true",
    });
  });

  it("lists each category with its cadence, and never Off for a required one", async () => {
    openPreferences();
    const about = await screen.findByRole("region", { name: "What you’re notified about" });
    const compliance = within(about).getByRole("radiogroup", { name: "How often: Compliance" });
    expect(within(compliance).getByRole("radio", { name: "Immediate" })).toBeChecked();
    expect(within(compliance).getByRole("radio", { name: "Off" })).toBeDisabled();
    expect(within(about).getAllByText("Required")).toHaveLength(3);
    expect(
      within(
        within(about).getByRole("radiogroup", { name: "How often: Updates & digests" }),
      ).getByRole("radio", { name: "Weekly digest" }),
    ).toBeChecked();
  });

  it("sets a category's cadence", async () => {
    const posted = openPreferences();
    const workflow = await screen.findByRole("radiogroup", {
      name: "How often: Approvals & workflow",
    });
    await userEvent.click(within(workflow).getByRole("radio", { name: "Daily digest" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(Object.fromEntries(posted[0]!)).toEqual({
      cadence: "DAILY",
      category: "WORKFLOW",
      intent: "set-category",
    });
  });

  it("fine-tunes each notice in a category, marking one set on its own as Custom", async () => {
    const posted = openPreferences();
    const fineTune = await screen.findByRole("button", {
      name: "Fine-tune 1 notification · Custom",
    });
    await userEvent.click(fineTune);
    const type = screen.getByRole("radiogroup", { name: "How often: Approval needed" });
    expect(within(type).getByRole("radio", { name: "Daily digest" })).toBeChecked();
    await userEvent.click(within(type).getByRole("radio", { name: "Off" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(Object.fromEntries(posted[0]!)).toEqual({
      cadence: "OFF",
      intent: "set-type",
      kind: "approval_needed",
    });
  });

  it("says so when the preferences can't be read", async () => {
    openPreferences(null);
    expect(
      await screen.findByText(
        "Notification preferences aren't available right now. Try again in a moment.",
      ),
    ).toBeVisible();
  });
});
