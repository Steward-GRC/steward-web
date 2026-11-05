// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { GlobalSettings } from "@steward-web/api-client";

import { useIdentity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { cn, Dialog, DialogClose, DialogTrigger, Lockup, SheetContent } from "@steward-web/ui";
import { ArrowLeft, Menu as MenuIcon, PanelLeftOpen, Search, X } from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";

import type { ShellConfig } from "../shellConfig";

import { AccountMenu } from "../AccountMenu";
import { adminCreates } from "../createActions";
import { EnvironmentBanner } from "../EnvironmentBanner";
import { MainContent, SkipLink } from "../MainContent";
import { SearchField } from "../SearchField";
import { ShellFooter } from "../ShellFooter";
import { SiteBanners } from "../SiteBanners";
import { AdminCategoryTree, type CategoryNode } from "./AdminCategoryTree";
import { ADMIN_COMING_SOON } from "./adminComingSoon";
import {
  activeAdminDestination,
  activeAdminGroup,
  type AdminDestination,
  type AdminGroup,
  adminNav,
} from "./adminNav";

const headerLink =
  "flex h-[34px] items-center gap-1.5 rounded-md px-2.5 text-[#e6d8e4] hover:bg-white/10 hover:text-[#f6eef4]";

const sticky = "sticky top-[var(--shell-top)] h-[calc(100dvh-var(--shell-top))] flex-none";

/** A navigation closes the overlay or drawer it happened in. */
const useClosesOnNavigation = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a navigation closes the sheet
    setOpen(false);
  }, [location.key]);
  return [open, setOpen] as const;
};

/** The 76 px group rail (H2): an icon over each group's name, the current group in plum. From
 *  768 px; below 1280 px it leads with "Pages", which opens the group's panel as an overlay. */
const Rail = ({
  categories,
  current,
  currentDestination,
  groups,
}: {
  categories: readonly CategoryNode[];
  current?: AdminGroup;
  currentDestination?: AdminDestination;
  groups: AdminGroup[];
}) => {
  const { t } = useTranslation("shell");
  return (
    <nav
      aria-label={t("admin.railLabel")}
      className={cn(
        sticky,
        "hidden w-[77px] flex-col items-center gap-1 overflow-y-auto border-r border-border-strong bg-sunken py-2.5 md:flex",
      )}
    >
      {current ? (
        <PanelOverlay categories={categories} current={currentDestination} group={current} />
      ) : null}
      {groups.map((group) => {
        const Icon = group.icon;
        const active = group === current;
        return (
          <Link
            aria-current={active ? true : undefined}
            className={cn(
              "flex w-16 flex-none flex-col items-center gap-1 rounded-lg pt-[7px] pb-[5px] text-2xs leading-[13px] font-medium",
              active
                ? "bg-primary-soft text-on-primary-soft hover:text-on-primary-soft"
                : "text-ink hover:bg-surface hover:text-ink",
            )}
            key={group.id}
            to={group.destinations[0]?.to ?? "/"}
          >
            <Icon aria-hidden="true" className="size-[22px]" />
            {t(group.label)}
          </Link>
        );
      })}
    </nav>
  );
};

const panelRow = (current: boolean) =>
  cn(
    "flex h-8 items-center gap-1.5 rounded-md px-1.5 text-[13.5px] text-ink hover:bg-sunken hover:text-ink",
    current &&
      "bg-primary-soft font-semibold text-on-primary-soft shadow-[inset_3px_0_0_var(--primary)] hover:bg-primary-soft hover:text-on-primary-soft",
  );

/** The category a Directory or Access page is showing, if any. */
const categoryIn = (pathname: string) => /^\/(?:access|groups)\/([^/]+)$/.exec(pathname)?.[1];

/**
 * Categories' two destinations as H2's segmented control. With a category open, each side
 * opens that same category: its details on Directory, its rules on Access.
 */
