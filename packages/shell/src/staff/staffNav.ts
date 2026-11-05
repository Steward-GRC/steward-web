// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  CircleCheck,
  Compass,
  FileText,
  Flag,
  House,
  Inbox,
  LayoutTemplate,
  ListOrdered,
  type LucideIcon,
  MessageCircleQuestion,
  PencilLine,
  ScrollText,
  Stamp,
} from "lucide-react";

import { COMING_SOON } from "./comingSoon";

export { COMING_SOON_PATHS } from "./comingSoon";

export interface NavItem {
  /** A count chip (H1's plum pill), only when there is something to count. */
  badge?: number;
  icon: LucideIcon;
  id: string;
  /** The i18n key of the item's label. */
  label: string;
  to: string;
}

export interface NavSection {
  id: string;
  items: NavItem[];
  /** The i18n key of the section heading. */
  label: string;
  /** Which run of the 1024 px icon rail (H1t) the section sits in; a divider separates runs. */
  railGroup: number;
}

export interface StaffNavInput {
  can: (permission: string) => boolean;
  counts: { approvals?: number };
  /** Compliance reporting is on for this install (`STEWARD_REPORTING=true`). */
  reporting: boolean;
}

interface ItemSpec extends Omit<NavItem, "label"> {
  show: boolean;
}

const item = ({ show, ...spec }: ItemSpec): NavItem | undefined =>
  show ? { ...spec, label: `shell:nav.items.${spec.id}` } : undefined;

const section = (id: string, railGroup: number, items: (NavItem | undefined)[]): NavSection => ({
  id,
  items: items.filter((entry): entry is NavItem => entry !== undefined),
  label: `shell:nav.sections.${id}`,
  railGroup,
});

const badge = (count: number | undefined) => (count && count > 0 ? count : undefined);

/**
 * The staff sidebar (H1): Overview, then the four peer areas Policies, Procedures, Compliance
 * and Ethics, then Assist and Workflow. Items you can't use are hidden and empty sections
 * drop (BRIEF H1). Compliance shows only while reporting is on; Ethics is a v0.2.0 module and
 * never shows yet. Browse by category is rendered from the category tree, not from here.
 */
export const staffNav = ({ can, counts, reporting }: StaffNavInput): NavSection[] => {
  const read = can("policy.read");
  return [
    section("overview", 0, [item({ icon: House, id: "myWork", show: true, to: "/" })]),
    section("policies", 1, [
      item({ icon: FileText, id: "policies", show: read, to: "/policies" }),
      item({ icon: CircleCheck, id: "toAcknowledge", show: read, to: COMING_SOON.toAcknowledge }),
    ]),
    section("procedures", 1, [
      item({ icon: ListOrdered, id: "procedures", show: read, to: "/procedures" }),
    ]),
    section("compliance", 1, [
      item({ icon: Flag, id: "reportConcern", show: reporting, to: COMING_SOON.reportConcern }),
      item({ icon: Inbox, id: "myReports", show: reporting, to: COMING_SOON.myReports }),
    ]),
    section("ethics", 1, [
      item({ icon: Compass, id: "ethicsReportConcern", show: false, to: "/" }),
      item({ icon: Inbox, id: "ethicsMyReports", show: false, to: "/" }),
      item({ icon: PencilLine, id: "myAttestations", show: false, to: "/" }),
    ]),
    section("assist", 2, [
      item({ icon: MessageCircleQuestion, id: "ask", show: read, to: COMING_SOON.ask }),
      item({
        icon: LayoutTemplate,
        id: "templates",
        show: can("policy.author"),
        to: COMING_SOON.templates,
      }),
    ]),
    section("workflow", 3, [
      item({
        badge: badge(counts.approvals),
        icon: Stamp,
        id: "approvals",
        show: can("policy.approve"),
        to: "/approvals",
      }),
      item({ icon: ScrollText, id: "auditLog", show: can("audit.read"), to: COMING_SOON.auditLog }),
    ]),
  ].filter((entry) => entry.items.length > 0);
};
