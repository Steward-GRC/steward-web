// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatRelativeTime } from "@steward-web/i18n";
import { render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import Overview from "./home";

const occurredAt = new Date(Date.now() - 2 * 60_000).toISOString();

const loaderData = {
  ackSnapshot: { acknowledged: 184, audience: 214 },
  activity: [
    {
      action: "policy.published",
      actorName: "Carol",
      actorUserId: "u-3",
      id: "1",
      occurredAt,
      subject: "pol-1",
      subjectLabel: "Desk Booking Policy",
    },
  ],
  groupCount: 4,
  inProgressCount: 5,
  policyCount: 14,
  publishedCount: 9,
  templateCount: 2,
};

type Props = Parameters<typeof Overview>[0];

const renderOverview = (data: object = loaderData) => {
  const Stub = createRoutesStub([
    { Component: () => <Overview {...({ loaderData: data } as unknown as Props)} />, path: "/" },
  ]);
  render(<Stub />);
};

describe("the admin Overview (A1)", () => {
  it("says what it is", () => {
    renderOverview();
    expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument();
    expect(screen.getByText("Policy platform at a glance.")).toBeInTheDocument();
  });

  it("links each stat card to the list it counts (4-components.s9)", () => {
    renderOverview();
    const cards = [
      ["Policies", "14", "/policies"],
      ["Published", "9", "/policies?status=published"],
      ["In progress", "5", "/policies?status=in-progress"],
      ["Groups", "4", "/groups"],
      ["Templates", "2", "/templates"],
    ];
    for (const [label, value, href] of cards) {
      const card = screen.getByRole("link", { name: new RegExp(`^${label}`) });
      expect(card).toHaveAttribute("href", href);
      expect(card).toHaveTextContent(`${label}${value}`);
    }
  });

  it("shows the acknowledgement snapshot beside the recent activity", () => {
    renderOverview();
    const snapshot = screen.getByRole("region", { name: "Acknowledgement snapshot" });
    expect(within(snapshot).getByText("184 of 214 acknowledged · 86%")).toBeInTheDocument();
    const activity = screen.getByRole("region", { name: "Recent activity" });
    const row = within(activity).getByRole("listitem");
    expect(within(row).getByText("Carol")).toBeInTheDocument();
    expect(row).toHaveTextContent("Policy published · Desk Booking Policy");
    expect(row).toHaveTextContent(formatRelativeTime(occurredAt));
  });

  it("leaves the snapshot out when it couldn't be read", () => {
    renderOverview({ ...loaderData, ackSnapshot: null });
    expect(screen.queryByRole("region", { name: "Acknowledgement snapshot" })).toBeNull();
  });
});
