// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { GlobalSettings } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { cn } from "@steward-web/ui";
import { Info, TriangleAlert, X } from "lucide-react";
import { useState } from "react";

type Tone = "danger" | "info" | "warn";

/** The announcement's level as admin settings store it, onto the strip's tones. */
const announcementTone = (level: string): Tone => {
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

const TONES: Record<Tone, string> = {
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  warn: "bg-warn-soft text-warn",
};

const DISMISSED_KEY = "steward.announcement.dismissed";

const dismissedMessage = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY);
  } catch {
    return null;
  }
};

/**
 * The site-wide maintenance notice (H6) and announcement (H5) a site admin sets in admin
 * settings, as the H4–H9 banner stack draws them: full-width strips. The maintenance notice is
 * the warn strip with its title (it no longer claims a lockdown; that's G11). An info
 * announcement is the soft info strip with "Dismiss announcement", remembered for that message
 * in this browser; a warning one can't be dismissed. Settings that couldn't be read show
 * nothing rather than fail the page.
 */
export const SiteBanners = ({ settings }: { settings: GlobalSettings | null | undefined }) => {
  const { t } = useTranslation("shell");
  const [dismissed, setDismissed] = useState(dismissedMessage);
  if (!settings) return null;
  const { announcement, maintenance } = settings;
  const message = announcement.message.trim();
  const tone = announcementTone(announcement.level);
  const showMaintenance = maintenance.enabled && maintenance.message.trim() !== "";
  const showAnnouncement =
    announcement.enabled && message !== "" && !(tone === "info" && dismissed === message);
  if (!showMaintenance && !showAnnouncement) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, message);
    } catch {
      // Storage can be blocked; it's still hidden for this page.
    }
    setDismissed(message);
  };

  return (
    <div className="flex flex-col" data-testid="site-banners">
      {showMaintenance ? (
        <div
          className="flex items-center gap-2.5 bg-warn px-4 py-2.5 text-base text-surface"
          data-tone="warn"
          role="status"
        >
          <TriangleAlert aria-hidden="true" className="size-[1.15em] flex-none" />
          <b>{t("siteBanners.maintenance")}</b>
          <span>{maintenance.message}</span>
        </div>
      ) : null}
      {showAnnouncement ? (
        <div
          className={cn("flex items-center gap-2.5 px-4 py-2.5 text-base", TONES[tone])}
          data-tone={tone}
          role="status"
        >
          {tone === "info" ? (
            <Info aria-hidden="true" className="size-[1.15em] flex-none" />
          ) : (
            <TriangleAlert aria-hidden="true" className="size-[1.15em] flex-none" />
          )}
          <span>{announcement.message}</span>
          {tone === "info" ? (
            <button
              aria-label={t("siteBanners.dismiss")}
              className="ml-auto flex flex-none"
              onClick={dismiss}
              type="button"
            >
              <X aria-hidden="true" className="size-[1.15em]" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
