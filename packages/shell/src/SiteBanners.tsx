// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { GlobalSettings } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { Banner, type BannerTone } from "@steward-web/ui";

/** The announcement's level as admin settings store it, onto the kit's banner tones. */
const announcementTone = (level: string): BannerTone => {
  switch (level.trim().toLowerCase()) {
    case "critical":
    case "danger":
    case "error": {
      return "danger";
    }
    case "warn":
    case "warning": {
      return "warn";
    }
    default: {
      return "info";
    }
  }
};

/**
 * The site-wide maintenance notice and announcement a site admin sets in admin settings
 * (#112), shown on every page of both apps, sign-in included. Settings that couldn't be
 * read show nothing rather than fail the page.
 */
export const SiteBanners = ({ settings }: { settings: GlobalSettings | null | undefined }) => {
  const { t } = useTranslation("shell");
  if (!settings) return null;
  const { announcement, maintenance } = settings;
  const showMaintenance = maintenance.enabled && maintenance.message.trim() !== "";
  const showAnnouncement = announcement.enabled && announcement.message.trim() !== "";
  if (!showMaintenance && !showAnnouncement) return null;

  return (
    <div className="grid gap-2 px-4 pt-3" data-testid="site-banners">
      {showMaintenance ? (
        <Banner title={t("siteBanners.maintenance")} tone="warn">
          {maintenance.message}
        </Banner>
      ) : null}
      {showAnnouncement ? (
        <Banner title={t("siteBanners.announcement")} tone={announcementTone(announcement.level)}>
          {announcement.message}
        </Banner>
      ) : null}
    </div>
  );
};
