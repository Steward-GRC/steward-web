// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { asPhone } from "../test/phone";
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

describe("Completion on a phone (7-responsive.s3)", () => {
  it("lists each policy as a card with its progress and overdue badge", async () => {
    asPhone();
    openCompletion();
    expect(screen.queryByRole("table")).toBeNull();
    const [expenses] = within(
      screen.getByRole("list", { name: "Obligating policies" }),
    ).getAllByRole("listitem");
    expect(within(expenses!).getByRole("link", { name: "Expense Claims Policy" })).toHaveAttribute(
      "href",
      "/completion/POL-EXPENSES-000002",
    );
    expect(expenses).toHaveTextContent(
      /^Expense Claims PolicyPOL-EXPENSES-000002Finance · 167 of 214/,
    );
    expect(within(expenses!).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "78");
    expect(within(expenses!).getByText("9 overdue")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("searchbox", { name: "Search policies" }), "desk");
    const cards = within(screen.getByRole("list", { name: "Obligating policies" })).getAllByRole(
      "listitem",
    );
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("Desk Booking Policy");
  });
});

describe("Completion category column and filter (#104)", () => {
  const NESTED = [
    { ...ROWS[0], category: "Expenses", path: "Finance › Expenses" },
    {
      ...ROWS[1],
      category: "Travel",
      path: "Workplace › Travel",
      number: "POL-TRAVEL-000001",
      title: "Travel Policy",
    },
    {
      ...ROWS[1],
      category: "Facilities",
      path: "Workplace › Facilities",
      number: "POL-FAC-000001",
      title: "Desk Booking Policy",
    },
  ];

  it("shows the whole category path in the table", () => {
    openCompletion(NESTED);
    const table = screen.getByRole("table", { name: "Obligating policies" });
    expect(within(table).getByText("Finance › Expenses")).toBeInTheDocument();
    expect(within(table).getByText("Workplace › Travel")).toBeInTheDocument();
  });

  it("lists top-level categories only in the dropdown, and picking one keeps everything under it", async () => {
    openCompletion(NESTED);
    await userEvent.click(screen.getByRole("combobox", { name: "Category" }));
    const found = await screen.findAllByRole("option");
    const options = found.map((option) => option.textContent);
    expect(options).toEqual(["All categories", "Finance", "Workplace"]);
    await userEvent.click(screen.getByRole("option", { name: "Workplace" }));
    const table = screen.getByRole("table", { name: "Obligating policies" });
    expect(within(table).getByText("Workplace › Travel")).toBeInTheDocument();
    expect(within(table).getByText("Workplace › Facilities")).toBeInTheDocument();
    expect(within(table).queryByText("Finance › Expenses")).toBeNull();
  });

  it("has the right-click row menu", async () => {
    openCompletion(NESTED);
    fireEvent.contextMenu(screen.getByRole("row", { name: /Travel Policy/ }));
    expect(await screen.findByRole("menuitem", { name: "Open in new tab" })).toBeInTheDocument();
  });
});
