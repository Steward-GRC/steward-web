// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useLoaderData } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import NewDraft from "./drafts.new";

type Props = Parameters<typeof NewDraft>[0];

const loaderData = {
  categories: [
    {
      id: "w",
      name: "Workplace",
      subcategories: [
        { id: "f", name: "Facilities" },
        { id: "t", name: "Travel" },
      ],
    },
    { id: "p", name: "People", subcategories: [] },
  ],
  templates: [
    { code: "STD", id: "tpl-1", name: "Standard Policy", ownerCategoryId: null, retiredAt: null },
  ],
};

const Page = () => {
  const data = useLoaderData();
  return <NewDraft {...({ actionData: undefined, loaderData: data } as unknown as Props)} />;
};

const openForm = (path = "/drafts/new", data: object = loaderData) => {
  const posted = vi.fn();
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        posted(Object.fromEntries(await request.formData()));
        return { ok: false, validationError: "stop here" };
      },
      Component: Page,
      loader: () => data,
      path: "/drafts/new",
    },
    {
      action: async ({ request }) => {
        posted(Object.fromEntries(await request.formData()));
        return { ok: false, validationError: "stop here" };
      },
      Component: Page,
      loader: () => data,
      path: "/drafts/new/:type",
    },
  ]);
  render(<Stub initialEntries={[path]} />);
  return posted;
};

afterEach(() => localStorage.clear());

describe("New policy (U20)", () => {
  it("says what it makes, with no type to pick when the route has one (#147, #149)", async () => {
    openForm("/drafts/new/policy");
    expect(
      await screen.findByRole("heading", { level: 1, name: "New policy" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Create a policy shell, then draft its content.")).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: /Procedure/ })).toBeNull();
    expect(screen.queryByRole("radiogroup", { name: "Type" })).toBeNull();
    expect(screen.queryByRole("list", { name: "Steps" })).toBeNull();
    expect(screen.getByRole("button", { name: "Create policy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/policies");
  });

  it("uses the full width of the page", async () => {
    openForm("/drafts/new/policy");
    expect(await screen.findByTestId("new-draft-page")).not.toHaveClass("max-w-[580px]");
  });

  it("starts as a procedure at /drafts/new/procedure", async () => {
    openForm("/drafts/new/procedure");
    expect(
      await screen.findByRole("heading", { level: 1, name: "New procedure" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: /Policy/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Create procedure" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/procedures");
  });

  it("creates in the chosen subcategory, with the template and sensitivity", async () => {
    const posted = openForm("/drafts/new/policy");
    await userEvent.type(await screen.findByLabelText("Title"), "Visitor Sign-in Policy");
    await userEvent.selectOptions(screen.getByLabelText("Category"), "w");
    await userEvent.selectOptions(screen.getByLabelText("Subcategory"), "f");
    await userEvent.selectOptions(screen.getByLabelText("Template"), "tpl-1");
    await userEvent.click(screen.getByRole("radio", { name: "Sensitive" }));
    await userEvent.click(screen.getByRole("button", { name: "Create policy" }));
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith({
        categoryId: "f",
        documentType: "POLICY",
        sensitivity: "SENSITIVE",
        templateId: "tpl-1",
        title: "Visitor Sign-in Policy",
      }),
    );
  });

  it("files it under the category itself when it has no subcategory", async () => {
    const posted = openForm("/drafts/new/policy");
    await userEvent.type(await screen.findByLabelText("Title"), "Leave");
    await userEvent.selectOptions(screen.getByLabelText("Category"), "p");
    expect(screen.getByLabelText("Subcategory")).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Create policy" }));
    await vi.waitFor(() => expect(posted.mock.calls[0]![0].categoryId).toBe("p"));
  });

  it("says when there are no categories to create in", async () => {
    openForm("/drafts/new", { ...loaderData, categories: [] });
    expect(await screen.findByText("No categories available")).toBeInTheDocument();
    expect(
      screen.getByText("An admin needs to create category groups in the Admin console first."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create policy" })).toBeNull();
  });

  it("opens with the template chosen from Use this template", async () => {
    openForm("/drafts/new/policy?template=tpl-1");
    expect(await screen.findByRole("combobox", { name: "Template" })).toHaveValue("tpl-1");
  });

  it("defaults the category and subcategory to the folder it started from (#148)", async () => {
    openForm("/drafts/new/policy?category=Workplace&subcategory=Travel");
    expect(await screen.findByLabelText("Category")).toHaveValue("w");
    expect(screen.getByLabelText("Subcategory")).toHaveValue("t");
  });

  it("defaults to the category alone when the folder has no subcategory chosen (#148)", async () => {
    openForm("/drafts/new/procedure?category=People");
    expect(await screen.findByLabelText("Category")).toHaveValue("p");
  });

  it("ignores a folder it doesn't know (#148)", async () => {
    openForm("/drafts/new/policy?category=Nowhere");
    expect(await screen.findByLabelText("Category")).toHaveValue("");
  });
});

describe("New draft stepper at /drafts/new (#149)", () => {
  it("starts on step 1, choosing the type, with the form not yet shown", async () => {
    openForm("/drafts/new");
    const steps = await screen.findByRole("list", { name: "Steps" });
    expect(steps).toHaveTextContent("Choose the type");
    expect(steps).toHaveTextContent("Draft details");
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Policy/ })).toBeChecked();
    expect(
      screen.getByText("A rule people must follow. Can require acknowledgement."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Steps for doing something. Never needs acknowledgement."),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Title")).toBeNull();
    expect(screen.getByRole("link", { name: "Cancel" })).toBeInTheDocument();
  });

  it("goes to step 2, the form, for the chosen type, and back", async () => {
    const posted = openForm("/drafts/new");
    await userEvent.click(await screen.findByRole("radio", { name: /Procedure/ }));
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "New procedure" })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: /Policy/ })).toBeNull();
    await userEvent.type(screen.getByLabelText("Title"), "Fire drill");
    await userEvent.selectOptions(screen.getByLabelText("Category"), "p");
    await userEvent.click(screen.getByRole("button", { name: "Create procedure" }));
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith(expect.objectContaining({ documentType: "PROCEDURE" })),
    );
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Procedure/ })).toBeChecked();
  });

  it("keeps the template from Use this template through the steps", async () => {
    openForm("/drafts/new?template=tpl-1");
    await userEvent.click(await screen.findByRole("button", { name: "Continue" }));
    expect(screen.getByRole("combobox", { name: "Template" })).toHaveValue("tpl-1");
  });
});
