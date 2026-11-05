// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Popover, PopoverContent, PopoverTrigger, Tooltip } from "@steward-web/ui";
import { PersonStanding } from "lucide-react";
import { useState } from "react";

import { AccessibilityPanel } from "./AccessibilityPanel";

/**
 * The floating accessibility button (H1 footer, decision 2-layout-and-navigation.s7): a 40 px
 * plum circle at the bottom right of every shell page, gates included. It opens Accessibility
 * options (H12).
 */
export const AccessibilityButton = () => {
  const { t } = useTranslation("shell");
  const [open, setOpen] = useState(false);
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <Tooltip content={t("accessibility.button")}>
        <PopoverTrigger asChild>
          <button
            aria-label={t("accessibility.button")}
            className="fixed right-9 bottom-[14px] z-[var(--z-sticky)] flex size-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_2px_6px_rgb(38_27_37/.2)] hover:bg-primary-hover max-md:right-4"
            type="button"
          >
            <PersonStanding aria-hidden="true" className="size-[21px]" />
          </button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        align="end"
        className="w-[380px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[14px] p-0 shadow-[var(--shadow-4)]"
        side="top"
      >
        <AccessibilityPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};
