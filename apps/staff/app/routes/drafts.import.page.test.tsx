// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useLoaderData } from "react-router";
import { describe, expect, it, vi } from "vitest";

import ImportCsv from "./drafts.import";

type Props = Parameters<typeof ImportCsv>[0];

const loaderData = {
  categories: [
    { id: "w", name: "Workplace", subcategories: [{ id: "f", name: "Facilities" }] },
    { id: "p", name: "People", subcategories: [] },
  ],
  templates: [{ id: "tpl-1", name: "Standard Policy" }],
};

const CSV = [
  "title,category",
  "Kitchen Use Policy,Workplace",
  "Parking Policy,Workplace",
  ",People",
  "Hybrid Work Policy,Operations",
  "Leave Requests Procedure,People",
].join("\n");

const Page = () => {
  const data = useLoaderData();
  return <ImportCsv {...({ loaderData: data } as unknown as Props)} />;
};

const open = (answer: (rows: { line: number; title: string }[]) => unknown) => {
  const posted = vi.fn();
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const fields = Object.fromEntries(await request.formData()) as Record<string, string>;
        posted(fields);
        return answer(JSON.parse(fields.rowsJson!) as { line: number; title: string }[]);
      },
      Component: Page,
      loader: () => loaderData,
      path: "/drafts/import",
    },
  ]);
  render(<Stub initialEntries={["/drafts/import"]} />);
  return posted;
};

const choose = async (text = CSV) =>
  userEvent.upload(
    await screen.findByLabelText("Choose CSV"),
    new File([text], "policies.csv", { type: "text/csv" }),
  );

describe("Import from CSV (U21)", () => {
  it("says what it does and offers the CSV template", async () => {
    open(() => ({}));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Import from CSV" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bulk-create policy drafts from a CSV file.")).toBeInTheDocument();
    const template = screen.getByRole("link", { name: "CSV template" });
    expect(template).toHaveAttribute("download", "policies-template.csv");
    expect(template.getAttribute("href")).toMatch(/^data:text\/csv/);
  });

  it("previews the rows with how many are ready and each row's issues", async () => {
    open(() => ({}));
    await choose();
    expect(await screen.findByText("3 ready")).toBeInTheDocument();
    expect(screen.getByText("2 with issues")).toBeInTheDocument();
    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(rows.map((row) => row.textContent)).toEqual([
      "1Kitchen Use PolicyWorkplaceReady",
      "2Parking PolicyWorkplaceReady",
      "3Peoplemissing title",
      "4Hybrid Work PolicyOperationsunknown category “Operations”",
      "5Leave Requests ProcedurePeopleReady",
    ]);
    expect(screen.getByRole("button", { name: "Import 3 policies" })).toBeEnabled();
  });

  it("says which columns a file is missing", async () => {
    open(() => ({}));
    await choose("name,category\nx,y\n");
    expect(await screen.findByText("This file has no title column.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Import/ })).toBeNull();
  });

  it("imports the ready rows and says they were created as drafts", async () => {
    // The server creates only the ready rows: 1, 2 and 5.
    const posted = open((rows) => ({
      ok: true,
      results: rows
        .filter((row) => [1, 2, 5].includes(row.line))
        .map((row) => ({ line: row.line, ok: true, policyId: `p-${row.line}` })),
    }));
    await choose();
    await userEvent.click(await screen.findByRole("button", { name: "Import 3 policies" }));
    await vi.waitFor(() => expect(posted).toHaveBeenCalled());
    const sent = JSON.parse((posted.mock.calls[0]![0] as { rowsJson: string }).rowsJson) as {
      line: number;
    }[];
    expect(sent.map((row) => row.line)).toEqual([1, 2, 3, 4, 5]);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Imported 3 policies · They were created as drafts.",
    );
    expect(screen.getByRole("link", { name: "Kitchen Use Policy" })).toHaveAttribute(
      "href",
      "/drafts/p-1",
    );
  });

  it("says how many rows failed, and why each one did", async () => {
    open(() => ({
      ok: true,
      results: [
        { line: 1, ok: true, policyId: "p-1" },
        { line: 2, ok: false },
        { line: 5, ok: true, policyId: "p-5" },
      ],
    }));
    await choose();
    await userEvent.click(await screen.findByRole("button", { name: "Import 3 policies" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("1 row failed to import");
    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(rows[1]).toHaveTextContent("Couldn't create it");
  });
});
