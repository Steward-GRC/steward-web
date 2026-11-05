// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type Identity, IdentityProvider, NO_ACCESS } from "@steward-web/auth";
import { ThemeProvider } from "@steward-web/ui";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import type { ShellConfig } from "../shellConfig";

import { AdminShell, type AdminShellProps } from "./AdminShell";

const alice: Identity = {
  ...NO_ACCESS,
  email: "alice@example.org",
  firstName: "Alice",
  id: "user-alice",
  isSiteAdmin: true,
  lastName: "Admin",
  name: "Alice Admin",
  permissions: new Set(["admin.manage", "group.manage"]),
  roles: ["site-admin"],
  username: "alice",
};

const CONFIG: ShellConfig = {
  adminUrl: "/admin",
  docsUrl: "https://steward-grc.com",
  environment: "test",
  organisation: "Example Organisation",
  staffUrl: "https://steward.example/",
};

const CATEGORIES = [
  { id: "c-work", name: "Workplace", parentId: null },
  { id: "c-fac", name: "Facilities", parentId: "c-work" },
  { id: "c-travel", name: "Travel", parentId: "c-work" },
  { id: "c-people", name: "People", parentId: null },
];

const renderShell = (identity: Identity, path = "/", props: Partial<AdminShellProps> = {}) => {
  const router = createMemoryRouter(
    [
      {
        element: (
          <AdminShell categories={CATEGORIES} config={CONFIG} {...props}>
            <p>page content</p>
          </AdminShell>
        ),
        path: "*",
      },
    ],
    { initialEntries: [path] },
  );
  return render(
    <ThemeProvider>
      <IdentityProvider identity={identity}>
        <RouterProvider router={router} />
      </IdentityProvider>
    </ThemeProvider>,
  );
};

const rail = () => screen.getByRole("navigation", { name: "Admin sections" });

describe("AdminShell header (H2)", () => {
  it("has the brand, the saffron Admin tag and the admin search", () => {
    renderShell(alice);
    const header = screen.getByRole("banner");
    expect(within(header).getByRole("link", { name: "Steward" })).toHaveAttribute("href", "/");
    expect(within(header).getByText("Admin")).toHaveClass("bg-[#e2a336]");
    expect(within(header).getByRole("searchbox", { name: "Search" })).toHaveAttribute(
      "placeholder",
      "Search policies, templates, groups…",
    );
    expect(within(header).getByRole("search")).toHaveAttribute("action", "/search");
  });

  it("links back to Staff and to Docs, with no Tour, and has the account menu", () => {
    renderShell(alice);
    const header = screen.getByRole("banner");
    expect(within(header).getByRole("link", { name: "Staff" })).toHaveAttribute(
      "href",
      "https://steward.example/",
    );
    expect(within(header).getByRole("link", { name: "Docs" })).toHaveAttribute(
      "href",
      "https://steward-grc.com",
    );
    expect(within(header).queryByText("Tour")).toBeNull();
    expect(within(header).getByRole("button", { name: "Account menu" })).toHaveTextContent("A");
  });
});

describe("AdminShell account menu", () => {
  it("opens About and diagnostics, and signs out with a POST under /admin", async () => {
    const router = createMemoryRouter(
      [
        {
          element: (
            <AdminShell config={CONFIG}>
              <p>page content</p>
            </AdminShell>
          ),
          path: "*",
        },
      ],
      { basename: "/admin", initialEntries: ["/admin"] },
    );
    render(
      <ThemeProvider>
        <IdentityProvider identity={alice}>
          <RouterProvider router={router} />
        </IdentityProvider>
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByRole("form", { name: "Sign out" })).toHaveAttribute(
      "action",
      "/admin/sign-out",
    );
    await userEvent.click(await screen.findByRole("menuitem", { name: "About and diagnostics" }));
    expect(await screen.findByRole("heading", { name: "About Steward" })).toBeInTheDocument();
  });
});

