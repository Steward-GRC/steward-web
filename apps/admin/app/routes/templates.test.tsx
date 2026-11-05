// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import Templates from "./templates";

const ROWS = [
  {
    categoryName: "Finance",
    latest: { status: "draft", versionNo: 3 },
    template: { code: "TPL-001", id: "t-1", name: "Standard Policy", retiredAt: null },
    versionCount: 3,
  },
  {
    categoryName: null,
    latest: null,
    template: { code: "TPL-002", id: "t-2", name: "Short notice", retiredAt: "2026-10-01" },
    versionCount: 0,
  },
];

type TemplatesProps = Parameters<typeof Templates>[0];

const openTemplates = (rows: object[] = ROWS) => {
  const created: FormData[] = [];
  const Stub = createRoutesStub([
    {
      Component: () => (
        <Templates
          {...({
            loaderData: { categories: [{ id: "c-finance", name: "Finance" }], rows },
          } as unknown as TemplatesProps)}
        />
      ),
      path: "/templates",
    },
    {
      action: async ({ request }) => {
        created.push(await request.formData());
        return null;
      },
      path: "/templates/new",
    },
  ]);
  render(<Stub initialEntries={["/templates"]} />);
  return created;
};

describe("Templates (A6)", () => {
  it("lists ID, name, category, versions and the latest version", async () => {
    openTemplates();
    expect(await screen.findByRole("heading", { level: 1, name: "Templates" })).toBeInTheDocument();
    expect(screen.getByText("Reusable document skeletons.")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "ID",
      "Name",
      "Category",
      "Versions",
      "Latest",
    ]);
    const [, standard, short] = screen.getAllByRole("row");
    expect(within(standard!).getByText("TPL-001")).toBeInTheDocument();
    expect(within(standard!).getByRole("link", { name: "Standard Policy" })).toHaveAttribute(
      "href",
      "/templates/TPL-001",
    );
    expect(within(standard!).getByText("v3 · draft")).toBeInTheDocument();
    expect(within(short!).getByText("Retired")).toBeInTheDocument();
  });

  it("creates a template from the dialog (D25)", async () => {
    const created = openTemplates();
    await userEvent.click(await screen.findByRole("button", { name: "+ New template" }));
    const dialog = screen.getByRole("dialog", { name: "New template" });
    await userEvent.type(within(dialog).getByLabelText("Name"), "Incident response");
    await userEvent.click(within(dialog).getByRole("button", { name: "Create template" }));
    await vi.waitFor(() => expect(created).toHaveLength(1));
    expect(created[0]!.get("name")).toBe("Incident response");
  });

  it("says when there are no templates", async () => {
    openTemplates([]);
    expect(await screen.findByText("No templates yet")).toBeInTheDocument();
  });
});
