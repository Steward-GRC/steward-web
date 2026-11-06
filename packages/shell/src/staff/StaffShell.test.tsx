// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type Identity, IdentityProvider, NO_ACCESS } from "@steward-web/auth";
import { ThemeProvider } from "@steward-web/ui";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import type { ShellConfig } from "../shellConfig";

import { StaffShell, type StaffShellProps } from "./StaffShell";

const person = (overrides: Partial<Identity>): Identity => ({
  ...NO_ACCESS,
  email: "bob@example.org",
  firstName: "Bob",
  id: "user-bob",
  lastName: "Author",
  name: "Bob Author",
  permissions: new Set(["policy.author", "policy.read"]),
  roles: ["author"],
  username: "bob",
  ...overrides,
});

const bob = person({});
const alice = person({
  email: "alice@example.org",
  firstName: "Alice",
  id: "user-alice",
  isSiteAdmin: true,
  lastName: "Admin",
  name: "Alice Admin",
  permissions: new Set([
    "admin.manage",
    "audit.read",
    "policy.approve",
    "policy.author",
    "policy.read",
  ]),
  roles: ["site-admin"],
  username: "alice",
});

const CONFIG: ShellConfig = {
  adminUrl: "/admin",
  docsUrl: "https://steward-grc.com",
  environment: "test",
  organisation: "Example Organisation",
  staffUrl: "/",
};

