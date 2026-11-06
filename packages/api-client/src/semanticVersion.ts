// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/**
 * A document version as major.minor.patch, without the leading "v" (the screens add it).
 *
 * The service still numbers versions with a plain integer, so 3 reads 3.0.0 until it sends the
 * minor and patch parts; a version that is already semantic passes through unchanged. Every
 * version the app shows comes through here, so the format is decided in one place (#150).
 */
export const semanticVersion = (version?: null | number | string): string => {
  if (version === null || version === undefined) return "";
  const parts = String(version)
    .trim()
    .replace(/^v/i, "")
    .split(".")
    .filter((part) => part !== "");
  if (parts.length === 0) return "";
  while (parts.length < 3) parts.push("0");
  return parts.join(".");
};
