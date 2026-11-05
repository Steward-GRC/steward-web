// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useLoaderData } from "react-router";
import { describe, expect, it } from "vitest";

import PolicyCompletion from "./completion.$number";

const POLICY = {
  currentPublishedVersionId: "pv-2",
  number: "POL-EXPENSES-000002",
  title: "Expense Claims Policy",
  version: "2.0.0",
};

const REPORT = {
  avgDaysToAck: 3.4,
  completionPct: 78,
  overdue: [{ email: "carol@example.org", userId: "u-carol", userName: "Carol" }],
  totalAcked: 2,
  totalAudience: 3,
  viewedNotAckedCount: 12,
};

const ROSTER = {
  acked: [
    { ackedAt: "2026-10-02T12:00:00Z", email: "bob@example.org", userId: "u-bob", userName: "Bob" },
    {
      ackedAt: "2026-10-03T12:00:00Z",
      email: "dave@example.org",
      userId: "u-dave",
      userName: "Dave",
    },
  ],
  pending: [
    { ackedAt: null, email: "carol@example.org", userId: "u-carol", userName: "Carol" },
    { ackedAt: null, email: "heidi@example.org", userId: "u-heidi", userName: "Heidi" },
  ],
};

const ACTIVITY = [
  { acks: 2, date: "2026-10-02", views: 4 },
  { acks: 0, date: "2026-10-03", views: 1 },
  { acks: 5, date: "2026-10-04", views: 6 },
];

type Props = Parameters<typeof PolicyCompletion>[0];

const Page = () => {
  const loaderData = useLoaderData();
  return <PolicyCompletion {...({ loaderData } as unknown as Props)} />;
};

const openCompletion = (overrides: Record<string, unknown> = {}) => {
  const Stub = createRoutesStub([
    {
      Component: Page,
      loader: ({ request }) => ({
        activity: ACTIVITY,
        days: Number(new URL(request.url).searchParams.get("days") ?? 30),
        policy: POLICY,
        report: REPORT,
        roster: ROSTER,
        ...overrides,
      }),
      path: "/completion/:number",
    },
  ]);
  render(<Stub initialEntries={["/completion/POL-EXPENSES-000002"]} />);
};

const statValue = (label: string) => {
  const items = within(screen.getByRole("list", { name: "Completion summary" })).getAllByRole(
    "listitem",
  );
  return items
    .find((item) => item.textContent?.startsWith(label))
    ?.textContent?.slice(label.length);
};

describe("Completion for one policy (A14)", () => {
  it("heads the page with the policy, its number and version, and Export CSV", async () => {
    openCompletion();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Expense Claims Policy" }),
    ).toHaveClass("font-serif");
    expect(screen.getByRole("link", { name: "Completion" })).toHaveAttribute("href", "/completion");
    expect(screen.getByText("POL-EXPENSES-000002 · v2.0.0")).toHaveClass("font-mono");
    expect(screen.getByRole("link", { name: "Export CSV" })).toHaveAttribute(
      "href",
      "/resources/acks-export?number=POL-EXPENSES-000002&policyVersionId=pv-2",
    );
  });

  it("shows the five stat cards", async () => {
    openCompletion();
    await screen.findByRole("heading", { level: 1 });
    expect(statValue("Audience")).toBe("3");
    expect(statValue("Acknowledged")).toBe("2");
    expect(statValue("Completion")).toBe("78%");
    expect(statValue("Avg days to ack")).toBe("3.4");
    expect(statValue("Viewed not acked")).toBe("12");
  });

  it("draws the Acknowledged vs not yet donut", async () => {
    openCompletion();
    const donut = await screen.findByRole("region", { name: "Acknowledged vs not yet" });
    expect(within(donut).getByRole("img", { name: "78%, 2 of 3" })).toBeInTheDocument();
    expect(within(donut).getByText("Acknowledged")).toBeInTheDocument();
    expect(within(donut).getByText("Not yet")).toBeInTheDocument();
  });

  it("draws a bar per day, each labelled with its date and count, for 30 or 90 days", async () => {
    openCompletion();
    const activity = await screen.findByRole("region", { name: "Activity over time" });
    const bars = within(activity).getAllByRole("img");
    expect(bars).toHaveLength(3);
    expect(bars[0]).toHaveAccessibleName(/: 2$/);
    expect(within(activity).getByRole("radio", { name: "30 days" })).toBeChecked();
    await userEvent.click(within(activity).getByRole("radio", { name: "90 days" }));
    expect(await within(activity).findByRole("radio", { name: "90 days" })).toBeChecked();
  });

  it("says when activity isn't available, keeping the rest of the page", async () => {
    openCompletion({ activity: null });
    const activity = await screen.findByRole("region", { name: "Activity over time" });
    expect(within(activity).getByText("Activity isn't available right now.")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Acknowledged vs not yet" })).toBeInTheDocument();
  });

  it("says how many people are overdue", async () => {
    openCompletion();
    expect(await screen.findByText("1 user is overdue for acknowledgement.")).toBeInTheDocument();
  });

  it("lists who hasn't acknowledged, overdue first, and who has, with the date", async () => {
    openCompletion();
    const notYet = await screen.findByRole("tab", { name: "Not yet 2" });
    await userEvent.click(notYet);
    const panel = screen.getByRole("tabpanel");
    const rows = within(panel).getAllByRole("listitem");
    // Each row: the name, the email, then where they stand.
    expect(rows.map((row) => within(row).getByText(/^(Carol|Heidi)$/).textContent)).toEqual([
      "Carol",
      "Heidi",
    ]);
    expect(within(rows[0]!).getByText("Overdue")).toHaveClass("text-danger");
    expect(within(rows[1]!).getByText("Not yet")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Acknowledged 2" }));
    expect(
      within(screen.getByRole("tabpanel")).getByText(/^Acknowledged 2 Oct 2026$/),
    ).toBeInTheDocument();
  });

  it("says when there's no published version to report on", async () => {
    openCompletion({ activity: null, report: null, roster: null });
    expect(await screen.findByText("Nothing to report")).toBeInTheDocument();
  });
});
