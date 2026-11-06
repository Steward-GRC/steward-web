// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { TabLink, TabNav } from "@steward-web/ui";
import { Outlet } from "react-router";

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
    <div
      className="flex flex-col gap-3.5 px-4 py-6 text-base text-ink sm:px-8"
      data-testid="profile-page"
    >
      <h1 className="text-[26px] font-semibold md:text-[30px] md:leading-[38px]">
        {t("profile.title")}
      </h1>
      <TabNav aria-label={t("profile.tabsLabel")}>
        {TABS.map((tab) => (
          <TabLink end={tab.end} key={tab.key} to={tab.to}>
            {t(`profile.tabs.${tab.key}`)}
          </TabLink>
        ))}
      </TabNav>
      <Outlet />
    </div>
  );
};