const Segmented = ({
  current,
  destinations,
}: {
  current?: AdminDestination;
  destinations: AdminDestination[];
}) => {
  const { t } = useTranslation("shell");
  const { pathname } = useLocation();
  const category = categoryIn(pathname);
  return (
    <div className="flex gap-0.5 rounded-lg bg-sunken p-[3px]">
      {destinations.map((destination) => {
        const active = destination === current;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-[30px] flex-1 items-center justify-center rounded-md text-sm font-medium text-muted hover:text-ink",
              active &&
                "bg-surface font-semibold text-ink shadow-[0_1px_2px_rgb(38_27_37/.1),inset_0_0_0_1px_var(--border)]",
            )}
            key={destination.id}
            to={
              category && category !== "new"
                ? `${destination.to}/${encodeURIComponent(category)}`
                : destination.to
            }
          >
            {t(destination.label)}
          </Link>
        );
      })}
    </div>
  );
};

/** A group's destinations, as the panel, its overlay and the phone menu list them. On
 *  Categories it is the Directory and Access switch, the category tree and "+ New category". */
const PanelContent = ({
  categories,
  current,
  group,
}: {
  categories: readonly CategoryNode[];
  current?: AdminDestination;
  group: AdminGroup;
}) => {
  const { t } = useTranslation("shell");
  return group.id === "categories" ? (
    <>
      <Segmented current={current} destinations={group.destinations} />
      <AdminCategoryTree
        base={current?.id === "access" ? "/access" : "/groups"}
        categories={categories}
      />
      {/* Only someone who manages categories (and so has Directory) can create one. */}
      {group.destinations.some((entry) => entry.id === "directory") ? (
        <Link
          className="mt-auto flex h-9 flex-none items-center justify-center rounded-md border border-dashed border-border-strong text-sm font-medium text-ink hover:bg-sunken hover:text-ink"
          to="/groups/new"
        >
          {t("admin.categories.new")}
        </Link>
      ) : null}
    </>
  ) : (
    <div className="flex flex-col gap-px">
      {group.destinations.map((destination) => {
        const Icon = destination.icon;
        const active = destination === current;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={panelRow(active)}
            key={destination.id}
            to={destination.to}
          >
            <Icon aria-hidden="true" className="size-4 flex-none" />
            {t(destination.label)}
          </Link>
        );
      })}
    </div>
  );
};

const groupHeading =
  "px-1.5 text-2xs leading-[13px] font-semibold tracking-[.06em] text-muted uppercase";

/** The 232 px destinations panel (H2), beside the rail from 1280 px. */
const Panel = ({
  categories,
  current,
  group,
}: {
  categories: readonly CategoryNode[];
  current?: AdminDestination;
  group: AdminGroup;
}) => {
  const { t } = useTranslation("shell");
  const name = t(group.label);
  return (
    <nav
      aria-label={t("admin.panelLabel", { group: name })}
      className={cn(
        sticky,
        "hidden w-[257px] flex-col gap-3 overflow-y-auto border-r border-border-strong bg-surface px-3 py-4 text-base xl:flex",
      )}
    >
      <h2 className={groupHeading}>{name}</h2>
      <PanelContent categories={categories} current={current} group={group} />
    </nav>
  );
};

/**
 * Below 1280 px the panel turns into an overlay (H2's note): "Pages" at the head of the rail
 * opens it beside the rail, over the page. Escape or a navigation closes it, and focus goes
 * back to "Pages".
 */
