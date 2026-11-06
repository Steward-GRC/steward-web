// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type DatePreference, useTranslation } from "@steward-web/i18n";
import { Card, Select, ThemeSwitch, usePreferences } from "@steward-web/ui";
import { useId } from "react";
import { useFetcher } from "react-router";

/** The select's value for "match my browser", which the gateway stores as an empty locale. */
const BROWSER = "browser";

/** The date formats on offer, in the order shown; "system" is the app default. */
const DATE_FORMATS: readonly DatePreference[] = ["system", "dmy", "mdy", "iso"];

/** The languages Steward ships; only English today, built for more. */
const LANGUAGES = ["en"] as const;

/**
 * Profile: preferences (U34): the theme (decision 3-colour-type-tokens.s3, saved to this
 * browser) and the display language (saved to the account; "Match my browser" clears it).
 */
export const Preferences = ({ locale }: { locale?: string }) => {
  const { t } = useTranslation("settings");
  const fetcher = useFetcher();
  const themeId = useId();
  const languageId = useId();
  const selectId = useId();
  const dateId = useId();
  const dateSelectId = useId();
  const { preferences, update } = usePreferences();
  const browserLanguage = t(`language.names.${LANGUAGES[0]}`);
  return (
    <div className="flex flex-col gap-3.5">
      <Card aria-labelledby={themeId} className="flex flex-col gap-2 px-4 py-3.5">
        <h2 className="font-semibold" id={themeId}>
          {t("theme.title")}
        </h2>
        <p className="text-[13px] leading-normal text-muted">{t("theme.description")}</p>
        <ThemeSwitch />
      </Card>
      <Card aria-labelledby={languageId} className="flex flex-col gap-2 px-4 py-3.5">
        <h2 className="font-semibold" id={languageId}>
          {t("language.title")}
        </h2>
        <label className="flex flex-col gap-[5px] text-[13px]" htmlFor={selectId}>
          {t("language.label")}
        </label>
        <Select
          aria-label={t("language.label")}
          className="h-[38px] max-w-sm"
          id={selectId}
          onValueChange={(value) =>
            void fetcher.submit(
              { intent: "set-locale", locale: value === BROWSER ? "" : value },
              { method: "post" },
            )
          }
          options={[
            {
              label: t("language.browserOptionWith", { language: browserLanguage }),
              value: BROWSER,
            },
            ...LANGUAGES.map((code) => ({ label: t(`language.names.${code}`), value: code })),
          ]}
          value={locale || BROWSER}
        />
        <p className="text-xs text-muted">{t("language.description")}</p>
      </Card>
      <Card aria-labelledby={dateId} className="flex flex-col gap-2 px-4 py-3.5">
        <h2 className="font-semibold" id={dateId}>
          {t("dateFormat.title")}
        </h2>
        <label className="flex flex-col gap-[5px] text-[13px]" htmlFor={dateSelectId}>
          {t("dateFormat.label")}
        </label>
        <Select
          aria-label={t("dateFormat.label")}
          className="h-[38px] max-w-sm"
          id={dateSelectId}
          onValueChange={(value) => update({ dateFormat: value as DatePreference })}
          options={DATE_FORMATS.map((format) => ({
            label: t(`dateFormat.${format}`),
            value: format,
          }))}
          value={preferences.dateFormat}
        />
        <p className="text-xs text-muted">{t("dateFormat.description")}</p>
      </Card>
    </div>
  );
};
