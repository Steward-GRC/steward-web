// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// My work (U1 for an author and approver, U1r for a reader) and To acknowledge (U2), as the
// Home and Library canvas draws them.
import { formatDate } from "@steward-web/i18n";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { createRoutesStub } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { MyWorkData, WorkRow } from "./myWork.server";

import { MyWork, ToAcknowledge } from "./MyWork";

const inRouter = (node: React.ReactNode) => {
  const Stub = createRoutesStub([{ Component: () => node, path: "/" }]);
  return render(<Stub initialEntries={["/"]} />);
};

const row = (title: string, number: string, version: string, href: string): WorkRow => ({
  href,
  number,
  title,
  version,
});

const many = (n: number, base: string): WorkRow[] =>
  Array.from({ length: n }, (_, index) =>
    row(`${base} ${index + 1}`, `POL-X-00000${index}`, "1.0.0", `/${base}/${index}`),
  );

const bob: MyWorkData = {
  ack: { done: 4, required: 5 },
  approvals: [
    {
      ...row("Lost Device Procedure", "POL-IT-000003", "1.2.0", "/approvals/POL-IT-000003"),
      dueAt: "2026-10-06T12:00:00Z",
    },
  ],
  drafts: [
    row("Visitor Sign-in Policy", "POL-FACILITIES-000004", "1.0.0", "/drafts/p-visit"),
    row("Travel Booking Procedure", "PRO-TRAVEL-000001", "2.1.0", "/drafts/p-travel"),
  ],
  email: "bob@example.org",
  library: {
    byCategory: [
      { count: 6, name: "Workplace" },
      { count: 3, name: "People" },
    ],
    drafts: 3,
    inReview: 2,
    policies: 14,
    published: 9,
    sensitive: 1,
  },
  obligations: [
    row("Expense Claims Policy", "POL-EXPENSES-000002", "2.0.0", "/policies/POL-EXPENSES-000002"),
  ],
};

const erin: MyWorkData = {
  ack: { done: 3, required: 4 },
  approvals: null,
  drafts: null,
  email: "erin@example.org",
  library: null,
  obligations: [
    row(
      "Visitor Sign-in Policy",
      "POL-FACILITIES-000004",
      "1.1.0",
      "/policies/POL-FACILITIES-000004",
    ),
  ],
};

