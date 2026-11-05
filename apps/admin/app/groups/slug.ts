// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A category's slug, which sets its policy-number prefix. Plain functions with no server
// imports, so the new-category form can fill the slug in as the name is typed.

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const isValidSlug = (slug: string): boolean => SLUG_PATTERN.test(slug);

export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
