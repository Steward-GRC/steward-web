// The bundled catalog.
//
// Resources are STATIC imports, not an http-backend fetch, for three reasons:
//   - i18next can then init SYNCHRONOUSLY, so useTranslation() returns real
//     copy on the very first render — no Suspense boundary, no flash of keys;
//   - one fewer network dependency on the critical path of a login screen;
//   - a missing/renamed namespace file becomes a BUILD error, not a 404 at
//     runtime in front of a user.
//
// English-only today. Adding a language is a new folder here plus one
// entry in SUPPORTED_LOCALES — see README.md.

import type { Namespace } from "./locales";

import admin from "./locales/en/admin.json";
import ai from "./locales/en/ai.json";
import approvals from "./locales/en/approvals.json";
import auth from "./locales/en/auth.json";
import authoring from "./locales/en/authoring.json";
import common from "./locales/en/common.json";
import errors from "./locales/en/errors.json";
import policy from "./locales/en/policy.json";
import search from "./locales/en/search.json";
import settings from "./locales/en/settings.json";
import shell from "./locales/en/shell.json";

// Typed as the full namespace record, so adding a name to NAMESPACES without
// adding the matching file (or vice versa) fails `tsc`.
const en: Record<Namespace, object> = {
  admin,
  ai,
  approvals,
  auth,
  authoring,
  common,
  errors,
  policy,
  search,
  settings,
  shell,
};

export const resources = { en } as const;

export type Resources = typeof resources;
