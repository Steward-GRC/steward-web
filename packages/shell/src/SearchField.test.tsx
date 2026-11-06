// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SearchField } from "./SearchField";

const Where = () => {
  const location = useLocation();
  return <p>at {location.pathname + location.search}</p>;
};

const CREATES = [
  { id: "policy", label: "shell:create.policy", to: "/drafts/new/policy" },
  { id: "procedure", label: "shell:create.procedure", to: "/drafts/new/procedure" },
];

const mountField = (loader = vi.fn(), creates: typeof CREATES = []) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <>
          <SearchField creates={creates} />
          <Where />
        </>
      ),
      path: "*",
    },
    {
      loader: ({ request }) => {
        const q = new URL(request.url).searchParams.get("q") ?? "";
        loader(q);
        return {
          groups: [
            {
              id: "policies",
              items: q
                ? [
                    {
                      hint: "POL-FACILITIES-000001 · Workplace",
                      id: "p1",
                      label: "Desk Booking Policy",
                      to: "/policies/POL-FACILITIES-000001",
                    },
                  ]
                : [],
            },
          ],
        };
      },
      path: "/resources/command-palette",
    },
  ]);
  render(<Stub initialEntries={["/"]} />);
  return loader;
};

afterEach(() => localStorage.clear());

describe("the header search opens the command palette (H10)", () => {
  it("opens from the search field", async () => {
    mountField();
    await userEvent.click(screen.getByRole("searchbox", { name: "Search" }));
    expect(screen.getByRole("dialog", { name: "Search Steward" })).toBeInTheDocument();
  });

  it("opens with the first letter typed into the field", async () => {
    mountField();
    await userEvent.tab();
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.keyboard("d");
    expect(screen.getByRole("combobox")).toHaveValue("d");
  });

  it("opens on ⌘K and Ctrl+K", async () => {
    mountField();
    await userEvent.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByRole("dialog", { name: "Search Steward" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}{Control>}k{/Control}");
    expect(screen.getByRole("dialog", { name: "Search Steward" })).toBeInTheDocument();
  });

  it("searches as you type and opens the result you pick", async () => {
    const loaderSpy = mountField();
    await userEvent.click(screen.getByRole("searchbox", { name: "Search" }));
    await userEvent.type(screen.getByRole("combobox"), "desk");
    const group = await screen.findByRole("group", { name: "Policies" });
    expect(loaderSpy).toHaveBeenLastCalledWith("desk");
    await userEvent.click(within(group).getByRole("option", { name: /Desk Booking Policy/ }));
    expect(await screen.findByText("at /policies/POL-FACILITIES-000001")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("sends See all results to the search page", async () => {
    mountField();
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await userEvent.type(screen.getByRole("combobox"), "desk");
    await userEvent.click(
      await screen.findByRole("option", { name: "See all results for “desk”" }),
    );
    expect(await screen.findByText("at /search?q=desk")).toBeInTheDocument();
  });

  it("shows the reach error with Try again when the search can't be reached", async () => {
    const Stub = createRoutesStub([
      { Component: () => <SearchField />, path: "/" },
      {
        loader: () => ({ failure: { requestId: "req-42", status: 503 }, groups: [] }),
        path: "/resources/command-palette",
      },
    ]);
    render(<Stub initialEntries={["/"]} />);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await userEvent.type(screen.getByRole("combobox"), "desk");
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Couldn't search");
    expect(alert).toHaveTextContent("Reference: req-42");
    expect(within(alert).getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("lists what you opened recently when nothing is typed", async () => {
    mountField();
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await userEvent.type(screen.getByRole("combobox"), "desk");
    await userEvent.click(await screen.findByRole("option", { name: /Desk Booking Policy/ }));
    await userEvent.keyboard("{Meta>}k{/Meta}");
    const recent = await screen.findByRole("group", { name: "Recent" });
    expect(within(recent).getByRole("option", { name: /Desk Booking Policy/ })).toBeInTheDocument();
  });
});

describe("creating from the command bar (Brigade-style)", () => {
  it("lists what the person can create first when nothing is typed", async () => {
    mountField(vi.fn(), CREATES);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    const create = await screen.findByRole("group", { name: "Create" });
    expect(
      within(create)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["New policy", "New procedure"]);
    expect(within(create).getByRole("option", { name: "New policy" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("narrows the create actions to the words, after the search's results", async () => {
    mountField(vi.fn(), CREATES);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await userEvent.type(screen.getByRole("combobox"), "desk");
    await screen.findByRole("group", { name: "Policies" });
    expect(screen.queryByRole("group", { name: "Create" })).toBeNull();
    await userEvent.clear(screen.getByRole("combobox"));
    await userEvent.type(screen.getByRole("combobox"), "proc");
    const create = await screen.findByRole("group", { name: "Create" });
    expect(
      within(create)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["New procedure"]);
  });

  it("opens the create page on Enter", async () => {
    mountField(vi.fn(), CREATES);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await screen.findByRole("group", { name: "Create" });
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByText("at /drafts/new/policy")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on Create with Shift+C", async () => {
    mountField(vi.fn(), CREATES);
    await userEvent.keyboard("{Shift>}C{/Shift}");
    expect(await screen.findByRole("combobox")).toHaveValue("New ");
    expect(await screen.findByRole("group", { name: "Create" })).toBeInTheDocument();
  });

  it("leaves Shift+C alone while typing in a field", async () => {
    render(
      <>
        <input aria-label="Notes" />
      </>,
    );
    mountField(vi.fn(), CREATES);
    await userEvent.type(screen.getByRole("textbox", { name: "Notes" }), "C");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a result in a new tab with Cmd+Enter", async () => {
    const open = vi.fn();
    vi.stubGlobal("open", open);
    mountField(vi.fn(), CREATES);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await screen.findByRole("group", { name: "Create" });
    await userEvent.keyboard("{Meta>}{Enter}{/Meta}");
    expect(open).toHaveBeenCalledWith("/drafts/new/policy", "_blank", "noopener");
    expect(screen.queryByRole("dialog")).toBeNull();
    vi.unstubAllGlobals();
  });
});
