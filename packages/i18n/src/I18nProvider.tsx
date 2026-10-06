// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The app-level i18n wiring. Each app mounts exactly one of these; shared
// packages neither mount nor require it (see i18n.ts for why).
//
// It owns the two things an app — and only an app — can know:
//   1. the signed-in user's STORED preference (it has the identity/session), and
//   2. how to PERSIST a new choice server-side (it has the data layer).
//
// Everything else (the instance, the catalog, the negotiation) is package-level.

import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { I18nextProvider } from "react-i18next";

import { currentLocale, i18n } from "./i18n";
import { type LocaleDescriptor, SUPPORTED_LOCALES } from "./locales";
import { browserLocales, type LocaleResolutionSource, resolveLocale } from "./resolveLocale";
import { clearStoredLocale, readStoredLocale, writeStoredLocale } from "./storedLocale";

export type LocaleContextValue = {
  /** False when the app supplied no `persist` — the switcher then says the
   *  choice is device-local instead of implying it followed the account. */
  canPersistToAccount: boolean;
  /** True while the server-side persist is in flight (drives the switcher's
   *  pending state). */
  isPersisting: boolean;
  /** The locale in effect right now. */
  locale: string;
  /** Locales with a shipped catalog. */
  locales: readonly LocaleDescriptor[];
  /** Set when the server-side persist FAILED. The locale still changed locally,
   *  so this is a warning, not an error state. */
  persistError: boolean;
  /** Apply a locale: takes effect immediately, is stored in this browser, and is
   *  persisted to the user's account when the app supplied a `persist`. Pass
   *  `null` to drop the explicit choice and follow the browser again. */
  setLocale: (tag: null | string) => Promise<void>;
  /** Which precedence step selected it — see resolveLocale.ts. */
  source: LocaleResolutionSource;
};

export const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export type I18nProviderProps = {
  children: ReactNode;
  /**
   * Persist a new choice to the user's account. Omitted when unauthenticated or
   * when no such mutation exists yet; the choice is then browser-local only.
   * A rejection is caught and surfaced as `persistError` — it never reverts the
   * locale, because the user's intent was unambiguous.
   */
  persist?: (tag: string) => Promise<void>;
  /**
   * The signed-in user's stored locale preference, or null/undefined when
   * unauthenticated, still loading, or not exposed by the backend yet.
   *
   * Caution: the gateway `me` query does NOT expose `locale` today, so both
   * apps pass `undefined` here. This prop is the ONE seam that has to change
   * when it does — see README.md "Wiring the account preference".
   */
  userLocale?: null | string;
};

export const I18nProvider = ({ children, persist, userLocale }: I18nProviderProps) => {
  const [locale, setLocaleState] = useState(currentLocale);
  const [source, setSource] = useState<LocaleResolutionSource>("default");
  const [isPersisting, setIsPersisting] = useState(false);
  const [persistError, setPersistError] = useState(false);

  // Re-run resolution when the user's stored preference arrives. `me` resolves
  // AFTER first paint, so the initial render uses the browser/stored locale and
  // then upgrades — which is why precedence is re-evaluated rather than
  // computed once.
  useEffect(() => {
    const resolved = resolveLocale({
      browserLocales: browserLocales(),
      storedLocale: readStoredLocale(),
      userLocale,
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolution reads browser state (storage, navigator) the server render can't see
    setSource(resolved.source);
    if (resolved.locale === currentLocale()) {
      setLocaleState(resolved.locale);
      return;
    }
    void i18n.changeLanguage(resolved.locale).then(() => {
      setLocaleState(currentLocale());
    });
  }, [userLocale]);

  // Keep <html lang> in step: it drives screen-reader pronunciation, the
  // browser's own translate prompt, and CSS `:lang()` hyphenation rules.
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = locale;
  }, [locale]);

  // `persist` is typically an inline arrow from the app, so hold it in a ref to
  // keep setLocale's identity stable across renders.
  const persistRef = useRef(persist);
  useLayoutEffect(() => {
    persistRef.current = persist;
  });

  const setLocale = useCallback(
    async (tag: null | string) => {
      setPersistError(false);

      // null = "stop overriding": drop the local choice and re-resolve, which
      // falls through to the account preference or the browser.
      if (tag === null) {
        clearStoredLocale();
        const resolved = resolveLocale({
          browserLocales: browserLocales(),
          userLocale,
        });
        await i18n.changeLanguage(resolved.locale);
        setLocaleState(currentLocale());
        setSource(resolved.source);
        return;
      }

      writeStoredLocale(tag);
      await i18n.changeLanguage(tag);
      setLocaleState(currentLocale());
      setSource("stored");

      const persistFunction = persistRef.current;
      if (!persistFunction) return;
      setIsPersisting(true);
      try {
        await persistFunction(tag);
        setSource("user");
      } catch {
        // The locale HAS changed and is stored locally; only the account-level
        // save failed, so warn rather than revert.
        setPersistError(true);
      } finally {
        setIsPersisting(false);
      }
    },
    [userLocale],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      canPersistToAccount: persist !== undefined,
      isPersisting,
      locale,
      locales: SUPPORTED_LOCALES,
      persistError,
      setLocale,
      source,
    }),
    [isPersisting, locale, persist, persistError, setLocale, source],
  );

  return (
    <LocaleContext value={value}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </LocaleContext>
  );
};

export { DEFAULT_LOCALE } from "./locales";
