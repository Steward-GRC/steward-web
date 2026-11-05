// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type Identity, IdentityProvider, NO_ACCESS } from "@steward-web/auth";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import DefinitionsLibrary from "./definitions-library";

const ADMIN: Identity = { ...NO_ACCESS, id: "u-alice", isSiteAdmin: true, name: "Alice" };

const CATEGORIES = [
  { id: "c-finance", path: "Finance" },
  { id: "c-workplace", path: "Workplace" },
];

const entry = (id: string, term: string, categoryId: string, usedByCount = 0) => ({
  archived: false,
  categoryId,
  createdByUserId: "u-alice",
  definition: `${term} means something.`,
  id,
  term,
  usedByCount,
});

const DEFS = [entry("d-1", "Per diem", "c-finance", 2), entry("d-2", "Shared desk", "c-workplace")];

type Props = Parameters<typeof DefinitionsLibrary>[0];

const openDefinitions = () => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <IdentityProvider identity={ADMIN}>
          <DefinitionsLibrary
            {...({ loaderData: { categories: CATEGORIES, defs: DEFS } } as unknown as Props)}
          />
        </IdentityProvider>
      ),
      path: "/definitions-library",
    },
  ]);
  render(<Stub initialEntries={["/definitions-library"]} />);
};

describe("Definitions (A27)", () => {
  it("heads the page, with + New definition and no eyebrow", async () => {
    openDefinitions();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Definitions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Reusable, category-scoped glossary terms attached by policy authors."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Structure")).toBeNull();
    expect(screen.getByRole("button", { name: "New definition" })).toBeInTheDocument();
  });

  it("scopes the list to the category chosen", async () => {
    openDefinitions();
    expect(screen.getByRole("row", { name: /Per diem/ })).toBeInTheDocument();
    expect(screen.queryByText("Shared desk")).toBeNull();
    await userEvent.click(screen.getByRole("combobox", { name: "Category" }));
    await userEvent.click(await screen.findByRole("option", { name: "Workplace" }));
    expect(screen.getByRole("row", { name: /Shared desk/ })).toBeInTheDocument();
    expect(screen.queryByText("Per diem")).toBeNull();
  });

  it("says how many policies use a term, and won't delete one in use", () => {
    openDefinitions();
    const perDiem = screen.getByRole("row", { name: /Per diem/ });
    expect(within(perDiem).getByText("2 policies")).toBeInTheDocument();
    expect(within(perDiem).getByRole("button", { name: "Delete" })).toHaveAccessibleDescription(
      "In use — archive instead of deleting.",
    );
  });
});
