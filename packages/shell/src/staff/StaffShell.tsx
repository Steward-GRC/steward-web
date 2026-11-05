// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Category, GlobalSettings } from "@steward-web/api-client";

import { type Identity, useIdentity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { Lockup, Tooltip } from "@steward-web/ui";
import { Bell, Search } from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router";

import type { ShellConfig } from "../shellConfig";

import { AccountMenu } from "../AccountMenu";
import { EnvironmentBanner } from "../EnvironmentBanner";
import { SearchField } from "../SearchField";
import { ShellFooter } from "../ShellFooter";
import { SiteBanners } from "../SiteBanners";
import { COMING_SOON } from "./comingSoon";
import { StaffDrawer } from "./StaffDrawer";
import { staffNav } from "./staffNav";
import { StaffSidebar } from "./StaffSidebar";

const COLLAPSED_KEY = "steward.sidebar.collapsed";
const RAIL_WIDTHS = "(min-width: 64rem) and (max-width: 79.98rem)";

/** Anyone with a way into the admin console: its permissions, or a group they manage. */
const ADMIN_PERMISSIONS = [
  "admin.manage",
  "audit.read",
  "group.manage",
  "settings.manage",
  "template.manage",
  "user.manage",
];
const opensAdmin = (identity: Identity) =>
  identity.isSiteAdmin ||
  identity.isGroupManager ||
  ADMIN_PERMISSIONS.some((permission) => identity.permissions.has(permission));

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = globalThis.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);
  return matches;
};

/** The sidebar's collapsed state, kept in this browser. */
const useCollapsed = (): [boolean, (collapsed: boolean) => void] => {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after hydration
      setCollapsed(globalThis.localStorage?.getItem(COLLAPSED_KEY) === "true");
    } catch {
      // Storage can be blocked; the sidebar starts open.
    }
  }, []);
  const change = useCallback((next: boolean) => {
    setCollapsed(next);
    try {
      globalThis.localStorage?.setItem(COLLAPSED_KEY, String(next));
    } catch {
      // Storage can be blocked; the choice still applies to this page.
    }
  }, []);
  return [collapsed, change];
};

const action =
  "flex h-[34px] items-center rounded-md px-2.5 text-ink hover:bg-sunken hover:text-ink";

export interface StaffShellProps {
  /** The site's announcement and maintenance settings, from the app's root loader. */
  banners?: GlobalSettings | null;
  /** The top-level categories and their subcategories, for Browse by category. */
  categories?: readonly Category[];
  children: ReactNode;
  config: ShellConfig;
  counts?: { approvals?: number };
  /** Compliance reporting is on for this install (`STEWARD_REPORTING=true`). */
  reporting?: boolean;
}

/**
 * The staff shell (H1, H1t, H3, H3o): the environment banner, the 56 px header, the sidebar,
 * the site banners, the page at full width (decision 2-layout-and-navigation.s9) and the
 * footer with the accessibility button. Signed out, it keeps only the brand, the organisation
 * slot and the footer: no navigation, search or account menu.
 */
export const StaffShell = ({
  banners,
  categories = [],
  children,
  config,
  counts = {},
  reporting = false,
}: StaffShellProps) => {
  const { t } = useTranslation("shell");
  const identity = useIdentity();
  const signedIn = identity.id !== "";
  const [collapsed, setCollapsed] = useCollapsed();
  const railWidth = useMediaQuery(RAIL_WIDTHS);
  const sections = useMemo(
    () =>
      staffNav({
        can: (permission) => identity.permissions.has(permission),
        counts,
        reporting,
      }),
    [identity, counts, reporting],
  );
  const adminUrl = signedIn && opensAdmin(identity) ? config.adminUrl : undefined;
  // The canvas frames size boxes content-box: a 56 px header plus its 1 px rule is 57 px.
  const style = { "--shell-top": config.environment ? "85px" : "57px" } as CSSProperties;

  return (
    <div className="flex min-h-dvh flex-col" style={style}>
      <div className="sticky top-0 z-[var(--z-header)]">
        <EnvironmentBanner name={config.environment} />
        <header className="flex h-[57px] items-center gap-1.5 border-b border-border-strong bg-surface px-1.5 lg:gap-3 lg:px-[14px] xl:gap-[14px] xl:px-4">
          {signedIn ? (
            <StaffDrawer
              adminUrl={adminUrl}
              docsUrl={config.docsUrl}
              feedbackUrl={COMING_SOON.feedback}
              sections={sections}
            />
          ) : null}
          <Link className="flex text-ink hover:text-ink" to="/">
            <Lockup className="max-lg:[&>svg:first-child]:size-6 max-lg:[&>svg:last-child]:h-[14.36px] max-lg:[&>svg:last-child]:w-auto" />
          </Link>
          {config.organisation ? (
            <span
              className="hidden items-center gap-[14px] xl:flex"
              data-testid="organisation-slot"
            >
              <span aria-hidden="true" className="h-[22px] w-px bg-border" />
              <span className="text-sm font-medium text-muted">{config.organisation}</span>
            </span>
          ) : null}
          {signedIn ? (
            <>
              <SearchField className="ml-6 hidden h-[38px] w-[322px] lg:flex xl:ml-10 xl:w-[382px]" />
              <div className="ml-auto flex items-center gap-1 text-sm font-medium">
                {adminUrl ? (
                  <a className={`${action} hidden lg:flex`} href={adminUrl}>
                    {t("header.admin")}
                  </a>
                ) : null}
                <Link className={`${action} hidden xl:flex`} to={COMING_SOON.feedback}>
                  {t("header.feedback")}
                </Link>
                <a
                  className={`${action} hidden lg:flex`}
                  href={config.docsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {t("header.docs")}
                </a>
                <Tooltip content={t("header.notifications")}>
                  <Link
                    aria-label={t("header.notifications")}
                    className="hidden size-9 items-center justify-center rounded-md text-ink hover:bg-sunken hover:text-ink lg:flex"
                    to={COMING_SOON.inbox}
                  >
                    <Bell aria-hidden="true" className="size-[18px]" />
                  </Link>
                </Tooltip>
                <Link
                  aria-label={t("header.search.label")}
                  className="flex size-11 items-center justify-center rounded-md text-ink hover:bg-sunken hover:text-ink lg:hidden"
                  to="/search"
                >
                  <Search aria-hidden="true" className="size-[22px]" />
                </Link>
                <span className="lg:ml-1.5">
                  <AccountMenu />
                </span>
              </div>
            </>
          ) : null}
        </header>
      </div>
      <div className="flex flex-1">
        {signedIn ? (
          <StaffSidebar
            categories={categories}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            rail={collapsed || railWidth}
            sections={sections}
          />
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
