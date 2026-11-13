// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import NewCategory from "./categories.new";

type NewProps = Parameters<typeof NewCategory>[0];

describe("New category (A4)", () => {
  it("fills the slug from the name and sends the parent and the defaults", async () => {
    const posted: FormData[] = [];
    const loaderData = {
      parentOptions: [{ id: "c-finance", path: "Finance" }],
      templates: [{ id: "t-standard", name: "Standard Policy" }],
      workflows: [{ id: "w-finance", name: "Finance sign-off" }],
    };
    const Stub = createRoutesStub([
      {
        action: async ({ request }) => {
          posted.push(await request.formData());
          return null;
        },
        Component: () => <NewCategory {...({ loaderData } as unknown as NewProps)} />,
        path: "/categories/new",
      },
    ]);
    render(<Stub initialEntries={["/categories/new"]} />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "New category" }),
    ).toBeInTheDocument();
    const form = screen.getByRole("form", { name: "New category" });
    await userEvent.type(within(form).getByLabelText("Name"), "Travel Claims");
    expect(within(form).getByLabelText("Slug")).toHaveValue("travel-claims");
    expect(within(form).getByRole("combobox", { name: "Parent" })).toHaveTextContent(
      "None (new top-level site)",
    );
    expect(within(form).getByRole("combobox", { name: "Default template" })).toHaveTextContent(
      "No template (freeform)",
    );
    await userEvent.click(within(form).getByRole("button", { name: "Create category" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.get("slug")).toBe("travel-claims");
    expect(posted[0]!.get("reviewCadence")).toBe("NONE");
  });

  it("lays the Name and Slug fields out in the same shared Field wrapper and control size", async () => {
    const loaderData = { parentOptions: [], templates: [], workflows: [] };
    const Stub = createRoutesStub([
      {
        Component: () => <NewCategory {...({ loaderData } as unknown as NewProps)} />,
        path: "/categories/new",
      },
    ]);
    render(<Stub initialEntries={["/categories/new"]} />);
    const form = await screen.findByRole("form", { name: "New category" });
    const name = within(form).getByLabelText("Name");
    const slug = within(form).getByLabelText("Slug");
    // The Slug field carries a hint; the two wrappers must still align their controls (#372).
    expect(slug).toHaveAccessibleDescription(/\S/);
    // oxlint-disable-next-line testing-library/no-node-access -- the wrapper has no role to query
    const [nameField, slugField] = [name.parentElement, slug.parentElement];
    expect(nameField).toHaveClass("grid", "content-start", "gap-1.5");
    expect(slugField?.className).toBe(nameField?.className);
    expect(name).toHaveClass("h-[38px]");
    expect(slug).toHaveClass("h-[38px]");
  });
});