const PanelOverlay = ({
  categories,
  current,
  group,
}: {
  categories: readonly CategoryNode[];
  current?: AdminDestination;
  group: AdminGroup;
}) => {
  const { t } = useTranslation("shell");
  const [open, setOpen] = useClosesOnNavigation();
  const name = t(group.label);
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <button
          aria-label={t("admin.openPanel", { group: name })}
          className="mb-1 flex w-16 flex-none flex-col items-center gap-1 rounded-lg border-b border-border-strong pt-[7px] pb-[7px] text-2xs leading-[13px] font-medium text-ink hover:bg-surface xl:hidden"
          type="button"
        >
          <PanelLeftOpen aria-hidden="true" className="size-[22px]" />
          {t("admin.pages")}
        </button>
      </DialogTrigger>
      <SheetContent
        className="top-[var(--shell-top)] left-[77px] w-[257px] max-w-[calc(100vw-77px)] gap-3 overflow-y-auto border-r border-border-strong px-3 py-4 text-base"
        title={t("admin.panelLabel", { group: name })}
      >
        <div className="flex items-center">
          <h2 className={groupHeading}>{name}</h2>
          <DialogClose
            aria-label={t("admin.closePanel", { group: name })}
            className="ml-auto flex size-9 items-center justify-center rounded-md hover:bg-sunken"
          >
            <X aria-hidden="true" className="size-[18px]" />
          </DialogClose>
        </div>
        <nav
          aria-label={t("admin.panelLabel", { group: name })}
          className="flex flex-1 flex-col gap-3"
        >
          <PanelContent categories={categories} current={current} group={group} />
        </nav>
      </SheetContent>
    </Dialog>
  );
};

const drawerLink = "flex h-11 items-center px-2.5 text-ink hover:text-ink";

/**
 * The admin phone menu (#24, after H3): below 768 px a 44 px "Open menu" opens a sheet with
 * every group and its pages (the category tree on Categories), and Staff and Docs along the
 * foot. It closes on navigation.
 */
const AdminDrawer = ({
  categories,
  config,
  current,
  groups,
}: {
  categories: readonly CategoryNode[];
  config: ShellConfig;
  current?: AdminDestination;
  groups: AdminGroup[];
}) => {
  const { t } = useTranslation("shell");
  const [open, setOpen] = useClosesOnNavigation();
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <button
          aria-label={t("header.openMenu")}
          className="-ml-2 flex size-11 flex-none items-center justify-center rounded-md text-[#f6eef4] hover:bg-white/10 md:hidden"
          type="button"
        >
          <MenuIcon aria-hidden="true" className="size-[23px]" />
        </button>
      </DialogTrigger>
      <SheetContent className="w-[318px] max-w-[calc(100vw-48px)]" title={t("admin.menuTitle")}>
        <div className="flex h-[57px] flex-none items-center gap-2 border-b border-border pr-1.5 pl-4">
          <Lockup fontSize={19} size={24} />
          <span className="rounded-sm bg-[#e2a336] px-2 py-[3px] text-2xs font-semibold tracking-[.04em] text-[#261b25]">
            {t("admin.tag")}
          </span>
          <DialogClose
            aria-label={t("header.closeMenu")}
            className="ml-auto flex size-11 items-center justify-center rounded-md hover:bg-sunken"
          >
            <X aria-hidden="true" className="size-[23px]" />
          </DialogClose>
        </div>
        <nav
          aria-label={t("admin.railLabel")}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2.5 py-3 text-[15px]"
        >
          {groups.map((group) => (
            <section className="flex flex-col gap-1.5" key={group.id}>
              <h2 className={groupHeading}>{t(group.label)}</h2>
              <PanelContent categories={categories} current={current} group={group} />
            </section>
          ))}
        </nav>
        <div className="flex flex-none gap-1 border-t border-border-strong px-2.5 py-1.5 text-[15px]">
          <a className={drawerLink} href={config.staffUrl}>
            {t("admin.staff")}
          </a>
          <span className="ml-auto" />
          <a className={drawerLink} href={config.docsUrl} rel="noreferrer" target="_blank">
            {t("header.docs")}
          </a>
        </div>
      </SheetContent>
    </Dialog>
  );
};

export interface AdminShellProps {
  /** The site's announcement and maintenance settings, from the app's root loader. */
  banners?: GlobalSettings | null;
  /** The category tree for the Categories panel; empty for someone who can't manage it. */
  categories?: readonly CategoryNode[];
  children: ReactNode;
  config: ShellConfig;
  /** Compliance reporting is on for this install (`STEWARD_REPORTING=true`). */
  reporting?: boolean;
}

