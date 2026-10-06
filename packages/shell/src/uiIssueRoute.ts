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

/**
 * The route pattern, not the concrete URL: every matched param's value in `pathname` is
 * swapped back for its `:name` placeholder.
 */
export const pathPattern = (
  pathname: string,
  parameters: Readonly<Record<string, string | undefined>>,
): string => {
  let pattern = pathname;
  for (const [key, value] of Object.entries(parameters)) {
    if (value) pattern = pattern.split(value).join(`:${key}`);
  }
  return pattern;
};
