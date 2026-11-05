// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Select, ThemeSwitch } from "@steward-web/ui";
import { useId } from "react";
import { useFetcher } from "react-router";

const card = "flex flex-col gap-2 rounded-[10px] border border-border bg-surface px-4 py-3.5";

/** The select's value for "match my browser", which the gateway stores as an empty locale. */
const BROWSER = "browser";

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
  const browserLanguage = t(`language.names.${LANGUAGES[0]}`);
  return (
    <div className="flex flex-col gap-3.5">
      <section aria-labelledby={themeId} className={card}>
        <h2 className="font-semibold" id={themeId}>
          {t("theme.title")}
        </h2>
        <p className="text-[13px] leading-normal text-muted">{t("theme.description")}</p>
        <ThemeSwitch />
      </section>
      <section aria-labelledby={languageId} className={card}>
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
      </section>
    </div>
  );
};
