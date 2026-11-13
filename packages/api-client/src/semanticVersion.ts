// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ChangeType } from "./generated/schema";

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

/**
 * The version label for a stored version: the semantic version core wrote at publish, or, when
 * core has none, the ordinal alone (read as N.0.0, as before). Every label built from a version
 * row goes through here (#390).
 */
export const versionOf = (version: {
  semanticVersion?: null | string;
  versionNo: number;
}): string => semanticVersion(version.semanticVersion || version.versionNo);

/** The author's pick sent with a submit: the change type, and why when it is below the
 *  suggestion. */
export interface ChangePick {
  change: VersionChange;
  reason?: string;
}

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

const RANK: Record<VersionChange, number> = { fix: 0, major: 2, minor: 1 };

const FROM_GATEWAY: Readonly<Record<ChangeType, VersionChange>> = {
  [ChangeType.Fix]: "fix",
  [ChangeType.Major]: "major",
  [ChangeType.Minor]: "minor",
};

/** The gateway's change type as the app's lowercase one; null when there is none. */
export const changeTypeFrom = (change?: ChangeType | null): null | VersionChange =>
  change ? (FROM_GATEWAY[change] ?? null) : null;

/** The app's change type as the gateway's enum. */
export const changeTypeToGateway = (change: VersionChange): ChangeType =>
  change === "major" ? ChangeType.Major : change === "minor" ? ChangeType.Minor : ChangeType.Fix;

/** True when the pick is below what core suggested (Major, then Minor, then Fix): that is the
 *  one pick that needs a reason and the first approval stage's agreement. */
export const isLowering = (pick: VersionChange, suggested?: null | VersionChange): boolean =>
  suggested ? RANK[pick] < RANK[suggested] : false;
