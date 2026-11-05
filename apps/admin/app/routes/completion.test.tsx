// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import Completion from "./completion";

const ROWS = [
  {
    category: "Finance",
    completionPct: 78,
    number: "POL-EXPENSES-000002",
    overdue: 9,
    title: "Expense Claims Policy",
    totalAcked: 167,
    totalAudience: 214,
  },
  {
    category: "Workplace",
    completionPct: 100,
    number: "POL-FACILITIES-000001",
    overdue: 0,
    title: "Desk Booking Policy",
    totalAcked: 40,
    totalAudience: 40,
  },
];

type CompletionProps = Parameters<typeof Completion>[0];

const openCompletion = (rows: object[] = ROWS) => {
  const Stub = createRoutesStub([
    {
      Component: () => <Completion {...({ loaderData: { rows } } as unknown as CompletionProps)} />,
      path: "/completion",
    },
  ]);
  render(<Stub initialEntries={["/completion"]} />);
};

const statValue = (label: string) => {
  const items = within(screen.getByRole("list", { name: "Completion summary" })).getAllByRole(
    "listitem",
  );
  return items
    .find((item) => item.textContent?.startsWith(label))
    ?.textContent?.slice(label.length);
};

describe("Completion (A13)", () => {
  it("heads the page and sums the obligating policies in four stat cards", async () => {
    openCompletion();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Completion" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Acknowledgement coverage across every policy that requires acknowledgement.",
      ),
    ).toBeInTheDocument();
    expect(statValue("Obligating policies")).toBe("2");
    expect(statValue("Audience")).toBe("254");
    expect(statValue("Acknowledged")).toBe("207");
    expect(statValue("Completion")).toBe("81%");
  });

  it("lists each policy with its progress bar and an overdue badge", () => {
    openCompletion();
    const table = screen.getByRole("table", { name: "Obligating policies" });
    const expenses = within(table).getByRole("row", { name: /Expense Claims Policy/ });
    expect(within(expenses).getByRole("link", { name: "Expense Claims Policy" })).toHaveAttribute(
      "href",
      "/completion/POL-EXPENSES-000002",
    );
    expect(within(expenses).getByText("POL-EXPENSES-000002")).toHaveClass("font-mono");
    expect(within(expenses).getByText("167 of 214")).toBeInTheDocument();
    expect(within(expenses).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "78");
    expect(within(expenses).getByText("9 overdue")).toBeInTheDocument();
    const desk = within(table).getByRole("row", { name: /Desk Booking Policy/ });
    expect(within(desk).queryByText(/overdue/)).toBeNull();
  });

  it("filters to overdue only, and to one category", async () => {
    openCompletion();
    await userEvent.click(screen.getByRole("button", { name: "Overdue only" }));
    expect(screen.getByRole("button", { name: "Overdue only" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByText("Desk Booking Policy")).toBeNull();
    expect(statValue("Obligating policies")).toBe("1");

    await userEvent.click(screen.getByRole("button", { name: "Overdue only" }));
    await userEvent.click(screen.getByRole("combobox", { name: "Category" }));
    await userEvent.click(await screen.findByRole("option", { name: "Workplace" }));
    expect(screen.queryByText("Expense Claims Policy")).toBeNull();
    expect(screen.getByText("Desk Booking Policy")).toBeInTheDocument();
  });

  it("says when nothing asks for acknowledgement", () => {
    openCompletion([]);
    expect(screen.getByText("No obligating policies")).toBeInTheDocument();
  });
});
