// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The page that lists the command bar's shortcuts (bug log 26): one row per entry of the one
// shortcut registry, so a new shortcut shows up here without anyone remembering to add it.
import { useTranslation } from "@steward-web/i18n";

import { formatShortcut, SHORTCUTS } from "./shortcuts";

export const ShortcutsPage = () => {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col gap-3.5 px-4 py-6 text-base text-ink sm:px-8">
      <h1 className="text-[26px] font-semibold md:text-[30px] md:leading-[38px]">
        {t("shortcutsPage.title")}
      </h1>
      <p className="leading-normal text-muted">{t("shortcutsPage.description")}</p>
      <ul
        aria-label={t("shortcutsPage.title")}
        className="overflow-hidden rounded-[10px] border border-border bg-surface"
      >
        {Object.entries(SHORTCUTS).map(([id, spec]) => (
          <li
            className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
            key={id}
          >
            <span>{t(spec.label)}</span>
            <kbd className="rounded-md border border-border-strong bg-sunken px-2 py-0.5 font-mono text-sm">
              {formatShortcut(spec.keys)}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
};
