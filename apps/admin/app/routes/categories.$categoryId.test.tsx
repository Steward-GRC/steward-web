// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import CategoryDetail from "./categories.$categoryId";

const EXPENSES = {
  ackEveryone: false,
  ackEveryoneSet: false,
  ackTriggers: "ON_CHANGE",
  defaultTemplateId: "t-standard",
  defaultTemplateNone: false,
  defaultWorkflowId: "w-finance",
  exclusionGroupIds: null,
  id: "c-expenses",
  idpGroupIds: null,
  name: "Expenses",
  owners: ["mock-user-dave"],
  parentId: "c-finance",
  reviewCadence: "ANNUAL",
  reviewDate: null,
  slug: "expenses",
};

const BASE = {
  audience: { everyone: false, exclusionGroupIds: [], idpGroupIds: ["finance-staff"] },
  candidates: [
    { id: "c-finance", path: "Finance" },
    { id: "c-workplace", path: "Workplace" },
  ],
  group: EXPENSES,
  inheritedOwners: [],
  owns: true,
  path: ["Finance", "Expenses"],
  templates: [{ id: "t-standard", name: "Standard Policy" }],
  userOptions: [
    { email: "dave@example.org", label: "Dave", value: "mock-user-dave" },
    { email: "grace@example.org", label: "Grace", value: "mock-user-grace" },
  ],
  workflows: [{ id: "w-finance", name: "Finance sign-off" }],
};

type DetailProps = Parameters<typeof CategoryDetail>[0];

const openCategory = (overrides: Record<string, unknown> = {}) => {
  const posted: FormData[] = [];
  const loaderData = { ...BASE, ...overrides };
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const form = await request.formData();
        posted.push(form);
        return { intent: form.get("intent"), ok: true };
      },
      Component: () => <CategoryDetail {...({ loaderData } as unknown as DetailProps)} />,
      path: "/categories/:groupId",
    },
  ]);
  render(<Stub initialEntries={["/categories/c-expenses"]} />);
  return posted;
};

const last = (posted: FormData[]) => posted.at(-1)!;

