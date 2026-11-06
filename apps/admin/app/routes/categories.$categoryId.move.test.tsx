// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import MoveDocuments from "./categories.$categoryId.move";

const DOCS = [
  { documentType: "POLICY", id: "p-1", number: "POL-EXP-000001", title: "Expense claims" },
  { documentType: "PROCEDURE", id: "r-1", number: "PRC-EXP-000001", title: "Claim steps" },
];

const BASE = {
  category: { id: "c-exp", name: "Expenses", path: ["Finance", "Expenses"] },
  documents: DOCS,
  preselected: [] as string[],
  targets: [
    { documentTypes: "BOTH", id: "c-fin", path: "Finance" },
    { documentTypes: "POLICIES", id: "c-pol", path: "Finance › Policies only" },
    { documentTypes: "NONE", id: "c-box", path: "Workplace" },
  ],
};

type Props = Parameters<typeof MoveDocuments>[0];

const open = (overrides: Record<string, unknown> = {}, answer?: (form: FormData) => object) => {
  const posted: FormData[] = [];
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const form = await request.formData();
        posted.push(form);
        return answer ? answer(form) : { intent: String(form.get("intent")), ok: true };
      },
      Component: () => (
        <MoveDocuments {...({ loaderData: { ...BASE, ...overrides } } as unknown as Props)} />
      ),
      path: "/categories/:categoryId/move",
    },
  ]);
  render(<Stub initialEntries={["/categories/c-exp/move"]} />);
  return posted;
};

const target = () => screen.getByRole("combobox", { name: "Move to" });

describe("Move documents out of a category (#87)", () => {
  it("lists the category's documents to pick from", async () => {
    open();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Move documents out of Expenses" }),
    ).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Documents in Expenses" });
    expect(
      within(table).getByRole("checkbox", { name: "Select Expense claims" }),
    ).not.toBeChecked();
    expect(within(table).getByText("POL-EXP-000001")).toBeInTheDocument();
  });

  it("selects every document at once", async () => {
    open();
    await userEvent.click(await screen.findByRole("checkbox", { name: "Select all documents" }));
    expect(screen.getByRole("checkbox", { name: "Select Expense claims" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Select Claim steps" })).toBeChecked();
  });

  it("starts with the documents a narrowing would strand already ticked", async () => {
    open({ preselected: ["r-1"] });
    expect(await screen.findByRole("checkbox", { name: "Select Claim steps" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Select Expense claims" })).not.toBeChecked();
  });

  it("greys out targets that do not hold every document picked, and says why", async () => {
    open();
    await userEvent.click(await screen.findByRole("checkbox", { name: "Select all documents" }));
    await userEvent.click(target());
    expect(await screen.findByRole("option", { name: "Finance" })).not.toHaveAttribute(
      "data-disabled",
    );
    expect(
      screen.getByRole("option", { name: "Finance › Policies only (holds policies only)" }),
    ).toHaveAttribute("data-disabled");
    expect(
      screen.getByRole("option", { name: "Workplace (only holds other categories)" }),
    ).toHaveAttribute("data-disabled");
  });

  it("previews before it moves, showing each new number", async () => {
    const posted = open({}, (form) =>
      form.get("intent") === "preview"
        ? {
            intent: "preview",
            items: [
              {
                newNumber: "POL-FIN-000009",
                number: "POL-EXP-000001",
                policyId: "p-1",
                refusal: null,
                title: "Expense claims",
              },
            ],
            ok: true,
          }
        : { intent: "move", ok: true },
    );
    await userEvent.click(await screen.findByRole("checkbox", { name: "Select Expense claims" }));
    await userEvent.click(target());
    await userEvent.click(await screen.findByRole("option", { name: "Finance" }));
    expect(screen.queryByRole("button", { name: /^Move 1 document/ })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Preview" }));
    const preview = await screen.findByRole("table", { name: "What would move" });
    expect(within(preview).getByText("POL-FIN-000009")).toBeInTheDocument();
    expect(posted[0]?.getAll("policyId")).toEqual(["p-1"]);
    expect(posted[0]?.get("homeCategoryId")).toBe("c-fin");
    await userEvent.click(screen.getByRole("button", { name: "Move 1 document" }));
    await vi.waitFor(() => expect(posted.at(-1)?.get("intent")).toBe("move"));
  });

  it("will not confirm a preview that has a refusal", async () => {
    open({}, () => ({
      intent: "preview",
      items: [
        {
          newNumber: null,
          number: "POL-EXP-000001",
          policyId: "p-1",
          refusal: "RETIRED: a retired document cannot be moved.",
          title: "Expense claims",
        },
      ],
      ok: true,
    }));
    await userEvent.click(await screen.findByRole("checkbox", { name: "Select Expense claims" }));
    await userEvent.click(target());
    await userEvent.click(await screen.findByRole("option", { name: "Finance" }));
    await userEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(await screen.findByText(/RETIRED/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move 1 document" })).toBeDisabled();
  });

  it("says when the category has no documents left", async () => {
    open({ documents: [] });
    expect(await screen.findByText("No documents left in Expenses.")).toBeInTheDocument();
  });
});
