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
    expect(within(header).getByText("Admin")).toHaveClass("bg-accent-fill");
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
    renderShell(alice, "/categories/c-fac");
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
      "/categories/new",
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
      "/categories/c-fac",
    );
  });

  it("switches from a category's details to the same category's access", () => {
    renderShell(alice, "/categories/c-fac");
    const panel = screen.getByRole("navigation", { name: "Categories pages" });
    expect(within(panel).getByRole("link", { name: "Access" })).toHaveAttribute(
      "href",
      "/access/c-fac",
    );
  });
});

describe("AdminShell secondary navigation (#83)", () => {
  it("shows none on Overview, a section with one page", () => {
    renderShell(alice, "/");
    expect(screen.queryByRole("navigation", { name: "Overview pages" })).toBeNull();
    expect(within(rail()).queryByRole("button", { name: "Open Overview pages" })).toBeNull();
  });

  it("shows none on System, a section with one page", () => {
    renderShell(alice, "/settings");
    expect(screen.queryByRole("navigation", { name: "System pages" })).toBeNull();
  });

  it("shows none on Assurance for someone who cannot read the audit log", () => {
    renderShell(
      { ...alice, isSiteAdmin: false, permissions: new Set(["group.manage"]), roles: [] },
      "/completion",
    );
    expect(screen.queryByRole("navigation", { name: "Assurance pages" })).toBeNull();
  });

  it("shows it on a section with two or more pages", () => {
    renderShell(alice, "/audit");
    expect(screen.getByRole("navigation", { name: "Assurance pages" })).toBeInTheDocument();
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
  it("puts the dev login bar across the very top, above the environment banner", () => {
    renderShell(alice, "/", { devLogin: <div data-testid="dev-login-bar">Dev login</div> });
    const bar = screen.getByTestId("dev-login-bar");
    const env = screen.getByTestId("environment-banner");
    expect(bar.compareDocumentPosition(env) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByTestId("shell-frame")).toHaveStyle("--shell-top: 113px");
  });

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

describe("the admin command bar's create actions", () => {
  it("offers a site admin every type", async () => {
    renderShell(alice);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    const create = await screen.findByRole("group", { name: "Create" });
    expect(
      within(create)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual([
      "New category",
      "New group",
      "New template",
      "New workflow",
      "New organisation",
      "New magic link",
    ]);
  });
});

describe("AdminShell below 1280 px and on a phone (#24)", () => {
  it("keeps the panel beside the rail only from 1280 px", () => {
    renderShell(alice, "/policies");
    expect(screen.getByRole("navigation", { name: "Policies pages" })).toHaveClass(
      "hidden",
      "xl:flex",
    );
  });

  it("opens the group's pages as an overlay below 1280 px, closing on navigation", async () => {
    renderShell(alice, "/policies");
    const open = within(rail()).getByRole("button", { name: "Open Policies pages" });
    expect(open).toHaveClass("xl:hidden");
    await userEvent.click(open);
    const overlay = await screen.findByRole("dialog", { name: "Policies pages" });
    await userEvent.click(within(overlay).getByRole("link", { name: "Magic links" }));
    expect(screen.queryByRole("dialog", { name: "Policies pages" })).toBeNull();
    expect(within(rail()).getByRole("button", { name: "Open Policies pages" })).toHaveFocus();
  });

  it("hides the rail on a phone and opens every group from Open menu", async () => {
    renderShell(alice, "/policies");
    expect(rail()).toHaveClass("hidden", "md:flex");
    const header = screen.getByRole("banner");
    const open = within(header).getByRole("button", { name: "Open menu" });
    expect(open).toHaveClass("md:hidden");
    await userEvent.click(open);
    const drawer = await screen.findByRole("dialog", { name: "Admin menu" });
    for (const group of ["Overview", "Categories", "Structure", "Policies", "People", "System"]) {
      expect(within(drawer).getByRole("heading", { name: group })).toBeInTheDocument();
    }
    expect(within(drawer).getByRole("link", { name: "Catalog" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(drawer).getByRole("link", { name: "Staff" })).toHaveAttribute(
      "href",
      "https://steward.example/",
    );
    await userEvent.click(within(drawer).getByRole("link", { name: "Settings" }));
    expect(screen.queryByRole("dialog", { name: "Admin menu" })).toBeNull();
  });

  it("swaps the header search for a search link below 1024 px", () => {
    renderShell(alice);
    const header = screen.getByRole("banner");
    expect(within(header).getByRole("link", { name: "Search" })).toHaveClass("lg:hidden");
  });

  it("leads with Skip to main content, onto the page's main landmark (WCAG 2.4.1)", async () => {
    renderShell(alice, "/policies");
    await userEvent.tab();
    const skip = screen.getByRole("link", { name: "Skip to main content" });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute("href", "#main");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
  });
});