describe("Category directory, Details & Defaults (A3)", () => {
  it("opens with the path, the name and the subtitle", async () => {
    openCategory();
    expect(await screen.findByRole("heading", { level: 1, name: "Expenses" })).toBeInTheDocument();
    expect(screen.getByText("Finance › Expenses")).toBeInTheDocument();
    expect(
      screen.getByText("Org hierarchy, review cadence, and inherited defaults."),
    ).toBeInTheDocument();
  });

  it("has the frame's fields in one card and saves them together", async () => {
    const posted = openCategory();
    const card = await screen.findByRole("form", { name: "Details & Defaults" });
    expect(within(card).getByLabelText("Name")).toHaveValue("Expenses");
    expect(within(card).getByLabelText("Slug")).toHaveValue("expenses");
    expect(
      within(card).getByText(
        "Sets the POL-EXPENSES- prefix. Renaming does not renumber existing policies…",
      ),
    ).toBeInTheDocument();
    expect(within(card).getByRole("combobox", { name: "Move to" })).toHaveTextContent("Finance");
    expect(within(card).getByRole("combobox", { name: "Review cadence" })).toHaveTextContent(
      "Annual",
    );
    expect(within(card).getByRole("combobox", { name: "Default template" })).toHaveTextContent(
      "Standard Policy",
    );
    expect(within(card).getByRole("combobox", { name: "Default workflow" })).toHaveTextContent(
      "Finance sign-off",
    );
    expect(within(card).queryByLabelText("Review date")).not.toBeInTheDocument();

    await userEvent.clear(within(card).getByLabelText("Name"));
    await userEvent.type(within(card).getByLabelText("Name"), "Expense claims");
    await userEvent.click(within(card).getByRole("button", { name: "Save" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(last(posted).get("intent")).toBe("save");
    expect(last(posted).get("name")).toBe("Expense claims");
    expect(last(posted).get("parentId")).toBe("c-finance");
    expect(last(posted).get("reviewCadence")).toBe("ANNUAL");
    expect(last(posted).get("defaultTemplateId")).toBe("t-standard");
    expect(last(posted).getAll("owners")).toEqual(["mock-user-dave"]);
    expect(await within(card).findByText("Saved!")).toBeInTheDocument();
  });

  it("adds and removes owners as chips", async () => {
    const posted = openCategory();
    const card = await screen.findByRole("form", { name: "Details & Defaults" });
    await userEvent.click(within(card).getByRole("button", { name: "Remove Dave as an owner" }));
    await userEvent.click(within(card).getByRole("combobox", { name: "Add owner…" }));
    await userEvent.click(await screen.findByRole("option", { name: "Grace" }));
    await userEvent.click(within(card).getByRole("button", { name: "Save" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(last(posted).getAll("owners")).toEqual(["mock-user-grace"]);
  });

  it("shows inherited owners read-only below a top-level department", async () => {
    openCategory({
      inheritedOwners: [{ from: "Finance", name: "Grace" }],
      owns: false,
    });
    expect(
      await screen.findByText("Grace · Inherited from Finance (read-only)."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Add owner…" })).not.toBeInTheDocument();
  });

  it("deletes after the typed name (D17)", async () => {
    const posted = openCategory();
    const danger = await screen.findByRole("region", { name: "Danger zone" });
    expect(
      within(danger).getByText("Blocked if the group or any subgroup has policies."),
    ).toBeInTheDocument();
    await userEvent.click(within(danger).getByRole("button", { name: "Delete group" }));
    const dialog = screen.getByRole("dialog", { name: "Delete the Expenses category?" });
    const confirm = within(dialog).getByRole("button", { name: "Delete category" });
    expect(confirm).toBeDisabled();
    await userEvent.type(within(dialog).getByLabelText("Type Expenses to confirm"), "Expenses");
    await userEvent.click(confirm);
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("delete"));
  });

  it("says when the category doesn't exist", async () => {
    openCategory({ group: null });
    expect(await screen.findByText("Category not found")).toBeInTheDocument();
  });
});

const form = () => screen.findByRole("form", { name: "Documents this category holds" });

describe("Category document types (#87)", () => {
  it("offers both, policies only, procedures only and none, with the current one chosen", async () => {
    openCategory({
      documentCounts: { policies: 0, procedures: 0 },
      group: { ...EXPENSES, documentTypes: "POLICIES" },
    });
    const card = await form();
    expect(within(card).getByRole("radio", { name: "Policies and procedures" })).not.toBeChecked();
    expect(within(card).getByRole("radio", { name: "Policies only" })).toBeChecked();
    expect(within(card).getByRole("radio", { name: "Procedures only" })).not.toBeChecked();
    expect(within(card).getByRole("radio", { name: /None/ })).not.toBeChecked();
  });

  it("reads a category with no setting as holding both", async () => {
    openCategory({ documentCounts: { policies: 0, procedures: 0 } });
    const card = await form();
    expect(within(card).getByRole("radio", { name: "Policies and procedures" })).toBeChecked();
  });

  it("saves a change that strands nothing", async () => {
    const posted = openCategory({
      documentCounts: { policies: 0, procedures: 0 },
      group: { ...EXPENSES, documentTypes: "BOTH" },
    });
    const card = await form();
    await userEvent.click(within(card).getByRole("radio", { name: /None/ }));
    await userEvent.click(within(card).getByRole("button", { name: "Save" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("save-document-types"));
    expect(last(posted).get("documentTypes")).toBe("NONE");
  });

  it("refuses to narrow while documents would be stranded, with the count and where to find them", async () => {
    const posted = openCategory({
      documentCounts: { policies: 3, procedures: 2 },
      group: { ...EXPENSES, documentTypes: "BOTH" },
    });
    const card = await form();
    await userEvent.click(within(card).getByRole("radio", { name: "Policies only" }));
    expect(within(card).getByText(/2 documents/)).toBeInTheDocument();
    expect(
      within(card).getByRole("link", { name: "Find them in the procedure catalog" }),
    ).toHaveAttribute("href", "/procedures?category=Finance&subcategory=Expenses");
    expect(within(card).getByRole("button", { name: "Save" })).toBeDisabled();
    expect(posted).toHaveLength(0);
  });

  it("lets a widening through even when the category holds documents", async () => {
    openCategory({
      documentCounts: { policies: 3, procedures: 0 },
      group: { ...EXPENSES, documentTypes: "POLICIES" },
    });
    const card = await form();
    await userEvent.click(within(card).getByRole("radio", { name: "Policies and procedures" }));
    expect(within(card).getByRole("button", { name: "Save" })).toBeEnabled();
  });
});
