// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
