// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Table, TD, TH, THead } from "./Display";
import { type ResponsiveColumn, ResponsiveTable } from "./ResponsiveTable";

interface Person {
  email: string;
  id: string;
  name: string;
  role: string;
  status: string;
}

const PEOPLE: Person[] = [
  { email: "alice@example.org", id: "p-1", name: "Alice", role: "Site admin", status: "enabled" },
  { email: "bob@example.org", id: "p-2", name: "Bob", role: "Author", status: "disabled" },
  { email: "carol@example.org", id: "p-3", name: "Carol", role: "Reader", status: "enabled" },
];

const onRemove = vi.fn();

const COLUMNS: ResponsiveColumn<Person>[] = [
  {
    card: "title",
    cell: (person) => <a href={`/users/${person.id}`}>{person.name}</a>,
    header: "Name",
    key: "name",
  },
  {
    card: "meta",
    cell: (person) => person.email,
    className: "text-muted",
    header: "Email",
    key: "email",
  },
  { card: "meta", cell: (person) => person.role, header: "Role", key: "role" },
  {
    card: "status",
    cell: (person) => <span>{person.status}</span>,
    header: "Status",
    key: "status",
  },
  { card: "hidden", cell: (person) => person.id, header: "Id", key: "id" },
  {
    card: "action",
    cell: (person) => (
      <button onClick={() => onRemove(person.id)} type="button">
        Remove {person.name}
      </button>
    ),
    header: <span className="sr-only">Actions</span>,
    key: "actions",
  },
];

const SEARCH = {
  label: "Search people",
  placeholder: "Search by name or email",
  text: (person: Person) => `${person.name} ${person.email}`,
};

const restore = globalThis.matchMedia;
afterEach(() => {
  globalThis.matchMedia = restore;
});

/** A phone-width screen, as the browser's media query list reports it. */
const asPhone = () => {
  globalThis.matchMedia = ((query: string) => ({
    addEventListener: () => {},
    matches: query === "(max-width: 47.98rem)",
    media: query,
    removeEventListener: () => {},
  })) as unknown as typeof globalThis.matchMedia;
};

const renderTable = (rows: readonly Person[] = PEOPLE) =>
  render(
    <ResponsiveTable
      columns={COLUMNS}
      empty={<p>No people yet</p>}
      label="People"
      rowKey={(person) => person.id}
      rows={rows}
      search={SEARCH}
    />,
  );

