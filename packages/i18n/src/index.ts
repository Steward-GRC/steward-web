// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The ONLY module the rest of the monorepo imports i18n from.
//
// react-i18next / i18next are re-exported here rather than imported directly by
// consumers, and an ESLint no-restricted-imports rule makes a direct import an
// ERROR outside this package. That is what mechanically guarantees "exactly one
// i18next instance, initialized in exactly one place" (see i18n.ts).

export {
  clearFormatCache,
  formatDate,
  formatDateTime,
  formatHour,
  formatList,
  formatNumber,
  type FormatOptions,
  formatPercent,
  formatRelativeTime,
  formatWeekday,
} from "./formats";

export { currentLocale, i18n } from "./i18n";
export {
  I18nProvider,
  type I18nProviderProps,
  LocaleContext,
  type LocaleContextValue,
} from "./I18nProvider";
export {
  DEFAULT_LOCALE,
  DEFAULT_NAMESPACE,
  isSupportedLocale,
  type LocaleDescriptor,
  localeDescriptor,
  type LocaleTag,
  type Namespace,
  NAMESPACES,
  SUPPORTED_LOCALES,
  SUPPORTED_TAGS,
} from "./locales";
export {
  browserLocales,
  type LocaleResolutionSource,
  negotiateLocale,
  type ResolvedLocale,
  resolveLocale,
  type ResolveLocaleInput,
} from "./resolveLocale";
export {
  clearStoredLocale,
  LOCALE_STORAGE_KEY,
  readStoredLocale,
  writeStoredLocale,
} from "./storedLocale";
export { useLocale } from "./useLocale";
export { Trans, useTranslation } from "react-i18next";
