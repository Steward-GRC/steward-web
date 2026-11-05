// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type Identity, IdentityProvider, NO_ACCESS } from "@steward-web/auth";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { asPhone } from "../test/phone";
import ContactLibrary from "./contact-library";

const ADMIN: Identity = { ...NO_ACCESS, id: "u-alice", isSiteAdmin: true, name: "Alice" };

const BLOCKS = [
  {
    archived: false,
    department: "Facilities",
    email: "help@example.org",
    hours: null,
    id: "c-1",
    label: "Facilities help",
    name: "Dave",
    notes: null,
    phone: null,
    role: "Category owner",
    usedByCount: 1,
  },
  {
    archived: true,
    department: null,
    email: null,
    hours: null,
    id: "c-2",
    label: "Old helpdesk",
    name: null,
    notes: null,
    phone: "555 0100",
    role: null,
    usedByCount: 0,
  },
];

type Props = Parameters<typeof ContactLibrary>[0];

const openContacts = () => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <IdentityProvider identity={ADMIN}>
          <ContactLibrary {...({ loaderData: { blocks: BLOCKS } } as unknown as Props)} />
        </IdentityProvider>
      ),
      path: "/contact-library",
    },
  ]);
  render(<Stub initialEntries={["/contact-library"]} />);
};

describe("Contact library (A25)", () => {
  it("heads the page, with + New contact block and no eyebrow", async () => {
    openContacts();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Contact library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Reusable contact blocks referenced by policies.")).toBeInTheDocument();
    expect(screen.queryByText("Structure")).toBeNull();
    expect(screen.getByRole("button", { name: "New contact block" })).toBeInTheDocument();
  });

  it("lists the active blocks with who they name and how many policies use them", () => {
    openContacts();
    const help = screen.getByRole("row", { name: /Facilities help/ });
    expect(within(help).getByText("Dave · Category owner")).toBeInTheDocument();
    expect(within(help).getByText("1 policy")).toBeInTheDocument();
    expect(screen.queryByText("Old helpdesk")).toBeNull();
  });

  it("shows the archived blocks on their tab, with Restore", async () => {
    openContacts();
    await userEvent.click(screen.getByRole("tab", { name: "Archived" }));
    const old = screen.getByRole("row", { name: /Old helpdesk/ });
    expect(within(old).getByRole("button", { name: "Restore" })).toBeInTheDocument();
  });

  it("edits a block in D32, which says policies update everywhere", async () => {
    openContacts();
    const help = screen.getByRole("row", { name: /Facilities help/ });
    await userEvent.click(within(help).getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog", { name: "Edit contact block" });
    expect(
      within(dialog).getByText("Policies that reference it update everywhere."),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("textbox", { name: "Label" })).toHaveValue("Facilities help");
    expect(within(dialog).getByRole("button", { name: "Save contact" })).toBeInTheDocument();
  });
});

describe("Contact library on a phone (7-responsive.s3)", () => {
  it("lists each block as a card with Edit and Archive along its foot", async () => {
    asPhone();
    openContacts();
    expect(screen.queryByRole("table")).toBeNull();
    const [help] = within(screen.getByRole("list", { name: "Contact library" })).getAllByRole(
      "listitem",
    );
    // The label, then who, department, email, phone and use on one line, then the actions.
    expect(help!.textContent).toBe(
      [
        "Facilities help",
        "Dave · Category owner · Facilities · help@example.org · — · 1 policy",
        "EditArchive",
      ].join(""),
    );
    await userEvent.click(within(help!).getByRole("button", { name: "Edit" }));
    expect(await screen.findByRole("dialog", { name: "Edit contact block" })).toBeInTheDocument();
  });

  it("narrows the cards from the search", async () => {
    asPhone();
    openContacts();
    await userEvent.type(screen.getByRole("searchbox", { name: "Search contacts" }), "nobody");
    expect(screen.queryByRole("list", { name: "Contact library" })).toBeNull();
    expect(screen.getByText("Nothing matches “nobody”.")).toBeInTheDocument();
  });
});
