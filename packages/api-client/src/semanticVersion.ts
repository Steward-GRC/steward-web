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

/** What the author picks when submitting: which part of the version goes up. */
export type VersionChange = "fix" | "major" | "minor";

/**
 * The version a submit gives, from the published one and the author's pick (#156): Major raises
 * the first part and resets the rest, Minor the second, Fix the third. With nothing published
 * yet it is 1.0.0, whatever was picked. The service keeps no pick, so this is only worked out
 * where the author chooses; stored versions still read through `semanticVersion`.
 */
export const nextVersion = (
  published: null | number | string | undefined,
  change: VersionChange,
) => {
  const current = semanticVersion(published);
  if (current === "") return "1.0.0";
  const [major = 0, minor = 0, fix = 0] = current.split(".").map((part) => Number(part) || 0);
  if (change === "major") return `${major + 1}.0.0`;
  if (change === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${fix + 1}`;
};
