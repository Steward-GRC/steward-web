// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useLoaderData } from "react-router";
import { describe, expect, it, vi } from "vitest";

import Templates, { shouldRevalidate } from "./templates";
import TemplateDetail from "./templates.$templateId";

type DetailProps = Parameters<typeof TemplateDetail>[0];
type ListProps = Parameters<typeof Templates>[0];

const List = () => {
  const data = useLoaderData();
  return <Templates {...({ loaderData: data } as unknown as ListProps)} />;
};
const Detail = () => {
  const data = useLoaderData();
  return <TemplateDetail {...({ loaderData: data } as unknown as DetailProps)} />;
};

const show = (path: string, data: object) => {
  const Stub = createRoutesStub([
    { Component: List, loader: () => data, path: "/templates" },
    { Component: Detail, loader: () => data, path: "/templates/:templateId" },
  ]);
  render(<Stub initialEntries={[path]} />);
};

const names = () =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent);

describe("Templates (U22)", () => {
  it("lists each template with its sections and version, linked to its structure", async () => {
    show("/templates", {
      templates: [
        { id: "t1", name: "Standard Policy", sections: 4, versionNo: 2 },
        { id: "t2", name: "Step-by-step Procedure", sections: 5, versionNo: 1 },
      ],
    });
    expect(await screen.findByRole("heading", { level: 1, name: "Templates" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Reusable section structures policies can be drafted against. Templates are created and managed in the admin console.",
      ),
    ).toBeInTheDocument();
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows.map((row) => row.textContent)).toEqual([
      "NameSectionsVersion",
      "Standard Policy4v2",
      "Step-by-step Procedure5v1",
    ]);
    expect(screen.getByRole("link", { name: "Standard Policy" })).toHaveAttribute(
      "href",
      "/templates/t1",
    );
  });

  it("says when there are none to use", async () => {
    show("/templates", { templates: [] });
    expect(await screen.findByText("No templates yet")).toBeInTheDocument();
  });
});

describe("Template detail (U23)", () => {
  const detail = {
    template: { id: "t1", name: "Standard Policy" },
    sections: [
      { key: "purpose", level: 1, required: true, title: "1. Purpose" },
      { key: "scope", level: 1, required: true, title: "2. Scope" },
      { key: "exceptions", level: 2, required: false, title: "3.1 Exceptions" },
    ],
  };

  it("lists the sections in order, nested ones indented, with Use this template", async () => {
    show("/templates/t1", detail);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Standard Policy" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Drafts pinned to this template inherit this structure, in order."),
    ).toBeInTheDocument();
    const sections = within(screen.getByRole("list", { name: "Sections" })).getAllByRole(
      "listitem",
    );
    expect(sections.map((section) => section.textContent)).toEqual([
      "1. PurposeRequired",
      "2. ScopeRequired",
      "3.1 ExceptionsOptional",
    ]);
    expect(sections[2]).toHaveAttribute("data-level", "2");
    expect(screen.getByRole("link", { name: "Use this template" })).toHaveAttribute(
      "href",
      "/drafts/new?template=t1",
    );
  });

  it("says when a template has no sections yet", async () => {
    show("/templates/t1", { ...detail, sections: [] });
    expect(await screen.findByText("This template has no sections yet.")).toBeInTheDocument();
  });

  it("sorts from the column headers, by sections as numbers", async () => {
    show("/templates", {
      templates: [
        { id: "t1", name: "Standard Policy", sections: 10, versionNo: 2 },
        { id: "t2", name: "Brief", sections: 9, versionNo: 1 },
        { id: "t3", name: "Annex", sections: 100, versionNo: null },
      ],
    });
    const sections = await screen.findByRole("columnheader", { name: "Sections" });
    await userEvent.click(within(sections).getByRole("button"));
    expect(sections).toHaveAttribute("aria-sort", "ascending");
    expect(names()).toEqual(["Brief", "Standard Policy", "Annex"]);
    await userEvent.click(within(sections).getByRole("button"));
    expect(names()).toEqual(["Annex", "Standard Policy", "Brief"]);
  });

  it("filters as you type without loading the page's data again", async () => {
    const loader = vi.fn(() => ({
      templates: Array.from({ length: 14 }, (_, index) => ({
        id: `t${index}`,
        name: `Template ${String(index).padStart(2, "0")}`,
        sections: index,
        versionNo: 1,
      })),
    }));
    const Stub = createRoutesStub([
      { Component: List, loader, path: "/templates", shouldRevalidate },
    ]);
    render(<Stub initialEntries={["/templates"]} />);
    await userEvent.type(await screen.findByRole("searchbox"), "ate 07");
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(2);
    expect(loader).toHaveBeenCalledTimes(1);
  });
});