describe("ResponsiveTable on a wide screen", () => {
  it("renders the kit table exactly as the hand-written markup would", () => {
    const { container } = renderTable();
    const { container: expected } = render(
      <Table aria-label="People">
        <THead>
          <tr>
            {COLUMNS.map((column) => (
              <TH key={column.key}>{column.header}</TH>
            ))}
          </tr>
        </THead>
        <tbody>
          {PEOPLE.map((person) => (
            <tr key={person.id}>
              {COLUMNS.map((column) => (
                <TD className={column.className} key={column.key}>
                  {column.cell(person)}
                </TD>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>,
    );
    expect(container.innerHTML).toBe(expected.innerHTML);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("shows the empty state instead of an empty table", () => {
    renderTable([]);
    expect(screen.getByText("No people yet")).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("ResponsiveTable on a phone (7-responsive.s3)", () => {
  it("lists each row as a card, in the rows' order, with no table", () => {
    asPhone();
    renderTable();
    expect(screen.queryByRole("table")).toBeNull();
    const cards = within(screen.getByRole("list", { name: "People" })).getAllByRole("listitem");
    expect(cards.map((card) => within(card).getByRole("link").textContent)).toEqual([
      "Alice",
      "Bob",
      "Carol",
    ]);
  });

  it("orders each card: the title, the meta line, the status row, then the actions", () => {
    asPhone();
    renderTable();
    const [alice] = within(screen.getByRole("list", { name: "People" })).getAllByRole("listitem");
    // "Alice", then "alice@example.org · Site admin", then "enabled", then "Remove Alice".
    expect(alice!.textContent).toBe("Alicealice@example.org · Site adminenabledRemove Alice");
    expect(within(alice!).getByRole("link", { name: "Alice" })).toHaveAttribute(
      "href",
      "/users/p-1",
    );
    // The hidden column stays out of the card.
    expect(alice).not.toHaveTextContent("p-1");
  });

  it("narrows the cards as the search is typed, and says when nothing matches", async () => {
    asPhone();
    renderTable();
    const search = screen.getByRole("searchbox", { name: "Search people" });
    expect(search).toHaveAttribute("placeholder", "Search by name or email");
    await userEvent.type(search, "BOB@");
    const cards = within(screen.getByRole("list", { name: "People" })).getAllByRole("listitem");
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("Bob");
    await userEvent.clear(search);
    await userEvent.type(search, "zed");
    expect(screen.queryByRole("list", { name: "People" })).toBeNull();
    expect(screen.getByText("Nothing matches “zed”.")).toBeInTheDocument();
  });

  it("shows the empty state, without a search, when there are no rows", () => {
    asPhone();
    renderTable([]);
    expect(screen.getByText("No people yet")).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("reaches every card's title and actions from the keyboard, in order", async () => {
    asPhone();
    onRemove.mockClear();
    renderTable();
    await userEvent.tab();
    expect(screen.getByRole("searchbox")).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Alice" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Remove Alice" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Bob" })).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onRemove).toHaveBeenCalledWith("p-2");
  });
});

const names = () =>
  within(screen.getByRole("table", { name: "People" }))
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent);

describe("ResponsiveTable with sortable columns", () => {
  const MANY: Person[] = Array.from({ length: 45 }, (_, index) => ({
    email: `p${index}@example.org`,
    id: `p-${index}`,
    name: `Person ${String(index).padStart(2, "0")}`,
    role: index % 2 === 0 ? "Author" : "Reader",
    status: "enabled",
  }));

  const SORTABLE: ResponsiveColumn<Person>[] = [
    { ...COLUMNS[0]!, value: (person) => person.name },
    { ...COLUMNS[1]!, value: (person) => person.email },
    { ...COLUMNS[2]!, filter: "values", value: (person) => person.role },
    COLUMNS[3]!,
    COLUMNS[5]!,
  ];

  const renderData = (rows: readonly Person[] = MANY, entry = "/") =>
    render(
      <MemoryRouter initialEntries={[entry]}>
        <ResponsiveTable
          columns={SORTABLE}
          empty={<p>No people yet</p>}
          label="People"
          rowKey={(person) => person.id}
          rows={rows}
        />
      </MemoryRouter>,
    );

  it("sorts from a header, both ways, and marks it for screen readers", async () => {
    renderData();
    const header = screen.getByRole("columnheader", { name: /Name/ });
    await userEvent.click(within(header).getByRole("button", { name: /Name/ }));
    expect(header).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(within(header).getByRole("button", { name: /Name/ }));
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(names()[0]).toBe("Person 44");
  });

  it("leaves a column without a value as plain text", () => {
    renderData();
    const header = screen.getByRole("columnheader", { name: "Status" });
    expect(within(header).queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows a page at a time, with the jump and the page size", async () => {
    renderData();
    expect(names()).toHaveLength(20);
    expect(screen.getByText("1–20 of 45")).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Jump to page" }), "3");
    expect(screen.getByText("41–45 of 45")).toBeInTheDocument();
    expect(names()).toHaveLength(5);
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Rows per page" }), "50");
    expect(names()).toHaveLength(45);
  });

  it("filters as you type and says when nothing matches", async () => {
    renderData();
    await userEvent.type(screen.getByRole("searchbox"), "person 07");
    expect(names()).toEqual(["Person 07"]);
    await userEvent.clear(screen.getByRole("searchbox"));
    await userEvent.type(screen.getByRole("searchbox"), "zzz");
    expect(screen.getByText(/Nothing matches/)).toBeInTheDocument();
    expect(screen.queryByText("No people yet")).not.toBeInTheDocument();
  });

  it("starts from the sort and page in the address", () => {
    renderData(MANY, "/?sort=name&dir=desc&page=2");
    expect(names()[0]).toBe("Person 24");
  });

  it("works without a router, keeping its state itself", async () => {
    render(
      <ResponsiveTable
        columns={SORTABLE}
        empty={<p>No people yet</p>}
        label="People"
        rowKey={(person) => person.id}
        rows={MANY}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  it("keeps a short table whole: no pager under ten rows", () => {
    renderData(PEOPLE);
    expect(screen.queryByRole("navigation", { name: "Pages" })).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("sorts cards on a phone from a Sort by dropdown", async () => {
    asPhone();
    renderData();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Sort by" }), "name:desc");
    const cards = within(screen.getByRole("list", { name: "People" })).getAllByRole("listitem");
    expect(cards[0]).toHaveTextContent("Person 44");
  });
});

describe("ResponsiveTable while it loads", () => {
  it("shows the animated skeleton in place of the rows, once the load is slow", async () => {
    render(
      <ResponsiveTable
        columns={COLUMNS}
        empty={<p>No people yet</p>}
        label="People"
        loading
        rowKey={(person) => person.id}
        rows={[]}
      />,
    );
    expect(screen.queryByText("No people yet")).not.toBeInTheDocument();
    expect(await screen.findByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("book-mark")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
