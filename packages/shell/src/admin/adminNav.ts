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

const shown = (show: boolean, entry: AdminDestination) => (show ? [entry] : []);

export interface AdminNavInput {
  /** Whether the signed-in person holds a permission; everything shows when it's left out. */
  can?: (permission: string) => boolean;
  /** Compliance reporting is on for this install (`STEWARD_REPORTING=true`). */
  compliance: boolean;
  /** The person manages at least one group, so My groups is theirs. */
  groupManager?: boolean;
}

/**
 * The admin rail (H2, decisions 2-layout-and-navigation.s3 and s6): Overview, Categories,
 * Structure, Policies, Assurance, Compliance, Ethics, People and System, each with the 232 px
 * panel's destinations. None of the brief's 17 destinations are renamed; "People" and
 * "Assurance" replace the old "Access" and "Compliance" headings. Compliance holds the
 * reporting module's case settings and shows only while reporting is on; Ethics is a v0.2.0
 * module and never shows yet, which leaves 7 groups by default.
 *
 * Like the staff sidebar, a destination shows only to someone its page lets in (each one's
 * `show` mirrors its route's guard), and a group with nothing left to show goes.
 */
export const adminNav = ({
  can = () => true,
  compliance,
  groupManager = true,
}: AdminNavInput): AdminGroup[] => {
  const categories = can("group.manage");
  return [
    group("overview", LayoutGrid, [destination("overview", LayoutGrid, "/")]),
    group("categories", Folder, [
      ...shown(categories, destination("directory", FolderTree, "/groups")),
      ...shown(categories || can("template.manage"), destination("access", ListChecks, "/access")),
    ]),
    group("structure", LayoutTemplate, [
      ...shown(categories, destination("templates", LayoutTemplate, "/templates")),
      ...shown(categories, destination("workflows", Workflow, "/workflows")),
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
      ...shown(can("audit.read"), destination("auditLog", ScrollText, "/audit")),
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
      ...shown(groupManager, destination("myGroups", Users, "/my-groups")),
      ...shown(can("user.manage"), destination("users", Users, "/users", ["/platform-groups"])),
      ...shown(can("settings.manage"), destination("organizations", Building2, "/organisations")),
    ]),
    group("system", Settings2, [
      ...shown(can("settings.manage"), destination("settings", Settings2, "/settings")),
    ]),
  ].filter((entry) => entry.destinations.length > 0);
};

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
