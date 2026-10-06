// Locale resolution — a PURE function so the precedence chain is testable
// without a browser, a provider, or a live session.
//
// PRECEDENCE, highest wins:
//
//   1. userLocale     — the signed-in user's STORED preference (identity's
//                       users.locale, surfaced through the gateway `me` query).
//                       Authoritative: it follows the person across devices.
//   2. storedLocale   — an explicit choice made in THIS browser (localStorage).
//                       Covers the pre-auth surfaces (sign-in, magic link,
//                       onboarding) where there is no user yet, and applies a
//                       switch instantly without waiting on a round trip.
//   3. browserLocales — navigator.languages, the client-side equivalent of the
//                       Accept-Language header, in the user's own priority order.
//   4. DEFAULT_LOCALE — "en".
//
// At every step the candidate is NEGOTIATED against SUPPORTED_LOCALES rather
// than trusted: an unsupported or malformed tag falls through to the next step
// instead of selecting a locale with no catalog behind it.

import { DEFAULT_LOCALE, type LocaleTag, SUPPORTED_TAGS } from "./locales";

export type LocaleResolutionSource = "browser" | "default" | "stored" | "user";

export type ResolvedLocale = {
  locale: LocaleTag;
  /** Which precedence step won — surfaced in the switcher's helper text and
   *  invaluable when a user reports "the UI is in the wrong language". */
  source: LocaleResolutionSource;
};

export type ResolveLocaleInput = {
  /** navigator.languages, most-preferred first. */
  browserLocales?: null | readonly string[];
  /** An explicit choice persisted in this browser. */
  storedLocale?: null | string;
  /** The user's stored server-side preference, if authenticated AND exposed. */
  userLocale?: null | string;
};

/**
 * Negotiate ONE candidate tag against the shipped catalogs.
 *
 * Matching is progressively less specific, which is what makes "ship `en`, get
 * `en-GB` and `en-AU` for free" work:
 *   - exact, case-insensitive        : "EN-us" -> "en-US" if shipped
 *   - base language of the candidate : "fr-CA" -> "fr"    if "fr" is shipped
 *   - a shipped regional variant     : "fr"    -> "fr-CA" if only "fr-CA" ships
 *
 * Returns undefined when nothing matches, so the caller falls through.
 */
export const negotiateLocale = (
  // Optional: callers routinely pass a value that may be absent — `null` from
  // the gateway for an unset preference, `undefined` from localStorage before
  // any choice is made — so an omitted argument is a valid call, not an error.
  candidate?: null | string,
): LocaleTag | undefined => {
  if (typeof candidate !== "string") return undefined;
  const tag = candidate.trim();
  // Reject anything that is not shaped like a BCP 47 tag before it can reach
  // i18next (and, through the formatters, Intl — which THROWS on a bad tag).
  if (!/^[a-z]{2,3}(-[a-z\d]{2,8})*$/i.test(tag)) return undefined;

  const lower = tag.toLowerCase();
  const exact = SUPPORTED_TAGS.find((s) => s.toLowerCase() === lower);
  if (exact) return exact;

  const base = lower.split("-", 1)[0];
  const baseMatch = SUPPORTED_TAGS.find((s) => s.toLowerCase() === base);
  if (baseMatch) return baseMatch;

  const regional = SUPPORTED_TAGS.find((s) => s.toLowerCase().split("-", 1)[0] === base);
  return regional;
};

/** Apply the full precedence chain. Never throws; always returns a supported tag. */
export const resolveLocale = (input: ResolveLocaleInput = {}): ResolvedLocale => {
  const fromUser = negotiateLocale(input.userLocale);
  if (fromUser) return { locale: fromUser, source: "user" };

  const fromStored = negotiateLocale(input.storedLocale);
  if (fromStored) return { locale: fromStored, source: "stored" };

  for (const candidate of input.browserLocales ?? []) {
    const fromBrowser = negotiateLocale(candidate);
    if (fromBrowser) return { locale: fromBrowser, source: "browser" };
  }

  return { locale: DEFAULT_LOCALE, source: "default" };
};

/** navigator.languages, defensively — jsdom and older browsers vary. */
export const browserLocales = (): readonly string[] => {
  if (typeof navigator === "undefined") return [];
  const { language, languages } = navigator;
  if (Array.isArray(languages) && languages.length > 0) return languages;
  return typeof language === "string" && language ? [language] : [];
};

// Re-exported so callers can validate a tag without importing ./locales too.

export { isSupportedLocale } from "./locales";
