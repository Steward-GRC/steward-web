// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { VersionLinksPanel } from "./VersionLinksPanel";

const definition = (id: string, term: string) => ({
  archived: false,
  categoryId: "c-1",
  createdByUserId: null,
  definition: `${term} means a thing.`,
  id,
  term,
  usedByCount: 0,
});
const reference = (id: string, label: string) => ({
  archived: false,
  body: null,
  clause: null,
  createdByUserId: null,
  id,
  kind: "STANDARD",
  label,
  url: null,
  usedByCount: 0,
});
const contact = (id: string, label: string) => ({
  archived: false,
  department: null,
  email: "x@example.org",
  hours: null,
  id,
  label,
  name: null,
  notes: null,
  phone: null,
  role: null,
  usedByCount: 0,
});

const links = {
  contacts: [contact("c-2", "Help desk"), contact("c-1", "Finance")],
  definitions: [definition("d-1", "Add"), definition("d-2", "Bob")],
  editable: true,
  policyVersionId: "v-1",
  references: [reference("r-1", "ISO 27001"), reference("r-2", "GDPR")],
  related: [
    {
      direction: "OUTGOING",
      label: "supersedes",
      number: "POL-A-000001",
      policyId: "p-a",
      title: "Old policy",
      type: "supersedes",
    },
    {
      direction: "INCOMING",
      label: "is related by",
      number: "POL-B-000001",
      policyId: "p-b",
      title: "Other policy",
      type: "related-by",
    },
  ],
};
const library = {
  contacts: [...links.contacts, contact("c-3", "Legal")],
  definitions: [...links.definitions, definition("d-3", "A"), definition("d-4", "Zed")],
  policies: [
    { id: "p-a", number: "POL-A-000001", title: "Old policy" },
    { id: "p-c", number: "POL-C-000001", title: "Third policy" },
    { id: "p-self", number: "POL-SELF-000001", title: "This one" },
  ],
  references: [...links.references, reference("r-3", "NIST")],
};
const types = [
  { id: "related", inverseId: "related-by", inverseLabel: "is related by", label: "is related to" },
  {
    id: "supersedes",
    inverseId: "superseded-by",
    inverseLabel: "is superseded by",
    label: "supersedes",
  },
];

const mount = (override: Partial<typeof links> = {}, answer?: unknown) => {
  const posted = vi.fn();
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        posted(Object.fromEntries(await request.formData()));
        return answer ?? { ok: true };
      },
      Component: () => (
        <VersionLinksPanel
          library={library as never}
          links={{ ...links, ...override } as never}
          policyId="p-self"
          relationshipTypes={types}
        />
      ),
      path: "/",
    },
  ]);
  render(<Stub />);
  return posted;
};

const section = (name: string) => screen.getByRole("region", { name });

describe("definitions, related, references and contacts on the edit screen (bug log 227)", () => {
  it("adds a definition from the library, and the list stays alphabetical", async () => {
    const posted = mount();
    const definitions = section("Definitions");
    expect(
      within(definitions)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual([expect.stringContaining("Add"), expect.stringContaining("Bob")]);
    await userEvent.selectOptions(within(definitions).getByLabelText("Add a definition"), "d-3");
    await userEvent.click(within(definitions).getByRole("button", { name: "Add" }));
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith({
        definitionIds: "d-1,d-2,d-3",
        intent: "set-definitions",
      }),
    );
  });

  it("offers only the definitions not linked yet", () => {
    mount();
    const choose = within(section("Definitions")).getByLabelText("Add a definition");
    expect(
      within(choose)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["", "A", "Zed"]);
  });

  it("removes a definition", async () => {
    const posted = mount();
    await userEvent.click(
      within(section("Definitions")).getByRole("button", { name: "Remove Bob" }),
    );
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith({ definitionIds: "d-1", intent: "set-definitions" }),
    );
  });

  it("links a policy with a relationship type", async () => {
    const posted = mount();
    const related = section("Related");
    await userEvent.selectOptions(within(related).getByLabelText("Policy"), "p-c");
    await userEvent.selectOptions(within(related).getByLabelText("Relationship"), "related");
    await userEvent.click(within(related).getByRole("button", { name: "Add" }));
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith({
        intent: "set-related",
        links: JSON.stringify([
          { policyId: "p-a", type: "supersedes" },
          { policyId: "p-c", type: "related" },
        ]),
      }),
    );
  });

  it("shows each link as it reads from this side, and only lets the author remove the ones they made", () => {
    mount();
    const related = section("Related");
    const items = within(related).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("supersedes POL-A-000001 Old policy");
    expect(items[1]).toHaveTextContent("is related by POL-B-000001 Other policy");
    expect(within(related).getAllByRole("button", { name: /^Remove / })).toHaveLength(1);
  });

  it("does not offer this policy to itself", () => {
    mount();
    const choose = within(section("Related")).getByLabelText("Policy");
    expect(within(choose).queryByRole("option", { name: /This one/ })).toBeNull();
  });

  it("moves a reference down by hand", async () => {
    const posted = mount();
    await userEvent.click(
      within(section("References")).getByRole("button", { name: "Move ISO 27001 down" }),
    );
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith({ intent: "set-references", referenceIds: "r-2,r-1" }),
    );
  });

  it("moves a contact up by hand, one to a line", async () => {
    const posted = mount();
    const contacts = section("Contacts");
    expect(within(contacts).getAllByRole("listitem")).toHaveLength(2);
    await userEvent.click(within(contacts).getByRole("button", { name: "Move Finance up" }));
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith({ contactBlockIds: "c-1,c-2", intent: "set-contacts" }),
    );
  });

  it("only reads when the version can't be changed", () => {
    mount({ editable: false });
    expect(screen.queryByRole("button", { name: "Add" })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Remove / })).toBeNull();
    expect(within(section("Definitions")).getAllByRole("listitem")[1]).toHaveTextContent("Bob");
  });

  it("says so when the gateway refuses the change", async () => {
    mount({}, { ok: false });
    await userEvent.click(
      within(section("Definitions")).getByRole("button", { name: "Remove Bob" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("The change could not be saved.");
  });
});
