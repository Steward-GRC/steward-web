# @steward-web/i18n

The one i18n runtime for steward-web. English ships today; more languages land as catalog data,
not code.

## One instance, one init

`src/i18n.ts` is the only place that calls `i18next.init()`. Importing anything from
`@steward-web/i18n` gives a fully initialised instance, so the shared packages need no provider,
tests need no bootstrapping, and the first render (on the server too) already has real copy:
resources are bundled, so init is synchronous.

Import `i18next` or `react-i18next` only through this package:

```ts
import { Trans, useTranslation, useLocale, formatDate } from "@steward-web/i18n";
```

Each app mounts one `<I18nProvider>`; it owns the signed-in user's stored preference and how to
persist a new choice.

## Catalogs

Files live at `src/locales/<tag>/<namespace>.json`, one namespace per functional area (the area a
string is displayed in, not the file it lives in): `common`, `shell`, `auth`, `settings`, `policy`,
`authoring`, `ai`, `approvals`, `search`, `admin`, `errors`. A key goes in `common` only when three
or more areas use it.

- Keys are dot-nested lowerCamelCase, and the last segment names the string's role: `.title`,
  `.description`, `.label`, `.placeholder`, `.action`, `.empty`, `.error`, `.aria`.
- Plurals use i18next's suffixes (`results_one`, `results_other`), never string concatenation.
- Sentences split across JSX use `<Trans>` with named components.
- Outside React, return a key and translate at the call site, or take `t` as a parameter.

## Locale resolution

Highest first: the signed-in user's stored preference, an explicit choice in this browser
(`localStorage` key `steward.locale`), `navigator.languages`, then `en`. Every candidate is
negotiated against the shipped catalogs, so `en` also serves `en-GB` and `en-AU`, and an
unsupported tag falls through.

## Formatters

`formatDate`, `formatDateTime`, `formatHour`, `formatWeekday`, `formatNumber`, `formatPercent`,
`formatRelativeTime` and `formatList` follow the app's locale and cache their `Intl` instances.

## The lint guard

`@steward-web/i18n/eslint-guard` flags hard-coded user-visible strings in JSX (a warning), and
`i18nRatchet([...])` raises it to an error for files already converted.

## Adding a language

1. Copy `src/locales/en` to `src/locales/<tag>` and translate the values.
2. Add an entry to `SUPPORTED_LOCALES` in `src/locales.ts`.
3. Add the imports to `src/resources.ts`.
