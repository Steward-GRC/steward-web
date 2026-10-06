// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Fails when a third-party production dependency carries a licence outside the
// allow-list. Workspace packages are the repo's own and are skipped.
import { execFileSync } from "node:child_process";

export const allowed = new Set([
  "0BSD",
  "Apache-2.0",
  "BlueOak-1.0.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "CC-BY-4.0",
  "CC0-1.0",
  "ISC",
  "MIT",
  "MPL-2.0",
  "OFL-1.1",
  "Python-2.0",
  "Unlicense",
]);

export const licenceAllowed = (expression) => {
  const cleaned = expression.replaceAll(/[()]/g, " ").trim();
  if (/\bOR\b/.test(cleaned)) {
    return cleaned.split(/\bOR\b/).some((part) => licenceAllowed(part));
  }
  return cleaned
    .split(/\bAND\b/)
    .map((part) => part.trim())
    .every((part) => allowed.has(part));
};

const main = () => {
  const out = execFileSync("pnpm", ["licenses", "list", "--prod", "--json"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const byLicence = JSON.parse(out || "{}");
  const refused = [];
  for (const [licence, packages] of Object.entries(byLicence)) {
    if (licenceAllowed(licence)) continue;
    for (const package_ of packages)
      refused.push(`${package_.name}@${package_.versions.join(",")}: ${licence}`);
  }
  if (refused.length > 0) {
    console.error("dependency licences outside the allow-list:");
    for (const line of refused) console.error(`  ${line}`);
    process.exitCode = 1;
    return;
  }
  console.log("dependency licences ok");
};

if (import.meta.url === `file://${process.argv[1]}`) main();
