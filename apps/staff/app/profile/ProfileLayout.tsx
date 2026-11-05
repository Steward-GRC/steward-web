// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { cn } from "@steward-web/ui";
import { NavLink, Outlet } from "react-router";

const TABS = [
  { end: true, key: "name", to: "/profile" },
  { end: false, key: "security", to: "/profile/security" },
  { end: false, key: "preferences", to: "/profile/preferences" },
  { end: false, key: "notifications", to: "/profile/notifications" },
] as const;

/**
 * Your profile (U32–U35): Name, Security, Preferences and Notifications as tabs, each its own
 * address, so the second-factor nudge's "Set up" and an email's "Notification settings" can
 * open their tab directly. Full width (decision 2-layout-and-navigation.s9).
 */
export const ProfileLayout = () => {
  const { t } = useTranslation("settings");
  return (
    <div className="flex flex-col gap-3.5 px-4 py-6 text-base text-ink md:px-9">
      <h1 className="text-[26px] font-semibold md:text-[30px] md:leading-[38px]">
        {t("profile.title")}
      </h1>
      <nav
        aria-label={t("profile.tabsLabel")}
        className="flex gap-1 overflow-x-auto border-b border-border-strong"
      >
        {TABS.map((tab) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                "-mb-px px-3 py-2.5 whitespace-nowrap",
                isActive
                  ? "font-semibold text-primary shadow-[inset_0_-2px_var(--primary)]"
                  : "text-muted hover:text-ink",
              )
            }
            end={tab.end}
            key={tab.key}
            to={tab.to}
          >
            {t(`profile.tabs.${tab.key}`)}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
};