describe("U1: My work for an author and approver", () => {
  it("says who is signed in, then My work and what it holds", async () => {
    inRouter(<MyWork data={bob} />);
    expect(await screen.findByText("Signed in as bob@example.org")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "My work" })).toBeInTheDocument();
    expect(screen.getByText("Everything waiting on you, across your roles.")).toBeInTheDocument();
  });

  it("no longer links the case queue: My work replaces the old link list (5-screens.s14)", async () => {
    inRouter(<MyWork data={bob} />);
    await screen.findByRole("heading", { level: 1, name: "My work" });
    expect(screen.queryByRole("link", { name: /cases/i })).toBeNull();
  });

  it("links a card per role, with its count", async () => {
    inRouter(<MyWork data={bob} />);
    expect(await screen.findByRole("link", { name: "Drafts in progress 2" })).toHaveAttribute(
      "href",
      "/drafts",
    );
    expect(screen.getByRole("link", { name: "Awaiting my approval 1" })).toHaveAttribute(
      "href",
      "/approvals",
    );
    expect(screen.getByRole("link", { name: "To acknowledge 1" })).toHaveAttribute(
      "href",
      "/acknowledge",
    );
  });

  it("leaves out the cards and lists of a role the person doesn't have", async () => {
    inRouter(<MyWork data={{ ...bob, approvals: null }} />);
    await screen.findByRole("link", { name: "Drafts in progress 2" });
    expect(screen.queryByRole("link", { name: /Awaiting my approval/ })).toBeNull();
    expect(screen.queryByRole("region", { name: "Awaiting my approval" })).toBeNull();
    // The count cards above the lists follow the same rule, so no empty third column is left.
    expect(screen.getByTestId("home-cards")).toHaveClass("md:grid-cols-2");
    expect(screen.getByTestId("home-cards")).not.toHaveClass("sm:grid-cols-3");
  });

  it("shows the library overview and the policies per category", async () => {
    inRouter(<MyWork data={bob} />);
    const library = await screen.findByRole("region", { name: "Library overview" });
    for (const [label, value] of [
      ["Policies", "14"],
      ["Published", "9"],
      ["Drafts", "3"],
      ["In review", "2"],
      ["Sensitive", "1"],
    ])
      expect(within(library).getByTestId(`library-${label}`)).toHaveTextContent(`${label}${value}`);
    expect(within(library).queryByText("watermarked on export")).toBeNull();
    expect(within(library).getByText("By category")).toBeInTheDocument();
    expect(within(library).getByRole("meter", { name: "Workplace" })).toHaveAttribute(
      "aria-valuenow",
      "6",
    );
  });

  it("shows the library counts, the category counts and the compliance figure in the amber tally", async () => {
    inRouter(<MyWork data={bob} />);
    const library = await screen.findByRole("region", { name: "Library overview" });
    expect(within(within(library).getByTestId("library-Policies")).getByText("14")).toHaveAttribute(
      "data-tally",
      "lg",
    );
    const workplace = within(library).getByTestId("library-category-Workplace");
    expect(within(workplace).getByText("6")).toHaveAttribute("data-tally", "sm");
    const compliance = screen.getByRole("region", { name: "Acknowledgement compliance" });
    expect(within(compliance).getByText("80%")).toHaveAttribute("data-tally", "lg");
    expect(within(compliance).getByTestId("progress-fill")).toHaveClass("bg-accent");
  });

  it("shows the acknowledgement compliance as a percentage and a bar", async () => {
    inRouter(<MyWork data={bob} />);
    const compliance = await screen.findByRole("region", { name: "Acknowledgement compliance" });
    expect(within(compliance).getByText("80%")).toBeInTheDocument();
    expect(within(compliance).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "80");
    expect(
      within(compliance).getByText(
        "4 of 5 mandatory-read policies acknowledged · 1 waiting on you",
      ),
    ).toBeInTheDocument();
  });

  it("gives the compliance card the same banded header as the library overview", async () => {
    inRouter(<MyWork data={bob} />);
    const compliance = await screen.findByRole("region", { name: "Acknowledgement compliance" });
    const library = screen.getByRole("region", { name: "Library overview" });
    expect(within(compliance).getByTestId("card-band")).toHaveClass(
      "bg-band",
      "text-on-band",
      "border-b",
    );
    expect(within(library).getByTestId("card-band")).toHaveClass(
      "bg-band",
      "text-on-band",
      "border-b",
    );
  });

  it("puts each list on its own full-width row, capped at five with a link to the full list", async () => {
    inRouter(
      <MyWork
        data={{
          ...bob,
          approvals: many(8, "Approval"),
          drafts: many(7, "Draft"),
          obligations: many(6, "Ack"),
        }}
      />,
    );
    const drafts = await screen.findByRole("region", { name: "My drafts" });
    const approvals = screen.getByRole("region", { name: "Awaiting my approval" });
    const acknowledge = screen.getByRole("region", { name: "To acknowledge" });
    expect(within(drafts).getAllByRole("listitem")).toHaveLength(5);
    expect(within(approvals).getAllByRole("listitem")).toHaveLength(5);
    expect(within(acknowledge).getAllByRole("listitem")).toHaveLength(5);
    expect(within(drafts).getByRole("link", { name: "View all 7" })).toHaveAttribute(
      "href",
      "/drafts",
    );
    expect(within(approvals).getByRole("link", { name: "View all 8" })).toHaveAttribute(
      "href",
      "/approvals",
    );
    expect(within(acknowledge).getByRole("link", { name: "View all 6" })).toHaveAttribute(
      "href",
      "/acknowledge",
    );
    expect(screen.getByTestId("home-lists")).toHaveClass("md:grid-cols-3");
  });

  it("shares the row equally: thirds for three boxes, halves for two, stacked when narrow (bug log 61)", async () => {
    inRouter(<MyWork data={bob} />);
    const three = await screen.findByTestId("home-lists");
    expect(three).toHaveClass("grid", "md:grid-cols-3");
    expect(three).not.toHaveClass("grid-cols-2");
  });

  it("gives two boxes 50/50 when access hides the third", async () => {
    inRouter(<MyWork data={{ ...bob, approvals: null }} />);
    const two = await screen.findByTestId("home-lists");
    expect(two).toHaveClass("md:grid-cols-2");
    expect(two).not.toHaveClass("md:grid-cols-3");
    expect(screen.queryByRole("region", { name: "Awaiting my approval" })).toBeNull();
  });

  it("doesn't link to the full list when everything already shows", async () => {
    inRouter(<MyWork data={bob} />);
    const drafts = await screen.findByRole("region", { name: "My drafts" });
    expect(within(drafts).queryByRole("link", { name: /View all/ })).toBeNull();
  });

  it("lists my drafts, my approvals and what I still have to acknowledge", async () => {
    inRouter(<MyWork data={bob} />);
    const drafts = await screen.findByRole("region", { name: "My drafts" });
    expect(within(drafts).getByText("v1.0.0 · draft")).toBeInTheDocument();
    expect(within(drafts).getAllByRole("link", { name: "Continue →" })[0]).toHaveAttribute(
      "href",
      "/drafts/p-visit",
    );
    const approvals = screen.getByRole("region", { name: "Awaiting my approval" });
    expect(
      within(approvals).getByText(`v1.2.0 · due ${formatDate("2026-10-06T12:00:00Z")}`),
    ).toBeInTheDocument();
    expect(within(approvals).getByRole("link", { name: "Review" })).toHaveAttribute(
      "href",
      "/approvals/POL-IT-000003",
    );
    const acknowledge = screen.getByRole("region", { name: "To acknowledge" });
    expect(within(acknowledge).getByRole("link", { name: "Read & acknowledge" })).toHaveAttribute(
      "href",
      "/policies/POL-EXPENSES-000002",
    );
  });

  it("says when a list is empty", async () => {
    inRouter(
      <MyWork
        data={{ ...bob, ack: { done: 0, required: 0 }, approvals: [], drafts: [], obligations: [] }}
      />,
    );
    expect(await screen.findByText("No drafts in progress.")).toBeInTheDocument();
    expect(screen.getByText("Nothing to review right now.")).toBeInTheDocument();
    expect(screen.getByText("You're all caught up.")).toBeInTheDocument();
    expect(
      screen.getByText("No policies require your acknowledgement right now."),
    ).toBeInTheDocument();
  });
});