/**
 * The admin shell (H2, decision 2-layout-and-navigation.s3): an ink header with the saffron
 * "Admin" tag, so it's always obvious which console you are in; the group rail; the group's
 * destinations panel; the page at full width; and the shared banners and footer. Signed out
 * (sign-in, first-run setup) it keeps only the header's brand and tag.
 */
export const AdminShell = ({
  banners,
  categories = [],
  children,
  config,
  reporting = false,
}: AdminShellProps) => {
  const { t } = useTranslation("shell");
  const identity = useIdentity();
  const { pathname } = useLocation();
  const signedIn = identity.id !== "";
  const groups = useMemo(
    () =>
      adminNav({
        can: (permission) => identity.isSiteAdmin || identity.permissions.has(permission),
        compliance: reporting,
        groupManager: identity.isSiteAdmin || identity.isGroupManager,
      }),
    [identity, reporting],
  );
  const creates = useMemo(
    () =>
      adminCreates((permission) => identity.isSiteAdmin || identity.permissions.has(permission)),
    [identity],
  );
  const currentGroup = activeAdminGroup(groups, pathname);
  const currentDestination = activeAdminDestination(groups, pathname);
  // The canvas frames size boxes content-box: a 56 px header plus its 1 px rule is 57 px.
  const style = { "--shell-top": config.environment ? "85px" : "57px" } as CSSProperties;

  return (
    <div className="flex min-h-dvh flex-col" style={style}>
      <SkipLink />
      <div className="sticky top-0 z-[var(--z-header)]">
        <EnvironmentBanner name={config.environment} />
        <header className="flex h-[57px] items-center gap-3 border-b border-[var(--admin-head-border)] bg-[var(--admin-head)] px-4 text-[#f6eef4]">
          {signedIn ? (
            <AdminDrawer
              categories={categories}
              config={config}
              current={currentDestination}
              groups={groups}
            />
          ) : null}
          <Link className="flex text-[#f6eef4] hover:text-[#f6eef4]" to="/">
            <Lockup tone="on-dark" />
          </Link>
          <span className="rounded-sm bg-[#e2a336] px-2 py-[3px] text-2xs font-semibold tracking-[.04em] text-[#261b25]">
            {t("admin.tag")}
          </span>
          {signedIn ? (
            <>
              <SearchField
                className="ml-[52px] hidden h-[38px] w-[382px] border-[#56465b] bg-transparent text-[#c9b8c7] focus-within:border-[#d9a6d2] lg:flex"
                creates={creates}
                placeholder={t("admin.searchPlaceholder")}
                tone="on-dark"
              />
              <div className="ml-auto flex items-center gap-1 text-sm font-medium">
                <Link
                  aria-label={t("header.search.label")}
                  className="flex size-11 items-center justify-center rounded-md text-[#f6eef4] hover:bg-white/10 hover:text-[#f6eef4] lg:hidden"
                  to="/search"
                >
                  <Search aria-hidden="true" className="size-[22px]" />
                </Link>
                <a className={cn(headerLink, "hidden md:flex")} href={config.staffUrl}>
                  <ArrowLeft aria-hidden="true" className="size-[15px]" />
                  {t("admin.staff")}
                </a>
                <a
                  className={cn(headerLink, "hidden md:flex")}
                  href={config.docsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {t("header.docs")}
                </a>
                <span className="ml-1.5">
                  <AccountMenu
                    avatarClassName="bg-[#d9a6d2] text-[#261b25] shadow-none"
                    links={ADMIN_COMING_SOON}
                  />
                </span>
              </div>
            </>
          ) : null}
        </header>
      </div>
      <div className="flex flex-1">
        {signedIn ? (
          <>
            <Rail
              categories={categories}
              current={currentGroup}
              currentDestination={currentDestination}
              groups={groups}
            />
            {currentGroup ? (
              <Panel categories={categories} current={currentDestination} group={currentGroup} />
            ) : null}
          </>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <SiteBanners settings={banners} />
          <MainContent className="flex-1 outline-none">{children}</MainContent>
          <ShellFooter organisation={config.organisation} />
        </div>
      </div>
    </div>
  );
};
