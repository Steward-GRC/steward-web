// The set of locales the UI actually ships catalogs for, plus the namespace
// list. This package lands the framework English-ONLY ("i18n-ready"): additional
// languages are DATA, not code — adding one is (1) a new folder under
// src/locales/<tag>/ with the same namespace files and (2) one entry in
// SUPPORTED_LOCALES. No component, provider, or resolver change.

/** BCP 47 tag used when nothing else resolves. Always shipped. */
export const DEFAULT_LOCALE = "en";

export type LocaleDescriptor = {
  /** ISO 3166-1 alpha-2 code for the kit's flag icon in the switcher. A flag is
   *  a COUNTRY, not a language, so this is a rough visual aid only — the
   *  nativeName is what actually identifies the choice. */
  country?: string;
  /** English name, for the accessible description in the switcher. */
  englishName: string;
  /** Name in the locale's OWN language — never translated, so it is readable
   *  to a speaker of that language even while the UI is in another one. */
  nativeName: string;
  /** BCP 47 tag, e.g. "en", "es-419". */
  tag: LocaleTag;
};

export type LocaleTag = string;

// ⚠ Adding a locale here without a matching src/locales/<tag>/ folder makes it
// selectable but untranslated (every key falls back to English). resources.ts is
// typed so the namespace files and NAMESPACES cannot drift apart.
export const SUPPORTED_LOCALES: readonly LocaleDescriptor[] = [
  { country: "US", englishName: "English", nativeName: "English", tag: "en" },
];

export const SUPPORTED_TAGS: readonly LocaleTag[] = SUPPORTED_LOCALES.map((l) => l.tag);

export const isSupportedLocale = (tag: null | string | undefined): boolean =>
  tag != undefined && SUPPORTED_TAGS.includes(tag);

export const localeDescriptor = (tag: string): LocaleDescriptor | undefined =>
  SUPPORTED_LOCALES.find((l) => l.tag === tag);

// ---------------------------------------------------------------------------
// Namespaces — see README.md "Catalog convention". ONE namespace per FUNCTIONAL
// AREA (the area a string is DISPLAYED in), never one per component or per
// package: a string rendered by @steward-web/ui's PolicyTocView belongs to `policy`,
// not to a "ui" namespace, because the shared component renders policy-domain
// copy on behalf of the app.
// ---------------------------------------------------------------------------
export const NAMESPACES = [
  "common", // cross-area atoms: actions, states, pagination, table chrome
  "shell", // app shell, nav, banners, tour (staff.* / admin.* sub-scoped)
  "auth", // sign-in, MFA, passkeys, magic links, onboarding, impersonation
  "settings", // profile, preferences, notification prefs, security methods
  "policy", // policy documents: catalog, detail, versions, references, TOC
  "authoring", // new policy, wizard, drafts, revise, templates
  "ai", // AI assist / draft / review / summary / ask
  "approvals", // approvals, acknowledgements, my work, workflow
  "search", // search page, spotlight, results
  "admin", // admin console: users, groups, orgs, SSO, setup, audit
  "errors", // user-facing error titles/details/actions
] as const;

export type Namespace = (typeof NAMESPACES)[number];

/** Loaded first and never lazily suspended — every surface uses it. */
export const DEFAULT_NAMESPACE: Namespace = "common";
