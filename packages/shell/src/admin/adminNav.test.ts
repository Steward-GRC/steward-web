// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { i18n } from "@steward-web/i18n";
import { describe, expect, it } from "vitest";

import { activeAdminGroup, ADMIN_COMING_SOON_PATHS, adminNav, hasSecondaryNav } from "./adminNav";

const labels = (compliance: boolean) =>
  adminNav({ compliance }).map((group) => [
    i18n.t(group.label),
    group.destinations.map((destination) => i18n.t(destination.label)),
  ]);

describe("adminNav", () => {
  it("has H2's groups, the brief's 17 destinations and Compliance's case settings, in order", () => {
    expect(labels(true)).toEqual([
      ["Overview", ["Overview"]],
      ["Categories", ["Directory", "Access"]],
      ["Structure", ["Templates", "Workflows", "Contact library", "References", "Definitions"]],
      ["Policies", ["Catalog", "Procedures", "Magic links"]],
      ["Assurance", ["Completion", "Audit log"]],
      ["Compliance", ["Case settings"]],
      ["People", ["My groups", "Users & roles", "Organizations"]],
      ["System", ["Settings"]],
    ]);
  });

  it("has 7 groups by default: Compliance waits for reporting, and Ethics is v0.2.0", () => {
    expect(labels(false).map(([group]) => group)).toEqual([
      "Overview",
      "Categories",
      "Structure",
      "Policies",
      "Assurance",
      "People",
      "System",
    ]);
  });

  it("links each destination to its admin route, or to a coming-soon page", () => {
    const links = Object.fromEntries(
      adminNav({ compliance: true })
        .flatMap((group) => group.destinations)
        .map((destination) => [destination.id, destination.to]),
    );
    expect(links).toMatchObject({
      auditLog: "/audit",
      catalog: "/policies",
      completion: "/completion",
      contactLibrary: "/contact-library",
      definitions: "/definitions-library",
      directory: "/categories",
      magicLinks: "/magic-links",
      myGroups: "/my-groups",
      organizations: "/organisations",
      overview: "/",
      procedures: "/procedures",
      references: "/references-library",
      settings: "/settings",
      templates: "/templates",
      users: "/users",
      workflows: "/workflows",
    });
    expect(links.access).toBe("/access");
    expect(ADMIN_COMING_SOON_PATHS).not.toContain(links.access);
    expect(ADMIN_COMING_SOON_PATHS).toContain(links.caseSettings);
  });
});

const visible = (permissions: string[], groupManager = false) =>
  adminNav({
    can: (permission) => permissions.includes(permission),
    compliance: false,
    groupManager,
  }).map((group) => [
    i18n.t(group.label),
    group.destinations.map((destination) => i18n.t(destination.label)),
  ]);

describe("adminNav for what the person can use", () => {
  it("gives a template admin Access but not Directory, and no People or System", () => {
    expect(visible(["template.manage"])).toEqual([
      ["Overview", ["Overview"]],
      ["Categories", ["Access"]],
      ["Structure", ["Contact library", "References", "Definitions"]],
      ["Policies", ["Catalog", "Procedures", "Magic links"]],
      ["Assurance", ["Completion"]],
    ]);
  });

  it("gives a group manager My groups and nothing else in People", () => {
    expect(visible([], true)).toContainEqual(["People", ["My groups"]]);
  });

  it("gives an auditor the audit log", () => {
    expect(visible(["audit.read"])).toContainEqual(["Assurance", ["Completion", "Audit log"]]);
  });

  it("keeps every destination for a site admin", () => {
    expect(
      visible(
        ["group.manage", "template.manage", "audit.read", "user.manage", "settings.manage"],
        true,
      ).flatMap(([, destinations]) => destinations),
    ).toHaveLength(17);
  });
});

describe("hasSecondaryNav (#83)", () => {
  it("is true for a section with two or more pages and false for one", () => {
    const groups = adminNav({ compliance: false });
    const by = (id: string) => groups.find((entry) => entry.id === id)!;
    expect(hasSecondaryNav(by("overview"))).toBe(false);
    expect(hasSecondaryNav(by("system"))).toBe(false);
    expect(hasSecondaryNav(by("policies"))).toBe(true);
    expect(hasSecondaryNav(by("assurance"))).toBe(true);
  });

  it("keeps Categories' panel, which also holds the category tree, even for one page", () => {
    const groups = adminNav({ can: (p) => p === "template.manage", compliance: false });
    const categories = groups.find((entry) => entry.id === "categories")!;
    expect(categories.destinations).toHaveLength(1);
    expect(hasSecondaryNav(categories)).toBe(true);
  });
});

describe("activeAdminGroup", () => {
  const groups = adminNav({ compliance: false });
  it.each([
    ["/", "overview"],
    ["/categories/g-1", "categories"],
    ["/access/g-1", "categories"],
    ["/templates/STD", "structure"],
    ["/policies/POL-1", "policies"],
    ["/completion/POL-1", "assurance"],
    ["/users/merge", "people"],
    ["/platform-groups", "people"],
    ["/settings", "system"],
  ])("puts %s in the %s group", (path, group) => {
    expect(activeAdminGroup(groups, path)?.id).toBe(group);
  });

  it("leaves pages outside the groups, such as search, unmarked", () => {
    expect(activeAdminGroup(groups, "/search")).toBeUndefined();
  });
});
