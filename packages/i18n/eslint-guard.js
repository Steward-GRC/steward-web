// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The i18n regression guard, shared by apps/staff and
// apps/admin so the two can never drift apart. Imported as
// `@steward-web/i18n/eslint-guard`.
//
// WHY IT IS A WARNING, NOT AN ERROR
// --------------------------------
// The audit counted ~3,400 hardcoded user-visible strings still to
// extract (≈1,130 in apps/staff, ≈2,030 in apps/admin, ≈264 in the shared
// packages). CI runs `npm run lint -w staff` / `-w admin` as a GATING job, so
// setting this to "error" would fail the Lint job on the very first pipeline and
// block every unrelated MR until the whole extraction programme finished — which
// is precisely the multi-slice programme this rule is meant to protect.
//
// So: `warn` globally (visible in every lint run, in the reviewer's editor, and
// in the job log, but non-gating), plus a RATCHET — see `ratchet()` below — that
// re-raises the rule to `error` for files already converted. Each extraction
// slice appends its files to that list, so a converted surface can never
// silently regress while the un-converted backlog stays non-blocking. When the
// backlog reaches zero the global severity flips to "error" and the ratchet list
// is deleted.

import i18next from "eslint-plugin-i18next";

const RULE = "i18next/no-literal-string";

const MESSAGE =
  "Hardcoded user-visible string. Extract it into the @steward-web/i18n English catalog " +
  "(packages/i18n/src/locales/en/<namespace>.json) and render it with useTranslation() " +
  "or <Trans> (see packages/i18n/README.md).";

const OPTIONS = {
  // Do not flag the i18n calls themselves — a key IS a string literal. The
  // plugin prefixes each entry with an optional `(?:.*\.)?` member path and
  // anchors it, so these must be BARE names: an explicit ^/$ here would produce
  // a regex that can never match.
  callees: {
    exclude: ["t", "i18n.t", "i18next.t", "getFixedT", "useTranslation"],
  },
  framework: "react",

  "jsx-attributes": {
    // Machine-facing attributes that happen to take strings. Flagging these is
    // pure noise and trains reviewers to ignore the rule.
    //
    // Caution: these are REGEX sources, not globs — the plugin wraps each one as
    // /^<source>$/. So a wildcard must be written `data-.*`, never `data-*`
    // (which would mean "data" followed by any number of hyphens).
    exclude: [
      "aria-controls",
      "aria-describedby",
      "aria-labelledby",
      "autoComplete",
      "className",
      "data-.*",
      "defaultValue",
      "for",
      "form",
      "href",
      "htmlFor",
      "id",
      "i18nKey",
      "key",
      "name",
      "ns",
      "pattern",
      "rel",
      "role",
      "src",
      "target",
      "to",
      "type",
      "value",
      "variant",
    ],
    // User-VISIBLE attributes, including the accessible-name ones that are easy
    // to forget precisely because they are invisible on screen.
    include: [
      "alt",
      "aria-description",
      "aria-label",
      "aria-placeholder",
      "aria-roledescription",
      "aria-valuetext",
      "briefLabel",
      "briefPlaceholder",
      "cardTitle",
      "description",
      "emptyMessage",
      "emptyNote",
      "emptyText",
      "heading",
      "hint",
      "label",
      "placeholder",
      "retryLabel",
      "saveLabel",
      "searchPlaceholder",
      "submitLabel",
      "subtitle",
      "title",
    ],
  },

  message: MESSAGE,

  // JSX only. The ~340 module-level strings in plain .ts files (label maps,
  // ColumnDef factories, error copy) are a real part of the backlog, but
  // "all" mode flags every string literal in every .ts file — including keys,
  // ids, GraphQL documents and CSS classes — which buries the signal. Those
  // files are covered by the inventory in the original inventory, not by this rule.
  mode: "jsx-only",

  // A string with no LETTERS carries no language, so it needs no translation.
  // That covers whitespace, digits, punctuation, separators (`·`, `—`) and
  // glyphs (`→`) in one rule, instead of an ever-growing character allowlist.
  // Passed as a RegExp (the plugin accepts them verbatim) so the `u` flag —
  // required by \p{L} — survives.
  words: { exclude: [/^\P{L}*$/u] },
};

/** Warn-everywhere baseline. Apply to both apps. */
export const i18nGuard = [
  {
    files: ["**/*.tsx"],
    plugins: { i18next },
    rules: { [RULE]: ["warn", OPTIONS] },
  },
  {
    // Tests, stories and Playwright specs legitimately hardcode English: they
    // assert on rendered copy and supply fixture props.
    files: ["**/*.spec.{ts,tsx}", "**/*.stories.tsx", "**/*.test.{ts,tsx}", "tests/**"],
    rules: { [RULE]: "off" },
  },
];

/**
 * The ratchet: re-raise the rule to ERROR for surfaces already extracted, so a
 * converted area cannot regress.
 *
 * Each extraction slice APPENDS the files it converted. Keep the list sorted.
 *
 * @param {string[]} files converted globs, relative to the app root
 */
export const i18nRatchet = (files) =>
  files.length === 0 ? [] : [{ files, rules: { [RULE]: ["error", OPTIONS] } }];

export default i18nGuard;
