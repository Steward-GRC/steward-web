// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useLoaderData } from "react-router";
import { describe, expect, it } from "vitest";

import SearchRoute from "./search";

type Data = Parameters<typeof SearchRoute>[0]["loaderData"];
type Props = Parameters<typeof SearchRoute>[0];

const groupsFor = (q: string): Data =>
  ({
    groups: q.includes("desk")
      ? [
          {
            id: "policies",
            items: [
              {
                hint: "POL-FACILITIES-000001 · Workplace",
                id: "p1",
                label: "Desk Booking Policy",
                to: "/policies/POL-FACILITIES-000001",
              },
            ],
          },
          {
            id: "categories",
            items: [
              { icon: "folder", id: "c1", label: "Desk services", to: "/policies/category/desk" },
            ],
          },
        ]
      : [],
    q,
  }) as unknown as Data;

const Page = () => {
  const loaderData = useLoaderData<Data>();
  return <SearchRoute {...({ loaderData } as unknown as Props)} />;
};

const renderAt = (path: string, loader = (q: string): unknown => groupsFor(q)) => {
  const Stub = createRoutesStub([
    {
      Component: Page,
      loader: ({ request }) => loader(new URL(request.url).searchParams.get("q") ?? ""),
      path: "/search",
    },
  ]);
  render(<Stub initialEntries={[path]} />);
};

describe("the search page (U5)", () => {
  it("shows the field, the operators help and Start typing to search", async () => {
    renderAt("/search");
    expect(await screen.findByRole("searchbox", { name: "Search" })).toBeInTheDocument();
    for (const operator of ['quoted "exact phrase"', "-exclude", "OR", "field:value"]) {
      expect(screen.getByText(operator).tagName).toBe("CODE");
    }
    expect(screen.getByText("Start typing to search")).toBeInTheDocument();
  });

  it("groups the results the command palette shows", async () => {
    renderAt("/search?q=desk");
    const policies = await screen.findByRole("region", { name: "Policies" });
    expect(within(policies).getByRole("link", { name: /Desk Booking Policy/ })).toHaveAttribute(
      "href",
      "/policies/POL-FACILITIES-000001",
    );
    expect(screen.getByRole("region", { name: "Categories" })).toBeInTheDocument();
  });

  it("says Searching… while the results load, then No results", async () => {
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    renderAt("/search", (q) => (q ? gate.then(() => groupsFor(q)) : groupsFor(q)));
    await userEvent.type(await screen.findByRole("searchbox", { name: "Search" }), "lost");
    expect(await screen.findByText("Searching…")).toBeInTheDocument();
    release?.();
    expect(await screen.findByText("No results")).toBeInTheDocument();
    expect(screen.getByText("Nothing matches “lost”…")).toBeInTheDocument();
  });
});
