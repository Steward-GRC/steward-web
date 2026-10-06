// THE i18next instance. There is exactly one, and this module is the only place
// in the monorepo that calls `init()`.
//
// Why a self-initializing module singleton rather than "the app initializes it":
//
//   - @steward-web/ui and @steward-web/auth are consumed as SOURCE inside the same
//     bundler graph as the apps, so this module is evaluated exactly once and
//     both apps and both shared packages see the same instance. A shared
//     package therefore only ever calls useTranslation() — it MUST NOT init, and
//     it does not need a provider handed down to it either.
//   - Tests and Storybook get working translations from a bare import, with no
//     per-suite bootstrapping to forget. That matters: packages/ui and
//     packages/auth have existing suites asserting English copy, and extraction
//     slices must not have to touch every test file.
//   - Because resources are bundled (see resources.ts), init is SYNCHRONOUS —
//     the first render already has real copy, so no Suspense and no key flash.
//
// The guardrail that keeps this true is an ESLint no-restricted-imports rule:
// importing "i18next" or "react-i18next" anywhere outside this package is an
// ERROR (see apps/*/eslint.config.js). Everything is re-exported from
// ./index.ts, so consumers never need to.

import i18next, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LOCALE, DEFAULT_NAMESPACE, NAMESPACES } from "./locales";
import { resources } from "./resources";

// `isInitialized` guard: HMR re-evaluates this module in dev, and a double
// init() logs a warning and re-registers the react binding.
if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    // No missing-key backend to POST to, and i18next's own console noise is
    // not useful here — a missing key is caught by the lint guard and by tsc
    // (the catalog is typed), not at runtime.
    debug: false,
    defaultNS: DEFAULT_NAMESPACE,
    // English is the source language AND the fallback, so a key that an
    // extraction slice has not reached yet still renders English rather than a
    // raw dotted key.
    fallbackLng: DEFAULT_LOCALE,
    // React already escapes everything it renders; letting i18next escape too
    // double-encodes apostrophes and ampersands in copy.
    interpolation: { escapeValue: false },
    lng: DEFAULT_LOCALE,
    // We ship a base-language catalog ("en"), so a regional request must fall
    // back to it instead of 404-ing on "en-US".
    load: "languageOnly",
    ns: NAMESPACES,
    // Bundled, so init() below is synchronous — no backend, no fetch, no
    // Suspense. See resources.ts.
    resources,
    // `null` as a "translation" is always a catalog mistake; treat it as missing
    // so the fallback chain runs instead of rendering nothing.
    returnNull: false,
    saveMissing: false,
  });
}

export const i18n: I18nInstance = i18next;

/** The locale actually in effect after i18next's own fallback (e.g. a request
 *  for "en-GB" against an "en" catalog resolves to "en"). Prefer this over
 *  i18n.language when feeding Intl or rendering the current choice. */
export const currentLocale = (): string =>
  i18next.resolvedLanguage ?? i18next.language ?? DEFAULT_LOCALE;
