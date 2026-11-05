// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { RadioGroup as RadioPrimitive } from "radix-ui";

import { cn } from "#ui/lib/cn";

import type { Theme } from "./preferences";

import { usePreferences } from "./ThemeProvider";

const OPTIONS: readonly Theme[] = ["light", "dark", "hc", "system"];

/**
 * The per-person theme choice (decision 3-colour-type-tokens.s3): Light, Dark, High contrast or
 * Follow my system, as a segmented control in the accessibility panel's style (H12). The choice
 * saves to this browser through `ThemeProvider`, and the boot script applies it before the
 * first paint on the next visit.
 */
export const ThemeSwitch = ({ className }: { className?: string }) => {
  const { t } = useTranslation("settings");
  const { preferences, update } = usePreferences();
  return (
    <RadioPrimitive.Root
      aria-label={t("theme.label")}
      className={cn("grid grid-cols-4 gap-0.5 rounded-lg bg-sunken p-[3px]", className)}
      onValueChange={(value) => update({ theme: value as Theme })}
      orientation="horizontal"
      value={preferences.theme}
    >
      {OPTIONS.map((theme) => (
        <RadioPrimitive.Item
          className="flex h-[34px] items-center justify-center rounded-md px-2 text-sm text-ink data-[state=checked]:bg-surface data-[state=checked]:font-semibold data-[state=checked]:shadow-[var(--shadow-1)]"
          key={theme}
          value={theme}
        >
          {t(`theme.options.${theme}`)}
        </RadioPrimitive.Item>
      ))}
    </RadioPrimitive.Root>
  );
};
