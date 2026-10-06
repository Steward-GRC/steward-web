// The browser-local half of the locale preference (precedence step 2 in
// resolveLocale.ts).
//
// Two reasons this exists even though identity stores the preference server-side:
//   - the PRE-AUTH surfaces (sign-in, magic link, /welcome onboarding) have no
//     user yet, so there is nothing to read a server preference from;
//   - a switch applies INSTANTLY, and survives a reload, without waiting on the
//     mutation to round-trip.
//
// Every access is guarded: localStorage throws in Safari private mode and when a
// site is blocked from storing data, and a language preference must never be
// able to take the app down.

const STORAGE_KEY = "steward.locale";

const storage = (): Storage | undefined => {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
};

export const readStoredLocale = (): null | string => {
  try {
    return storage()?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
};

export const writeStoredLocale = (tag: string): void => {
  try {
    storage()?.setItem(STORAGE_KEY, tag);
  } catch {
    // Non-fatal: the choice still applies for this page's lifetime.
  }
};

/** Drop the local override so resolution falls back to the server preference or
 *  the browser's own languages. Used by "Use my browser language". */
export const clearStoredLocale = (): void => {
  try {
    storage()?.removeItem(STORAGE_KEY);
  } catch {
    // Non-fatal.
  }
};

export const LOCALE_STORAGE_KEY = STORAGE_KEY;
