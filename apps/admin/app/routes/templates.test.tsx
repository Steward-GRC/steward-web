// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate } from "@steward-web/i18n";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { asPhone } from "../test/phone";
import Templates from "./templates";

const ROWS = [
  {
    categoryName: "Finance",
    latest: { semanticVersion: "1.2.0", status: "draft", versionNo: 3 },
    template: {
      code: "TPL-001",
      id: "t-1",
      name: "Standard Policy",
      retiredAt: null,
      updatedAt: "2026-11-03T09:00:00Z",
    },
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
      "Updated",
    ]);
    const [, standard, short] = screen.getAllByRole("row");
    expect(within(standard!).getByText("TPL-001")).toBeInTheDocument();
    expect(within(standard!).getByRole("link", { name: "Standard Policy" })).toHaveAttribute(
      "href",
      "/templates/TPL-001",
    );
    expect(within(standard!).getByText("v3 (1.2.0) · draft")).toBeInTheDocument();
    expect(within(standard!).getByText(formatDate("2026-11-03T09:00:00Z"))).toBeInTheDocument();
    expect(within(short!).getByText("Retired")).toBeInTheDocument();
  });

  it("shows the number alone for a version core has no semantic version for (#390)", async () => {
    openTemplates([
      { ...ROWS[0]!, latest: { semanticVersion: null, status: "published", versionNo: 2 } },
    ]);
    expect(await screen.findByText("v2 · published")).toBeInTheDocument();
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

describe("Templates on a phone (7-responsive.s3)", () => {
  it("lists each template as a card: its name, then its ID, category and latest version", async () => {
    asPhone();
    openTemplates();
    const list = await screen.findByRole("list", { name: "Templates" });
    expect(screen.queryByRole("table")).toBeNull();
    const [standard, short] = within(list).getAllByRole("listitem");
    expect(within(standard!).getByRole("link", { name: "Standard Policy" })).toHaveAttribute(
      "href",
      "/templates/TPL-001",
    );
    expect(standard!.textContent).toBe("Standard PolicyTPL-001 · Finance · v3 (1.2.0) · draft");
    expect(short!.textContent).toBe("Short noticeRetiredTPL-002 · — · —");
  });

  it("narrows the cards from the search", async () => {
    asPhone();
    openTemplates();
    await userEvent.type(await screen.findByRole("searchbox", { name: "Search templates" }), "002");
    const cards = within(screen.getByRole("list", { name: "Templates" })).getAllByRole("listitem");
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("Short notice");
  });
});