describe("U1r: My work for a reader", () => {
  it("is the ring, the next action and nothing for roles they don't have", async () => {
    inRouter(<MyWork data={erin} />);
    expect(await screen.findByText("Signed in as erin@example.org")).toBeInTheDocument();
    const ring = screen.getByRole("progressbar", { name: "75% acknowledged" });
    expect(ring).toHaveAttribute("aria-valuenow", "75");
    expect(
      screen.getByText("3 of 4 mandatory-read policies acknowledged · 1 waiting on you"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Read & acknowledge Visitor Sign-in Policy" }),
    ).toHaveAttribute("href", "/policies/POL-FACILITIES-000004");
    expect(screen.queryByRole("region", { name: "Library overview" })).toBeNull();
    expect(screen.queryByRole("region", { name: "My drafts" })).toBeNull();
    expect(screen.queryByRole("link", { name: /Drafts in progress/ })).toBeNull();
  });

  it("has no next action once everything is acknowledged", async () => {
    inRouter(<MyWork data={{ ...erin, ack: { done: 4, required: 4 }, obligations: [] }} />);
    expect(await screen.findByRole("progressbar", { name: "100% acknowledged" })).toBeVisible();
    expect(screen.queryByRole("link", { name: /Read & acknowledge/ })).toBeNull();
  });
});

describe("U2: To acknowledge", () => {
  it("lists each pending acknowledgement with its number and version", async () => {
    inRouter(<ToAcknowledge obligations={bob.obligations} />);
    expect(
      await screen.findByRole("heading", { level: 1, name: "To acknowledge" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Published policies you must confirm you have read."),
    ).toBeInTheDocument();
    const list = screen.getByRole("region", { name: "Pending acknowledgements (1)" });
    expect(within(list).getByText("Expense Claims Policy")).toBeInTheDocument();
    expect(within(list).getByText("POL-EXPENSES-000002 · v2.0.0")).toBeInTheDocument();
    expect(within(list).getByRole("link", { name: "Read & acknowledge" })).toHaveAttribute(
      "href",
      "/policies/POL-EXPENSES-000002",
    );
  });

  it("says you're all caught up when there's nothing left", async () => {
    inRouter(<ToAcknowledge obligations={[]} />);
    expect(await screen.findByText("You're all caught up")).toBeInTheDocument();
    expect(
      screen.getByText("You have no policies awaiting your acknowledgement."),
    ).toBeInTheDocument();
  });

  it("says it couldn't load the list when the read failed", async () => {
    inRouter(<ToAcknowledge obligations={null} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load");
  });
});

describe("U1: the live-update cue (6-states.s5)", () => {
  afterEach(() => vi.useRealTimers());

  it("uses the shared stat cards for the role cards", async () => {
    inRouter(<MyWork data={bob} />);
    const card = await screen.findByRole("link", { name: "Drafts in progress 2" });
    expect(card).toHaveAttribute("data-stat-card", "lg");
  });

  it("flashes a row that changed since the page last loaded and says Updated just now", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const added = row("Lost Device Procedure", "POL-IT-000003", "1.3.0", "/drafts/p-lost");
    let setData: ((data: MyWorkData) => void) | undefined;
    const Live = () => {
      const [data, set] = React.useState(bob);
      setData = set;
      return <MyWork data={data} />;
    };
    inRouter(<Live />);
    const drafts = await screen.findByRole("region", { name: "My drafts" });
    expect(within(drafts).queryByText("Updated just now")).toBeNull();
    act(() => setData?.({ ...bob, drafts: [...bob.drafts!, added] }));
    const rowOf = (title: string) =>
      within(drafts)
        .getAllByRole("listitem")
        .find((item) => item.textContent?.includes(title))!;
    const fresh = rowOf("Lost Device Procedure");
    expect(fresh).toHaveClass("stw-updated");
    expect(rowOf("Visitor Sign-in Policy")).not.toHaveClass("stw-updated");
    expect(within(drafts).getByText("Updated just now")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1200));
    expect(fresh).not.toHaveClass("stw-updated");
  });
});

const cards = () => within(screen.getByRole("list", { name: /Pending acknowledgements/ }));
const titles = () =>
  cards()
    .getAllByRole("listitem")
    .map((item) => within(item).getByText(/^Policy \d{4}$/).textContent);

describe("U2: To acknowledge with hundreds of policies (bug log item 22)", () => {
  const CATEGORIES = ["Finance", "HR", "IT Security", "Workplace"];
  const lots: WorkRow[] = Array.from({ length: 520 }, (_, index) => ({
    category: CATEGORIES[index % CATEGORIES.length],
    href: `/policies/POL-${String(index).padStart(4, "0")}`,
    number: `POL-${String(index).padStart(4, "0")}`,
    title: `Policy ${String(index).padStart(4, "0")}`,
    version: "1.0.0",
  }));

  const open = async (entry = "/") => {
    const Stub = createRoutesStub([
      { Component: () => <ToAcknowledge obligations={lots} />, path: "/" },
    ]);
    render(<Stub initialEntries={[entry]} />);
    await screen.findByRole("heading", { level: 1, name: "To acknowledge" });
  };

  it("pages the cards, with the count, the jump and the page size, and no table", async () => {
    await open();
    expect(titles()).toHaveLength(20);
    expect(screen.getByRole("navigation", { name: "Pages" })).toHaveTextContent("1–20 of 520");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Jump to page" }), "26");
    expect(screen.getByRole("navigation", { name: "Pages" })).toHaveTextContent("501–520 of 520");
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Rows per page" }), "100");
    expect(titles()).toHaveLength(100);
  });

  it("filters as you type, on the title or the number", async () => {
    await open();
    await userEvent.type(
      screen.getByRole("searchbox", { name: "Filter by title or number" }),
      "0042",
    );
    expect(titles()).toEqual(["Policy 0042"]);
    expect(screen.getByRole("navigation", { name: "Pages" })).toHaveTextContent("1–1 of 1");
  });

  it("filters to one category", async () => {
    await open();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Category" }), "HR");
    expect(screen.getByRole("navigation", { name: "Pages" })).toHaveTextContent("1–20 of 130");
    expect(titles()[0]).toBe("Policy 0001");
  });

  it("groups by category, a heading and the group's whole count over each group on the page", async () => {
    await open("/?groupby=category&size=100&page=2");
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual(["Finance (130)", "HR (130)"]);
    expect(screen.getAllByText(/^Policy \d{4}$/)).toHaveLength(100);
    // A valid list: each group is an item of the outer list, holding its own list.
    expect(
      within(screen.getByRole("list", { name: /Pending acknowledgements/ })).getAllByRole(
        "heading",
        {
          level: 3,
        },
      ),
    ).toHaveLength(2);
  });

  it("starts sorted by title and says so", async () => {
    await open();
    expect(screen.getByRole("combobox", { name: "Sort by" })).toHaveValue("title:asc");
  });

  it("sorts from a Sort by dropdown", async () => {
    await open();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Sort by" }), "title:desc");
    expect(titles()[0]).toBe("Policy 0519");
  });

  it("keeps a short list as it was: no filter, no pager", async () => {
    const Stub = createRoutesStub([
      { Component: () => <ToAcknowledge obligations={lots.slice(0, 3)} />, path: "/" },
    ]);
    render(<Stub initialEntries={["/"]} />);
    await screen.findByRole("heading", { level: 1, name: "To acknowledge" });
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Pages" })).not.toBeInTheDocument();
  });
});
