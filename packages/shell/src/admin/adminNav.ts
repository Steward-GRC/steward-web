// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  BookOpen,
  Building2,
  ChartPie,
  Contact,
  Files,
  FileText,
  Flag,
  Folder,
  FolderTree,
  LayoutGrid,
  LayoutTemplate,
  Link,
  ListChecks,
  type LucideIcon,
  Quote,
  ScrollText,
  Settings2,
  Users,
  Workflow,
} from "lucide-react";

import { ADMIN_COMING_SOON } from "./adminComingSoon";

export { ADMIN_COMING_SOON_PATHS } from "./adminComingSoon";

export interface AdminDestination {
  /** Other pages that sit under this destination ("/platform-groups" under Users & roles). */
  also?: readonly string[];
  icon: LucideIcon;
  id: string;
  /** The i18n key of the destination's name. */
  label: string;
  to: string;
}

export interface AdminGroup {
  destinations: AdminDestination[];
  icon: LucideIcon;
  id: string;
  /** The i18n key of the group's name, on the rail and as the panel's heading. */
  label: string;
}

const destination = (
  id: string,
  icon: LucideIcon,
  to: string,
  also?: readonly string[],
): AdminDestination => ({ also, icon, id, label: `shell:admin.destinations.${id}`, to });

const group = (id: string, icon: LucideIcon, destinations: AdminDestination[]): AdminGroup => ({
  destinations,
  icon,
  id,
  label: `shell:admin.groups.${id}`,
});

/**
 * The admin rail (H2, decisions 2-layout-and-navigation.s3 and s6): Overview, Categories,
 * Structure, Policies, Assurance, Compliance, Ethics, People and System, each with the 232 px
 * panel's destinations. None of the brief's 17 destinations are renamed; "People" and
 * "Assurance" replace the old "Access" and "Compliance" headings. Compliance holds the
 * reporting module's case settings and shows only while reporting is on; Ethics is a v0.2.0
 * module and never shows yet, which leaves 7 groups by default.
 */
export const adminNav = ({ compliance }: { compliance: boolean }): AdminGroup[] => [
  group("overview", LayoutGrid, [destination("overview", LayoutGrid, "/")]),
  group("categories", Folder, [
    destination("directory", FolderTree, "/groups"),
    destination("access", ListChecks, "/access"),
  ]),
  group("structure", LayoutTemplate, [
    destination("templates", LayoutTemplate, "/templates"),
    destination("workflows", Workflow, "/workflows"),
    destination("contactLibrary", Contact, "/contact-library"),
    destination("references", Quote, "/references-library"),
    destination("definitions", BookOpen, "/definitions-library"),
  ]),
  group("policies", FileText, [
    destination("catalog", Files, "/policies"),
    destination("procedures", Files, "/procedures"),
    destination("magicLinks", Link, "/magic-links"),
  ]),
  group("assurance", ChartPie, [
    destination("completion", ChartPie, "/completion"),
    destination("auditLog", ScrollText, "/audit"),
  ]),
  ...(compliance
    ? [
        group("compliance", Flag, [
          destination("caseSettings", Flag, ADMIN_COMING_SOON.caseSettings),
        ]),
      ]
    : []),
  // Ethics (the compass icon) joins here with its module in v0.2.0.
  group("people", Users, [
    destination("myGroups", Users, "/my-groups"),
    destination("users", Users, "/users", ["/platform-groups"]),
    destination("organizations", Building2, "/organisations"),
  ]),
  group("system", Settings2, [destination("settings", Settings2, "/settings")]),
];

/** A destination covers its own path and the pages below it; "/" covers only itself. */
const covers = (path: string, pathname: string) =>
  path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

/** The destination showing at `pathname`, if any. */
export const activeAdminDestination = (groups: readonly AdminGroup[], pathname: string) =>
  groups
    .flatMap((entry) => entry.destinations)
    .find((entry) => [entry.to, ...(entry.also ?? [])].some((path) => covers(path, pathname)));

/** The group whose destination is showing at `pathname`, if any. */
export const activeAdminGroup = (groups: readonly AdminGroup[], pathname: string) => {
  const current = activeAdminDestination(groups, pathname);
  return current ? groups.find((entry) => entry.destinations.includes(current)) : undefined;
};
