// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Popover, PopoverContent, PopoverTrigger, ThemeSwitch, Tooltip } from "@steward-web/ui";
import { PersonStanding } from "lucide-react";

/**
 * The floating accessibility button (H1 footer, decision 2-layout-and-navigation.s7): a 40 px
 * plum circle at the bottom right of every shell page. For now it opens the theme choice; the
 * full Accessibility options panel (H12) comes with the responsive and accessibility work.
 */
export const AccessibilityButton = () => {
  const { t } = useTranslation("shell");
  return (
    <Popover>
      <Tooltip content={t("accessibility.button")}>
        <PopoverTrigger asChild>
          <button
            aria-label={t("accessibility.button")}
            className="fixed right-9 bottom-[14px] z-[var(--z-sticky)] flex size-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_2px_6px_rgb(38_27_37/.2)] hover:bg-primary-hover"
            type="button"
          >
            <PersonStanding aria-hidden="true" className="size-[21px]" />
          </button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent align="end" className="grid w-[380px] gap-4 p-0" side="top">
        <div className="flex items-center gap-2.5 border-b border-border px-[18px] py-4">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-on-primary">
            <PersonStanding aria-hidden="true" className="size-[18px]" />
          </span>
          <b className="text-base font-semibold">{t("accessibility.title")}</b>
        </div>
        <div className="grid gap-4 px-[18px] pb-4">
          <ThemeSwitch />
          <p className="border-t border-border pt-3 text-[13px] text-muted">
            {t("accessibility.saved")}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
