// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/** Route params with their concrete values, dropping any key react-router left undefined. */
export const stringParameters = (
  parameters: Readonly<Record<string, string | undefined>>,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
};

const ULID_PATTERN = /^[\dA-HJKMNP-TV-Z]{26}$/i;
const UUID_PATTERN = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

/** The params whose values are opaque ids (a ULID or a UUID); every other value is dropped. */
export const idParameters = (
  parameters: Readonly<Record<string, string>>,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(parameters)) {
    if (ULID_PATTERN.test(value) || UUID_PATTERN.test(value)) result[key] = value;
  }
  return result;
};

const decoded = (segment: string): string => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

/**
 * The route pattern, not the concrete URL: each pathname segment holding a matched param's
 * value (raw or URL-encoded) is swapped back for its `:name` placeholder.
 */
export const pathPattern = (
  pathname: string,
  parameters: Readonly<Record<string, string | undefined>>,
): string => {
  const entries = Object.entries(parameters).filter(
    (entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== "",
  );
  return pathname
    .split("/")
    .map((segment) => {
      const match = entries.find(([, value]) => value === segment || value === decoded(segment));
      return match ? `:${match[0]}` : segment;
    })
    .join("/");
};

/** The route id and path reported for a location no route matched. */
export const UNMATCHED_ROUTE = "*";

export interface UiIssueRoute {
  params: Record<string, string>;
  path: string;
  route: string;
}

export interface UiIssueRouteMatch {
  id: string;
  params: Readonly<Record<string, string | undefined>>;
  pathname: string;
}

/** A pathname in one comparable form: each segment decoded, no trailing slash. */
const comparable = (pathname: string): string => {
  const trimmed = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return trimmed
    .split("/")
    .map((segment) => decoded(segment))
    .join("/");
};

/**
 * What the bundle reports about the current location, from react-router's matches: the
 * deepest route's id, its pattern and its id-shaped params. A location the deepest match
 * doesn't cover (no route matched it) is reported as `*`, never as its pathname.
 */
export const resolveUiIssueRoute = (
  matches: readonly UiIssueRouteMatch[],
  pathname: string,
): UiIssueRoute => {
  const deepest = matches.at(-1);
  if (!deepest || comparable(deepest.pathname) !== comparable(pathname)) {
    return { params: {}, path: UNMATCHED_ROUTE, route: UNMATCHED_ROUTE };
  }
  return {
    params: idParameters(stringParameters(deepest.params)),
    path: pathPattern(deepest.pathname, deepest.params),
    route: deepest.id,
  };
};