const renderShell = (
  identity: Identity,
  props: Partial<StaffShellProps> = {},
  path = "/",
  page: ReactNode = <p>page content</p>,
) => {
  const router = createMemoryRouter(
    [
      {
        element: (
          <StaffShell config={CONFIG} {...props}>
            {page}
          </StaffShell>
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

const sidebar = () => screen.getByRole("navigation", { name: "Main navigation" });

describe("StaffShell header (H1)", () => {
  it("has the brand linking home, the organisation slot and the search field with ⌘K", () => {
    renderShell(bob);
    const banner = screen.getByRole("banner");
    expect(within(banner).getByRole("link", { name: "Steward" })).toHaveAttribute("href", "/");
    expect(within(banner).getByText("Example Organisation")).toBeInTheDocument();
    const search = within(banner).getByRole("searchbox", { name: "Search" });
    expect(search).toHaveAttribute("placeholder", "Search policies, templates…");
    expect(within(banner).getByRole("search")).toHaveAttribute("action", "/search");
    expect(within(banner).getByText("⌘K")).toBeInTheDocument();
  });

  it("leaves the organisation slot out when no organisation is set", () => {
    renderShell(bob, { config: { ...CONFIG, organisation: null } });
    expect(screen.queryByText("Example Organisation")).toBeNull();
    expect(screen.queryByTestId("organisation-slot")).toBeNull();
  });

  it("has Feedback, Docs and the bell, and no Tour (decision 2-layout-and-navigation.s2)", () => {
    renderShell(bob);
    const banner = screen.getByRole("banner");
    expect(within(banner).getByRole("link", { name: "Feedback" })).toBeInTheDocument();
    expect(within(banner).getByRole("link", { name: "Docs" })).toHaveAttribute(
      "href",
      "https://steward-grc.com",
    );
    expect(within(banner).getByRole("link", { name: "Notifications" })).toBeInTheDocument();
    expect(within(banner).queryByText("Tour")).toBeNull();
  });

  it("shows Admin to admins only", () => {
    renderShell(bob);
    expect(screen.queryByRole("link", { name: "Admin" })).toBeNull();
  });

  it("links admins to the admin app", () => {
    renderShell(alice);
    expect(within(screen.getByRole("banner")).getByRole("link", { name: "Admin" })).toHaveAttribute(
      "href",
      "/admin",
    );
  });

  it("has the avatar, not a second Steward lockup (decision 1-brand-and-voice.s3)", () => {
    renderShell(bob);
    const banner = screen.getByRole("banner");
    expect(within(banner).getAllByRole("img", { name: "Steward" })).toHaveLength(1);
    expect(within(banner).getByRole("button", { name: "Account menu" })).toHaveTextContent("B");
  });

  it("opens the account menu (H14) with the name, email and its items in order", async () => {
    renderShell(bob);
    await userEvent.click(screen.getByRole("button", { name: "Account menu" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByText("Bob Author")).toBeInTheDocument();
    expect(within(menu).getByText("bob@example.org")).toBeInTheDocument();
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual([
      "Your profile",
      "Notifications",
      "Log out everywhere",
      "About and diagnostics",
      "Sign out",
    ]);
    expect(screen.getByRole("form", { name: "Sign out" })).toHaveAttribute("method", "post");
  });
});

describe("StaffShell sidebar (H1)", () => {
  it("shows the sections in order with the current page marked", () => {
    renderShell(
      alice,
      { categories: [{ id: "c1", name: "Workplace", slug: "workplace", subcategories: [] }] },
      "/policies",
    );
    const nav = sidebar();
    expect(
      within(nav)
        .getAllByRole("heading")
        .map((heading) => heading.textContent),
    ).toEqual(["Overview", "Policies", "Procedures", "Assist", "Workflow", "Browse by category"]);
    const current = within(nav).getByRole("link", { current: "page" });
    expect(current).toHaveAttribute("href", "/policies");
    expect(current).toHaveTextContent("Library");
    // The current page carries the amber accent bar, like the amber count badge.
    expect(current.className).toContain("shadow-[inset_4px_0_0_var(--accent)]");
  });

  it("shows Compliance only while reporting is on, and never Ethics", () => {
    renderShell(alice, { reporting: true });
    const headings = within(sidebar())
      .getAllByRole("heading")
      .map((heading) => heading.textContent);
    expect(headings).toContain("Compliance");
    expect(headings).not.toContain("Ethics");
  });

  it("shows the Approvals count as an amber pill so it stands out", () => {
    renderShell(alice, { counts: { approvals: 2 } });
    const link = within(sidebar()).getByRole("link", { name: "Approvals, 2 waiting" });
    expect(within(link).getByText("2")).toHaveClass("bg-accent", "text-on-accent");
  });

  it("counts pending approvals on Approvals", () => {
    renderShell(alice, { counts: { approvals: 2 } });
    expect(within(sidebar()).getByRole("link", { name: "Approvals, 2 waiting" })).toHaveAttribute(
      "href",
      "/approvals",
    );
  });

  it("browses by category, opening a category to its subcategories", async () => {
    renderShell(bob, {
      categories: [
        { id: "c1", name: "Workplace", slug: "workplace", subcategories: ["Facilities", "Travel"] },
        { id: "c2", name: "Finance", slug: "finance", subcategories: [] },
      ],
    });
    const nav = sidebar();
    expect(within(nav).getByRole("link", { name: "Workplace" })).toHaveAttribute(
      "href",
      "/policies?category=Workplace",
    );
    expect(within(nav).queryByRole("link", { name: "Facilities" })).toBeNull();
    await userEvent.click(
      within(nav).getByRole("button", { name: "Show Workplace's subcategories" }),
    );
    expect(within(nav).getByRole("link", { name: "Facilities" })).toHaveAttribute(
      "href",
      "/policies?category=Workplace&subcategory=Facilities",
    );
  });

  it("collapses to the icon rail and back", async () => {
    renderShell(bob);
    await userEvent.click(within(sidebar()).getByRole("button", { name: "Collapse" }));
    expect(sidebar()).toHaveAttribute("data-rail", "true");
    await userEvent.click(within(sidebar()).getByRole("button", { name: "Expand" }));
    expect(sidebar()).toHaveAttribute("data-rail", "false");
  });
});

describe("StaffShell banners and footer", () => {
  it("names a non-production environment in the hatched banner", () => {
    renderShell(bob);
    const banner = screen.getByTestId("environment-banner");
    expect(banner).toHaveClass("env-banner");
    expect(banner).toHaveTextContent("TESTTest environment");
  });

  it("puts the dev login bar across the very top, above the environment banner", () => {
    renderShell(bob, { devLogin: <div data-testid="dev-login-bar">Dev login</div> });
    const bar = screen.getByTestId("dev-login-bar");
    const env = screen.getByTestId("environment-banner");
    expect(bar.compareDocumentPosition(env) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByTestId("shell-frame")).toHaveStyle("--shell-top: 113px");
  });

  it("has no environment banner in production or when none is set", () => {
    renderShell(bob, { config: { ...CONFIG, environment: null } });
    expect(screen.queryByTestId("environment-banner")).toBeNull();
  });

  it("puts the announcement and maintenance banners above the page", () => {
    renderShell(bob, {
      banners: {
        announcement: { enabled: true, level: "info", message: "Welcome to Steward." },
        maintenance: { enabled: true, message: "Read-only tonight." },
      },
    });
    expect(
      screen
        .getByText("Read-only tonight.")
        .compareDocumentPosition(screen.getByText("page content")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("Welcome to Steward.")).toBeInTheDocument();
  });

  it("has the footer and the accessibility button", async () => {
    renderShell(bob);
    const year = new Date().getFullYear();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      `© ${year} Example Organisation · Steward`,
    );
    await userEvent.click(screen.getByRole("button", { name: "Accessibility options" }));
    // The full Accessibility options panel (H12), closed again from its own button.
    expect(await screen.findByRole("radiogroup", { name: "Text size" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close accessibility options" }));
    expect(screen.queryByRole("radiogroup", { name: "Text size" })).toBeNull();
  });
});

describe("StaffShell keyboard and focus (WCAG 2.4.1, 2.4.3)", () => {
  it("skips to the main content from the first link on the page", async () => {
    renderShell(bob);
    await userEvent.tab();
    const skip = screen.getByRole("link", { name: "Skip to main content" });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute("href", "#main");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  });

  it("moves focus to the new page's content when a link changes the page", async () => {
    renderShell(bob);
    await userEvent.click(within(sidebar()).getByRole("link", { name: /To acknowledge/ }));
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("keeps the notices inside the main landmark, where the skip link lands", () => {
    renderShell(bob, { secondFactorNudge: true });
    expect(within(screen.getByRole("main")).getByRole("link", { name: "Set up" })).toBeVisible();
  });

  it("leaves focus alone on the first page", () => {
    renderShell(bob);
    expect(screen.getByRole("main")).not.toHaveFocus();
  });
});

describe("StaffShell on a phone (H3, H3o)", () => {
  it("opens the drawer from the menu button and closes it", async () => {
    renderShell(bob);
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const drawer = await screen.findByRole("dialog", { name: "Menu" });
    expect(within(drawer).getByRole("link", { name: "My work" })).toBeInTheDocument();
    expect(within(drawer).getByRole("searchbox", { name: "Search" })).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "Docs" })).toBeInTheDocument();
    await userEvent.click(within(drawer).getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes the drawer when you follow a link", async () => {
    renderShell(bob);
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const drawer = await screen.findByRole("dialog", { name: "Menu" });
    const [policies] = within(drawer).getAllByRole("link", { name: "Library" });
    await userEvent.click(policies as HTMLElement);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("StaffShell signed out", () => {
  it("shows no account menu, sidebar, search or menu button", () => {
    renderShell(NO_ACCESS, {}, "/sign-in");
    expect(screen.getByRole("link", { name: "Steward" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Account menu" })).toBeNull();
    expect(screen.queryByRole("navigation", { name: "Main navigation" })).toBeNull();
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.queryByRole("button", { name: "Open menu" })).toBeNull();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });
});

describe("the staff shell's banners (H7, H8, H9)", () => {
  it("puts the acting-as banner above everything, the environment banner included", () => {
    renderShell(bob, {
      impersonation: {
        expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
        targetName: "Erin",
      },
    });
    const actingAs = screen.getByTestId("acting-as-banner");
    expect(actingAs).toHaveTextContent("You are acting as Erin");
    expect(
      actingAs.compareDocumentPosition(screen.getByTestId("environment-banner")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("nudges for a stronger second factor when asked to, and not otherwise", () => {
    renderShell(bob, { secondFactorNudge: true });
    expect(screen.getByRole("link", { name: "Set up" })).toHaveAttribute(
      "href",
      "/profile/security",
    );
  });

  it("rings the bell to the inbox, and the account menu to the notification settings", async () => {
    renderShell(bob);
    expect(screen.getByRole("link", { name: "Notifications" })).toHaveAttribute("href", "/inbox");
    await userEvent.click(screen.getByRole("button", { name: /Account/ }));
    expect(screen.getByRole("menuitem", { name: "Notifications" })).toHaveAttribute(
      "href",
      "/notifications",
    );
  });

  it("has no acting-as banner or nudge by default", () => {
    renderShell(bob);
    expect(screen.queryByTestId("acting-as-banner")).toBeNull();
    expect(screen.queryByRole("link", { name: "Set up" })).toBeNull();
  });
});

describe("the staff command bar's create actions", () => {
  it("offers an author New policy and New procedure", async () => {
    renderShell(bob);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    const create = await screen.findByRole("group", { name: "Create" });
    expect(
      within(create)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["New policy", "New procedure", "New draft from a template"]);
  });
});
