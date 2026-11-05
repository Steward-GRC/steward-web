// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { GlobalSettings } from "@steward-web/api-client";

import { useIdentity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { cn, Lockup } from "@steward-web/ui";
import { ArrowLeft } from "lucide-react";
import { type CSSProperties, type ReactNode, useMemo } from "react";
import { Link, useLocation } from "react-router";

import type { ShellConfig } from "../shellConfig";

import { AccountMenu } from "../AccountMenu";
import { EnvironmentBanner } from "../EnvironmentBanner";
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

/** The 76 px group rail (H2): an icon over each group's name, the current group in plum. */
const Rail = ({ current, groups }: { current?: AdminGroup; groups: AdminGroup[] }) => {
  const { t } = useTranslation("shell");
  return (
    <nav
      aria-label={t("admin.railLabel")}
      className={cn(
        sticky,
        "flex w-[77px] flex-col items-center gap-1 overflow-y-auto border-r border-border-strong bg-sunken py-2.5",
      )}
    >
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

/**
 * The 232 px destinations panel (H2): the group's name, then its destinations. On Categories
 * it is the Directory and Access switch, the category tree and "+ New category".
 */
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
      <h2 className="px-1.5 text-2xs leading-[13px] font-semibold tracking-[.06em] text-muted uppercase">
        {name}
      </h2>
      {group.id === "categories" ? (
        <>
          <Segmented current={current} destinations={group.destinations} />
          <AdminCategoryTree
            base={current?.id === "access" ? "/access" : "/groups"}
            categories={categories}
          />
          <Link
            className="mt-auto flex h-9 flex-none items-center justify-center rounded-md border border-dashed border-border-strong text-sm font-medium text-ink hover:bg-sunken hover:text-ink"
            to="/groups/new"
          >
            {t("admin.categories.new")}
          </Link>
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
      )}
    </nav>
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
  const groups = useMemo(() => adminNav({ compliance: reporting }), [reporting]);
  const currentGroup = activeAdminGroup(groups, pathname);
  const currentDestination = activeAdminDestination(groups, pathname);
  // The canvas frames size boxes content-box: a 56 px header plus its 1 px rule is 57 px.
  const style = { "--shell-top": config.environment ? "85px" : "57px" } as CSSProperties;

  return (
    <div className="flex min-h-dvh flex-col" style={style}>
      <div className="sticky top-0 z-[var(--z-header)]">
        <EnvironmentBanner name={config.environment} />
        <header className="flex h-[57px] items-center gap-3 border-b border-[var(--admin-head-border)] bg-[var(--admin-head)] px-4 text-[#f6eef4]">
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
                placeholder={t("admin.searchPlaceholder")}
                tone="on-dark"
              />
              <div className="ml-auto flex items-center gap-1 text-sm font-medium">
                <a className={headerLink} href={config.staffUrl}>
                  <ArrowLeft aria-hidden="true" className="size-[15px]" />
                  {t("admin.staff")}
                </a>
                <a className={headerLink} href={config.docsUrl} rel="noreferrer" target="_blank">
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
            <Rail current={currentGroup} groups={groups} />
            {currentGroup ? (
              <Panel categories={categories} current={currentDestination} group={currentGroup} />
            ) : null}
          </>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <SiteBanners settings={banners} />
          <main className="flex-1">{children}</main>
          <ShellFooter organisation={config.organisation} />
        </div>
      </div>
    </div>
  );
};
