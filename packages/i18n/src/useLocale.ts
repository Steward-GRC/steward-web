// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useContext } from "react";

import { currentLocale } from "./i18n";
import { LocaleContext, type LocaleContextValue } from "./I18nProvider";
import { SUPPORTED_LOCALES } from "./locales";

// Deliberately works WITHOUT an <I18nProvider> above it, degrading to a
// read-only view of the current locale. That keeps @steward-web/ui components (and
// their Storybook stories and vitest suites) renderable in isolation — a
// component that merely wants to format a date must not drag an app-level
// provider into every test. Only the switcher needs the writable form, and it
// lives inside the provider.
const DETACHED_FALLBACK: Omit<LocaleContextValue, "locale"> = {
  canPersistToAccount: false,
  isPersisting: false,
  locales: SUPPORTED_LOCALES,
  persistError: false,
  setLocale: async () => {
    // No provider: there is nothing that could own persistence, so a write is a
    // no-op rather than a half-applied change.
  },
  source: "default",
};

export const useLocale = (): LocaleContextValue => {
  const context = useContext(LocaleContext);
  return context ?? { ...DETACHED_FALLBACK, locale: currentLocale() };
};