describe("AdminShell rail and panel (H2)", () => {
  it("shows 7 groups by default, in H2's order", () => {
    renderShell(alice);
    expect(
      within(rail())
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Overview", "Categories", "Structure", "Policies", "Assurance", "People", "System"]);
  });

  it("adds Compliance while reporting is on, and never Ethics", () => {
    renderShell(alice, "/", { reporting: true });
    const groups = within(rail())
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(groups).toContain("Compliance");
    expect(groups).not.toContain("Ethics");
  });

  it("marks the current group and lists its destinations in the panel", () => {
    renderShell(alice, "/workflows/w-1");
    expect(within(rail()).getByRole("link", { current: true })).toHaveTextContent("Structure");
    const panel = screen.getByRole("navigation", { name: "Structure pages" });
    expect(within(panel).getByRole("heading")).toHaveTextContent("Structure");
    expect(
      within(panel)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Templates", "Workflows", "Contact library", "References", "Definitions"]);
    expect(within(panel).getByRole("link", { current: "page" })).toHaveTextContent("Workflows");
  });

  it("names the old Access group People (decision 2-layout-and-navigation.s6)", () => {
    renderShell(alice, "/platform-groups");
    expect(within(rail()).getByRole("link", { current: true })).toHaveTextContent("People");
  });

  it("shows the category tree on Directory, with Directory and Access and New category", async () => {
    renderShell(alice, "/groups/c-fac");
    const panel = screen.getByRole("navigation", { name: "Categories pages" });
    expect(within(panel).getByRole("link", { name: "Directory" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(panel).getByRole("link", { name: "Access" })).toBeInTheDocument();
    expect(within(panel).getByRole("link", { current: "location" })).toHaveTextContent(
      "Facilities",
    );
    expect(within(panel).getByRole("link", { name: "+ New category" })).toHaveAttribute(
      "href",
      "/groups/new",
    );
    await userEvent.type(
      within(panel).getByRole("searchbox", { name: "Filter categories" }),
      "peo",
    );
    expect(within(panel).getByRole("link", { name: "People" })).toBeInTheDocument();
    expect(within(panel).queryByRole("link", { name: "Facilities" })).toBeNull();
  });
  it("points the tree at each category's access on Access (A5)", () => {
    renderShell(alice, "/access/c-fac");
    const panel = screen.getByRole("navigation", { name: "Categories pages" });
    expect(within(panel).getByRole("link", { name: "Access" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const current = within(panel).getByRole("link", { current: "location" });
    expect(current).toHaveTextContent("Facilities");
    expect(current).toHaveAttribute("href", "/access/c-fac");
    expect(within(panel).getByRole("link", { name: "Directory" })).toHaveAttribute(
      "href",
      "/groups/c-fac",
    );
  });

  it("switches from a category's details to the same category's access", () => {
    renderShell(alice, "/groups/c-fac");
    const panel = screen.getByRole("navigation", { name: "Categories pages" });
    expect(within(panel).getByRole("link", { name: "Access" })).toHaveAttribute(
      "href",
      "/access/c-fac",
    );
  });
});

describe("AdminShell for someone with less than site admin", () => {
  it("hides the destinations their permissions don't open, and empty groups", () => {
    renderShell(
      { ...alice, isSiteAdmin: false, permissions: new Set(["template.manage"]), roles: [] },
      "/access",
    );
    const groups = within(rail())
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(groups).toEqual(["Overview", "Categories", "Structure", "Policies", "Assurance"]);
    const panel = screen.getByRole("navigation", { name: "Categories pages" });
    expect(within(panel).queryByRole("link", { name: "Directory" })).toBeNull();
    expect(within(panel).getByRole("link", { name: "Access" })).toBeInTheDocument();
    expect(within(panel).queryByRole("link", { name: "+ New category" })).toBeNull();
  });
});

describe("AdminShell banners and footer", () => {
  it("has the environment banner, the footer and the accessibility button", () => {
    renderShell(alice);
    expect(screen.getByTestId("environment-banner")).toHaveTextContent("Test environment");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Example Organisation · Steward");
    expect(screen.getByRole("button", { name: "Accessibility options" })).toBeInTheDocument();
  });
});

describe("AdminShell signed out", () => {
  it("keeps the brand and the Admin tag, with no rail, panel, search or account menu", () => {
    renderShell(NO_ACCESS, "/sign-in");
    expect(screen.getByRole("link", { name: "Steward" })).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.queryByRole("button", { name: "Account menu" })).toBeNull();
  });
});
