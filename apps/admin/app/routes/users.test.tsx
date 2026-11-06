// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { asPhone } from "../test/phone";
import Users from "./users";

const user = (overrides: Record<string, unknown>) => ({
  deletedAt: null,
  email: "x@example.org",
  enabled: true,
  groupIds: [],
  idpGroups: [],
  isRoot: false,
  mergedIntoUserId: null,
  name: "X",
  policyOverrides: [],
  roles: [],
  userId: "x",
  ...overrides,
});

const USERS = [
  user({
    email: "alice@example.org",
    groupIds: ["g-all"],
    isRoot: true,
    name: "Alice",
    roles: ["site-admin"],
    userId: "mock-user-alice",
  }),
  user({
    email: "grace@example.org",
    groupIds: ["g-all"],
    name: "Grace",
    policyOverrides: [
      { effect: "DENY", policyNumber: "POL-A" },
      { effect: "DENY", policyNumber: "POL-B" },
      { effect: "ALLOW", policyNumber: "POL-C" },
    ],
    roles: ["compliance-admin"],
    userId: "mock-user-grace",
  }),
  user({
    email: "erin@example.org",
    groupIds: ["g-all"],
    idpGroups: ["Finance team"],
    name: "Erin",
    userId: "mock-user-erin",
  }),
  user({ email: "ivan@example.net", enabled: false, name: "Ivan", userId: "mock-user-ivan" }),
  user({
    deletedAt: "2026-10-01T00:00:00Z",
    email: "erin.old@example.org",
    mergedIntoUserId: "mock-user-erin",
    name: "Erin (old)",
    userId: "mock-user-erin-old",
  }),
];

type UsersProps = Parameters<typeof Users>[0];

const openUsers = (includeDeleted = true) => {
  const visited: string[] = [];
  const Stub = createRoutesStub([
    {
      loader: ({ request }) => {
        visited.push(new URL(request.url).search);
        return null;
      },
      Component: () => (
        <Users
          {...({
            loaderData: { groupNames: { "g-all": "All staff" }, includeDeleted, users: USERS },
          } as unknown as UsersProps)}
        />
      ),
      path: "/users",
    },
  ]);
  render(<Stub initialEntries={["/users"]} />);
  return visited;
};

/** The row whose first cell is this person's name. */
const row = (name: string) => {
  const found = screen
    .getAllByRole("row")
    .find((entry) => within(entry).queryAllByRole("cell")[0]?.textContent === name);
  if (!found) throw new Error(`no row for ${name}`);
  return found;
};

describe("Users & roles (A16)", () => {
  it("has the frame's title, subtitle, Show deleted and Merge accounts", async () => {
    openUsers();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByRole("heading", { level: 1, name: "Users & roles" })).toBeInTheDocument();
    expect(screen.getByText("Platform users, roles, and policy access.")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Show deleted" })).toBeChecked();
    expect(screen.getByRole("link", { name: "Merge accounts" })).toHaveAttribute(
      "href",
      "/users/merge",
    );
  });

  it("lists name, email, one status pill, roles, groups and access", async () => {
    openUsers();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Name",
      "Email",
      "Status",
      "Roles",
      "Groups",
      "Access",
    ]);

    const alice = row("Alice");
    expect(within(alice).getByText("root")).toBeInTheDocument();
    expect(within(alice).getByText("Site admin")).toBeInTheDocument();
    expect(within(alice).getByText("All staff")).toBeInTheDocument();
    expect(within(alice).getByText("All policies")).toBeInTheDocument();

    const grace = row("Grace");
    expect(within(grace).getByText("enabled")).toBeInTheDocument();
    expect(within(grace).getByText("Compliance admin")).toBeInTheDocument();
    expect(within(grace).getByText("All · −2 policies, +1 policy")).toBeInTheDocument();

    const erin = row("Erin");
    expect(within(erin).getByText("Reader")).toBeInTheDocument();
    expect(within(erin).getByText("All staff, Finance team")).toBeInTheDocument();

    expect(within(row("Ivan")).getByText("disabled")).toBeInTheDocument();
    const old = row("Erin (old)");
    expect(within(old).getByText("merged into Erin")).toBeInTheDocument();
    expect(within(old).queryByRole("link")).not.toBeInTheDocument();
  });

  it("opens a live account's detail from its name", async () => {
    openUsers();
    await screen.findByRole("heading", { level: 1 });
    expect(within(row("Erin")).getByRole("link", { name: "Erin" })).toHaveAttribute(
      "href",
      "/users/mock-user-erin",
    );
  });

  it("asks for the deleted accounts when Show deleted is turned on", async () => {
    const visited = openUsers(false);
    const toggle = await screen.findByRole("switch", { name: "Show deleted" });
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await vi.waitFor(() => expect(visited.at(-1)).toBe("?deleted=1"));
  });
});

describe("Users & roles on a phone (7-responsive.s3)", () => {
  it("lists each person as a card: the name, a muted line, then the status pill", async () => {
    asPhone();
    openUsers();
    const list = await screen.findByRole("list", { name: "Users & roles" });
    expect(screen.queryByRole("table")).toBeNull();
    const cards = within(list).getAllByRole("listitem");
    // Each card starts with the name, then the email.
    expect(cards.map((card) => card.textContent)).toEqual([
      expect.stringMatching(/^Alicealice@/),
      expect.stringMatching(/^Gracegrace@/),
      expect.stringMatching(/^Erinerin@/),
      expect.stringMatching(/^Ivanivan@/),
      expect.stringMatching(/^Erin \(old\)erin\.old@/),
    ]);
    // The name, then email, roles, groups and access on one line, then the status pill.
    expect(cards[1]!.textContent).toBe(
      "Gracegrace@example.org · Compliance admin · All staff · All · −2 policies, +1 policyenabled",
    );
    expect(within(cards[0]!).getByRole("link", { name: "Alice" })).toHaveAttribute(
      "href",
      "/users/mock-user-alice",
    );
    expect(within(cards[4]!).queryByRole("link")).toBeNull();
  });

  it("narrows the cards by name or email from the search", async () => {
    asPhone();
    openUsers();
    await userEvent.type(await screen.findByRole("searchbox", { name: "Search users" }), "erin");
    // The search is kept in the address, so the list follows the router a moment later.
    await waitFor(() =>
      expect(
        within(screen.getByRole("list", { name: "Users & roles" })).getAllByRole("listitem"),
      ).toHaveLength(2),
    );
    const cards = within(screen.getByRole("list", { name: "Users & roles" })).getAllByRole(
      "listitem",
    );
    expect(cards[0]).toHaveTextContent(/^Erinerin@example\.org/);
    expect(cards[1]).toHaveTextContent(/^Erin \(old\)erin\.old@example\.org/);
  });
});

describe("Users right-click and command bar (#109)", () => {
  it("offers Edit in the row menu, opening that user's page", async () => {
    openUsers();
    fireEvent.contextMenu(await screen.findByRole("row", { name: /^Erin erin@example.org/ }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Open" })).toHaveAttribute(
      "href",
      "/users/mock-user-erin",
    );
    expect(within(menu).getByRole("menuitem", { name: "Edit user" })).toBeInTheDocument();
  });
});
