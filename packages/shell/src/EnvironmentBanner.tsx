// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";

const titleCase = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

/**
 * The environment banner (H4): a 28 px ink hatch naming a non-production install, with a
 * saffron tag ("TEST") and "Test environment". It never uses a status colour, so it can't be
 * mistaken for a warning. Nothing renders in production.
 */
export const EnvironmentBanner = ({ name }: { name: null | string }) => {
  const { t } = useTranslation("shell");
  if (!name) return null;
  return (
    <div
      className="env-banner flex h-7 flex-none items-center justify-center gap-2.5 text-xs font-medium"
      data-testid="environment-banner"
    >
      <span className="rounded-[3px] bg-accent px-[7px] py-px font-mono text-[11px] font-semibold tracking-[.06em] text-on-accent">
        {name.toUpperCase()}
      </span>
      {t("environment.label", { name: titleCase(name) })}
    </div>
  );
};
