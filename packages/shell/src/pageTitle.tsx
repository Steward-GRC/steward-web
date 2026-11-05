// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { i18n } from "@steward-web/i18n";
import { useMatches } from "react-router";

/**
 * The document title for the current page, "<page> · Steward" (decision 1-brand-and-voice.s6,
 * WCAG 2.4.2). `titles` maps a route id ("routes/policies") to its title's i18n key; the
 * deepest matched route that has one wins. A page without one is plain "Steward".
 */
export const pageTitle = (
  titles: Readonly<Record<string, string>>,
  matches: readonly ({ id: string } | undefined)[],
): string => {
  const key = matches
    .toReversed()
    .map((match) => (match ? titles[match.id] : undefined))
    .find(Boolean);
  const brand = i18n.t("shell:brand.name");
  return key ? i18n.t("shell:pageTitle", { brand, page: i18n.t(key) }) : brand;
};

/**
 * The page's <title>, for each app's root `Layout` head. A component rather than the root's
 * `meta`: React Router hands a route's `meta` only the matches down to that route, so the
 * root's can't see which page is showing.
 */
export const PageTitle = ({ titles }: { titles: Readonly<Record<string, string>> }) => (
  <title>{pageTitle(titles, useMatches())}</title>
);
