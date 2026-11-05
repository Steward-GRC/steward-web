// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { i18n } from "@steward-web/i18n";
import { describe, expect, it } from "vitest";

import { activeAdminGroup, ADMIN_COMING_SOON_PATHS, adminNav } from "./adminNav";

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
      directory: "/groups",
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
    expect(ADMIN_COMING_SOON_PATHS).toContain(links.access);
    expect(ADMIN_COMING_SOON_PATHS).toContain(links.caseSettings);
  });
});

describe("activeAdminGroup", () => {
  const groups = adminNav({ compliance: false });
  it.each([
    ["/", "overview"],
    ["/groups/g-1", "categories"],
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
