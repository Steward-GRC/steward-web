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
  ]);
  render(<Stub initialEntries={[path]} />);
  return posted;
};

afterEach(() => localStorage.clear());

describe("New policy (U20)", () => {
  it("says what it makes and offers both types with their hints", async () => {
    openForm();
    expect(
      await screen.findByRole("heading", { level: 1, name: "New policy" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Create a policy shell, then draft its content.")).toBeInTheDocument();
    const policy = screen.getByRole("radio", { name: /Policy/ });
    expect(policy).toBeChecked();
    expect(
      screen.getByText("A rule people must follow. Can require acknowledgement."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Steps for doing something. Never needs acknowledgement."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create policy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/policies");
  });

  it("uses the full width of the page", async () => {
    openForm();
    expect(await screen.findByTestId("new-draft-page")).not.toHaveClass("max-w-[580px]");
  });

  it("starts as a procedure from the command bar's New procedure", async () => {
    openForm("/drafts/new?type=PROCEDURE");
    expect(
      await screen.findByRole("heading", { level: 1, name: "New procedure" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Procedure/ })).toBeChecked();
    expect(screen.getByRole("button", { name: "Create procedure" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/procedures");
  });

  it("creates in the chosen subcategory, with the template and sensitivity", async () => {
    const posted = openForm();
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
    const posted = openForm();
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
    openForm("/drafts/new?template=tpl-1");
    expect(await screen.findByRole("combobox", { name: "Template" })).toHaveValue("tpl-1");
  });
});
