// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Category, GlobalSettings } from "@steward-web/api-client";

import { canOpenAdmin, useIdentity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { CommandActionsProvider, Lockup, Tooltip } from "@steward-web/ui";
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
import { staffCreates } from "../createActions";
import { EnvironmentBanner } from "../EnvironmentBanner";
import { MainContent, SkipLink } from "../MainContent";
import { SearchField } from "../SearchField";
import { ShellActions } from "../ShellActions";
import { ActingAsBanner, ConnectionLostBanner, SecondFactorNudge } from "../ShellBanners";
import { ShellFooter } from "../ShellFooter";
import { SiteBanners } from "../SiteBanners";
import { ACCOUNT_PATHS } from "./accountPaths";
import { COMING_SOON } from "./comingSoon";
import { StaffDrawer } from "./StaffDrawer";
import { staffNav } from "./staffNav";
import { StaffSidebar } from "./StaffSidebar";

const COLLAPSED_KEY = "steward.sidebar.collapsed";
const RAIL_WIDTHS = "(min-width: 64rem) and (max-width: 79.98rem)";

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
  /** The dev login bar (dev builds only): a 28 px strip across the very top, above everything. */
  devLogin?: ReactNode;
  /** An active "act as" session (H9): the acting-as banner sits above everything. */
  impersonation?: { expiresAt: string; targetName: string } | null;
  /** Compliance reporting is on for this install (`STEWARD_REPORTING=true`). */
  reporting?: boolean;
  /** The person signs in with email codes only: nudge towards a stronger second factor (H8). */
  secondFactorNudge?: boolean;
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
  devLogin,
  impersonation = null,
  reporting = false,
  secondFactorNudge = false,
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
  const creates = useMemo(
    () => staffCreates((permission) => identity.permissions.has(permission)),
    [identity],
  );
  const adminUrl = signedIn && canOpenAdmin(identity) ? config.adminUrl : undefined;
  // The canvas frames size boxes content-box: a 56 px header plus its 1 px rule is 57 px.
  // The acting-as banner adds its 44 px.
  const top = 57 + (devLogin ? 28 : 0) + (config.environment ? 28 : 0) + (impersonation ? 44 : 0);
  const style = { "--shell-top": `${top}px` } as CSSProperties;

  return (
    <CommandActionsProvider>
      <ShellActions inbox={signedIn} />
      <div className="flex min-h-dvh flex-col" data-testid="shell-frame" style={style}>
        <SkipLink />
        <div className="sticky top-0 z-[var(--z-header)]">
          {devLogin}
          {impersonation ? <ActingAsBanner session={impersonation} /> : null}
          <EnvironmentBanner name={config.environment} />
          <header className="flex h-[57px] items-center gap-1.5 border-b border-border-strong bg-surface px-1.5 lg:gap-3 lg:px-[14px] xl:gap-[14px] xl:px-4">
            {signedIn ? (
              <StaffDrawer
                adminUrl={adminUrl}
                creates={creates}
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
                <SearchField
                  className="ml-6 hidden h-[38px] w-[322px] lg:flex xl:ml-10 xl:w-[382px]"
                  creates={creates}
                />
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
                      to={ACCOUNT_PATHS.inbox}
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
            {/* The notices open the main landmark, so every word on the page sits in one and the
              skip link lands on them first. */}
            <MainContent className="flex flex-1 flex-col outline-none">
              <SiteBanners settings={banners} />
              {signedIn ? <ConnectionLostBanner /> : null}
              {signedIn && secondFactorNudge ? (
                <SecondFactorNudge setUpUrl={ACCOUNT_PATHS.security} />
              ) : null}
              <div className="flex-1">{children}</div>
            </MainContent>
            <ShellFooter organisation={config.organisation} />
          </div>
        </div>
      </div>
    </CommandActionsProvider>
  );
};
